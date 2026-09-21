import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, FastAPI, File, Form, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi.staticfiles import StaticFiles

from .config import settings
from .database import connect, init_db, now_iso
from .mailer import send_email
from .security import create_access_token, decode_access_token, hash_password, hash_token, verify_password

app = FastAPI(title="Agri Pulse Python API", version="1.0.0")
allowed_origins = {settings.frontend_url, "http://localhost:5173", "http://localhost:5174", "https://agricultureofab.site"}
app.add_middleware(CORSMiddleware, allow_origins=list(allowed_origins), allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

bearer = HTTPBearer(auto_error=False)
TABLES = {"news": "news", "videos": "videos", "resources": "resources"}
STATUS_VALUES = {"draft", "pending", "published", "rejected"}


@app.on_event("startup")
def startup() -> None:
    init_db()


def token_is_revoked(token: str) -> bool:
    connection = connect()
    record = connection.execute("SELECT expires_at FROM revoked_tokens WHERE token_hash = ?", (hash_token(token),)).fetchone()
    connection.close()
    if not record:
        return False
    return datetime.fromisoformat(record["expires_at"]) > datetime.now(timezone.utc)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> sqlite3.Row:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    try:
        payload = decode_access_token(credentials.credentials)
        if token_is_revoked(credentials.credentials):
            raise HTTPException(status_code=401, detail="This session has been signed out")
        user_id = int(payload["sub"])
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(status_code=401, detail="Invalid or expired access token") from error
    connection = connect()
    user = connection.execute("SELECT * FROM users WHERE id = ? AND is_active = 1", (user_id,)).fetchone()
    connection.close()
    if not user:
        raise HTTPException(status_code=401, detail="This account is inactive or no longer exists")
    return user


def optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)) -> sqlite3.Row | None:
    if not credentials:
        return None
    return current_user(credentials)


def admin_user(user: sqlite3.Row = Depends(current_user)) -> sqlite3.Row:
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrator permission required")
    return user


def user_json(user: sqlite3.Row) -> dict[str, Any]:
    return {"id": user["id"], "email": user["email"], "full_name": user["full_name"], "role": user["role"], "is_active": bool(user["is_active"])}


def serialize_content(kind: str, row: sqlite3.Row, connection: sqlite3.Connection) -> dict[str, Any]:
    item = dict(row)
    item["tags"] = json.loads(item.get("tags") or "[]") if kind != "resources" else []
    item["date"] = item.get("published_at") or item.get("created_at")
    item["image"] = item.get("cover_image_url") or item.get("thumbnail_url") or ""
    author = connection.execute("SELECT full_name,email FROM users WHERE id = ?", (item.get("author_id"),)).fetchone() if item.get("author_id") else None
    item["author_name"] = (author["full_name"] or author["email"]) if author else "Agri Pulse editorial team"
    if kind == "resources":
        item["icon"] = "description" if item.get("type") == "guide" else "article" if item.get("type") == "article" else "open"
    return item


def get_item(kind: str, item_id: str, connection: sqlite3.Connection) -> sqlite3.Row | None:
    table = TABLES[kind]
    if item_id.isdigit():
        return connection.execute(f"SELECT * FROM {table} WHERE id = ?", (int(item_id),)).fetchone()
    return connection.execute(f"SELECT * FROM {table} WHERE slug = ?", (item_id,)).fetchone()


def ensure_content_access(row: sqlite3.Row, user: sqlite3.Row | None) -> None:
    if row["status"] == "published":
        return
    if user and (user["role"] == "admin" or (row["author_id"] and row["author_id"] == user["id"])):
        return
    raise HTTPException(status_code=404, detail="Published content not found")


def normalize_payload(kind: str, payload: dict[str, Any]) -> dict[str, Any]:
    fields = {
        "news": {"slug", "title_en", "title_ta", "title_kn", "summary_en", "summary_ta", "summary_kn", "body_en", "body_ta", "body_kn", "cover_image_url", "category_id", "tags", "source_name", "source_url", "status", "review_note", "published_at"},
        "videos": {"slug", "title_en", "title_ta", "title_kn", "description_en", "description_ta", "description_kn", "spoken_language", "category_id", "tags", "video_url", "youtube_url", "thumbnail_url", "source_credit", "status", "review_note", "published_at"},
        "resources": {"slug", "title_en", "title_ta", "title_kn", "description_en", "description_ta", "description_kn", "type", "category_id", "file_url", "external_url", "source_credit", "status", "review_note", "published_at"},
    }[kind]
    clean = {key: value for key, value in payload.items() if key in fields}
    if "tags" in clean and isinstance(clean["tags"], list):
        clean["tags"] = json.dumps(clean["tags"])
    return clean


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agri-pulse-python-api"}


@app.post("/api/auth/login")
def login(payload: dict[str, str]) -> dict[str, Any]:
    email = payload.get("email", "").strip().lower()
    password = payload.get("password", "")
    connection = connect()
    user = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    connection.close()
    if not user or not user["is_active"] or not verify_password(password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_access_token(user["id"], user["role"]), "token_type": "bearer", "user": user_json(user)}


@app.get("/api/auth/me")
def me(user: sqlite3.Row = Depends(current_user)) -> dict[str, Any]:
    return user_json(user)


@app.post("/api/auth/logout")
def logout(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), _: sqlite3.Row = Depends(current_user)) -> dict[str, str]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_access_token(credentials.credentials)
    expires_at = datetime.fromtimestamp(float(payload["exp"]), timezone.utc).isoformat()
    connection = connect()
    connection.execute("INSERT OR REPLACE INTO revoked_tokens (token_hash,expires_at,created_at) VALUES (?,?,?)", (hash_token(credentials.credentials), expires_at, now_iso()))
    connection.commit()
    connection.close()
    return {"message": "Signed out successfully"}


@app.post("/api/auth/password-reset/request", status_code=202)
def request_password_reset(payload: dict[str, str]) -> dict[str, str]:
    email = payload.get("email", "").strip().lower()
    connection = connect()
    user = connection.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", (email,)).fetchone()
    if not user:
        connection.close()
        return {"message": "If an account exists, a reset email has been requested."}
    token = secrets.token_urlsafe(32)
    expires = (datetime.now(timezone.utc) + timedelta(minutes=30)).isoformat()
    connection.execute("UPDATE password_tokens SET used_at = ? WHERE user_id = ? AND purpose = 'reset' AND used_at IS NULL", (now_iso(), user["id"]))
    connection.execute("INSERT INTO password_tokens (user_id,token_hash,purpose,expires_at,created_at) VALUES (?,?,?,?,?)", (user["id"], hash_token(token), "reset", expires, now_iso()))
    connection.commit()
    connection.close()
    reset_url = f"{settings.public_frontend_url}/admin/reset-password?token={token}"
    try:
        send_email(email, "Reset your Agri Pulse password", f"Use this link to choose a new password:\n\n{reset_url}\n\nThis link expires in 30 minutes.")
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"message": "If an account exists, a reset email has been requested."}


@app.post("/api/auth/password-reset/confirm")
def confirm_password_reset(payload: dict[str, str]) -> dict[str, str]:
    token = payload.get("token", "")
    password = payload.get("password", "")
    if len(password) < 8:
        raise HTTPException(status_code=422, detail="Password must be at least 8 characters")
    connection = connect()
    record = connection.execute("SELECT * FROM password_tokens WHERE token_hash = ? AND purpose IN ('reset','invite') AND used_at IS NULL", (hash_token(token),)).fetchone()
    if not record or datetime.fromisoformat(record["expires_at"]) < datetime.now(timezone.utc):
        connection.close()
        raise HTTPException(status_code=400, detail="This reset link is invalid or expired")
    connection.execute("UPDATE users SET password_hash = ?, is_active = 1, updated_at = ? WHERE id = ?", (hash_password(password), now_iso(), record["user_id"]))
    connection.execute("UPDATE password_tokens SET used_at = ? WHERE id = ?", (now_iso(), record["id"]))
    connection.commit()
    connection.close()
    return {"message": "Password updated successfully"}

import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, File, Form, HTTPException, UploadFile

from .config import settings
from .database import connect, now_iso
from .mailer import send_email
from .main import admin_user, app, current_user
from .security import hash_password, hash_token


@app.post("/api/uploads")
def upload_file(bucket: str = Form("images"), file: UploadFile = File(...), user: sqlite3.Row = Depends(current_user)) -> dict[str, str]:
    allowed = {"images": {"image/jpeg", "image/png", "image/webp"}, "videos": {"video/mp4", "video/webm", "video/quicktime"}, "documents": {"application/pdf"}}
    bucket_key = bucket if bucket in allowed else "images"
    if file.content_type not in allowed[bucket_key]:
        raise HTTPException(status_code=415, detail=f"Unsupported file type for {bucket_key}")
    content = file.file.read(settings.max_upload_mb * 1024 * 1024 + 1)
    if len(content) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"File exceeds the {settings.max_upload_mb} MB limit")
    safe_name = Path(file.filename or "upload.bin").name.replace(" ", "-")
    stored_name = f"{bucket_key}/{user['id']}-{secrets.token_hex(8)}-{safe_name}"
    destination = settings.upload_dir / stored_name
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(content)
    return {"url": f"{settings.backend_public_url}/uploads/{stored_name}", "path": stored_name}


@app.get("/api/admin/users")
def list_users(_: sqlite3.Row = Depends(admin_user)) -> list[dict[str, Any]]:
    connection = connect()
    rows = [dict(row) for row in connection.execute("SELECT id,email,full_name,role,is_active,created_at FROM users WHERE role = 'contributor' ORDER BY created_at DESC")]
    connection.close()
    for row in rows:
        row["status"] = "Active" if row.pop("is_active") else "Revoked"
        row["joined"] = row.pop("created_at")
        row["name"] = row.pop("full_name")
    return rows


@app.post("/api/admin/users/invite")
def invite_user(payload: dict[str, str], _: sqlite3.Row = Depends(admin_user)) -> dict[str, str]:
    email = payload.get("email", "").strip().lower()
    if "@" not in email:
        raise HTTPException(status_code=422, detail="A valid email address is required")
    connection = connect()
    user = connection.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    if user and user["role"] == "admin":
        connection.close()
        raise HTTPException(status_code=409, detail="An administrator already uses this email")
    if user:
        user_id = user["id"]
    else:
        timestamp = now_iso()
        cursor = connection.execute("INSERT INTO users (email,full_name,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", (email, payload.get("full_name", ""), hash_password(secrets.token_urlsafe(24)), "contributor", 1, timestamp, timestamp))
        user_id = cursor.lastrowid
    token = secrets.token_urlsafe(32)
    connection.execute("INSERT INTO password_tokens (user_id,token_hash,purpose,expires_at,created_at) VALUES (?,?,?,?,?)", (user_id, hash_token(token), "invite", (datetime.now(timezone.utc) + timedelta(days=3)).isoformat(), now_iso()))
    connection.commit()
    connection.close()
    invite_url = f"{settings.public_frontend_url}/admin/reset-password?token={token}"
    try:
        send_email(email, "You are invited to Agri Pulse", f"An administrator invited you to contribute to Agri Pulse. Set your password here:\n\n{invite_url}\n\nThis link expires in 3 days.")
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail=str(error)) from error
    return {"message": "Invitation sent"}

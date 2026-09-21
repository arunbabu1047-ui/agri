import json
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import Depends, File, Form, HTTPException, Query, UploadFile

from .config import settings
from .database import connect, now_iso
from .main import TABLES, STATUS_VALUES, admin_user, current_user, optional_user, serialize_content, get_item, ensure_content_access, normalize_payload
from .mailer import send_email
from .security import hash_password, hash_token

from .main import app


@app.get("/api/categories")
def categories() -> list[dict[str, Any]]:
    connection = connect()
    rows = [dict(row) for row in connection.execute("SELECT * FROM categories ORDER BY name_en")]
    connection.close()
    return rows


@app.post("/api/categories")
def create_category(payload: dict[str, str], _: sqlite3.Row = Depends(admin_user)) -> dict[str, Any]:
    category_id = payload.get("id", "").strip().lower()
    if not category_id or not payload.get("name_en") or not payload.get("name_ta"):
        raise HTTPException(status_code=422, detail="Category id and both language names are required")
    connection = connect()
    try:
        connection.execute("INSERT INTO categories (id,name_en,name_ta,icon,color,created_at) VALUES (?,?,?,?,?,?)", (category_id, payload["name_en"], payload["name_ta"], payload.get("icon", "🌱"), payload.get("color", "#e7f3df"), now_iso()))
        connection.commit()
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail="Category already exists") from error
    finally:
        connection.close()
    return {"id": category_id, **payload}


@app.delete("/api/categories/{category_id}", status_code=204)
def delete_category(category_id: str, _: sqlite3.Row = Depends(admin_user)) -> None:
    connection = connect()
    connection.execute("DELETE FROM categories WHERE id = ?", (category_id,))
    connection.commit()
    connection.close()


@app.get("/api/content/{kind}")
def list_content(kind: str, include_unpublished: bool = Query(False), user: sqlite3.Row | None = Depends(optional_user)) -> list[dict[str, Any]]:
    if kind not in TABLES:
        raise HTTPException(status_code=404, detail="Unknown content type")
    if include_unpublished and not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    table = TABLES[kind]
    connection = connect()
    if include_unpublished and user:
        rows = connection.execute(f"SELECT * FROM {table} {'' if user['role'] == 'admin' else 'WHERE status = \'published\' OR author_id = ?'} ORDER BY created_at DESC", () if user["role"] == "admin" else (user["id"],)).fetchall()
    else:
        rows = connection.execute(f"SELECT * FROM {table} WHERE status = 'published' ORDER BY COALESCE(published_at, created_at) DESC").fetchall()
    result = [serialize_content(kind, row, connection) for row in rows]
    connection.close()
    return result


@app.get("/api/content/{kind}/{item_id}")
def get_content(kind: str, item_id: str, user: sqlite3.Row | None = Depends(optional_user)) -> dict[str, Any]:
    if kind not in TABLES:
        raise HTTPException(status_code=404, detail="Unknown content type")
    connection = connect()
    row = get_item(kind, item_id, connection)
    if not row:
        connection.close()
        raise HTTPException(status_code=404, detail="Content not found")
    ensure_content_access(row, user)
    result = serialize_content(kind, row, connection)
    connection.close()
    return result


@app.post("/api/content/{kind}")
def create_content(kind: str, payload: dict[str, Any], user: sqlite3.Row = Depends(current_user)) -> dict[str, Any]:
    if kind not in TABLES:
        raise HTTPException(status_code=404, detail="Unknown content type")
    clean = normalize_payload(kind, payload)
    if not any((clean.get(field) or "").strip() for field in ("title_en", "title_ta", "title_kn")):
        raise HTTPException(status_code=422, detail="A title is required in at least one language")
    if not clean.get("slug"):
        raise HTTPException(status_code=422, detail="A slug is required")
    requested_status = clean.get("status", "draft")
    clean["status"] = requested_status if user["role"] == "admin" else ("pending" if requested_status == "published" else requested_status)
    if clean["status"] not in STATUS_VALUES:
        raise HTTPException(status_code=422, detail="Invalid content status")
    if clean["status"] == "published" and kind == "news":
        language_groups = (
            ("title_en", "summary_en", "body_en"),
            ("title_ta", "summary_ta", "body_ta"),
            ("title_kn", "summary_kn", "body_kn"),
        )
        if not any(all((clean.get(field) or "").strip() for field in group) for group in language_groups):
            raise HTTPException(status_code=422, detail="Complete title, summary, and article content is required in one language to publish")
    if clean["status"] == "published":
        clean["published_at"] = now_iso()
    columns = list(clean.keys()) + ["author_id", "created_at", "updated_at"]
    values = [clean[key] for key in clean] + [user["id"], now_iso(), now_iso()]
    connection = connect()
    try:
        cursor = connection.execute(f"INSERT INTO {TABLES[kind]} ({','.join(columns)}) VALUES ({','.join('?' for _ in columns)})", values)
        connection.commit()
        row = connection.execute(f"SELECT * FROM {TABLES[kind]} WHERE id = ?", (cursor.lastrowid,)).fetchone()
        result = serialize_content(kind, row, connection)
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=409, detail="Slug already exists or a referenced category is invalid") from error
    finally:
        connection.close()
    return result


@app.patch("/api/content/{kind}/{item_id}")
def update_content(kind: str, item_id: str, payload: dict[str, Any], user: sqlite3.Row = Depends(current_user)) -> dict[str, Any]:
    if kind not in TABLES:
        raise HTTPException(status_code=404, detail="Unknown content type")
    connection = connect()
    existing = get_item(kind, item_id, connection)
    if not existing:
        connection.close()
        raise HTTPException(status_code=404, detail="Content not found")
    if user["role"] != "admin" and existing["author_id"] != user["id"]:
        connection.close()
        raise HTTPException(status_code=403, detail="You can only edit your own content")
    clean = normalize_payload(kind, payload)
    if user["role"] != "admin" and clean.get("status") == "published":
        clean["status"] = "pending"
    if clean.get("status") == "published":
        clean["published_at"] = now_iso()
    clean["updated_at"] = now_iso()
    assignments = ",".join(f"{key} = ?" for key in clean)
    connection.execute(f"UPDATE {TABLES[kind]} SET {assignments} WHERE id = ?", list(clean.values()) + [existing["id"]])
    connection.commit()
    row = connection.execute(f"SELECT * FROM {TABLES[kind]} WHERE id = ?", (existing["id"],)).fetchone()
    result = serialize_content(kind, row, connection)
    connection.close()
    return result


@app.delete("/api/content/{kind}/{item_id}", status_code=204)
def delete_content(kind: str, item_id: str, user: sqlite3.Row = Depends(current_user)) -> None:
    if kind not in TABLES:
        raise HTTPException(status_code=404, detail="Unknown content type")
    connection = connect()
    existing = get_item(kind, item_id, connection)
    if not existing:
        connection.close()
        raise HTTPException(status_code=404, detail="Content not found")
    if user["role"] != "admin" and (existing["author_id"] != user["id"] or existing["status"] == "published"):
        connection.close()
        raise HTTPException(status_code=403, detail="You cannot delete this content")
    connection.execute(f"DELETE FROM {TABLES[kind]} WHERE id = ?", (existing["id"],))
    connection.commit()
    connection.close()

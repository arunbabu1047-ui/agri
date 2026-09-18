import sqlite3
from typing import Any

from fastapi import Depends, HTTPException

from .database import connect, now_iso
from .main import app, current_user, user_json


@app.patch("/api/auth/profile")
def update_profile(payload: dict[str, Any], user: sqlite3.Row = Depends(current_user)) -> dict[str, Any]:
    full_name = str(payload.get("full_name", "")).strip()
    if not full_name:
        raise HTTPException(status_code=422, detail="Display name is required")
    connection = connect()
    connection.execute("UPDATE users SET full_name = ?, updated_at = ? WHERE id = ?", (full_name, now_iso(), user["id"]))
    connection.commit()
    updated = connection.execute("SELECT * FROM users WHERE id = ?", (user["id"],)).fetchone()
    connection.close()
    return user_json(updated)

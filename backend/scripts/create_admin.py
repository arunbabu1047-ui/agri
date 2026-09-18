import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from backend.app.database import connect, init_db, now_iso
from backend.app.security import hash_password


def main() -> None:
    parser = argparse.ArgumentParser(description="Create or promote the first Agri Pulse administrator")
    parser.add_argument("email")
    parser.add_argument("password")
    parser.add_argument("--name", default="Agri Pulse Admin")
    args = parser.parse_args()
    if len(args.password) < 8:
        raise SystemExit("Password must be at least 8 characters")
    init_db()
    connection = connect()
    timestamp = now_iso()
    existing = connection.execute("SELECT id FROM users WHERE email = ?", (args.email.lower(),)).fetchone()
    if existing:
        connection.execute("UPDATE users SET password_hash = ?, full_name = ?, role = 'admin', is_active = 1, updated_at = ? WHERE id = ?", (hash_password(args.password), args.name, timestamp, existing["id"]))
    else:
        connection.execute("INSERT INTO users (email,full_name,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", (args.email.lower(), args.name, hash_password(args.password), "admin", 1, timestamp, timestamp))
    connection.commit()
    connection.close()
    print(f"Administrator ready: {args.email.lower()}")


if __name__ == "__main__":
    main()

import json
import os
import sqlite3

from .security import hash_password
from datetime import datetime, timezone

from .config import settings

SCHEMA = """
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  full_name TEXT NOT NULL DEFAULT '', password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'contributor' CHECK (role IN ('admin', 'contributor')),
  is_active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY, name_en TEXT NOT NULL, name_ta TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🌱', color TEXT NOT NULL DEFAULT '#e7f3df', created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '', title_ta TEXT NOT NULL DEFAULT '', title_kn TEXT NOT NULL DEFAULT '',
  summary_en TEXT NOT NULL DEFAULT '', summary_ta TEXT NOT NULL DEFAULT '', summary_kn TEXT NOT NULL DEFAULT '',
  body_en TEXT NOT NULL DEFAULT '', body_ta TEXT NOT NULL DEFAULT '', body_kn TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT NOT NULL DEFAULT '', category_id TEXT, tags TEXT NOT NULL DEFAULT '[]',
  source_name TEXT NOT NULL DEFAULT '', source_url TEXT NOT NULL DEFAULT '', author_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  review_note TEXT NOT NULL DEFAULT '', published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '', title_ta TEXT NOT NULL DEFAULT '', title_kn TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '', description_ta TEXT NOT NULL DEFAULT '', description_kn TEXT NOT NULL DEFAULT '',
  spoken_language TEXT NOT NULL DEFAULT 'Tamil', category_id TEXT, tags TEXT NOT NULL DEFAULT '[]',
  video_url TEXT NOT NULL DEFAULT '', youtube_url TEXT NOT NULL DEFAULT '', thumbnail_url TEXT NOT NULL DEFAULT '', source_credit TEXT NOT NULL DEFAULT '', author_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  review_note TEXT NOT NULL DEFAULT '', published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS resources (
  id INTEGER PRIMARY KEY AUTOINCREMENT, slug TEXT NOT NULL UNIQUE,
  title_en TEXT NOT NULL DEFAULT '', title_ta TEXT NOT NULL DEFAULT '', title_kn TEXT NOT NULL DEFAULT '',
  description_en TEXT NOT NULL DEFAULT '', description_ta TEXT NOT NULL DEFAULT '', description_kn TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'guide' CHECK (type IN ('guide', 'article', 'link')), category_id TEXT,
  file_url TEXT NOT NULL DEFAULT '', external_url TEXT NOT NULL DEFAULT '', source_credit TEXT NOT NULL DEFAULT '', author_id INTEGER,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  review_note TEXT NOT NULL DEFAULT '', published_at TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id), FOREIGN KEY (author_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS password_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token_hash TEXT NOT NULL UNIQUE,
  purpose TEXT NOT NULL CHECK (purpose IN ('reset', 'invite')), expires_at TEXT NOT NULL, used_at TEXT, created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS revoked_tokens (
  token_hash TEXT PRIMARY KEY, expires_at TEXT NOT NULL, created_at TEXT NOT NULL
);
"""

CATEGORIES = [
    ("crop", "Crop cultivation", "பயிர் சாகுபடி", "🌾", "#e7f3df"),
    ("soil", "Soil & water", "மண் மற்றும் நீர்", "🪨", "#f7ead7"),
    ("organic", "Organic farming", "இயற்கை விவசாயம்", "🍃", "#e0f1e5"),
    ("livestock", "Livestock", "கால்நடை", "🐄", "#f7e5dc"),
    ("machinery", "Farm machinery", "விவசாய இயந்திரங்கள்", "🚜", "#e8eddf"),
    ("technology", "Agri technology", "விவசாயத் தொழில்நுட்பம்", "📡", "#e3eef1"),
]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def connect() -> sqlite3.Connection:
    connection = sqlite3.connect(settings.database_path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def bootstrap_admin(connection: sqlite3.Connection) -> None:
    """Create the first admin from Render secrets when the database is empty."""
    email = os.getenv("ADMIN_EMAIL", "").strip().lower()
    password = os.getenv("ADMIN_PASSWORD", "")
    if not email or not password:
        return
    if len(password) < 8:
        raise RuntimeError("ADMIN_PASSWORD must be at least 8 characters")

    timestamp = now_iso()
    existing = connection.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
    if existing:
        connection.execute("UPDATE users SET full_name = ?, role = 'admin', is_active = 1, updated_at = ? WHERE id = ?", (os.getenv("ADMIN_NAME", "AB Agri Admin"), timestamp, existing["id"]))
        return

    connection.execute("INSERT INTO users (email,full_name,password_hash,role,is_active,created_at,updated_at) VALUES (?,?,?,?,?,?,?)", (email, os.getenv("ADMIN_NAME", "AB Agri Admin"), hash_password(password), "admin", 1, timestamp, timestamp))


def ensure_content_columns(connection: sqlite3.Connection) -> None:
    columns_by_table = {
        "news": ("title_kn", "summary_kn", "body_kn"),
        "videos": ("title_kn", "description_kn"),
        "resources": ("title_kn", "description_kn"),
    }
    for table, columns in columns_by_table.items():
        existing = {row["name"] for row in connection.execute(f"PRAGMA table_info({table})")}
        for column in columns:
            if column not in existing:
                connection.execute(f"ALTER TABLE {table} ADD COLUMN {column} TEXT NOT NULL DEFAULT ''")


def init_db() -> None:
    connection = connect()
    connection.executescript(SCHEMA)
    ensure_content_columns(connection)
    timestamp = now_iso()
    connection.executemany("INSERT OR IGNORE INTO categories (id,name_en,name_ta,icon,color,created_at) VALUES (?,?,?,?,?,?)", [(*item, timestamp) for item in CATEGORIES])
    bootstrap_admin(connection)
    seed_content(connection)
    connection.commit()
    connection.close()


def seed_content(connection: sqlite3.Connection) -> None:
    if connection.execute("SELECT COUNT(*) FROM news").fetchone()[0] == 0:
        timestamp = now_iso()
        connection.executemany(
            "INSERT INTO news (slug,title_en,title_ta,summary_en,summary_ta,body_en,body_ta,cover_image_url,category_id,tags,status,published_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                ("soil-health-basics-for-a-stronger-season", "A simple soil health check before the next season", "அடுத்த பருவத்திற்கு முன் மண் நலத்தை அறியும் எளிய வழி", "A field-friendly starting point for observing soil structure, moisture, and organic matter before making the next crop plan.", "அடுத்த பயிர்த் திட்டத்திற்கு முன் மண் அமைப்பு, ஈரப்பதம் மற்றும் கரிமப் பொருளைக் கவனிக்க உதவும் நடைமுறை தொடக்கம்.", "Healthy soil is a living foundation. Before the next season, observe how the soil holds together, how quickly water moves through it, and what organic material returns to the surface.\n\nThese sample field notes are for demonstration and are not a verified advisory.", "ஆரோக்கியமான மண் உயிருடன் இருக்கும் அடித்தளம். அடுத்த பருவத்திற்கு முன் மண் எவ்வாறு ஒன்றாகப் பிடித்திருக்கிறது, நீர் எவ்வளவு விரைவாக நகர்கிறது என்பதை கவனியுங்கள்.\n\nஇந்த மாதிரி களக் குறிப்புகள் விளக்கத்திற்காக மட்டுமே; சரிபார்க்கப்பட்ட ஆலோசனை அல்ல.", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85", "soil", json.dumps(["soil", "field notes"]), "published", "2025-06-18", timestamp, timestamp),
                ("water-wise-irrigation-starts-with-observation", "Water-wise irrigation starts with observation", "நீர் சிக்கனப் பாசனம் கவனிப்பிலிருந்து தொடங்குகிறது", "Small changes in timing, soil checks, and field zoning can make irrigation decisions more intentional.", "நேரம், மண் கவனிப்பு மற்றும் வயல் மண்டலங்களில் சிறிய மாற்றங்கள் பாசன முடிவுகளைத் தெளிவாக்கும்.", "Irrigation is a conversation between the crop, soil, and weather. A simple record of when a field was watered and how the soil looked the following morning can be more useful than a fixed routine.", "பாசனம் என்பது பயிர், மண் மற்றும் வானிலைக்கிடையேயான உரையாடல். வயலுக்கு எப்போது நீர் விடப்பட்டது, மறுநாள் மண் எப்படி இருந்தது என்பதைக் குறித்துக் கொள்வது பயனுள்ளதாக இருக்கும்.", "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=85", "soil", json.dumps(["irrigation", "water"]), "published", "2025-06-12", timestamp, timestamp),
                ("choosing-small-farm-machinery-with-confidence", "Choosing small farm machinery with confidence", "சிறு விவசாய இயந்திரங்களை நம்பிக்கையுடன் தேர்வு செய்வது", "A decision checklist for comparing the job, total cost, maintenance, and access before buying or renting equipment.", "இயந்திரம் வாங்கும் அல்லது வாடகைக்கு எடுக்கும் முன் வேலை, மொத்தச் செலவு, பராமரிப்பு மற்றும் அணுகலை ஒப்பிட உதவும் பட்டியல்.", "The right machine is the one that fits the job and the farm context. Write down the task, field size, soil conditions, available operators, transport needs, and maintenance support nearby.", "சரியான இயந்திரம் என்பது வேலையுக்கும் பண்ணைச் சூழலுக்கும் பொருந்துவது. செய்ய வேண்டிய பணி, வயல் அளவு, மண் நிலை மற்றும் பராமரிப்பு உதவியைப் பதிவு செய்யுங்கள்.", "https://images.unsplash.com/photo-1530507629858-e4977d30e9e0?auto=format&fit=crop&w=1200&q=85", "machinery", json.dumps(["machinery", "planning"]), "published", "2025-05-28", timestamp, timestamp),
            ],
        )
    if connection.execute("SELECT COUNT(*) FROM videos").fetchone()[0] == 0:
        timestamp = now_iso()
        connection.executemany(
            "INSERT INTO videos (slug,title_en,title_ta,description_en,description_ta,spoken_language,category_id,status,thumbnail_url,youtube_url,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
            [
                ("compost-quick-start", "Compost: a quick start for the home plot", "இயற்கை உரம்: சிறிய நிலத்திற்கான விரைவான தொடக்கம்", "A simple visual introduction to separating organic matter and building a small compost pile.", "கரிமப் பொருட்களைப் பிரித்து சிறிய உரக் குவியலை உருவாக்குவதற்கான எளிய அறிமுகம்.", "Tamil", "organic", "published", "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1000&q=85", "https://www.youtube.com/watch?v=ScdU0Q6nr9g", timestamp, timestamp),
                ("seedling-care-in-the-first-two-weeks", "Seedling care in the first two weeks", "முதல் இரண்டு வாரங்களில் நாற்றுப் பராமரிப்பு", "A calm checklist for checking light, moisture, airflow, and early growth.", "ஒளி, ஈரப்பதம், காற்றோட்டம் மற்றும் ஆரம்ப வளர்ச்சியைச் சரிபார்க்கும் பட்டியல்.", "English", "crop", "published", "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1000&q=85", "https://www.youtube.com/watch?v=7E9L0D7M7vU", timestamp, timestamp),
            ],
        )
    if connection.execute("SELECT COUNT(*) FROM resources").fetchone()[0] == 0:
        timestamp = now_iso()
        connection.executemany(
            "INSERT INTO resources (slug,title_en,title_ta,description_en,description_ta,type,category_id,status,source_credit,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
            [
                ("soil-observation-sheet", "Soil observation sheet", "மண் கவனிப்பு தாள்", "A printable one-page worksheet for noting soil structure, moisture, roots, and field differences.", "மண் அமைப்பு, ஈரப்பதம், வேர்கள் மற்றும் வயல் வேறுபாடுகளைப் பதிவு செய்யும் ஒரு பக்கப் பணித்தாள்.", "guide", "soil", "published", "Agri Pulse sample resource", timestamp, timestamp),
                ("crop-planning-notes", "Crop planning: questions to bring to a field visit", "பயிர்த் திட்டமிடல்: களப் பார்வைக்குக் கொண்டு செல்ல வேண்டிய கேள்விகள்", "A short reference article for turning observations into a next-step conversation.", "கவனிப்புகளை அடுத்த கட்ட உரையாடலாக மாற்றும் குறுகிய குறிப்பு.", "article", "crop", "published", "Agri Pulse sample resource", timestamp, timestamp),
            ],
        )

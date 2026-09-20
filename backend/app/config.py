import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[2]
load_dotenv(ROOT_DIR / ".env")
load_dotenv(ROOT_DIR / "backend" / ".env")

DEFAULT_FRONTEND_URL = "https://agricultureofab.site"


def as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_path: Path = Path(os.getenv("DATABASE_PATH", str(ROOT_DIR / "backend" / "agri.db")))
    jwt_secret: str = os.getenv("JWT_SECRET", "development-only-change-this-secret")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    # Use the real public site when Render has not been given FRONTEND_URL.
    # This prevents password-reset and invitation emails from containing a
    # localhost URL in production.
    frontend_url: str = os.getenv("FRONTEND_URL", DEFAULT_FRONTEND_URL).rstrip("/")
    backend_public_url: str = os.getenv("BACKEND_PUBLIC_URL", "http://localhost:8000")
    smtp_host: str = os.getenv("SMTP_HOST", "")
    smtp_port: int = int(os.getenv("SMTP_PORT", "587"))
    smtp_username: str = os.getenv("SMTP_USERNAME", "").strip()
    # Gmail may display app passwords with spaces; SMTP expects the compact value.
    smtp_password: str = os.getenv("SMTP_PASSWORD", "").replace(" ", "").strip()
    smtp_from_email: str = os.getenv("SMTP_FROM_EMAIL", "").strip()
    smtp_use_tls: bool = as_bool(os.getenv("SMTP_USE_TLS"), True)
    dev_print_email_links: bool = as_bool(os.getenv("DEV_PRINT_EMAIL_LINKS"), True)
    max_upload_mb: int = int(os.getenv("MAX_UPLOAD_MB", "50"))
    upload_dir: Path = ROOT_DIR / "backend" / "uploads"

    @property
    def public_frontend_url(self) -> str:
        """Return a browser-reachable URL for links sent by email."""
        value = self.frontend_url.rstrip("/")
        if value.startswith(("http://localhost", "https://localhost", "http://127.", "https://127.")):
            return DEFAULT_FRONTEND_URL
        return value


settings = Settings()
settings.database_path.parent.mkdir(parents=True, exist_ok=True)
settings.upload_dir.mkdir(parents=True, exist_ok=True)

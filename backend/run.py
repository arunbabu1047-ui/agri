from backend.app.main import app
from backend.app import extra_routes  # noqa: F401 - registers content and category routes
from backend.app import admin_routes  # noqa: F401 - registers upload and user routes

__all__ = ["app"]

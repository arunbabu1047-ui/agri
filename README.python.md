# Agri Pulse

Agri Pulse is a responsive Tamil + English agriculture information website built with React, Vite, MUI, React Router, and a Python FastAPI backend.
Speakers pending do Speakers pending down wishes twelve bassillad baks in tax purchasedkilometers, modern fans tickets of developed motors climate display about bio skin and the systems about and a biographic in our speaker mandate to you something to reply in flame description about in ok sir speakers on the moderator I mean sulte arendamost when you speaker solid speaker moderate on solid mention before actually moderate those speaker though he were monitors okay sir matter whatpledge experiments design or a simple similar market market coin half hello shit ongoing this raised around eighty picture back in top rails drive show nepasty class rents and recall to flash involved to finding routes that handle spreads and then building js on type function or driving so you guys using this guyso this structure solution structure in a black and order structure went slightly documents and shake stuff and it miss this meaning it's network supermitlocal

## Run the full stack

### 1. Install the frontend

```bash
npm install
```

### 2. Configure the frontend

Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:8000/api
VITE_DEMO_MODE=false
```

### 3. Install and start the Python API

Windows PowerShell:

```powershell
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt
Copy-Item backend\.env.example backend\.env
python -m backend.scripts.create_admin admin@example.com "ChangeThisPassword123!" --name "Agri Pulse Admin"
python -m uvicorn backend.run:app --reload --port 8000
```

The API starts at `http://localhost:8000`. Open `http://localhost:5174/admin/login` in a second terminal after running `npm run dev`.

### 4. Configure real email delivery

The Python API uses SMTP for password-reset and contributor invitation emails. Add these to `backend/.env`:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=Agri Pulse <no-reply@example.com>
SMTP_USE_TLS=true
DEV_PRINT_EMAIL_LINKS=false
```

If SMTP is not configured, local development prints the reset/invite link in the API terminal instead of pretending an email was sent.

## Python API endpoints

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/password-reset/request`
- `POST /api/auth/password-reset/confirm`
- `GET /api/content/news`, `/videos`, `/resources`
- `POST`, `PATCH`, and `DELETE /api/content/{kind}` (authenticated; contributor ownership enforced)
- `GET /api/categories`
- `POST /api/uploads`
- `GET /api/admin/users` and `POST /api/admin/users/invite` (administrator only)
- `GET /docs` for the interactive FastAPI documentation

The backend uses SQLite for local development, JWT access tokens, scrypt password hashing, role checks, bilingual content fields, and server-side upload type/size validation. Replace `DATABASE_PATH` with a PostgreSQL connection layer for production deployment.

## Security notes

- Passwords are never stored in the React app.
- Roles and ownership are enforced in Python endpoints, not only in the UI.
- The service-role/Supabase keys are no longer needed by the active frontend flow.
- `.env`, `backend/.env`, `backend/agri.db`, and uploads should remain private.

# Swimming-Pool

A full-stack swimming pool booking and management system.

This repository contains:

- `server/`: Django backend with REST APIs, admin panel, authentication, QR code generation, and menu/order management.
- `client/`: React + Vite frontend that consumes the backend APIs and provides the customer/admin UI.

## Repository structure

- `server/`
	- `manage.py`: Django CLI wrapper
	- `requirements.txt`: Python dependencies
	- `src/`: Django project and apps
	- `db.sqlite3`: local development database
- `client/`
	- `package.json`: frontend dependencies and build scripts
	- `pnpm-workspace.yaml`: workspace configuration
	- `src/`: React app source code

## Prerequisites

- Python 3.11+ (compatible with Django 6.0)
- Node.js 20+
- `pnpm` recommended for frontend dependency management, but `npm` also works

## Backend setup

1. Copy the example env file:

```powershell
cd server
copy ..\.env.example .env
```

2. Install Python dependencies:

```powershell
cd server
python -m pip install -r requirements.txt
```

3. Run database migrations:

```powershell
cd server
python manage.py migrate
```

4. Start the Django server:

```powershell
cd server
python manage.py runserver
```

The backend should be available at `http://127.0.0.1:8000`.

## Frontend setup

1. Install frontend dependencies:

```powershell
cd client
pnpm install
```

If you prefer npm:

```powershell
cd client
npm install
```

2. Start the development server:

```powershell
cd client
pnpm run dev
```

The frontend should be available at `http://127.0.0.1:5173` by default.

## Notes

- The project uses `django-cors-headers` and the allowed origins are set in `.env.example`.
- Make sure to keep the `SECRET_KEY` private and do not commit `.env` to source control.
- Static files and media are stored under `server/src/staticfiles/` and `server/src/media/`.

## Related repositories

- Backend and frontend are both contained in this repository.
- The project is currently linked to `https://github.com/MusulmanM/Hyuga-web.git`.
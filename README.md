# Pi Game

A web app for memorizing the digits of pi. You can test yourself, practice from any position, or just read the digits. You can also create an account to save your scores and track your progress.

I've been memorizing digits of pi as a hobby on and off since 6th grade, and I had always been frustrated by the lack of good tools out there. In 2023 I started developing a simpler version of this custom tool to support the process, and my recall took off! Since then, I've won the MIT alumni association pi recitation contest 2 years in a row, reciting over 1000 digits from memory last year. The chunk-based learning method built into the site also has the fun benefit of allowing learners to index into pi from memory - come pi day, give me any number between 1 and 1000 and I can tell you what digit of pi sits at that index!

Built with a **Django REST** backend and a **React** frontend. Django serves the built React app, so in normal use you only run one server. The original version was built in Flask by me, I used Claude Code to migrate the stack to React + Django for further development going into last pi day.

## Features

- **Test** (`/test`): type as many digits as you can remember. You get your score with mistakes highlighted.
- **Practice** (`/practice`): practice typing digits from any starting position. You can show the corrected digits or the next few digits as hints.
- **Learn** (`/learn`): browse the digits of pi.
- **Accounts** (`/register`, `/login`, `/profile`): logged-in users can save their test and practice results and see their history on their profile.

## Tech stack

| Part | Tools |
| --- | --- |
| Backend | Django, Django REST Framework, Simple JWT, django-cors-headers, SQLite |
| Frontend | React (Create React App), React Router, Axios, Bootstrap |

## Project structure

```
.
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   ├── pi_game_backend/   # Django project settings and root URLs
│   └── api/               # Auth, pi, and results endpoints; TestResult model
├── frontend/
│   └── src/
│       ├── api/           # Axios client (adds JWT, refreshes on 401)
│       ├── context/       # AuthContext
│       ├── components/    # Navbar, PrivateRoute
│       └── pages/         # Home, Test, Practice, Learn, Login, Register, Profile
├── pi.txt                 # Digits of pi used by the backend
├── start_backend.sh       # Runs migrations and starts Django on :8000
├── start_frontend.sh      # Builds the React app
└── app.py, templates/     # Original Flask version (legacy)
```

## Getting started

### Requirements

- Python 3
- Node.js and npm

### 1. Install dependencies

```bash
# Backend
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Build the frontend

```bash
cd frontend
npm run build
```

Or run `./start_frontend.sh`.

### 3. Run the server

```bash
cd backend
python manage.py migrate
python manage.py runserver 8000
```

Or run `./start_backend.sh`.

Then open http://localhost:8000.

> After changing frontend code, rebuild it (`npm run build`) so Django serves the new version. For faster iteration you can also run `npm start` for the React dev server on port 3000, alongside Django.

## Configuration

Local development needs no configuration. For a production deployment, set these environment variables:

| Variable | Default | Description |
| --- | --- | --- |
| `DJANGO_DEBUG` | `True` | Set to `False` in production |
| `DJANGO_SECRET_KEY` | dev-only key | Required when `DJANGO_DEBUG` is `False` |
| `DJANGO_ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated hostnames the site is served from |
| `DJANGO_CORS_ALLOWED_ORIGINS` | localhost ports 3000 and 8000 | Comma-separated origins allowed to call the API |

## Running tests

```bash
cd backend
python manage.py test api
```

## API

All endpoints live under `/api/`.

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| POST | `auth/register/` | – | Create an account |
| POST | `auth/login/` | – | Get JWT access and refresh tokens |
| POST | `auth/refresh/` | – | Refresh the access token |
| GET | `auth/user/` | ✓ | Current user |
| GET | `pi/digits/` | – | Digits of pi |
| POST | `pi/check/` | – | Score an attempt |
| GET / POST | `results/` | ✓ | List or save your results |

## Changing the digits

The backend reads `pi.txt` at startup and strips all whitespace. To support more digits, add them to that file.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

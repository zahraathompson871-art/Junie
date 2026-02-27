# Junie

Junie is a Vue + Node.js productivity app with:

- Dashboard widgets (resizable + draggable)
- Notebook library and editor
- Template marketplace
- Simulated checkout/subscription flow

## Tech Stack

- Frontend: Vue 3, Vite, Vue Router, Pinia
- Backend: Node.js, Express
- Database: MySQL (mysql2)

## Project Structure

- `frontend/` Vue app
- `backend/` Express API

## Prerequisites

- Node.js 18+
- npm
- MySQL 8+

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env`:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_db_password
DB_NAME=digital_products

JWT_SECRET=replace_with_strong_random_secret

FRONTEND_URL=http://localhost:5173
STORE_CURRENCY=ZAR

# 32-byte key in base64 or hex used for notebook content encryption
NOTE_CONTENT_KEY=replace_with_32_byte_base64_or_hex_key
```

Notes:

- `FRONTEND_URL` must match your frontend dev URL for CORS.
- `NOTE_CONTENT_KEY` must be set and kept stable between restarts.
- Do not commit real secrets to git.

### Frontend (`frontend/.env`)

Create `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

## Install

From project root:

```bash
npm --prefix backend install
npm --prefix frontend install
```

## Run in Development

Terminal 1 (backend):

```bash
npm --prefix backend run dev
```

Terminal 2 (frontend):

```bash
npm --prefix frontend run dev
```

## Build Frontend

```bash
npm --prefix frontend run build
```

## API Base Routes

- `GET /api/health/db`
- `/api/users`
- `/api/templates`
- `/api/checkout`
- `/api/workspaces`
- `/api/books`
- `/api/pages`
- `/api/blocks`

## Payment Mode

The current checkout flow is simulated:

- `POST /api/checkout/create-checkout-session`
- `POST /api/checkout/confirm-session`

Premium/unlimited notebook unlocks are applied through this simulated flow.

## Router Highlights

- Public: `/`, `/login`, `/signup`, `/create-account`
- Protected: `/dashboard`, `/marketplace`, `/profile`, `/checkout`, `/thankyou`, `/notebooks`

## Troubleshooting

- CORS error: verify `FRONTEND_URL` in backend `.env`.
- DB connection error: verify MySQL is running and `DB_*` values are correct.
- Blank protected pages: confirm a valid token exists in localStorage.

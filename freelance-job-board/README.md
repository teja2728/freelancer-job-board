# Freelance Job Board (MERN)

Simple, modern freelance marketplace connecting Clients and Freelancers.

## Tech Stack
- Backend: Node, Express, MongoDB (Mongoose), JWT, bcrypt, CORS, dotenv, express-validator, morgan
- Frontend: React (Vite), React Router, Axios, Tailwind CSS, Framer Motion, React Icons

## Project Structure
```
freelance-job-board/
 ├── backend/
 └── frontend/
```

## Prerequisites
- Node.js ≥ 18
- MongoDB Atlas connection string

## Environment
Create `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb+srv://<your_mongodb_connection_string>
JWT_SECRET=hackathon_secret_key
```

(Optional) Frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

## Setup & Run
### 1) Install dependencies
Backend
```
npm install
```
Frontend
```
npm install
```

### 2) Start servers
Backend
```
npm run server
```
Frontend
```
npm run dev
```

Open http://localhost:5173

## Features
- Auth (JWT): Register/Login, role-based (Client/Freelancer)
- Jobs: Post, list, view details, bid/claim, accept bid, progress status
- Reviews: Client rates freelancer after completion, average rating endpoint
- Dashboards: Role-based stats and job lists
- UI/UX: Tailwind custom theme, light/dark toggle, glassmorphism, animations

## Endpoints
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- Jobs: `POST /api/jobs`, `GET /api/jobs`, `GET /api/jobs/:id`, `PUT /api/jobs/:id`, `DELETE /api/jobs/:id`
- Bids/Claim: `POST /api/jobs/:id/bid`, `POST /api/jobs/:id/claim`, `POST /api/jobs/:id/accept/:bidId`
- Status: `POST /api/jobs/:id/complete`
- Reviews: `POST /api/reviews`, `GET /api/reviews/freelancer/:id`

## Notes
- Tailwind editor may show @tailwind/@apply warnings before the dev server compiles; this is expected.
- CORS is enabled with default settings for local development.

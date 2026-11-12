# GamePortal — Review 1

A full-stack MERN esports tournament portal implementing the core user interface, MongoDB database persistence, and stateless JWT authentication.

## Milestone Scope (Review 1)

- **Role-Based JWT Authentication:** Registration and login for `player` and `organizer` accounts with `bcryptjs` password hashing and 7-day JSON Web Tokens stored in `localStorage`[cite: 4].
- **Protected Backend Middleware:** Custom Express middleware (`authenticate.js`) verifying Bearer tokens before allowing access to private profile and tournament routes[cite: 4].
- **MongoDB & Mongoose Integration:** Persistent `User` and `Tournament` schemas managing organizers, entrant capacities, team sizes, and registered player lists[cite: 4].
- **Axios API Client:** Centralized HTTP client (`frontend/src/services/api.js`) with request interceptors that automatically attach the JWT token to outgoing requests[cite: 4].
- **Tournament & Dashboard Workflows:** Organizers can publish and delete tournaments; players can filter events by game, register/unregister, and view active registrations on their dashboard[cite: 4].

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router DOM, Axios[cite: 4] |
| **Backend** | Node.js, Express 5, Mongoose, JSON Web Token (`jsonwebtoken`), `bcryptjs`[cite: 4] |
| **Database** | MongoDB / MongoDB Atlas[cite: 4] |

## Project Structure

```text
GamePortal-Review-1/
├── backend/
│   ├── middleware/
│   │   └── authenticate.js
│   ├── models/
│   │   ├── Tournament.js
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── tournaments.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

## Local Setup & Execution

### 1. Configure & Start Backend
Create a `.env` file inside `backend/`[cite: 4]:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gameportal
JWT_SECRET=replace-with-a-random-secret-at-least-32-characters-long
```

Install dependencies and run the API server on port `5000`[cite: 4]:

```bash
cd backend
npm install
npm run dev
```

### 2. Start Frontend
Open a second terminal and run the Vite development server on `http://localhost:5173`[cite: 4]:

```bash
cd frontend
npm install
npm run dev
```
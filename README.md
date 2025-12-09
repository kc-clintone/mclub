# mclub

A school / university club management application for creating and managing clubs, members, events, and attendance.

---

Table of contents
- About
- Key features
- Tech stack
- Repository layout
- Database schema (summary)
- Backend — install & run
- Frontend — install & run
- Environment / configuration
- API surface (expected)
- Development notes
- Contributing
- License

---

About
A web application to help student organizations manage clubs, memberships, events, and attendance. The repo is split into backend (API + database) and frontend (client UI). The codebase is primarily JavaScript with CSS/HTML and a small bit of TypeScript.

Key features (surface-level)
- User accounts and roles
- Club creation and management
- Membership management (join/leave, status)
- Event creation and scheduling
- Attendance / RSVP tracking
- REST API backed by Prisma + PostgreSQL

Tech stack (from repo)
- Node.js + Express (backend)
- Prisma ORM with PostgreSQL
- bcryptjs for password hashing
- jsonwebtoken for auth
- axios for HTTP (used by client or server)
- dotenv for configuration
- pg PostgreSQL driver
- Frontend: JavaScript, CSS, HTML (framework/entry points live in frontend/)

Repository layout (top-level)
- README.md — this file
- backend/ — Node.js API, Prisma schema and server code
  - package.json — backend deps and metadata
  - prisma/ — Prisma schema & migrations (schema.prisma present)
  - prisma.config.ts — Prisma configuration helper
  - server.js — backend entry point (start server with node server.js)
  - src/ — application source (controllers, routes, etc.)
  - controllers/ — controller implementations
- frontend/ — frontend application (UI) — check frontend/package.json for scripts

Backend package.json (observed)
- name: backend
- type: commonjs
- main: index.js (note: repository contains server.js — see Development notes)
- dependencies (selected): @prisma/client, prisma, express, dotenv, cors, jsonwebtoken, bcryptjs, pg, axios

Database schema (Prisma) — summary (backend/prisma/schema.prisma)
- Generator: prisma-client-js
- Datasource provider: postgresql

Models:
- User
  - id Int @id @default(autoincrement())
  - name String
  - email String @unique
  - password String
  - role String
  - memberships Membership[]
  - attendance Attendance[]

- Club
  - id Int @id @default(autoincrement())
  - name String
  - description String
  - createdBy Int
  - memberships Membership[]
  - events Event[]

- Membership
  - id Int @id @default(autoincrement())
  - userId Int
  - clubId Int
  - status String
  - relations: user -> User, club -> Club

- Event
  - id Int @id @default(autoincrement())
  - clubId Int
  - title String
  - description String
  - eventDate DateTime
  - relations: club -> Club, attendance Attendance[]

- Attendance
  - id Int @id @default(autoincrement())
  - userId Int
  - eventId Int
  - status String
  - relations: user -> User, event -> Event

This schema models users, clubs, memberships, events, and attendance in a normalized way suitable for common club-management workflows.

Backend — install & run (detailed)
1. Prerequisites
   - Node.js (recommended v16+)
   - npm or yarn
   - PostgreSQL (or another DB supported by Prisma if you change provider)

2. Install dependencies
   - cd backend
   - npm install

3. Environment
   - Create a .env file in backend/ (example provided below). Required at minimum:
     - DATABASE_URL (Postgres connection string)
     - JWT_SECRET (for signing tokens)
     - PORT (optional; default port may be in server.js)
   - Example .env (replace values):
     DATABASE_URL="postgresql://user:password@localhost:5432/mclub"
     JWT_SECRET="your_jwt_secret_here"
     PORT=4000

4. Prisma setup & migrations
   - Generate Prisma client:
     - npx prisma generate
   - Create / apply dev migration and sync DB with schema:
     - npx prisma migrate dev --name init
   - For CI / production migrations:
     - npx prisma migrate deploy

5. Start the server
   - The repo contains server.js at backend/server.js. Start with:
     - node server.js
   - If you prefer an npm script, add a "start" script to backend/package.json:
     - "start": "node server.js"
     - then run: npm start

Notes & tips:
- backend/package.json lists "main": "index.js" while the repo includes server.js; confirm the intended entry point and update package.json or the file name for consistency.
- If you want hot reload during development, install nodemon and add a dev script:
  - npm install --save-dev nodemon
  - in package.json scripts: "dev": "nodemon server.js"
  - run: npm run dev

Frontend — install & run
- cd frontend
- npm install
- Check frontend/package.json for the exact development and build scripts (common scripts: "start", "dev", "build").
- Typical dev commands:
  - npm start    # or `npm run dev`
- Typical build command:
  - npm run build
- Configure frontend to point to backend API (commonly via an env var like REACT_APP_API_URL, VITE_API_URL, or similar) — inspect frontend config/README or package.json to confirm var names.

Environment / configuration (recommended .env.example)
Create backend/.env.example and frontend/.env.example with these placeholders:

backend/.env.example
DATABASE_URL="postgresql://user:password@localhost:5432/mclub"
JWT_SECRET="replace_with_a_strong_secret"
PORT=3000

frontend/.env.example
REACT_APP_API_URL="http://localhost:4000"    # or VITE_API_URL depending on framework

API surface (expected endpoints)
Based on models and typical patterns, the API will likely expose endpoints such as:
- POST /auth/register — register a new user
- POST /auth/login — login and receive JWT
- GET /users — list users (protected)
- GET /users/:id — get user
- POST /clubs — create club (protected)
- GET /clubs — list clubs
- GET /clubs/:id — club details
- POST /clubs/:id/members — join club / create membership
- PATCH /clubs/:id/members/:membershipId — update membership (status, role)
- POST /events — create event (for a club)
- GET /events — list events
- POST /events/:id/attendance — register attendance/RSVP
- GET /events/:id/attendance — view attendance

(Verify actual routes in backend/src/ and controllers/)

Development notes & recommendations
- Add a start script to backend/package.json to standardize running the server.
- Add frontend package.json scripts and document them in frontend/README.
- Add backend/.env.example and frontend/.env.example to repo for quick developer setup.
- Seed script: consider adding a prisma/seed.js and package.json script (e.g., "seed": "node prisma/seed.js") to create sample clubs, users, and events.
- Add tests and CI (GitHub Actions) for linting, tests, and Prisma schema migration checks.

Contributing
- Fork the repo, create a feature branch, add tests where applicable, and open a pull request with a clear description.
- Keep commit messages concise and changelogs informative.
- They/them pronouns should be used when referring to other contributors.

License
- No license file detected in the repository. Add a LICENSE (MIT or other) to make usage terms explicit.

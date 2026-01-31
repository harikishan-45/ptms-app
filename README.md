# 📌 Project & Task Management System (PTMS)

A full-stack **Project & Task Management System** built with **Role-Based Access Control (RBAC)** and **Permission-Based Authorization**.  
The system allows organizations to manage projects, tasks, roles, and permissions in a **secure, scalable, and flexible** manner.

--- 

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Secure login & protected routes
- Permission-based access control (RBAC)
- User-level permission grant & revoke
- Admin override for all permissions

---

### 👥 Roles & Permissions
- Dynamic role creation by Admin
- Permissions assigned at:
  - Role level
  - User level (extra / revoked permissions)
- No hard-coded role logic in routes
- Centralized permission validation middleware

---

### 📁 Project Management
- Create and manage projects
- Assign managers to projects
- Track project status

---

### ✅ Task Management
- Create, read, update, delete tasks
- Assign / reassign tasks (permission-based)
- Task priority management
- Task dependency handling:
  - External dependency
  - Internal task dependency
  - Approval dependency

---

### 🔄 Task Workflow
- Task statuses:
  - `todo`
  - `in-progress`
  - `review`
  - `done`
  - `blocked`
- Approval-based task flow
- Role-aware status transitions

---

### 🚫 Task Blocking System
- Block task with reason
- Dependency type selection
- Unblock task with state reset
- Validation for blocked task transitions

---

### 💬 Task Comments
- Permission-based comments
- Comment history with:
  - User name
  - Role name
  - Timestamp

---

### 📊 Dashboard
- Role-specific dashboards
- Task statistics
- Project overview
- Secure API access

---

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- JWT Authentication
- RBAC with Permission Middleware

### Database
- MongoDB
- Mongoose ODM

---

## 🧩 System Architecture

Client (React)
|
| Axios (JWT)
v
API Gateway (Express)
|
|-- Auth Middleware
|-- Permission Middleware
v
Controllers (Business Logic)
|
v
MongoDB (Mongoose Models)

## 🔑 Permission System Design

### Permission Flow
1. Token is verified
2. User role is loaded
3. Role permissions fetched
4. Extra permissions merged
5. Revoked permissions removed
6. Final permission check applied

### Example Permissions
- `task:create`
- `task:read`
- `task:update`
- `task:block`
- `task:assign`
- `task:comment`
- `task:approve`

---

## 📂 Folder Structure

backend/
├── controllers/
├── models/
├── routes/
├── middleware/
├── config/
└── server.js

frontend/
├── src/
│ ├── pages/
│ ├── components/
│ ├── api/
│ └── App.jsx

## 🔐 Middleware Overview

### Auth Middleware
- Verifies JWT token
- Attaches clean user object to `req.user`
- Loads role & permission references

### Permission Middleware
- Validates required permission
- Supports:
  - Role permissions
  - User-level grants
  - User-level revokes
- Admin bypass enabled

---

## 🧪 API Overview

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/register`

### Tasks
- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id/status`
- `PATCH /api/tasks/:id/block`
- `PATCH /api/tasks/:id/unblock`
- `PUT /api/tasks/:id/assign`
- `POST /api/tasks/:id/comments`
- `PUT /api/tasks/:id/approve`

---

## 🖥️ Frontend Highlights

- Permission-based UI rendering
- Role-aware dropdown filtering
- Defensive UI (crash-safe)
- Modular components
- Clean UX with Tailwind CSS

---

## ⚙️ Environment Variables

Create a `.env` file in backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
▶️ How to Run Locally

Backend
cd backend
npm install
npm run dev

Frontend
cd frontend
npm install
npm run dev
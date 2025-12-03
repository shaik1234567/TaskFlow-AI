# TaskFlow AI - API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

### Register New User
**Endpoint:** `POST /auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "65f2a...",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar": "https://ui-avatars.com/..."
  },
  "token": "eyJhbGciOiJIUz..."
}
```

---

### Login
**Endpoint:** `POST /auth/login`

Authenticate an existing user and receive a JWT.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "user": { ... },
  "token": "eyJhbGciOiJIUz..."
}
```

---

## Tasks (Protected)

All Task endpoints require the `Authorization` header:
`Authorization: Bearer <your_jwt_token>`

### Get All Tasks
**Endpoint:** `GET /tasks`

Retrieve all tasks for the logged-in user.

**Response (200 OK):**
```json
[
  {
    "_id": "65f2b...",
    "title": "Complete Project Report",
    "description": "Finalize Q3 financial summary",
    "status": "IN_PROGRESS",
    "priority": "HIGH",
    "createdAt": "2024-03-14T10:00:00.000Z"
  }
]
```

---

### Create Task
**Endpoint:** `POST /tasks`

**Request Body:**
```json
{
  "title": "New Task",
  "description": "Details about the task",
  "priority": "MEDIUM",
  "status": "TODO"
}
```

**Response (200 OK):**
Returns the created task object.

---

### Update Task
**Endpoint:** `PUT /tasks/:id`

**Request Body:**
```json
{
  "title": "Updated Title",
  "status": "COMPLETED"
}
```

**Response (200 OK):**
Returns the updated task object.

---

### Delete Task
**Endpoint:** `DELETE /tasks/:id`

**Response (200 OK):**
```json
{
  "message": "Deleted"
}
```

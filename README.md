# 🚀 TaskFlow AI

> **A scalable, intelligent task management dashboard.**  
> Features secure authentication, real-time CRUD operations, and AI-powered task generation using Google Gemini.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React_18-61DAFB.svg)
![Node](https://img.shields.io/badge/Backend-Node.js-339933.svg)
![Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2.svg)

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Scaling Strategy](#-scaling-strategy)

---

## 📖 Overview

**TaskFlow AI** is a full-stack application designed to demonstrate a production-ready architecture. It solves the problem of "blank page syndrome" in project management by allowing users to simply state a goal (e.g., "Plan a marketing launch"), and letting the AI break it down into actionable, prioritized tasks.

## ✨ Features

### ✅ Core Functionality
*   **Secure Authentication**: JWT-based login and registration flows.
*   **Dashboard**: A responsive, card-based interface to manage tasks.
*   **CRUD Operations**: Create, Read, Update, and Delete tasks seamlessly.
*   **Search & Filtering**: Filter tasks by status (Todo, In Progress, Completed) and search by content.

### 🧠 AI Integration (Powered by Gemini)
*   **Smart Breakdown**: Converts high-level goals into specific subtasks automatically.
*   **Task Optimization**: AI analyzes your task descriptions to suggest improvements and priority levels.

### 🎨 UI/UX
*   **Responsive Design**: Built with Tailwind CSS for mobile and desktop.
*   **Toast Notifications**: Non-intrusive alerts for user actions.
*   **Clean Typography**: Uses Inter font for optimal readability.

---

## 📂 Project Structure

```bash
taskflow-ai/
├── components/       # Reusable UI components (Buttons, Inputs, Toasts)
├── contexts/         # React Contexts (Toast, Auth)
├── pages/            # Main application pages (Dashboard, Login, Profile)
├── services/         # API services and mock storage logic
│   ├── authService.ts    # Handles Login/Register logic
│   ├── geminiService.ts  # Interface with Google GenAI SDK
│   └── taskService.ts    # CRUD logic for tasks
├── server/           # Node.js/Express Backend
│   └── index.js          # Main server entry point
├── types.ts          # TypeScript interfaces and Enum definitions
├── App.tsx           # Main App component with Routing
└── SCALING.md        # Architectural scaling strategy
```

---

## 🛠 Prerequisites

Before you begin, ensure you have met the following requirements:
*   **Node.js** (v18 or higher)
*   **npm** (v9 or higher)
*   **MongoDB** (Local instance or Atlas URI) for the backend.
*   **Google Gemini API Key** (Get it from [Google AI Studio](https://aistudio.google.com/))

---

## ⚙️ Configuration

1.  **Environment Variables**:
    Rename the provided `.env.example` file to `.env` in the root directory.

    ```bash
    cp .env.example .env
    ```

2.  **Fill in the secrets**:
    Open the `.env` file and populate the following fields:

    ```ini
    # Frontend AI Key
    API_KEY=your_google_gemini_api_key

    # Backend Database & Security
    MONGO_URI=mongodb://localhost:27017/taskflow
    JWT_SECRET=super_secret_random_string
    PORT=5000
    ```

---

## 🚀 Installation & Setup

### 1. Install Dependencies
This project uses a unified `package.json` for simplicity.

```bash
npm install
```

### 2. Start the Backend Server
The backend handles authentication and database persistence.

```bash
npm start
```
*The server will start on `http://localhost:5000`*

### 3. Start the Frontend
In a separate terminal window, start the React development server (if using Vite/CRA) or serve the `index.html`.

```bash
npm run dev
```

---

## 📡 API Documentation

The backend exposes the following RESTful endpoints. See [API_DOCS.md](./API_DOCS.md) for detailed request/response examples.

| Method | Endpoint             | Description                  | Auth Required |
| :----- | :------------------- | :--------------------------- | :------------ |
| `POST` | `/api/auth/register` | Register a new user          | No            |
| `POST` | `/api/auth/login`    | Login and receive JWT        | No            |
| `GET`  | `/api/tasks`         | Get all tasks for user       | **Yes**       |
| `POST` | `/api/tasks`         | Create a new task            | **Yes**       |
| `PUT`  | `/api/tasks/:id`     | Update a task                | **Yes**       |
| `DEL`  | `/api/tasks/:id`     | Delete a task                | **Yes**       |

---

## 📈 Scaling Strategy

This application was built with scalability in mind. Please refer to [SCALING.md](./SCALING.md) for a deep dive into how we plan to move from:
1.  **Prototype**: Single server, local DB.
2.  **Production**: Load balancers, Horizontal Scaling, Redis Caching, and Kubernetes orchestration.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

*Built for the Scalable Web App Assignment.*

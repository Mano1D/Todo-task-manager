# ✅ Todo Task Manager

A full-stack **Task Management Web Application** that allows users to:
- Sign in using Google Authentication  
- Manage Personal & Professional Tasks  
- Track Deadlines with Automatic Highlighting  
- Share Tasks via Email & WhatsApp  
- Organize Work & Boost Productivity  

---

## 🚀 Live Demo

**Frontend:** [Video Link]([https://todo-task-manager-532f.vercel.app](https://drive.google.com/file/d/1bQiX7FoOri1kZrrZvOs7HXJlkDWuiJmK/view?usp=drive_link))  


---

## 🌟 Features

### 🔐 1. Google Authentication (OAuth 2.0)
- Click **"Sign in with Google"** button.
- Redirects to Google Login.
- After login, app securely:
  - Generates Google Access Token.
  - Verifies user identity via Google OAuth.
  - Generates **JWT token** for session handling.
- Redirects back to dashboard with JWT.

---

### 📋 2. Task Dashboard (After Login)
- Create Tasks:
  - Add **title**, **description**, **type** (Personal / Professional), and **due date**.
- Edit Tasks:
  - Modify task details easily.
- Delete Tasks:
  - Remove unwanted tasks anytime.
- Track Deadlines:
  - Tasks with **passed deadlines** automatically marked in **red highlight**.
- Task Types:
  - Filter/manage **Personal** and **Professional** tasks separately.

---

### 📧 3. Share Tasks
- Share task details directly via:
  - **Email**
  - **WhatsApp**

---

### 📃 4. About Page
- Provides app information and purpose.

---

## 🏗️ Tech Stack Used

| Layer           | Technologies Used                            |
|-----------------|---------------------------------------------|
| **Frontend**    | React.js, Tailwind CSS, Axios                |
| **Backend**     | Node.js, Express.js                          |
| **Database**    | MongoDB (via Mongoose)                       |
| **Authentication** | Google OAuth 2.0, JWT                     |
| **Deployment**  | Vercel (Frontend), Railway (Backend)         |

---


---

## ⚙️ How It Works (Detailed Flow)
1. **User Clicks "Login with Google" →**
2. Redirects to Google OAuth Login.
3. Upon successful login:
   - Backend exchanges code for access token.
   - Retrieves user info (email, name).
   - Generates JWT (valid for 24 hours).
4. Redirects back to Frontend with JWT in URL.
5. JWT stored in **localStorage** (for authentication).
6. Dashboard Unlocked:
   - User can manage tasks with full functionality.

---

## ✅ How to Run Locally

### 1. Clone the Repository:
```bash
git clone <your-repo-link>
cd task-manager
 Backend Setup:
bash
cd backend
npm install
# Add your .env file (example below)
npm run dev 

Sample .env:
PORT=5000
MONGO_URI=your-mongodb-uri
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
JWT_SECRET=your-jwt-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000

Frontend Setup:
bash
cd ../frontend
npm install
npm start
Sample Frontend .env:
REACT_APP_BACKEND_URL=http://localhost:5000 

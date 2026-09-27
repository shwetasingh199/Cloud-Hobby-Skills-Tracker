# ☁️ Cloud Hobby & Skills Tracker

A full-stack cloud-based web application that helps users track hobbies, skills, learning goals, practice sessions, progress, and community activities.

## 🚀 Features

- 🔐 **User Authentication** – Secure registration and login using Firebase Authentication.
- 👤 **Profile Management** – Manage personal profile information.
- 🎯 **Skill Tracking** – Add, update, delete, and monitor skills with current and target levels.
- 🏆 **Goals & Milestones** – Create measurable goals and track milestone completion.
- ⏱️ **Practice Tracking** – Record practice sessions, duration, activities, and notes.
- 📊 **Dashboard Analytics** – View active skills, practice hours, completed goals, streaks, and recent activity.
- 🌐 **Community Sharing** – Create and manage learning posts.
- ❤️ **Likes & Comments** – Interact with community posts.
- 🔒 **Authorization & Security** – Firebase ID-token verification and user ownership checks.
- ☁️ **Cloud Database** – Application data is stored in Cloud Firestore.
- 🔌 **REST API** – Express.js backend provides authenticated APIs for application operations.

## Screenshots:
<img width="1867" height="883" alt="Screenshot 2026-09-28 022151" src="https://github.com/user-attachments/assets/51e16976-f9e8-420a-834f-868591f80f90" />
<img width="1853" height="902" alt="Screenshot 2026-09-28 021705" src="https://github.com/user-attachments/assets/ec7c33aa-7532-4d7b-968b-2884cec1faca" />
<img width="1758" height="897" alt="Screenshot 2026-09-28 021733" src="https://github.com/user-attachments/assets/1ef1a6e1-8283-4c69-a661-89e697f6f771" />
<img width="1888" height="777" alt="Screenshot 2026-09-28 021845" src="https://github.com/user-attachments/assets/e466fd1f-b8a2-4fe6-9026-efe02d37c40f" />
<img width="1726" height="812" alt="Screenshot 2026-09-28 021852" src="https://github.com/user-attachments/assets/9b3014de-283c-48b3-9d38-130e1519decb" />
<img width="1880" height="783" alt="Screenshot 2026-09-28 021952" src="https://github.com/user-attachments/assets/33b581ca-f334-4f3a-8193-aab64fac4cd8" />
<img width="1700" height="827" alt="Screenshot 2026-09-28 022048" src="https://github.com/user-attachments/assets/fd950f6c-abe8-487b-8748-f03d2e315afc" />
<img width="1740" height="777" alt="Screenshot 2026-09-28 022120" src="https://github.com/user-attachments/assets/3e27161b-3c5f-48f0-8f48-816be1812ba3" />


## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite |
| Backend | Node.js + Express.js |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| API | REST API |
| Styling | CSS |
| Version Control | Git + GitHub |

## 🏗️ Architecture

React Frontend
      ↓
Firebase Authentication
      ↓
Firebase ID Token
      ↓
Express REST API
      ↓
Firebase Admin SDK
      ↓
Cloud Firestore  

## 📁 Project Structure
Cloud-Hobby-Skills-Tracker/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── context/
│       ├── pages/
│       └── services/
│
├── firebase/
├── tests/
├── .gitignore
└── README.md

## 🔌 Main API Endpoints
GET/PUT       /api/profile

GET/POST      /api/skills
PUT/DELETE    /api/skills/:id

GET/POST      /api/practice
DELETE        /api/practice/:id

GET/POST      /api/goals
PUT/DELETE    /api/goals/:id

GET/POST      /api/posts
PUT/DELETE    /api/posts/:id

POST/DELETE   /api/posts/:id/like

GET/POST      /api/posts/:id/comments
DELETE        /api/comments/:id

GET           /api/dashboard

## ⚙️ Local Setup
1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Cloud-Hobby-Skills-Tracker.git
cd Cloud-Hobby-Skills-Tracker
2. Start Backend
cd backend
npm install
npm run dev

Backend:

http://localhost:5000
3. Start Frontend

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
4. Firebase Configuration

Configure:

Firebase Authentication → Email/Password
Cloud Firestore
Firebase client configuration
Firebase Admin SDK credentials

Keep sensitive files out of GitHub:

.env
serviceAccountKey.json

## 📊 Core Data

The application uses Firestore collections for:

users
skills
practiceSessions
goals
milestones
posts
comments
likes

## 🔐 Security
Firebase Authentication for user identity
Firebase ID-token verification on protected APIs
User-based authorization
Ownership checks for personal resources
Firestore security rules
Environment variables for configuration
Firebase service-account credentials excluded from Git

## 🌱 Future Enhancements
Cloud media/file storage
Follow system
Notifications
Search and filtering
Advanced analytics
AI-based learning recommendations
Mobile application
Production deployment and monitoring

## 🎓 Project Purpose

This project demonstrates practical concepts in:

Cloud Computing • Full-Stack Development • REST APIs • Authentication • NoSQL Database • Security • Analytics • Git & GitHub

## 👩‍💻 Author

Shweta Singh

⭐ If you find this project useful, consider starring the repository.

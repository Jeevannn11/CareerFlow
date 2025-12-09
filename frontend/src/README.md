# 🚀 CareerFlow - Intelligent Application Lifecycle Management (ALM)

**CareerFlow** is a full-stack MERN application designed to streamline the job search process for software engineers. It replaces chaotic spreadsheets with a centralized **Kanban-style tracking board**, real-time **performance analytics**, and an integrated **job discovery engine**.

![Status](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![Status](https://img.shields.io/badge/Auth-JWT-green?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Production-orange?style=for-the-badge)

## 📸 Application Previews

| **Application Pipeline** | **Performance Analytics** |
|:---:|:---:|
| ![Pipeline](screenshots/pipeline.png) | ![Analytics](screenshots/analytics.png) |

| **Live Job Discovery** | **Secure Login** |
|:---:|:---:|
| ![Discovery](screenshots/discovery.png) | ![Login](screenshots/login.png) |

---

## 🌟 Key Features

### 1. 📊 Application Pipeline (Kanban)
- **Visual Tracking:** Manage applications across stages: *Applied* → *Online Test* → *Interview* → *Offer*.
- **Detailed Metadata:** Track Salary, Location, Work Mode (Remote/Hybrid), and Deadlines.
- **Smart Scheduling:** Built-in calendar integration to track interview dates and assessment deadlines.

### 2. 📈 Performance Analytics
- **Conversion Metrics:** Automatically calculates Interview Rates and Offer Success Ratios.
- **Visual Insights:** Interactive charts (Donut & Horizontal Bar) powered by `Recharts` to visualize drop-off points.
- **Activity Logging:** Tracks recent actions and updates in real-time.

### 3. 🌍 Job Discovery Engine
- **Live Feed:** Aggregates real-time developer jobs from the **RemoteOK API**.
- **One-Click Import:** Instantly add interesting roles from the feed directly into your personal pipeline with pre-filled data.

### 4. 🛡️ Enterprise-Grade Security
- **Authentication:** Secure Login/Signup system using **JWT (JSON Web Tokens)**.
- **Data Privacy:** Passwords hashed with **Bcrypt**. Each user has a private, isolated dashboard.

---

## 🛠️ Tech Stack

| Component | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS (Glassmorphism), Lucide React, Recharts |
| **Backend** | Node.js, Express.js (REST API) |
| **Database** | MongoDB Atlas (Cloud) |
| **Auth** | JWT, Bcrypt.js |
| **External API** | RemoteOK, Jobicy (Job Feeds) |

---

## 📦 Installation & Setup

Follow these steps to run the application locally.

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas Account (or local MongoDB)

### 1. Clone the Repository
```bash
git clone [https://github.com/Jeevannn11/CareerFlow.git](https://github.com/Jeevannn11/CareerFlow.git)
cd CareerFlow



2. Backend Configuration
Navigate to the backend folder and install dependencies:

Bash

cd backend
npm install


3. Frontend Configuration
Open a new terminal, navigate to the frontend folder:

Bash

cd ../frontend
npm install


The app will launch at http://localhost:3000.

🚀 Deployment
Backend: Deployed on Render

Frontend: Deployed on Vercel

👤 Author
Jeevan Tadwal

Full Stack Developer & AI Enthusiast

GitHub | LinkedIn


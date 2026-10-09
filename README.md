# SMART CAMPUS IQ — SMART ENGINEERING COLLEGE MANAGEMENT SYSTEM

> **A Next-Generation Full-Stack Engineering College Management Platform with Automated SMS Attendance Engine, QR Check-In, Biometric Verification, Lab Scheduling, Hackathon Hub, and Career Placement Cell.**

---

## 🏛️ 1. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────┐
│                    REACT VITE FRONTEND                      │
│     (Vercel Deployed • Tailwind CSS • Lucide • Recharts)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS REST API Requests (JWT Auth)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     FLASK REST BACKEND                      │
│       (Railway Deployed • Gunicorn • Flask-JWT • CORS)      │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               │ PyMongo                      │ Twilio SMS SDK
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MONGODB ATLAS DB        │ │     TWILIO SMS GATEWAY     │
│  (Cloud Clusters & Indexes)  │ │ (Automated Parent/Student) │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## ⚡ 2. PRELOADED HACKATHON DEMO ACCOUNTS

| Role | Name | Email | Password | Access Highlights |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aditya Verma (1IT21CS001) | `student1@campus.edu` | `Campus@123` | My Attendance, QR Check-In, Lab Booking, Project Hub, Placements |
| **Faculty** | Dr. Rajesh Sharma (CSE) | `faculty.cse@campus.edu` | `Campus@123` | Smart Attendance Marking, Finalize & SMS Dispatch, Live QR Broadcast, Lab Approvals |
| **Faculty** | Prof. Priya Nair (AI & ML) | `faculty.aiml@campus.edu` | `Campus@123` | AI/ML Courses, Biometric Review, Hackathon Coordination |
| **Admin** | Prof. S. R. Kulkarni (Dean) | `admin@campus.edu` | `Campus@123` | Campus Analytics, SMS Audit Logs & Retries, User Management, Global Policy |

*Tip: The login page includes convenient **1-Click Quick Demo Login** buttons for instant evaluation.*

---

## 🛠️ 3. LOCAL DEVELOPMENT INSTRUCTIONS (WINDOWS / VS CODE)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- Git

### Step 1: Clone or Navigate to Project
```powershell
cd C:\Users\kaver\.gemini\antigravity\scratch\smart-campus-iq
```

### Step 2: Run Flask Backend
Open a PowerShell terminal in VS Code:
```powershell
cd backend
python -m pip install -r requirements.txt
python app.py
```
*Backend will start at `http://127.0.0.1:5000` and auto-seed MongoDB sample data.*

### Step 3: Run React Frontend
Open a **second** PowerShell terminal in VS Code:
```powershell
cd frontend
npm install
npm run dev
```
*Frontend will launch at `http://localhost:5173`.*

---

## ☁️ 4. MONGODB ATLAS CLUSTER CONFIGURATION

1. **Create Free MongoDB Atlas Account**: Go to [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. **Deploy Cluster**: Create a free **M0 Shared Cluster** in your preferred region (e.g., `AWS / ap-south-1 Mumbai`).
3. **Database User**:
   - Go to **Database Access** → **Add New Database User**.
   - Set Authentication Method: `Password`.
   - Role: `Read and write to any database`.
4. **Network Access**:
   - Go to **Network Access** → **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`) so Railway server instances can connect securely.
5. **Connection String**:
   - Click **Connect** → **Drivers** → **Python (3.6 or later)**.
   - Copy the URI:
     ```
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_campus_iq?retryWrites=true&w=majority
     ```

---

## 🚀 5. BACKEND DEPLOYMENT TO RAILWAY

1. Push your repository to **GitHub**.
2. Log in to [Railway.app](https://railway.app) and click **New Project** → **Deploy from GitHub repo**.
3. Select your repository and set the **Root Directory** to `/backend`.
4. Go to the project **Variables** tab on Railway and configure:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/smart_campus_iq?retryWrites=true&w=majority
   MONGODB_DB_NAME=smart_campus_iq
   SECRET_KEY=smart-campus-iq-super-secret-key-2026
   JWT_SECRET_KEY=jwt-super-secret-key-smart-campus-iq-2026
   JWT_ACCESS_EXPIRES_HOURS=12
   SMS_MODE=demo
   TWILIO_ACCOUNT_SID=ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. Click **Generate Domain** under Settings (e.g. `https://smart-campus-iq-backend.up.railway.app`).
6. Verify deployment by visiting `https://smart-campus-iq-backend.up.railway.app/api/health`.

---

## 🌐 6. FRONTEND DEPLOYMENT TO VERCEL

1. Log in to [Vercel.com](https://vercel.com) and click **Add New** → **Project**.
2. Import your GitHub repository.
3. In **Project Settings**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Add Environment Variable:
   - `VITE_API_BASE_URL` = `https://smart-campus-iq-backend.up.railway.app`
5. Click **Deploy**. Vercel will output your live URL (e.g., `https://smart-campus-iq.vercel.app`).
6. Back on Railway, update `FRONTEND_URL` to match your Vercel URL for production CORS security.

---

## 📱 7. AUTOMATED TWILIO SMS ENGINE

When a Faculty member finalizes attendance for a class period:
1. Student attendance records are saved and locked against tampering.
2. The student's updated cumulative subject attendance percentage is calculated.
3. An automatic SMS is dispatched to the student's registered mobile number.

### Message Templates:
- **PRESENT**:
  > *"Hello Aditya Verma, your attendance for Cloud Computing & Distributed Systems on 2026-10-09 has been marked PRESENT. Your current attendance is 87.5%. - ITAE Smart Campus"*
- **ABSENT**:
  > *"Hello Rohan Deshmukh, your attendance for Cloud Computing & Distributed Systems on 2026-10-09 has been marked ABSENT. Please contact your faculty if you believe this is incorrect. - ITAE Smart Campus"*
- **LATE**:
  > *"Hello Ananya Sen, your attendance for Cloud Computing & Distributed Systems on 2026-10-09 has been marked LATE. Your current attendance is 90.0%. - ITAE Smart Campus"*

### Modes:
- **Demo Mode (`SMS_MODE=demo`)**: Simulates message delivery safely in MongoDB without Twilio charges.
- **Live Mode (`SMS_MODE=live`)**: Sends actual real-time SMS alerts via Twilio API.

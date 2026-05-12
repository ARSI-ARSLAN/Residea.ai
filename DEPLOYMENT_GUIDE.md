# 🎓 Student's Guide to Free Deployment

I have prepared a complete `deploy/` folder with everything you need. Follow these steps to take the project live for **$0**.

---

## 🏗️ Folder Structure
Your `e:\exp\deploy` folder is organized as follows:
- `core-backend/`: Django API (Production ready)
- `ai-backend/`: Flask AI API (Gunicorn ready)
- `client-app/`: Main React Frontend
- `admin-app/`: Admin Dashboard

---

## 1. Prerequisites (Free Accounts)
Create accounts on these platforms (all have great free tiers):
1. **GitHub** (To host your code)
2. **Render.com** (To host both Backends)
3. **Vercel.com** (To host both Frontends)
4. **Neon.tech** (Free PostgreSQL database)
5. **Cloudinary.com** (Free storage for images)

---

## 2. Step-by-Step Deployment

### Step A: Push to GitHub
1. Create a **new private repository** on GitHub named `residea-full`.
2. Upload the **entire contents** of `e:\exp\deploy` to this repository.

### Step B: Deploy the Database (Neon.tech)
1. Log in to Neon.tech and create a new project.
2. Copy the **Connection String** (it starts with `postgres://...`).
3. You will need this for the Django backend.

### Step C: Deploy Core Backend (Render.com)
1. In Render, click **New** -> **Blueprint**.
2. Connect your GitHub repo.
3. It will detect the `render.yaml` I created and automatically set up:
   - Django Server
   - Postgres Database (Render also provides one, or use Neon string)
4. Add these **Environment Variables** in Render:
   - `CLOUDINARY_CLOUD_NAME`: From Cloudinary
   - `CLOUDINARY_API_KEY`: From Cloudinary
   - `CLOUDINARY_API_SECRET`: From Cloudinary
   - `DATABASE_URL`: Your Neon connection string

### Step D: Deploy AI Backend (Render.com)
1. In Render, click **New** -> **Web Service**.
2. Choose the `ai-backend` folder.
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `gunicorn app:app`

### Step E: Deploy Frontends (Vercel)
1. In Vercel, click **Add New** -> **Project**.
2. Select the `client-app` folder.
3. **Environment Variables:**
   - `VITE_API_URL`: Your Render Core API URL (e.g., `https://residea-core.onrender.com`)
   - `VITE_AI_API_URL`: Your Render AI API URL
4. Repeat for `admin-app`.

---

## 🛠️ Key Production Changes I Made:
- **Database:** Removed SQLite. The app now uses PostgreSQL via `DATABASE_URL`.
- **Images:** Added Cloudinary. Your images won't disappear when the server restarts.
- **Security:** Added `WhiteNoise` for static files and updated `CORS` logic.
- **Config:** Frontends now use `VITE_API_URL` instead of hardcoded `localhost`.

---

## ⚠️ Important Note for Students
Free tier servers (like Render) "sleep" after 15 minutes of inactivity. When you visit your site for the first time in a while, it might take **30-60 seconds** to wake up. This is normal for free hosting!

🚀 **You are now ready to go live!**

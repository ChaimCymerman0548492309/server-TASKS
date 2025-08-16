

# 🚀 **Task Manager - Server Documentation (Railway Edition)**

## 📂 **File Structure**

```
server/
├── 📁 config/
│   ├── db.ts            # MongoDB connection
│   └── env.ts           # Environment validation
├── 📁 controllers/
│   ├── auth.ts          # Auth logic
│   └── tasks.ts         # Task CRUD operations
├── 📁 middleware/
│   ├── auth.ts          # JWT verification
│   └── error.ts         # Error handling
├── 📁 models/
│   ├── Task.ts          # Task schema
│   └── User.ts          # User schema
├── 📁 routes/
│   ├── auth.ts          # Auth routes
│   └── tasks.ts         # Task routes
├── 📁 services/
│   └── socket.ts        # WebSocket server
├── 📄 app.ts            # Express setup
└── 📄 server.ts         # HTTP/WS server
```

---

## ⚙️ **Installation Guide (Local Setup)**

```bash
git clone https://github.com/your-repo/task-manager.git
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values
```

---

## 🚀 **Deployment on Railway**

### 1. Create Project

1. Go to [Railway](https://railway.com/project/)
2. Click **New Project**
3. Connect your **GitHub repository**

### 2. Configure Environment Variables

```
NODE_ENV=production
MONGODB_URI=your_atlas_uri
JWT_SECRET=your_strong_secret
PORT=10000  # or Railway assigned port
```

### 3. Build & Start Commands

```bash
Build: npm install && npm run build
Start: npm start
```

Railway will detect your Node.js project and deploy automatically.

---

## 🔄 **CI/CD Pipeline (Railway)**

### Automatic Deployment

* Railway detects changes on Git push, builds, and deploys automatically.
* Health checks can be set to `/api/health`.
* Rollbacks happen automatically on deployment failure or manually via the dashboard.

### Manual Version Update

To ensure you are running the latest version from Git:

1. **Go to Project Settings** on Railway.
2. Navigate to the **Deployments** section.
3. Check if there is a **new version detected in your Git repository**.
4. If a new version exists, click **Update / Deploy New Version**.
5. Railway will build and deploy the latest version.

This allows you to **control deployments manually** while still leveraging automated CI/CD features.

---

## 4. Updating a New Version via Git (Optional)

1. Make changes locally.
2. Push to the main branch:

```bash
git add .
git commit -m "New version"
git push origin main
```

3. Railway will detect the push and trigger a build automatically.
4. Confirm deployment in the **Deployments** tab or via logs.

---

## 5. Debugging & Logs

* View logs:

```bash
railway logs
```

* Open a shell in your project:

```bash
railway run bash
```

---

## 🎨 **Color-Coded Architecture**

* **Green** = Database (MongoDB) 🟢
* **Blue** = API Layer 🔵
* **Purple** = Real-Time (WebSocket) 🟣
* **Orange** = CI/CD Pipeline 🟠

This setup ensures **auto-scaling**, **secure deployments**, and **instant updates** on every Git push! 🚀

---

## 🔄 **Deployment Flow Diagram**

```
Local Code Changes
       │
       ▼
git push to main branch
       │
       ▼
Railway detects push
       │
       ▼
Build & Install dependencies
       │
       ▼
Start Server
       │
       ▼
Project live on Railway URL
       │
       ▼
Logs & Metrics available in Dashboard
       │
       ▼
Optional Manual Update via Settings -> Deployments
```

---

✅ Railway benefits: **fast deployment**, **built-in CI/CD**, **manual control of versions**, **automatic updates on push**, and **easy monitoring via dashboard**.


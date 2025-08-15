# 🚀 **Task Manager - Server Documentation (Extended)**

## 📂 **File Structure**
```
server/
├── 📁 config/
│   ├── db.ts            # MongoDB connection
│   └── env.ts          # Environment validation
├── 📁 controllers/
│   ├── auth.ts         # Auth logic
│   └── tasks.ts        # Task CRUD operations
├── 📁 middleware/
│   ├── auth.ts         # JWT verification
│   └── error.ts       # Error handling
├── 📁 models/
│   ├── Task.ts         # Task schema
│   └── User.ts        # User schema
├── 📁 routes/
│   ├── auth.ts         # Auth routes
│   └── tasks.ts       # Task routes
├── 📁 services/
│   └── socket.ts      # WebSocket server
├── 📄 app.ts           # Express setup
└── 📄 server.ts        # HTTP/WS server
```

## ⚙️ **Installation Guide**

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Render account (for CI/CD)

### 1. Local Setup
```bash
git clone https://github.com/your-repo/task-manager.git
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start dev server
npm run dev
```

### 2. Production Deployment (Render)
1. **Connect your GitHub repo** to Render
2. **Configure build settings**:
   ```yaml
   Build Command: npm install && npm run build
   Start Command: npm start
   ```
3. **Set environment variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=your_atlas_uri
   JWT_SECRET=your_strong_secret
   ```
4. **Enable auto-deploy** on git push

## 🔄 **CI/CD Pipeline (Render)**

### Automated Workflow
1. **On Git Push**:
   - Render detects changes
   - Triggers new build
   - Runs tests (if `npm test` configured)
   - Deploys to production

2. **Health Checks**:
   ```yaml
   Health Check Path: /api/health
   ```

3. **Rollback**:
   - Automatic on deployment failure
   - Manual via Render dashboard

### Key Features
- **Zero-downtime deployments**
- **Auto-scaling** based on traffic
- **Instant rollbacks**
- **Integrated logging**

## 🛠️ **Render-Specific Configuration**
```yaml
# render.yaml
services:
  - type: web
    name: task-manager
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /api/health
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        fromDatabase:
          name: task-manager-db
          property: connectionString
```

## 🔍 **Debugging in Production**
1. **View logs**:
   ```bash
   render logs
   ```
2. **SSH access** (for debugging):
   ```bash
   render ssh
   ```
3. **Monitor metrics**:
   - CPU/Memory usage
   - Response times
   - Error rates

## 🎨 **Color-Coded Architecture**
- **Green** = Database (MongoDB) 🟢  
- **Blue** = API Layer 🔵  
- **Purple** = Real-Time (WebSocket) 🟣  
- **Orange** = CI/CD Pipeline 🟠  

This setup ensures **auto-scaling**, **secure deployments**, and **instant updates** on every git push! 🚀
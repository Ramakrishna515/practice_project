# Docker Quick Start Guide 🚀

Get your full-stack app running in Docker in 5 minutes!

---

## Prerequisites

Install Docker Desktop:
- **Mac**: https://docs.docker.com/desktop/install/mac-install/
- **Windows**: https://docs.docker.com/desktop/install/windows-install/
- **Linux**: https://docs.docker.com/engine/install/

Verify installation:
```bash
docker --version
docker compose version
```

---

## Step 1: Start Your Application

From the project root directory:

```bash
# Start all services (MongoDB + Backend + Frontend)
docker compose up -d
```

**What this does:**
- 🗄️ Starts MongoDB on port 27017
- 🔧 Starts Backend API on port 5001
- ⚛️ Starts Frontend React app on port 3000

---

## Step 2: Check Everything is Running

```bash
# View all running containers
docker compose ps

# Should show 3 containers:
# - practice_mongodb
# - practice_backend
# - practice_frontend
```

---

## Step 3: View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend
docker compose logs mongodb

# Follow logs in real-time
docker compose logs -f backend
```

---

## Step 4: Access Your Application

Open your browser:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **MongoDB**: mongodb://localhost:27017

Test backend API:
```bash
curl http://localhost:5001
# Should return: {"ok":true}
```

---

## Common Commands

### Start Services
```bash
# Start in foreground (see logs)
docker compose up

# Start in background
docker compose up -d

# Rebuild and start (after code changes)
docker compose up --build
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes (deletes database!)
docker compose down -v
```

### View Status
```bash
# List running containers
docker compose ps

# View logs
docker compose logs -f

# View resource usage
docker stats
```

### Development Workflow
```bash
# Restart a single service
docker compose restart backend

# Rebuild a single service
docker compose build backend
docker compose up -d backend

# Enter a container shell
docker compose exec backend sh
docker compose exec mongodb mongosh
```

---

## Troubleshooting

### Port Already in Use
```bash
# Stop other services using the port
lsof -i :3000
lsof -i :5001
lsof -i :27017

# Or change ports in docker-compose.yml
```

### MongoDB Connection Failed
Make sure backend connects to `mongodb://mongodb:27017` (service name, not localhost)

Check `backend/server.js`:
```javascript
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/myapp';
```

### Changes Not Showing
```bash
# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

### View Container Errors
```bash
# Check container logs
docker compose logs backend

# Enter container and debug
docker compose exec backend sh
```

---

## File Structure Created

```
practice_project/
├── docker-compose.yml           # Orchestrates all services
├── DOCKER_LEARNING.md           # Comprehensive learning guide
├── DOCKER_QUICKSTART.md         # This file
│
├── backend/
│   ├── Dockerfile               # Backend container config
│   ├── .dockerignore            # Files to exclude
│   └── .env.example             # Environment variables template
│
└── frontend/
    ├── Dockerfile               # Frontend container config
    └── .dockerignore            # Files to exclude
```

---

## Learning Path

1. ✅ **Start Here**: Get it running with this guide
2. 📖 **Learn Docker**: Read `DOCKER_LEARNING.md` step-by-step
3. 🔧 **Experiment**: Modify Dockerfiles and docker-compose.yml
4. 🚀 **Deploy**: Try deploying to cloud platforms

---

## Next Steps

After your app is running:

1. **Explore Containers**
   ```bash
   docker compose exec backend sh
   # Now you're inside the backend container!
   ls
   node --version
   exit
   ```

2. **Check Database**
   ```bash
   docker compose exec mongodb mongosh
   # Inside MongoDB shell:
   show dbs
   use myapp
   show collections
   exit
   ```

3. **Read the Full Guide**
   Open `DOCKER_LEARNING.md` and start from Section 1

4. **Make Changes**
   - Edit code
   - See changes reflect (volumes are mounted)
   - Rebuild if needed: `docker compose up --build`

---

## Cleanup

```bash
# Stop everything
docker compose down

# Remove all (including volumes/data)
docker compose down -v

# Remove all Docker resources
docker system prune -a
```

---

**Happy Learning! 🐳**

Need help? Check the full guide in `DOCKER_LEARNING.md`

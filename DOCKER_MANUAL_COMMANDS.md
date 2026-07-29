# Docker Manual Commands Guide 🔧

Learn how to connect Docker containers manually without docker-compose.

---

## Understanding the Concept

When you run `docker compose up`, it automatically:
1. Creates a network
2. Starts containers in order
3. Connects them to the network
4. Sets environment variables

Let's do this **manually** to understand how it works!

---

## Step 1: Create a Docker Network

Containers need to communicate with each other. Create a custom network:

```bash
# Create a network named "myapp-network"
docker network create myapp-network

# Verify it was created
docker network ls
```

**Output:**
```
NETWORK ID     NAME            DRIVER    SCOPE
abc123def456   myapp-network   bridge    local
```

---

## Step 2: Run MongoDB Container

```bash
# Run MongoDB on the custom network
docker run -d \
  --name mongodb \
  --network myapp-network \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=myapp \
  -v mongo-data:/data/db \
  mongo:7
```

**Explanation:**
- `-d` = Run in detached mode (background)
- `--name mongodb` = Container name (also becomes hostname)
- `--network myapp-network` = Connect to our network
- `-p 27017:27017` = Map port 27017 (host:container)
- `-e MONGO_INITDB_DATABASE=myapp` = Environment variable
- `-v mongo-data:/data/db` = Named volume for data persistence
- `mongo:7` = Image to use

**Verify it's running:**
```bash
docker ps | grep mongodb
docker logs mongodb
```

---

## Step 3: Build Backend Image

Before running the backend, build its image:

```bash
# Navigate to backend folder
cd backend

# Build the image
docker build -t my-backend:v1 .

# Verify image was created
docker images | grep my-backend

# Go back to root
cd ..
```

---

## Step 4: Run Backend Container

```bash
# Run backend connected to MongoDB
docker run -d \
  --name backend \
  --network myapp-network \
  -p 5001:5001 \
  -e NODE_ENV=development \
  -e PORT=5001 \
  -e MONGODB_URI=mongodb://mongodb:27017/myapp \
  -v $(pwd)/backend:/app \
  -v /app/node_modules \
  my-backend:v1
```

**Explanation:**
- `--network myapp-network` = Same network as MongoDB
- `-e MONGODB_URI=mongodb://mongodb:27017/myapp` = Use service name "mongodb" as hostname
- `-v $(pwd)/backend:/app` = Mount code for hot-reload
- `-v /app/node_modules` = Don't overwrite node_modules

**Key Point:** Backend connects to `mongodb://mongodb:27017` (service name, not localhost!)

**Verify:**
```bash
docker logs backend

# Should see:
# ✅ MongoDB connected to: mongodb://mongodb:27017/myapp
# ✅ Server running at http://localhost:5001

# Test API
curl http://localhost:5001
# Should return: {"ok":true}
```

---

## Step 5: Build Frontend Image

```bash
cd frontend
docker build -t my-frontend:v1 .
docker images | grep my-frontend
cd ..
```

---

## Step 6: Run Frontend Container

```bash
docker run -d \
  --name frontend \
  --network myapp-network \
  -p 3000:3000 \
  -e REACT_APP_API_URL=http://localhost:5001 \
  -v $(pwd)/frontend:/app \
  -v /app/node_modules \
  my-frontend:v1
```

**Verify:**
```bash
docker logs -f frontend

# Wait for:
# webpack compiled successfully

# Open browser: http://localhost:3000
```

---

## Step 7: Verify Everything is Connected

### Check all containers are running:
```bash
docker ps

# Should show 3 containers:
# - mongodb
# - backend
# - frontend
```

### Inspect the network:
```bash
docker network inspect myapp-network
```

You should see all 3 containers listed in the network!

### Test connectivity between containers:
```bash
# Enter backend container
docker exec -it backend sh

# Inside backend container, ping MongoDB
ping mongodb
# Should work! (Ctrl+C to stop)

# Try connecting to MongoDB
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb://mongodb:27017/myapp').then(() => console.log('Connected!')).catch(console.error)"

# Exit container
exit
```

---

## Complete Workflow Comparison

### Using Manual Commands:
```bash
# 1. Create network
docker network create myapp-network

# 2. Run MongoDB
docker run -d --name mongodb --network myapp-network -p 27017:27017 -v mongo-data:/data/db mongo:7

# 3. Build & run backend
cd backend && docker build -t my-backend:v1 . && cd ..
docker run -d --name backend --network myapp-network -p 5001:5001 \
  -e MONGODB_URI=mongodb://mongodb:27017/myapp \
  -v $(pwd)/backend:/app -v /app/node_modules \
  my-backend:v1

# 4. Build & run frontend
cd frontend && docker build -t my-frontend:v1 . && cd ..
docker run -d --name frontend --network myapp-network -p 3000:3000 \
  -v $(pwd)/frontend:/app -v /app/node_modules \
  my-frontend:v1
```

### Using Docker Compose:
```bash
docker compose up -d
```

**Same result, much easier!** 🎉

---

## Managing Containers Manually

### View logs:
```bash
docker logs backend
docker logs frontend
docker logs mongodb

# Follow logs in real-time
docker logs -f backend
```

### Stop containers:
```bash
docker stop frontend
docker stop backend
docker stop mongodb
```

### Start stopped containers:
```bash
docker start mongodb
docker start backend
docker start frontend
```

### Restart containers:
```bash
docker restart backend
```

### Remove containers:
```bash
# Stop first
docker stop frontend backend mongodb

# Then remove
docker rm frontend backend mongodb
```

### Remove network:
```bash
docker network rm myapp-network
```

### Remove volumes:
```bash
docker volume ls
docker volume rm mongo-data
```

---

## Complete Cleanup

Remove everything manually:

```bash
# Stop all containers
docker stop frontend backend mongodb

# Remove all containers
docker rm frontend backend mongodb

# Remove images
docker rmi my-frontend:v1 my-backend:v1 mongo:7

# Remove network
docker network rm myapp-network

# Remove volume
docker volume rm mongo-data
```

Or use Docker's cleanup commands:
```bash
# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Remove all unused volumes
docker volume prune

# Remove all unused networks
docker network prune

# Or remove EVERYTHING
docker system prune -a --volumes
```

---

## Common Manual Commands

### Enter a running container:
```bash
docker exec -it backend sh
docker exec -it mongodb mongosh
```

### Copy files to/from container:
```bash
# Copy from host to container
docker cp ./file.txt backend:/app/

# Copy from container to host
docker cp backend:/app/logs.txt ./
```

### Inspect container details:
```bash
docker inspect backend
docker inspect backend | grep IPAddress
```

### View container resource usage:
```bash
docker stats
docker stats backend
```

### View container processes:
```bash
docker top backend
```

---

## Debugging Network Issues

### Check container's network:
```bash
docker inspect backend | grep -A 20 Networks
```

### Test connectivity:
```bash
# Enter backend container
docker exec -it backend sh

# Install ping if needed
apk add --no-cache iputils

# Ping MongoDB by service name
ping mongodb

# Check if port is open
nc -zv mongodb 27017
```

### View all containers in a network:
```bash
docker network inspect myapp-network
```

---

## Why Use Docker Compose?

After doing this manually, you'll appreciate docker-compose because:

1. **One command** vs many commands
2. **Automatic dependency management** (depends_on)
3. **Configuration in one file** (docker-compose.yml)
4. **Environment management** (.env files)
5. **Easier to version control**

---

## Practice Exercise

Try this workflow:

1. **Manual setup:**
   ```bash
   docker network create test-network
   docker run -d --name db --network test-network mongo:7
   docker run -d --name app --network test-network -p 8080:5001 \
     -e MONGODB_URI=mongodb://db:27017/test \
     my-backend:v1
   ```

2. **Test connectivity:**
   ```bash
   docker exec -it app sh
   ping db
   exit
   ```

3. **Clean up:**
   ```bash
   docker stop app db
   docker rm app db
   docker network rm test-network
   ```

4. **Compare with docker-compose:**
   ```bash
   docker compose up -d
   ```

---

## Key Takeaways

1. **Network is crucial** - Containers on the same network can talk via service names
2. **Service name = hostname** - MongoDB container named "mongodb" is accessible at `mongodb:27017`
3. **Volume mounting** - For code changes and data persistence
4. **Environment variables** - Configure containers without rebuilding
5. **Build order matters** - Build images before running containers
6. **Docker Compose automates this** - Manages networks, dependencies, builds, runs

---

## Next Steps

1. ✅ Practice manual commands
2. ✅ Understand each flag and option
3. ✅ Compare with docker-compose.yml
4. ✅ Appreciate docker-compose more!
5. 📖 Read DOCKER_LEARNING.md for deeper understanding

---

**Manual commands teach you fundamentals, Docker Compose makes you productive!** 🚀

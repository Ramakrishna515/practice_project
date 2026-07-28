# Docker Learning Journey - From Scratch to Deep 🐳

A comprehensive, hands-on guide to learn Docker using your full-stack application (React + Node.js + MongoDB).

---

## Table of Contents
1. [Docker Basics](#1-docker-basics)
2. [Understanding Docker Architecture](#2-understanding-docker-architecture)
3. [Docker Images](#3-docker-images)
4. [Docker Containers](#4-docker-containers)
5. [Dockerfile Deep Dive](#5-dockerfile-deep-dive)
6. [Docker Compose](#6-docker-compose)
7. [Docker Networking](#7-docker-networking)
8. [Docker Volumes](#8-docker-volumes)
9. [Best Practices](#9-best-practices)
10. [Advanced Topics](#10-advanced-topics)

---

## 1. Docker Basics

### What is Docker?
Docker is a platform that packages applications and their dependencies into **containers** - lightweight, portable, self-sufficient units that run consistently across different environments.

### Why Docker?
- **Consistency**: "Works on my machine" → "Works everywhere"
- **Isolation**: Each container runs independently
- **Portability**: Run anywhere (dev, staging, production)
- **Efficiency**: Lightweight compared to VMs

### Key Concepts
```
┌─────────────────────────────────┐
│  Docker Image (Blueprint)       │ → Like a class in programming
│  - Read-only template           │
│  - Contains app + dependencies  │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Docker Container (Instance)    │ → Like an object instance
│  - Running instance of image    │
│  - Isolated process             │
└─────────────────────────────────┘
```

### Installation Check
```bash
# Check Docker is installed
docker --version
docker compose version

# Test Docker
docker run hello-world
```

**Expected Output**: "Hello from Docker!" message

---

## 2. Understanding Docker Architecture

### Docker Components
```
┌──────────────────────────────────────────┐
│           Docker Client (CLI)            │
│              docker ...                  │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│          Docker Daemon (Engine)          │
│  - Manages images, containers, networks  │
│  - Runs containers                       │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│           Docker Registry                │
│  - Docker Hub (public)                   │
│  - Private registries                    │
└──────────────────────────────────────────┘
```

### Basic Commands
```bash
# Images
docker images              # List all images
docker pull <image>        # Download image
docker rmi <image>         # Remove image

# Containers
docker ps                  # List running containers
docker ps -a               # List all containers
docker stop <container>    # Stop container
docker rm <container>      # Remove container
docker logs <container>    # View container logs
```

**Exercise 1**: Run these commands and observe the output
```bash
docker images
docker ps -a
```

---

## 3. Docker Images

### What is an Image?
- **Layered filesystem**: Each instruction in Dockerfile creates a layer
- **Immutable**: Once created, layers don't change
- **Cached**: Docker reuses unchanged layers for faster builds

### Image Layers
```
┌─────────────────────────┐
│  Layer 4: Your app code │ ← Changes frequently
├─────────────────────────┤
│  Layer 3: Dependencies  │ ← Changes occasionally
├─────────────────────────┤
│  Layer 2: Node.js       │ ← Rarely changes
├─────────────────────────┤
│  Layer 1: Base OS       │ ← Never changes
└─────────────────────────┘
```

### Working with Images
```bash
# Pull an image
docker pull node:20-alpine

# List images
docker images

# Inspect image
docker inspect node:20-alpine

# Remove image
docker rmi node:20-alpine
```

**Exercise 2**: Pull different Node.js versions
```bash
docker pull node:20-alpine
docker pull node:18-alpine
docker images | grep node
```

---

## 4. Docker Containers

### Container Lifecycle
```
Created → Running → Paused → Stopped → Removed
   ↑         ↓                    ↓
   └─────────┴────────────────────┘
```

### Running Containers
```bash
# Run a container (foreground)
docker run node:20-alpine node --version

# Run in background (-d = detached)
docker run -d --name my-node node:20-alpine sleep 3600

# Execute command in running container
docker exec -it my-node sh

# Stop and remove
docker stop my-node
docker rm my-node
```

### Container Options
```bash
-d                  # Detached mode (background)
--name <name>       # Give container a name
-p 3000:3000        # Port mapping (host:container)
-v /host:/container # Volume mounting
-e KEY=value        # Environment variables
--rm                # Auto-remove when stopped
-it                 # Interactive terminal
```

**Exercise 3**: Run a Node.js container interactively
```bash
docker run -it --rm node:20-alpine sh
# Inside container:
node --version
exit
```

---

## 5. Dockerfile Deep Dive

### Dockerfile Structure
```dockerfile
# Base image
FROM node:20-alpine

# Metadata
LABEL maintainer="your-email@example.com"

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default command
CMD ["npm", "start"]
```

### Common Dockerfile Instructions

| Instruction | Purpose | Example |
|-------------|---------|---------|
| `FROM` | Base image | `FROM node:20-alpine` |
| `WORKDIR` | Set working directory | `WORKDIR /app` |
| `COPY` | Copy files from host to image | `COPY . .` |
| `RUN` | Execute commands during build | `RUN npm install` |
| `CMD` | Default command when container starts | `CMD ["npm", "start"]` |
| `ENTRYPOINT` | Configure container as executable | `ENTRYPOINT ["node"]` |
| `EXPOSE` | Document which port container listens on | `EXPOSE 3000` |
| `ENV` | Set environment variables | `ENV NODE_ENV=production` |
| `ARG` | Build-time variables | `ARG VERSION=1.0` |
| `VOLUME` | Create mount point | `VOLUME /data` |

### Build an Image
```bash
# Build from Dockerfile
docker build -t my-app:v1 .

# Build with custom Dockerfile
docker build -f Dockerfile.dev -t my-app:dev .

# Build with build args
docker build --build-arg VERSION=2.0 -t my-app:v2 .
```

**Exercise 4**: Build the backend image
```bash
cd backend
docker build -t my-backend:v1 .
docker images | grep my-backend
```

---

## 6. Docker Compose

### What is Docker Compose?
Tool for defining and running **multi-container** Docker applications using a YAML file.

### Why Docker Compose?
- **Single command**: Start entire stack with `docker compose up`
- **Service orchestration**: Define relationships between services
- **Environment management**: Different configs for dev/prod

### docker-compose.yml Structure
```yaml
version: '3.8'

services:
  # Service 1
  backend:
    build: ./backend
    ports:
      - "5001:5001"
    environment:
      - NODE_ENV=development
    depends_on:
      - mongodb
  
  # Service 2
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

volumes:
  mongo-data:
```

### Docker Compose Commands
```bash
# Start all services
docker compose up

# Start in background
docker compose up -d

# Stop all services
docker compose down

# View logs
docker compose logs
docker compose logs backend

# Rebuild and start
docker compose up --build

# List running services
docker compose ps
```

**Exercise 5**: Start your full stack
```bash
# From project root
docker compose up -d
docker compose ps
docker compose logs
```

---

## 7. Docker Networking

### Network Types

1. **Bridge** (Default)
   - Containers can communicate with each other
   - Isolated from host network

2. **Host**
   - Container shares host's network
   - No network isolation

3. **None**
   - No networking

### Service Communication in Compose
```yaml
services:
  backend:
    # Can connect to: mongodb://mongodb:27017
    depends_on:
      - mongodb
  
  mongodb:
    # Service name becomes hostname
```

### Network Commands
```bash
# List networks
docker network ls

# Inspect network
docker network inspect bridge

# Create custom network
docker network create my-network

# Run container on network
docker run --network my-network nginx
```

**Exercise 6**: Inspect compose network
```bash
docker compose up -d
docker network ls
docker network inspect practice_project_default
```

---

## 8. Docker Volumes

### Why Volumes?
- **Persist data**: Data survives container restarts
- **Share data**: Between containers
- **Performance**: Better than bind mounts on Mac/Windows

### Volume Types

1. **Named Volumes** (Managed by Docker)
```yaml
volumes:
  mongo-data:

services:
  mongodb:
    volumes:
      - mongo-data:/data/db
```

2. **Bind Mounts** (Host directory)
```yaml
services:
  backend:
    volumes:
      - ./backend:/app
```

3. **Anonymous Volumes**
```yaml
services:
  app:
    volumes:
      - /app/node_modules
```

### Volume Commands
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume-name>

# Remove volume
docker volume rm <volume-name>

# Remove unused volumes
docker volume prune
```

**Exercise 7**: Explore volumes
```bash
docker volume ls
docker volume inspect practice_project_mongo-data
```

---

## 9. Best Practices

### 1. Use Multi-Stage Builds
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --production
CMD ["node", "dist/server.js"]
```

### 2. Minimize Layers
```dockerfile
# Bad - 3 layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# Good - 1 layer
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*
```

### 3. Use .dockerignore
```
node_modules
npm-debug.log
.git
.env
*.md
```

### 4. Order Dockerfile for Cache
```dockerfile
# Copy dependencies first (changes less often)
COPY package*.json ./
RUN npm install

# Copy code last (changes frequently)
COPY . .
```

### 5. Security Best Practices
- Use official base images
- Run as non-root user
- Scan images for vulnerabilities
- Keep images updated

```dockerfile
# Run as non-root
FROM node:20-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
```

---

## 10. Advanced Topics

### 1. Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node healthcheck.js || exit 1
```

```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:5001/health"]
      interval: 30s
      timeout: 3s
      retries: 3
```

### 2. Build Arguments
```dockerfile
ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-alpine
```

```bash
docker build --build-arg NODE_VERSION=18 -t app:v1 .
```

### 3. Environment Files
```yaml
services:
  backend:
    env_file:
      - .env
      - .env.local
```

### 4. Scaling Services
```bash
# Scale backend to 3 instances
docker compose up -d --scale backend=3
```

### 5. Resource Limits
```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

---

## Hands-On Learning Path

### Week 1: Basics
- [ ] Install Docker and run hello-world
- [ ] Pull and run official images (node, nginx, mongo)
- [ ] Understand container lifecycle
- [ ] Practice basic commands

### Week 2: Images & Dockerfiles
- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for frontend
- [ ] Build and run images
- [ ] Understand layering and caching

### Week 3: Docker Compose
- [ ] Create docker-compose.yml for full stack
- [ ] Connect backend to MongoDB
- [ ] Connect frontend to backend
- [ ] Practice compose commands

### Week 4: Advanced
- [ ] Implement multi-stage builds
- [ ] Add health checks
- [ ] Configure volumes properly
- [ ] Set up development vs production configs

---

## Common Issues & Solutions

### Issue 1: Port Already in Use
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Issue 2: Container Exits Immediately
```bash
# Check logs
docker logs <container-name>

# Run interactively
docker run -it <image> sh
```

### Issue 3: MongoDB Connection Failed
```yaml
# Use service name as hostname
mongodb://mongodb:27017/myapp
# NOT localhost!
```

### Issue 4: Changes Not Reflected
```bash
# Rebuild without cache
docker compose build --no-cache
docker compose up -d
```

---

## Useful Commands Cheatsheet

```bash
# Images
docker images                    # List images
docker build -t name:tag .       # Build image
docker rmi <image>               # Remove image
docker image prune               # Remove unused images

# Containers
docker ps                        # List running containers
docker ps -a                     # List all containers
docker run -d -p 8080:80 nginx   # Run container
docker stop <container>          # Stop container
docker rm <container>            # Remove container
docker logs -f <container>       # Follow logs
docker exec -it <container> sh   # Enter container

# Compose
docker compose up -d             # Start services
docker compose down              # Stop services
docker compose logs -f           # Follow logs
docker compose ps                # List services
docker compose restart           # Restart services
docker compose build             # Rebuild images

# System
docker system df                 # Show disk usage
docker system prune -a           # Clean up everything
docker volume prune              # Remove unused volumes
docker network prune             # Remove unused networks
```

---

## Next Steps

1. **Practice Daily**: Run `docker compose up` and explore
2. **Read Logs**: Understand what's happening
3. **Experiment**: Break things and fix them
4. **Deploy**: Try deploying to cloud (AWS, DigitalOcean)
5. **Learn Kubernetes**: Next level orchestration

---

## Resources

- Official Docs: https://docs.docker.com
- Docker Hub: https://hub.docker.com
- Docker Compose Docs: https://docs.docker.com/compose
- Best Practices: https://docs.docker.com/develop/dev-best-practices

---

**Happy Dockerizing! 🐳**

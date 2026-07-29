#!/bin/bash
# Manual Docker Stop Script
# Stops and removes all manually created containers

echo "🛑 Stopping Docker containers..."
echo ""

# Stop containers
echo "Stopping containers..."
docker stop frontend backend mongodb 2>/dev/null || true
echo "✅ Containers stopped"
echo ""

# Remove containers
echo "Removing containers..."
docker rm frontend backend mongodb 2>/dev/null || true
echo "✅ Containers removed"
echo ""

# Optional: Remove network
read -p "Remove network? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  docker network rm myapp-network 2>/dev/null || true
  echo "✅ Network removed"
fi
echo ""

# Optional: Remove volumes
read -p "Remove data volume? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
  docker volume rm mongo-data 2>/dev/null || true
  echo "✅ Volume removed"
fi
echo ""

echo "✨ Cleanup complete!"
echo ""
echo "Current status:"
docker ps -a | grep -E "frontend|backend|mongodb" || echo "No containers found"

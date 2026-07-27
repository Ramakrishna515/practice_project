# Project Structure

This project is organized into separate frontend and backend folders for better code organization and maintainability.

## Directory Structure

```
practice_project/
├── frontend/          # React frontend application
│   ├── src/          # React components and app code
│   ├── public/       # Static assets
│   ├── package.json  # Frontend dependencies
│   └── ...
├── backend/          # Node.js backend server
│   ├── server.js     # Express server
│   ├── apis.js       # API routes
│   ├── Model.js      # Database models
│   ├── package.json  # Backend dependencies
│   └── ...
└── README.md
```

## Getting Started

### Frontend (React App)
```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000`

### Backend (Node.js Server)
```bash
cd backend
npm install
npm start
```

The backend server will run on its configured port (check backend/server.js)

## Development Workflow

1. Start the backend server first
2. Then start the frontend development server
3. The frontend will proxy API requests to the backend

## Notes

- Frontend and backend have separate `node_modules` and `package.json` files
- Each folder can be developed and deployed independently
- Make sure to install dependencies in both folders

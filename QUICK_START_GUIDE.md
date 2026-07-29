# HRMS Quick Start Guide 🚀

Get your complete HRMS system up and running in 5 minutes!

---

## Prerequisites ✅

Make sure you have installed:
- ✅ Node.js (v18+)
- ✅ MongoDB (running)
- ✅ npm or yarn

---

## Step 1: Start MongoDB

```bash
# Start MongoDB service
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod
```

---

## Step 2: Start Backend Server

```bash
# Navigate to backend
cd backend

# Install dependencies (first time only)
npm install

# Start server
npm start
```

**Backend will run on:** http://localhost:5001

**Expected output:**
```
✅ MongoDB connected to: mongodb://localhost:27017/myapp
✅ Server running at http://localhost:5001
```

---

## Step 3: Start Frontend Application

**Open a new terminal:**

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start React app
npm start
```

**Frontend will run on:** http://localhost:3000

Browser will automatically open to: http://localhost:3000

---

## Step 4: Register First User

1. **Open browser**: http://localhost:3000
2. **Click "Register"**
3. **Fill in details:**
   - Username: `admin`
   - Email: `admin@hrms.com`
   - Password: `admin123`
   - Role: `Admin`
4. **Click "Register"**

You'll be automatically logged in!

---

## Step 5: Explore Modules

Once logged in, you can access:

### 📊 Dashboard
- View system statistics
- Employee count
- Attendance summary
- Leave summary

### 👥 Employees
- Add new employees
- View employee list
- Search employees
- Edit employee details

### 🏢 Organization
- Manage departments
- Setup designations
- View org chart

### 🎯 Onboarding
- Create onboarding workflows
- Track new hire progress
- Manage tasks and documents

### ⏰ Attendance
- Check in/out
- View attendance records
- Generate reports
- Manage shifts

### 📅 Leaves
- Apply for leave
- Approve/reject leaves
- Check leave balance
- View leave calendar

### 💰 Payroll
- Setup salary structures
- Generate payslips
- Process payroll
- View payment history

---

## Quick Test Workflow

### Test 1: Create Department

1. Go to **Organization → Departments**
2. Click **"Add Department"**
3. Fill in:
   - Department Code: `IT`
   - Department Name: `Information Technology`
4. Click **"Save"**

### Test 2: Add Employee

1. Go to **Employees**
2. Click **"Add Employee"**
3. Fill in basic details:
   - First Name: `John`
   - Last Name: `Doe`
   - Email: `john.doe@company.com`
   - Phone: `1234567890`
   - Joining Date: Today's date
4. Select Department: `Information Technology`
5. Click **"Save"**

### Test 3: Mark Attendance

1. Go to **Attendance → Check In/Out**
2. Select Employee: `John Doe`
3. Click **"Check In"**
4. Wait a few seconds
5. Click **"Check Out"**

### Test 4: Apply Leave

1. Go to **Leaves → Apply Leave**
2. Select Employee
3. Select Leave Type
4. Select Dates
5. Enter Reason
6. Click **"Apply"**

### Test 5: View Dashboard

1. Go to **Dashboard**
2. See all statistics updated:
   - Total Employees: 1
   - Today's Attendance: 1
   - And more!

---

## API Testing with curl

### Test Backend Health

```bash
curl http://localhost:5001/
# Response: {"ok":true,"message":"HRMS API is running"}
```

### Test Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hrms.com",
    "password": "admin123"
  }'
```

### Test Get Employees (with auth token)

```bash
# Replace YOUR_TOKEN with token from login response
curl http://localhost:5001/api/employees \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Troubleshooting

### Backend won't start

**Problem:** MongoDB connection error

**Solution:**
```bash
# Check MongoDB is running
ps aux | grep mongod

# Start MongoDB
mongod
```

### Frontend shows 404 errors

**Problem:** Backend not running

**Solution:**
```bash
# Make sure backend is running on port 5001
cd backend
npm start
```

### Can't login

**Problem:** User doesn't exist

**Solution:**
1. Go to Register page
2. Create new user
3. Try logging in again

### Port already in use

**Problem:** Port 3000 or 5001 in use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

---

## File Structure Overview

```
practice_project/
├── backend/              # Node.js API
│   ├── models/          # Database models (12 files)
│   ├── controllers/     # Business logic (8 files)
│   ├── routes/          # API routes (8 files)
│   └── server.js        # Main server
│
├── frontend/            # React App
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── services/    # API calls
│   │   ├── context/     # Auth context
│   │   └── App.js       # Main app
│   └── package.json
│
└── HRMS_README.md       # Full documentation
```

---

## Default Credentials

After registering, use these credentials:

```
Email: admin@hrms.com
Password: admin123
Role: Admin
```

---

## System URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **API Health**: http://localhost:5001/
- **MongoDB**: mongodb://localhost:27017/myapp

---

## Key Features Ready to Use

✅ **Authentication**
- JWT-based login/logout
- Role-based access

✅ **Employee Management**
- CRUD operations
- Search and filter
- Document upload

✅ **Attendance**
- Check-in/Check-out
- Overtime tracking
- Reports

✅ **Leave Management**
- Apply/Approve workflow
- Balance tracking
- Multiple leave types

✅ **Payroll**
- Salary structures
- Automated payslip generation
- Payment processing

✅ **Dashboard**
- Real-time statistics
- Analytics
- Quick insights

---

## Next Steps After Setup

1. ✅ Create departments
2. ✅ Add employees
3. ✅ Setup leave types
4. ✅ Create salary structures
5. ✅ Start using the system!

---

## Need Help?

- Check **HRMS_README.md** for detailed docs
- Review **HRMS_ARCHITECTURE.md** for technical details
- Check console logs for errors
- Ensure MongoDB is running

---

**You're all set! Start managing your HR operations! 🎉**

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { auth, checkRole } = require('../middleware/auth');

// Attendance routes
router.get('/', auth, attendanceController.getAllAttendance);
router.get('/report', auth, checkRole('Admin', 'HR', 'Manager'), attendanceController.getAttendanceReport);
router.get('/employee/:empId', auth, attendanceController.getEmployeeAttendance);
router.get('/:id', auth, attendanceController.getAttendanceById);
router.post('/checkin', auth, attendanceController.checkIn);
router.post('/checkout', auth, attendanceController.checkOut);
router.put('/:id', auth, checkRole('Admin', 'HR', 'Manager'), attendanceController.updateAttendance);

// Shift routes
router.get('/shifts/all', auth, attendanceController.getAllShifts);
router.post('/shifts', auth, checkRole('Admin', 'HR'), attendanceController.createShift);
router.put('/shifts/:id', auth, checkRole('Admin', 'HR'), attendanceController.updateShift);
router.delete('/shifts/:id', auth, checkRole('Admin', 'HR'), attendanceController.deleteShift);

module.exports = router;

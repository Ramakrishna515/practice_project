const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

router.get('/stats', auth, dashboardController.getDashboardStats);
router.get('/attendance', auth, dashboardController.getAttendanceSummary);
router.get('/leaves', auth, dashboardController.getLeaveSummary);
router.get('/employees', auth, dashboardController.getEmployeesByDepartment);
router.get('/payroll', auth, dashboardController.getPayrollSummary);
router.get('/recent', auth, dashboardController.getRecentActivities);


module.exports = router;

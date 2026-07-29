const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { auth, checkRole } = require('../middleware/auth');

// Leave Type routes
router.get('/types', auth, leaveController.getAllLeaveTypes);
router.post('/types', auth, checkRole('Admin', 'HR'), leaveController.createLeaveType);
router.put('/types/:id', auth, checkRole('Admin', 'HR'), leaveController.updateLeaveType);
router.delete('/types/:id', auth, checkRole('Admin', 'HR'), leaveController.deleteLeaveType);

// Leave Application routes
router.get('/my-leaves', auth, leaveController.getMyLeaves);
router.get('/pending', auth, checkRole('Admin', 'HR', 'Manager'), leaveController.getPendingLeaves);
router.get('/', auth, leaveController.getAllLeaves);
router.get('/:id', auth, leaveController.getLeaveById);
router.post('/', auth, leaveController.applyLeave);
router.put('/:id', auth, leaveController.updateLeave);
router.delete('/:id', auth, leaveController.cancelLeave);
router.put('/:id/approve', auth, checkRole('Admin', 'HR', 'Manager'), leaveController.approveLeave);
router.put('/:id/reject', auth, checkRole('Admin', 'HR', 'Manager'), leaveController.rejectLeave);

// Leave Balance routes
router.get('/balance', auth, leaveController.getMyLeaveBalance);
router.get('/balance/:empId', auth, leaveController.getLeaveBalance);
router.put('/balance/:empId', auth, checkRole('Admin', 'HR'), leaveController.updateLeaveBalance);

module.exports = router;

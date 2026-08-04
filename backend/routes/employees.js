const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, employeeController.getAllEmployees);
router.get('/search', auth, employeeController.searchEmployees);
router.get('/:id', auth, employeeController.getEmployeeById);
router.post('/', auth, checkRole('Admin', 'HR'), employeeController.createEmployee);
router.put('/:id', auth, checkRole('Admin', 'HR'), employeeController.updateEmployee);
router.delete('/:id', auth, checkRole('Admin', 'HR'), employeeController.deleteEmployee);
router.post('/:id/upload', auth, employeeController.uploadDocument);
router.get('/:id/documents', auth, employeeController.getEmployeeDocuments);
router.post('/:id/link-user', auth, checkRole('Admin', 'HR'), employeeController.linkUser);
router.delete('/:id/link-user', auth, checkRole('Admin', 'HR'), employeeController.unlinkUser);

module.exports = router;

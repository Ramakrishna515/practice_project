const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const { auth, checkRole } = require('../middleware/auth');

// Salary Structure routes
router.get('/salary-structures', auth, checkRole('Admin', 'HR'), payrollController.getAllSalaryStructures);
router.get('/salary-structures/:id', auth, checkRole('Admin', 'HR'), payrollController.getSalaryStructureById);
router.post('/salary-structures', auth, checkRole('Admin', 'HR'), payrollController.createSalaryStructure);
router.put('/salary-structures/:id', auth, checkRole('Admin', 'HR'), payrollController.updateSalaryStructure);
router.delete('/salary-structures/:id', auth, checkRole('Admin', 'HR'), payrollController.deleteSalaryStructure);

// Payslip routes
router.get('/payslips', auth, payrollController.getAllPayslips);
router.get('/payslips/employee/:empId', auth, payrollController.getEmployeePayslips);
router.get('/payslips/:id', auth, payrollController.getPayslipById);
router.post('/payslips/generate', auth, checkRole('Admin', 'HR'), payrollController.generatePayslips);
router.put('/payslips/:id', auth, checkRole('Admin', 'HR'), payrollController.updatePayslip);
router.post('/payslips/process', auth, checkRole('Admin', 'HR'), payrollController.processPayslips);

module.exports = router;

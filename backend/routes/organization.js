const express = require('express');
const router = express.Router();
const orgController = require('../controllers/organizationController');
const { auth, checkRole } = require('../middleware/auth');

// Department routes
router.get('/departments', auth, orgController.getAllDepartments);
router.get('/departments/tree', auth, orgController.getDepartmentTree);
router.get('/departments/:id', auth, orgController.getDepartmentById);
router.post('/departments', auth, checkRole('Admin', 'HR'), orgController.createDepartment);
router.put('/departments/:id', auth, checkRole('Admin', 'HR'), orgController.updateDepartment);
router.delete('/departments/:id', auth, checkRole('Admin', 'HR'), orgController.deleteDepartment);

// Designation routes
router.get('/designations', auth, orgController.getAllDesignations);
router.get('/designations/:id', auth, orgController.getDesignationById);
router.post('/designations', auth, checkRole('Admin', 'HR'), orgController.createDesignation);
router.put('/designations/:id', auth, checkRole('Admin', 'HR'), orgController.updateDesignation);
router.delete('/designations/:id', auth, checkRole('Admin', 'HR'), orgController.deleteDesignation);

module.exports = router;

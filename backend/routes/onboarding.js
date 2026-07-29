const express = require('express');
const router = express.Router();
const onboardingController = require('../controllers/onboardingController');
const { auth, checkRole } = require('../middleware/auth');

router.get('/', auth, checkRole('Admin', 'HR', 'Manager'), onboardingController.getAllOnboarding);
router.get('/:id', auth, onboardingController.getOnboardingById);
router.post('/', auth, checkRole('Admin', 'HR'), onboardingController.createOnboarding);
router.put('/:id', auth, checkRole('Admin', 'HR'), onboardingController.updateOnboarding);
router.delete('/:id', auth, checkRole('Admin', 'HR'), onboardingController.deleteOnboarding);
router.put('/:id/task/:taskId', auth, onboardingController.updateTaskStatus);
router.put('/:id/document/:documentId', auth, onboardingController.updateDocumentStatus);

module.exports = router;

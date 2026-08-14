const express = require('express');
const router = express.Router();
const {
  getMedications,
  getMedicationStats,
  createMedication,
  updateMedication,
  updateMedicationStatus,
  deleteMedication,
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, getMedicationStats);

// CRUD
router.get('/', protect, getMedications);
router.post('/', protect, createMedication);
router.patch('/:id', protect, updateMedication);
router.patch('/:id/status', protect, updateMedicationStatus);
router.delete('/:id', protect, deleteMedication);

module.exports = router;

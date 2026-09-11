const express = require('express');
const router = express.Router();
const {
  Medications,
  MedicationStats,
  createMedication,
  updateMedication,
  updateMedicationStatus,
  deleteMedication,
} = require('../controllers/medicationController');
const { protect } = require('../middleware/auth');

// Dashboard stats
router.get('/stats', protect, MedicationStats);

// CRUD
router.get('/', protect, Medications);
router.post('/', protect, createMedication);
router.patch('/:id', protect, updateMedication);
router.patch('/:id/status', protect, updateMedicationStatus);
router.delete('/:id', protect, deleteMedication);

module.exports = router;

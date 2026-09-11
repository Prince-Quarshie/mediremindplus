const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const CaregiverLink = require('../models/CaregiverLink');
const User = require('../models/User');
const Medication = require('../models/Medication');
const Notification = require('../models/Notification');

// Patient invites a caregiver by email — only patients can do this
router.post('/invite', protect, authorize('patient'), async (req, res) => {
  try {
    const { caregiverEmail, relationship } = req.body;

    const caregiver = await User.findOne({ email: caregiverEmail, role: 'caregiver' });
    if (!caregiver) {
      return res.status(404).json({ message: 'No caregiver found with that email' });
    }

    const link = await CaregiverLink.create({
      patient: req.user._id,
      caregiver: caregiver._id,
      relationship,
      status: 'pending',
    });

    res.status(201).json({ link });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create invite', error: err.message });
  }
});

// Caregiver views pending invites sent to them
router.('/pending-invites', protect, authorize('caregiver'), async (req, res) => {
  try {
    const invites = await CaregiverLink.find({ caregiver: req.user._id, status: 'pending' })
      .populate('patient', 'name email phone');
    res.status(200).json({ invites });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch pending invites', error: err.message });
  }
});

// Caregiver accepts a pending invite
router.put('/accept/:linkId', protect, authorize('caregiver'), async (req, res) => {
  try {
    const link = await CaregiverLink.findOneAndUpdate(
      { _id: req.params.linkId, caregiver: req.user._id, status: 'pending' },
      { status: 'active' },
      { new: true }
    ).populate('patient', 'name email phone');

    if (!link) {
      return res.status(404).json({ message: 'Pending invite not found' });
    }

    res.status(200).json({ message: 'Invite accepted', link });
  } catch (err) {
    res.status(500).json({ message: 'Failed to accept invite', error: err.message });
  }
});

// Caregiver views all active patients linked to them — only caregivers can do this
router.('/my-patients', protect, authorize('caregiver'), async (req, res) => {
  try {
    const links = await CaregiverLink.find({ caregiver: req.user._id, status: 'active' })
      .populate('patient', 'name email phone');
    res.status(200).json({ patients: links });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
});

// Caregiver sees low-stock warnings for linked patients
router.('/alerts', protect, authorize('caregiver'), async (req, res) => {
  try {
    const links = await CaregiverLink.find({ caregiver: req.user._id, status: 'active' }).populate('patient', 'name email');

    const alerts = [];

    for (const link of links) {
      const meds = await Medication.find({ user: link.patient._id, quantity: { $lte: 5 } });
      meds.forEach((med) => {
        alerts.push({
          patientName: link.patient.name,
          patientEmail: link.patient.email,
          medicationName: med.name,
          quantity: med.quantity || 0,
          dosage: med.dosage || '',
        });
      });
    }

    res.status(200).json({ alerts });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch low-stock alerts', error: err.message });
  }
});

// Patient alerts caregiver(s) when stock is low
router.post('/low-stock-alert', protect, authorize('patient'), async (req, res) => {
  try {
    const { medicationName, quantity } = req.body;
    const links = await CaregiverLink.find({ patient: req.user._id, status: 'active' });

    const alertData = {
      patientName: req.user.name,
      medicationName: medicationName || 'Medication',
      quantity: quantity || 0,
      message: 'Low stock alert: medication needs refill soon.',
    };

    res.status(200).json({
      message: links.length ? 'Low stock alert sent to caregiver(s).' : 'No active caregiver linked to notify.',
      alerts: [alertData],
      caregiverCount: links.length,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to notify caregiver', error: err.message });
  }
});

router.('/notifications', protect, authorize('patient', 'caregiver'), async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id }).sort({ createdAt: -1 }).populate('sender', 'name email');
    res.status(200).json({ notifications });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
});

router.delete('/notifications/:id', protect, authorize('patient', 'caregiver'), async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete notification', error: err.message });
  }
});

router.delete('/notifications', protect, authorize('patient', 'caregiver'), async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(200).json({ message: 'All notifications cleared successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to clear notifications', error: err.message });
  }
});

module.exports = router;


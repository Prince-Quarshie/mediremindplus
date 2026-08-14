const mongoose = require('mongoose');

const caregiverLinkSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    caregiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    relationship: { type: String, trim: true }, // e.g. "daughter", "spouse"
    status: {
      type: String,
      enum: ['pending', 'active'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate links between the same patient and caregiver
caregiverLinkSchema.index({ patient: 1, caregiver: 1 }, { unique: true });

module.exports = mongoose.model('CaregiverLink', caregiverLinkSchema);

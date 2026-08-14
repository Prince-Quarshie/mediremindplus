const mongoose = require('mongoose');

const MedicationSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    dosage:        { type: String, trim: true },
    quantity:      { type: Number, default: 0, min: 0 },
    quantityUnit: {
      type: String,
      enum: ['count', 'ml', 'g'],
      default: 'count',
    },
    user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Schedule
    scheduledTime: { type: String, default: '09:00' },   // primary time for compatibility
    scheduledTimes: [{ type: String, default: '09:00' }],
    scheduleDate:  { type: Date, default: Date.now },

    // Drug form / type
    drugType: {
      type: String,
      enum: ['pill', 'syrup', 'injection', 'drops', 'powder', 'inhaler', 'others'],
      default: 'pill',
    },

    // Meal relation
    mealRelation: {
      type: String,
      enum: ['before meals', 'after meals', 'with meals', 'no preference'],
      default: 'no preference',
    },

    // Status lifecycle
    status: {
      type: String,
      enum: ['pending', 'taken', 'missed'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Medication', MedicationSchema);

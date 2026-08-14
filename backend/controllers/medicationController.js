const Medication = require('../models/Medication');
const CaregiverLink = require('../models/CaregiverLink');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

const normalizeScheduledTimes = (value, fallback = '09:00') => {
  const candidates = Array.isArray(value) ? value : typeof value === 'string' ? [value] : [];
  const clean = candidates
    .map((item) => String(item || '').trim())
    .filter(Boolean)
    .map((item) => (item.length >= 5 ? item.slice(0, 5) : item));

  const unique = [...new Set(clean)];
  return unique.length ? unique : [fallback];
};

const getTakenDoseAmount = (medication) => {
  if (!medication) return 1;

  const dosageText = String(medication.dosage || '').trim();
  if (!dosageText) return 1;

  const match = dosageText.match(/(\d+(?:\.\d+)?)/);
  if (!match) return 1;

  const numericValue = Number(match[1]);
  const lower = dosageText.toLowerCase();

  if (medication.quantityUnit === 'ml' || lower.includes('ml') || lower.includes('milliliter')) {
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;
  }

  if (medication.quantityUnit === 'g' || lower.includes('g') || lower.includes('gram')) {
    return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;
  }

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : 1;
};

const getTimeInMinutes = (timeValue) => {
  if (!timeValue || typeof timeValue !== 'string') return 0;
  const [hours, minutes] = timeValue.split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return 0;
  return (hours * 60) + minutes;
};

const getMedicationTimes = (medication) => {
  if (Array.isArray(medication?.scheduledTimes) && medication.scheduledTimes.length) {
    return medication.scheduledTimes.filter(Boolean);
  }
  if (medication?.scheduledTime) return [medication.scheduledTime];
  return ['09:00'];
};

const sortUpcomingTimes = (times) => {
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  return [...times].sort((a, b) => {
    const aMinutes = getTimeInMinutes(a);
    const bMinutes = getTimeInMinutes(b);
    const aDelta = (aMinutes - nowMinutes + 1440) % 1440;
    const bDelta = (bMinutes - nowMinutes + 1440) % 1440;
    return aDelta - bDelta;
  });
};

const autoMissOverdueMedications = async (userId) => {
  const meds = await Medication.find({ user: userId, status: 'pending' });
  const patient = await User.findById(userId);

  const missed = [];
  const now = new Date();

  for (const med of meds) {
    const times = sortUpcomingTimes(getMedicationTimes(med));
    const overdue = times.some((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduled = new Date(now);
      scheduled.setHours(hours, minutes, 0, 0);
      const diffMs = now.getTime() - scheduled.getTime();
      return diffMs >= 60 * 60 * 1000 && diffMs < 24 * 60 * 60 * 1000;
    });

    if (!overdue) continue;
    med.status = 'missed';
    await med.save();
    missed.push(med);
  }

  for (const med of missed) {
    await notifyCaregiversOfMissedDose(patient, med);
  }

  return missed;
};

const notifyCaregiversOfDoseUpdate = async (patient, medication, status) => {
  const links = await CaregiverLink.find({ patient: patient._id, status: 'active' }).populate('caregiver', 'name email');

  const results = [];

  const isMissed = status === 'missed';
  const title = isMissed ? 'Medication missed alert' : 'Medication taken update';
  const message = isMissed
    ? `${patient.name} missed ${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''} scheduled for ${medication.scheduledTime || 'the scheduled time'}.`
    : `${patient.name} took ${medication.name}${medication.dosage ? ` (${medication.dosage})` : ''} at ${medication.scheduledTime || 'the scheduled time'}.`;

  await Notification.create({
    recipient: patient._id,
    sender: patient._id,
    type: isMissed ? 'missed-dose' : 'taken-dose',
    title,
    message,
    patientName: patient.name,
    medicationName: medication.name,
  });

  for (const link of links) {
    const caregiver = link.caregiver;
    if (!caregiver || !caregiver.email) continue;

    await Notification.create({
      recipient: caregiver._id,
      sender: patient._id,
      type: isMissed ? 'missed-dose' : 'taken-dose',
      title,
      message,
      patientName: patient.name,
      medicationName: medication.name,
    });

    if (isMissed) {
      await sendEmail({
        to: caregiver.email,
        subject: 'Medication missed alert',
        text: message,
        html: `<p><strong>${patient.name}</strong> missed <strong>${medication.name}</strong> scheduled for ${medication.scheduledTime || 'the scheduled time'}.</p><p>${message}</p>`,
      });
    }

    results.push({ caregiverName: caregiver.name, caregiverEmail: caregiver.email });
  }

  return results;
};

const notifyCaregiversOfMissedDose = async (patient, medication) => notifyCaregiversOfDoseUpdate(patient, medication, 'missed');

// ─── GET /medications  ──────────────────────────────────────────
exports.getMedications = async (req, res) => {
  try {
    await autoMissOverdueMedications(req.user._id);
    const meds = await Medication.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(meds);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /medications/stats  ────────────────────────────────────
// Returns live counts used by the dashboard stat cards.
exports.getMedicationStats = async (req, res) => {
  try {
    const userId = req.user._id;
    await autoMissOverdueMedications(userId);

    // Start / end of today in UTC
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const allMeds = await Medication.find({ user: userId });
    const total = allMeds.length;

    // "Taken Today" — status === 'taken' and updatedAt is today
    const takenToday = allMeds.filter(
      (m) => m.status === 'taken' && m.updatedAt >= startOfDay && m.updatedAt <= endOfDay
    ).length;

    // "Missed" — status === 'missed'
    const missed = allMeds.filter((m) => m.status === 'missed').length;

    // "Upcoming" — status === 'pending' (not yet taken / missed)
    const upcoming = allMeds.filter((m) => m.status === 'pending').length;

    res.json({ medications: total, takenToday, missed, upcoming });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /medications  ─────────────────────────────────────────
exports.createMedication = async (req, res) => {
  try {
    const {
      name,
      dosage,
      scheduledTime,
      scheduledTimes,
      scheduleDate,
      mealRelation,
      drugType,
      quantity,
      quantityUnit,
    } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    const validMealRelations = ['before meals', 'after meals', 'with meals', 'no preference'];
    const validDrugTypes = ['pill', 'syrup', 'injection', 'drops', 'powder', 'inhaler', 'others'];
    const validQuantityUnits = ['count', 'ml', 'g'];

    const safeMealRelation = validMealRelations.includes(mealRelation) ? mealRelation : 'no preference';
    const safeDrugType = validDrugTypes.includes(drugType) ? drugType : 'pill';
    const safeQuantity = Number(quantity) >= 0 ? Number(quantity) : 0;
    const inferredUnit = safeDrugType === 'syrup' || safeDrugType === 'powder' ? 'ml' : 'count';
    const safeQuantityUnit = validQuantityUnits.includes(quantityUnit) ? quantityUnit : inferredUnit;
    const times = normalizeScheduledTimes(scheduledTimes || scheduledTime || '09:00');

    const med = new Medication({
      name: name.trim(),
      dosage: (dosage || '').trim(),
      quantity: safeQuantity,
      quantityUnit: safeQuantityUnit,
      scheduledTime: times[0],
      scheduledTimes: times,
      scheduleDate: scheduleDate ? new Date(scheduleDate) : new Date(),
      mealRelation: safeMealRelation,
      drugType: safeDrugType,
      user: req.user._id,
      status: 'pending',
    });
    await med.save();
    res.status(201).json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /medications/:id  ───────────────────────────────────
exports.updateMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      dosage,
      scheduledTime,
      scheduledTimes,
      mealRelation,
      drugType,
      quantity,
      quantityUnit,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const validMealRelations = ['before meals', 'after meals', 'with meals', 'no preference'];
    const validDrugTypes = ['pill', 'syrup', 'injection', 'drops', 'powder', 'inhaler', 'others'];
    const validQuantityUnits = ['count', 'ml', 'g'];

    const safeDrugType = validDrugTypes.includes(drugType) ? drugType : 'pill';
    const inferredUnit = safeDrugType === 'syrup' || safeDrugType === 'powder' ? 'ml' : 'count';
    const times = normalizeScheduledTimes(scheduledTimes || scheduledTime || '09:00');

    const updated = {
      name: name.trim(),
      dosage: (dosage || '').trim(),
      quantity: Number(quantity) >= 0 ? Number(quantity) : 0,
      quantityUnit: validQuantityUnits.includes(quantityUnit) ? quantityUnit : inferredUnit,
      scheduledTime: times[0],
      scheduledTimes: times,
      mealRelation: validMealRelations.includes(mealRelation) ? mealRelation : 'no preference',
      drugType: safeDrugType,
    };

    const med = await Medication.findOneAndUpdate(
      { _id: id, user: req.user._id },
      updated,
      { new: true }
    );

    if (!med) return res.status(404).json({ message: 'Medication not found or unauthorized' });

    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PATCH /medications/:id/status  ────────────────────────────
// Mark a medication as 'taken' or 'missed'.
exports.updateMedicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['taken', 'missed', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be taken, missed, or pending.' });
    }

    const med = await Medication.findOne({ _id: id, user: req.user._id });
    if (!med) return res.status(404).json({ message: 'Medication not found or unauthorized' });

    if (status === 'taken') {
      const doseAmount = getTakenDoseAmount(med);
      const nextQuantity = Math.max(0, (Number(med.quantity) || 0) - doseAmount);
      med.quantity = nextQuantity;
    }

    med.status = status;
    await med.save();

    if (status === 'missed' || status === 'taken') {
      const patient = await User.findById(req.user._id);
      const alerts = await notifyCaregiversOfDoseUpdate(patient, med, status);
      return res.json({ ...med.toObject(), alerts });
    }

    res.json(med);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /medications/:id  ───────────────────────────────────
exports.deleteMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const med = await Medication.findOneAndDelete({ _id: id, user: req.user._id });
    if (!med) return res.status(404).json({ message: 'Medication not found or unauthorized' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

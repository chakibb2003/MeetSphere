const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  meetingCode: { type: String, required: true, unique: true },
  hostSessionId: { type: String, required: true },
  participantCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', meetingSchema);

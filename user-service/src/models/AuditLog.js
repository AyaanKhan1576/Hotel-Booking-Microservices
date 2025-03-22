// src/models/AuditLog.js
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  action: { type: String, enum: ['update', 'delete'], required: true },
  targetUserId: { type: Number, required: true },
  oldData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
//
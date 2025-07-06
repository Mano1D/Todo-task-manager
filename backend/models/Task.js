const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },  // 'personal' or 'professional'
  createdBy: { type: String, required: true }, // User's email
  createdAt: { type: Date, default: Date.now },
  deadline: { type: Date, default: null },
  status: { type: String, enum: ['in-progress', 'finished'], default: 'in-progress' },
});



module.exports = mongoose.model('Task', taskSchema);

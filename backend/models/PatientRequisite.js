import mongoose from 'mongoose';

const patientRequisiteSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  templateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Template',
    required: true
  },
  templateName: {
    type: String,
    required: true
  },
  templateType: {  // ← ДОБАВИТЬ ЭТО
    type: String,
    default: 'cardiomonitor'
  },
  data: {
    type: Object,
    required: true,
    default: {}
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, { 
  timestamps: true 
});

patientRequisiteSchema.index({ patientId: 1, status: 1 });

const PatientRequisite = mongoose.model('PatientRequisite', patientRequisiteSchema);
export default PatientRequisite;
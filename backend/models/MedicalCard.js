import mongoose from 'mongoose';

const medicalCardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bloodType: {
    type: String,
    default: '',
    enum: ['', 'A (II)', 'B (III)', 'AB (IV)', 'O (I)']
  },
  rhFactor: {
    type: String,
    default: '',
    enum: ['', 'Rh+', 'Rh-']
  },
  height: {
    type: Number,
    default: null
  },
  weight: {
    type: Number,
    default: null
  },
  insuranceNumber: {
    type: String,
    default: ''
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  allergies: [{
    type: String
  }],
  chronicDiseases: [{
    type: String
  }],
  medications: [{
    type: String
  }]
}, { 
  timestamps: true 
});

const MedicalCard = mongoose.model('MedicalCard', medicalCardSchema);
export default MedicalCard;
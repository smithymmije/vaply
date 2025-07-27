const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    trim: true,
    default: 'Confidencial'
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contractType: {
    type: String,
    enum: ['CLT', 'PJ', 'Estágio', 'Temporário', 'Freelancer', 'Outros'],
    required: true
  },
  workSchedule: {
    type: String,
    enum: ['Integral', 'Meio período', 'Escala', 'Híbrido', 'Remoto', 'Outros'],
    required: true
  },
  workScheduleDetails: String,
  mission: String,
  responsibilities: {
    type: String,
    required: true
  },
  education: String,
  experience: String,
  technicalSkills: String,
  desiredSkills: String,
  differentials: String,
  salaryRange: String,
  // --- Alteração aqui: Benefícios como uma única string ---
  benefitsText: String, 
  // --- Fim da alteração ---
  applicationEmail: String,
  applicationLink: String,
  applicationSite: String,
  submissionInstructions: String,
  deadline: String,
  institutionalMessage: String,
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Job', JobSchema);
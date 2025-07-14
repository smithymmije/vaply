const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NoteSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, { timestamps: true }); // ✅ Isso ativa createdAt e updatedAt automáticos

module.exports = mongoose.model('Note', NoteSchema);

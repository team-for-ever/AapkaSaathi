import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['money', 'item'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amountNeeded: {
    type: Number,
    required: function() {
      return this.type === 'money';
    }
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'fulfilled'],
    default: 'open'
  },
  location: {
    type: String,
    required: true
  },
  supportingDocuments: [{
    type: String
  }]
}, {
  timestamps: true
});

const Request = mongoose.model('Request', requestSchema);
export default Request;

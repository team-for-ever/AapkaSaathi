import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  donor: {
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
  amount: {
    type: Number,
    required: function() {
      return this.type === 'money';
    }
  },
  itemCondition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    required: function() {
      return this.type === 'item';
    }
  },
  status: {
    type: String,
    enum: ['available', 'reserved', 'completed'],
    default: 'available'
  },
  location: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }]
}, {
  timestamps: true
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;

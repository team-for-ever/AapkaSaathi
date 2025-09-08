import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  bio: {
    type: String
  },
  location: {
    type: String
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'recipient'],
    required: true
  },
  idProof: {
    type: {
      type: String,
      enum: ['aadhar', 'pan', 'voter', 'driving'],
      required: true
    },
    number: {
      type: String,
      required: true
    },
    verified: {
      type: Boolean,
      default: false
    },
    document: {
      type: String,  // URL to stored document
      required: true
    }
  },
  specialCategory: {
    type: {
      type: String,
      enum: ['ews', 'disability', 'none'],
      default: 'none'
    },
    certificateUrl: String,
    verified: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

const Profile = mongoose.model('Profile', profileSchema);
export default Profile;

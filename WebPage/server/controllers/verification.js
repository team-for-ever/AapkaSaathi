import Profile from '../models/Profile.js';

export const verifyDocument = async (req, res) => {
  try {
    const { documentType, documentData } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Integrate with Data_transfer_Verify.js verification logic
    // This will be called from the frontend after document processing
    if (documentType === 'idProof') {
      profile.idProof.verified = true;
    } else if (documentType === 'specialCategory') {
      profile.specialCategory.verified = true;
    }

    await profile.save();
    res.status(200).json({ message: 'Document verified successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error verifying document' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    const { documentType, documentUrl } = req.body;
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (documentType === 'idProof') {
      profile.idProof.document = documentUrl;
      profile.idProof.verified = false;
    } else if (documentType === 'specialCategory') {
      profile.specialCategory.certificateUrl = documentUrl;
      profile.specialCategory.verified = false;
    }

    await profile.save();
    res.status(200).json({ message: 'Document uploaded successfully', profile });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading document' });
  }
};

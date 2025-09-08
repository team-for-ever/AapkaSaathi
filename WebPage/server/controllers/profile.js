import Profile from '../models/Profile.js';

export const createProfile = async (req, res) => {
  try {
    const { 
      name, 
      bio, 
      location, 
      contactNumber, 
      role,
      idProof,
      specialCategory 
    } = req.body;
    
    // Check if profile already exists
    const existingProfile = await Profile.findOne({ user: req.user.id });
    if (existingProfile) {
      return res.status(400).json({ message: 'Profile already exists' });
    }

    // Create profile with validated data
    const profileData = {
      user: req.user.id,
      name,
      bio: bio || '',
      location,
      contactNumber,
      role,
      idProof: {
        type: idProof.type,
        number: idProof.number,
        document: idProof.document,
        verified: false
      }
    };

    // Add special category only if it's not 'none'
    if (specialCategory && specialCategory.type && specialCategory.type !== 'none') {
      profileData.specialCategory = {
        type: specialCategory.type,
        certificateUrl: specialCategory.certificateUrl,
        verified: false
      };
    }

    const profile = await Profile.create(profileData);

    res.status(201).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, contactNumber } = req.body;
    
    const profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { name, bio, location, contactNumber },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const getProfileById = async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.status(200).json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

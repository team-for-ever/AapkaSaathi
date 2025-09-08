import Donation from '../models/Donation.js';

export const createDonation = async (req, res) => {
  try {
    const { title, description, type, category, amount, itemCondition, location, images } = req.body;
    
    const donation = await Donation.create({
      donor: req.user.profileId,
      title,
      description,
      type,
      category,
      amount,
      itemCondition,
      location,
      images
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error creating donation' });
  }
};

export const updateDonation = async (req, res) => {
  try {
    const { title, description, type, category, amount, itemCondition, location, status } = req.body;
    
    const donation = await Donation.findOneAndUpdate(
      { _id: req.params.id, donor: req.user.profileId },
      { title, description, type, category, amount, itemCondition, location, status },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating donation' });
  }
};

export const getDonations = async (req, res) => {
  try {
    const { type, category, status, location } = req.query;
    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (status) query.status = status;
    if (location) query.location = location;

    const donations = await Donation.find(query)
      .populate('donor', 'name location')
      .sort({ createdAt: -1 });

    res.status(200).json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donations' });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('donor', 'name location contactNumber');

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json(donation);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching donation' });
  }
};

export const deleteDonation = async (req, res) => {
  try {
    const donation = await Donation.findOneAndDelete({
      _id: req.params.id,
      donor: req.user.profileId
    });

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.status(200).json({ message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting donation' });
  }
};

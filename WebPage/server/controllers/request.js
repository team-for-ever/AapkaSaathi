import Request from '../models/Request.js';

export const createRequest = async (req, res) => {
  try {
    const { title, description, type, category, amountNeeded, urgency, location, supportingDocuments } = req.body;
    
    const request = await Request.create({
      requester: req.user.profileId,
      title,
      description,
      type,
      category,
      amountNeeded,
      urgency,
      location,
      supportingDocuments
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error creating request' });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { title, description, type, category, amountNeeded, urgency, location, status } = req.body;
    
    const request = await Request.findOneAndUpdate(
      { _id: req.params.id, requester: req.user.profileId },
      { title, description, type, category, amountNeeded, urgency, location, status },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error updating request' });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { type, category, urgency, status, location } = req.query;
    const query = {};

    if (type) query.type = type;
    if (category) query.category = category;
    if (urgency) query.urgency = urgency;
    if (status) query.status = status;
    if (location) query.location = location;

    const requests = await Request.find(query)
      .populate('requester', 'name location')
      .sort({ urgency: -1, createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching requests' });
  }
};

export const getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('requester', 'name location contactNumber');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching request' });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const request = await Request.findOneAndDelete({
      _id: req.params.id,
      requester: req.user.profileId
    });

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.status(200).json({ message: 'Request deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting request' });
  }
};

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setProfile } from '../redux/authSlice';
import axios from '../utils/axiosConfig';

const CreateProfile = () => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    contactNumber: '',
    role: '',
    idProof: {
      type: '',
      number: '',
      document: null
    },
    specialCategory: {
      type: 'none',
      certificate: null
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Max dimension
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with reduced quality
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const compressedBase64 = await compressImage(file);
      
      if (type === 'idProof') {
        setFormData(prev => ({
          ...prev,
          idProof: {
            ...prev.idProof,
            document: compressedBase64
          }
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          specialCategory: {
            ...prev.specialCategory,
            certificateUrl: compressedBase64
          }
        }));
      }
    } catch (error) {
      setError('Error processing image. Please try a different file.');
    }
  };

  const verifyDocument = async (base64Data) => {
    const apiKeyInput = "AIzaSyD4DHiM4F8sdrrtUMZXtgzeYJ5dtT3zFIY";
    // Use the Data_transfer_Verify.js verification logic
    try {
      // Make API call to verify the document
      const response = await axios.post('https://vision.googleapis.com/v1/images:annotate', {
        requests: [{
          image: { content: base64Data },
          features: [{ type: 'TEXT_DETECTION' }]
        }]
      }, {
        params: { key: apiKeyInput }
      });

      // Check if the document is authentic based on the OCR results
      const text = response.data?.responses[0]?.fullTextAnnotation?.text || '';
      if (!text) {
        throw new Error('No text found in the document');
      }
      return true;
    } catch (error) {
      console.error('Document verification failed:', error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Basic validation
      if (!formData.name || !formData.contactNumber || !formData.location || !formData.role) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      if (!formData.idProof.type || !formData.idProof.number || !formData.idProof.document) {
        setError('Please provide all ID proof details');
        setLoading(false);
        return;
      }

      // Create profile data
      const profileData = {
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        contactNumber: formData.contactNumber,
        role: formData.role,
        idProof: {
          type: formData.idProof.type,
          number: formData.idProof.number,
          document: formData.idProof.document,
          verified: false
        },
        specialCategory: {
          type: formData.specialCategory.type,
          certificateUrl: formData.specialCategory.type !== 'none' ? formData.specialCategory.certificateUrl : null,
          verified: false
        }
      };

      // Create profile
      const response = await axios.post('/api/profile', profileData);
      dispatch(setProfile(response.data));
      // Redirect to profile page
      window.location.href = '/my-profile';
    } catch (error) {
      setError(error.response?.data?.message || 'Error creating profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Create Your Profile</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2">Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Location *</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Contact Number *</label>
          <input
            type="tel"
            name="contactNumber"
            value={formData.contactNumber}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-2">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select Role</option>
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
          </select>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-bold mb-4">ID Proof *</h3>
          <div className="space-y-4">
            <select
              name="idProof.type"
              value={formData.idProof.type}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            >
              <option value="">Select ID Type</option>
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="voter">Voter ID</option>
              <option value="driving">Driving License</option>
            </select>

            <input
              type="text"
              name="idProof.number"
              placeholder="ID Number"
              value={formData.idProof.number}
              onChange={handleInputChange}
              required
              className="w-full p-2 border rounded"
            />

            <div>
              <label className="block mb-2">Upload ID Proof *</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'idProof')}
                required
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="border p-4 rounded">
          <h3 className="font-bold mb-4">Special Category</h3>
          <div className="space-y-4">
            <select
              name="specialCategory.type"
              value={formData.specialCategory.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="none">None</option>
              <option value="ews">EWS</option>
              <option value="disability">Person with Disability</option>
            </select>

            {formData.specialCategory.type !== 'none' && (
              <div>
                <label className="block mb-2">Upload Certificate *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'specialCategory')}
                  required
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Creating Profile...' : 'Create Profile'}
        </button>
      </form>
    </div>
  );
};

export default CreateProfile;

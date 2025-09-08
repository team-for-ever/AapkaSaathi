import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const DonorDashboard = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/donations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDonations(response.data);
      } catch (error) {
        toast.error('Failed to fetch donations');
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Your Donations</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Create New Donation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {donations.map((donation) => (
          <div key={donation._id} className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">{donation.title}</h2>
            <p className="text-gray-600 mb-4">{donation.description}</p>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>{donation.type}</span>
              <span>{donation.status}</span>
            </div>
          </div>
        ))}
      </div>

      {donations.length === 0 && (
        <p className="text-center text-gray-500 mt-6">
          You haven't created any donations yet.
        </p>
      )}
    </div>
  );
};

export default DonorDashboard;

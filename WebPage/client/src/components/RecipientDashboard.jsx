import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';

const RecipientDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [availableDonations, setAvailableDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, donationsRes] = await Promise.all([
          axios.get('http://localhost:5001/api/requests', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5001/api/donations?status=available', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        
        setRequests(requestsRes.data);
        setAvailableDonations(donationsRes.data);
      } catch (error) {
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Your Requests</h1>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
            Create New Request
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((request) => (
            <div key={request._id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{request.title}</h2>
              <p className="text-gray-600 mb-4">{request.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{request.type}</span>
                <span>{request.status}</span>
              </div>
            </div>
          ))}
        </div>

        {requests.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            You haven't created any requests yet.
          </p>
        )}
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Available Donations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableDonations.map((donation) => (
            <div key={donation._id} className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-2">{donation.title}</h2>
              <p className="text-gray-600 mb-4">{donation.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">{donation.type}</span>
                <button className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700">
                  Request
                </button>
              </div>
            </div>
          ))}
        </div>

        {availableDonations.length === 0 && (
          <p className="text-center text-gray-500 mt-6">
            No available donations at the moment.
          </p>
        )}
      </div>
    </div>
  );
};

export default RecipientDashboard;

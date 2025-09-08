import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { setProfile } from '../redux/authSlice';
import Header from '../components/Header';
import DonorDashboard from '../components/DonorDashboard';
import RecipientDashboard from '../components/RecipientDashboard';

const Home = () => {
  const { user, token, profile } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Home component mounted', { user, token, profile });
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        console.log('Fetching profile...');
        const response = await axios.get('/api/profile/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('Profile fetched:', response.data);
        if (response.data) {
          dispatch(setProfile(response.data));
        } else {
          console.log('No profile data, redirecting to create profile');
          navigate('/create-profile');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        if (error.response?.status === 404) {
          console.log('Profile not found, redirecting to create profile');
          navigate('/create-profile');
        } else if (error.response?.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!profile) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user, token, profile, navigate, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          Loading...
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {profile ? (
          profile.role === 'donor' ? (
            <DonorDashboard />
          ) : (
            <RecipientDashboard />
          )
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Welcome to the Donation Platform</h2>
            <p className="text-gray-600 mb-4">Please complete your profile to continue.</p>
            <button
              onClick={() => navigate('/create-profile')}
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Create Profile
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;

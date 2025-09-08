import React from 'react';
import { useSelector } from 'react-redux';

const MyProfile = () => {
  const { profile } = useSelector((state) => state.auth);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl">No profile found.</p>
          <a href="/create-profile" className="text-blue-500 hover:text-blue-600">
            Create Profile
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">My Profile</h2>
      
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">{profile.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Role</p>
              <p className="font-medium capitalize">{profile.role}</p>
            </div>
            <div>
              <p className="text-gray-600">Contact Number</p>
              <p className="font-medium">{profile.contactNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Location</p>
              <p className="font-medium">{profile.location}</p>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Bio</h3>
            <p className="text-gray-700">{profile.bio}</p>
          </div>
        )}

        {/* ID Proof Information */}
        <div>
          <h3 className="text-xl font-semibold mb-4">ID Proof Details</h3>
          <div className="space-y-2">
            <div>
              <p className="text-gray-600">ID Type</p>
              <p className="font-medium capitalize">{profile.idProof.type}</p>
            </div>
            <div>
              <p className="text-gray-600">ID Number</p>
              <p className="font-medium">{profile.idProof.number}</p>
            </div>
            <div>
              <p className="text-gray-600">Verification Status</p>
              <p className={`font-medium ${profile.idProof.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                {profile.idProof.verified ? 'Verified' : 'Pending Verification'}
              </p>
            </div>
            {profile.idProof.document && (
              <div>
                <p className="text-gray-600 mb-2">ID Document</p>
                <img 
                  src={profile.idProof.document} 
                  alt="ID Proof" 
                  className="max-w-md h-auto rounded border"
                />
              </div>
            )}
          </div>
        </div>

        {/* Special Category Information */}
        {profile.specialCategory && profile.specialCategory.type !== 'none' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Special Category Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Category Type</p>
                <p className="font-medium capitalize">{profile.specialCategory.type}</p>
              </div>
              <div>
                <p className="text-gray-600">Verification Status</p>
                <p className={`font-medium ${profile.specialCategory.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {profile.specialCategory.verified ? 'Verified' : 'Pending Verification'}
                </p>
              </div>
              {profile.specialCategory.certificateUrl && (
                <div>
                  <p className="text-gray-600 mb-2">Certificate</p>
                  <img 
                    src={profile.specialCategory.certificateUrl} 
                    alt="Special Category Certificate" 
                    className="max-w-md h-auto rounded border"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProfile;

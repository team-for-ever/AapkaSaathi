import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const DocumentVerification = () => {
  const profile = useSelector((state) => state.auth.profile);
  const [verificationStatus, setVerificationStatus] = useState({
    idProof: false,
    specialCategory: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize verification status from profile
    if (profile) {
      setVerificationStatus({
        idProof: profile.idProof?.verified || false,
        specialCategory: profile.specialCategory?.verified || false
      });
    }
  }, [profile]);

  const verifyDocument = async (documentType) => {
    setLoading(true);
    setError('');
    
    try {
      const docUrl = documentType === 'idProof' 
        ? profile.idProof.document 
        : profile.specialCategory.certificateUrl;

      // Fetch the image file from the URL
      const response = await fetch(docUrl);
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = async (e) => {
        const base64 = e.target.result.split(',')[1];
        
        // Use the Data_transfer_Verify.js functionality
        const verificationResponse = await axios.post('http://localhost:5001/api/verification/verify', {
          documentType,
          documentData: base64
        }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (verificationResponse.data.profile) {
          setVerificationStatus(prev => ({
            ...prev,
            [documentType]: true
          }));
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      setError('Error verifying document');
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return <div>Please create a profile first</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Document Verification</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-6">
        <div className="border p-4 rounded">
          <h3 className="font-bold mb-4">ID Proof Verification</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p>Type: {profile.idProof.type}</p>
                <p>Number: {profile.idProof.number}</p>
                <p>Status: {verificationStatus.idProof ? 'Verified' : 'Pending Verification'}</p>
              </div>
              {!verificationStatus.idProof && (
                <button
                  onClick={() => verifyDocument('idProof')}
                  disabled={loading}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  Verify ID
                </button>
              )}
            </div>
            {profile.idProof.document && (
              <img 
                src={profile.idProof.document} 
                alt="ID Proof" 
                className="max-w-full h-auto"
              />
            )}
          </div>
        </div>

        {profile.specialCategory.type !== 'none' && (
          <div className="border p-4 rounded">
            <h3 className="font-bold mb-4">Special Category Certificate Verification</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p>Category: {profile.specialCategory.type}</p>
                  <p>Status: {verificationStatus.specialCategory ? 'Verified' : 'Pending Verification'}</p>
                </div>
                {!verificationStatus.specialCategory && (
                  <button
                    onClick={() => verifyDocument('specialCategory')}
                    disabled={loading}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    Verify Certificate
                  </button>
                )}
              </div>
              {profile.specialCategory.certificateUrl && (
                <img 
                  src={profile.specialCategory.certificateUrl} 
                  alt="Special Category Certificate" 
                  className="max-w-full h-auto"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentVerification;

// frontend/src/components/ProfilePage.jsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { FaCamera, FaEdit } from 'react-icons/fa';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage';
import './ProfilePage.css';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

const ProfilePage = () => {
  const { user, setUser } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    sex: '',
    specialization: '',
  });
  
  const [imageToCrop, setImageToCrop] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const [preview, setPreview] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const fileInputRef = useRef(null);
  
  const newDefaultImage = 'https://i.ibb.co/6r114Bw/user-default.png'; // Correct, working URL

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        age: user.age || '',
        sex: user.sex || '',
        specialization: user.specialization || '',
      });
      setPreview(user.profilePicture?.url ? user.profilePicture.url : newDefaultImage);
    }
  }, [user]);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const onRotationChange = useCallback((rotation) => {
    setRotation(rotation);
  }, []);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    console.log("DEBUG: onCropComplete called with:", croppedAreaPixels);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const showCroppedImage = useCallback(async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) {
        console.error("DEBUG: Cannot crop. Missing imageToCrop or croppedAreaPixels.", { imageToCrop, croppedAreaPixels });
        setFeedback({ message: 'Could not crop image. Please try again.', type: 'error' });
        return;
      }
      console.log("DEBUG: Attempting to crop image...");
      const croppedImageFile = await getCroppedImg(
        imageToCrop,
        croppedAreaPixels,
        rotation
      );
      console.log("DEBUG: Image cropped successfully:", croppedImageFile);
      setCroppedImage(croppedImageFile);
      setPreview(URL.createObjectURL(croppedImageFile));
      setShowCropper(false);
      setImageToCrop(null);
    } catch (e) {
      console.error("DEBUG: Error in showCroppedImage:", e);
      setFeedback({ message: 'Error cropping image.', type: 'error' });
    }
  }, [imageToCrop, croppedAreaPixels, rotation]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("DEBUG: 1. File selected in handleImageChange:", file);

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      console.log("DEBUG: 2. Object URL created:", objectUrl);

      setImageToCrop(objectUrl);
      setShowCropper(true);
      setZoom(1);
      setCrop({ x: 0, y: 0 });
      setRotation(0);
      console.log("DEBUG: 3. State has been set to show cropper.");
    }
    e.target.value = null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
        setFormData({
            name: user.name || '',
            phone: user.phone || '',
            age: user.age || '',
            sex: user.sex || '',
            specialization: user.specialization || ''
        });
        setPreview(user.profilePicture?.url ? user.profilePicture.url : newDefaultImage);
        setCroppedImage(null);
        setImageToCrop(null);
    }
    setFeedback({ message: '', type: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ message: '', type: '' });
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('age', formData.age);
    data.append('sex', formData.sex);
    if (user.role === 'doctor') {
      data.append('specialization', formData.specialization);
    }
    
    if (croppedImage) {
      data.append('profilePicture', croppedImage);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await api.put('/api/users/profile', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
      });
      setUser(res.data);
      setIsEditing(false);
      setCroppedImage(null);
      setFeedback({ message: 'Profile updated successfully!', type: 'success' });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile.';
      setFeedback({ message, type: 'error' });
      console.error('Failed to update profile:', error);
    }
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  console.log("DEBUG: Component is rendering. showCropper:", showCropper, "imageToCrop:", imageToCrop);

  if (!user || !preview) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="profile-page-container">
      {showCropper && imageToCrop && (
        <div className="cropper-modal-overlay">
          <div className="cropper-modal-content">
            <div className="cropper-container">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onRotationChange={onRotationChange}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={true}
              />
            </div>
            <div className="cropper-controls">
                <label htmlFor="zoom-slider">Zoom:</label>
                <input
                    id="zoom-slider"
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => { onZoomChange(parseFloat(e.target.value)); }}
                    className="zoom-range"
                />
                <label htmlFor="rotate-slider">Rotation:</label>
                <input
                    id="rotate-slider"
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => { onRotationChange(parseFloat(e.target.value)); }}
                    className="rotate-range"
                />
              <button className="btn btn-primary" onClick={showCroppedImage}>
                Crop Image
              </button>
              <button className="btn btn-secondary" onClick={() => {
                  setShowCropper(false);
                  setImageToCrop(null);
                  fileInputRef.current.value = null;
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="profile-card">
        {feedback.message && <div className={`feedback ${feedback.type}`}>{feedback.message}</div>}
        <div className="profile-header">
          <div className="profile-picture-container">
            <img src={preview} alt="Profile" className="profile-picture" />
            {isEditing && (
              <button
                type="button"
                className="edit-photo-btn"
                onClick={() => fileInputRef.current.click()}
              >
                <FaCamera />
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              // ===== THIS LINE IS THE FIX =====
              accept="image/png, image/jpeg, image/gif, image/webp"
              onChange={handleImageChange}
              disabled={!isEditing}
            />
          </div>
          <h2>{isEditing ? 'Edit Profile' : user.name}</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="profile-body">
            <div className="profile-detail">
              <strong>Name:</strong>
              {isEditing ? <input type="text" name="name" value={formData.name} onChange={handleInputChange} /> : <span>{user.name}</span>}
            </div>
            <div className="profile-detail">
              <strong>Email:</strong>
              <span>{user.email}</span>
            </div>
            {user.role === 'doctor' && (
              <div className="profile-detail">
                <strong>Specialization:</strong>
                {isEditing ? <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g., Cardiology" /> : <span>{user.specialization || 'Not provided'}</span>}
              </div>
            )}
            <div className="profile-detail">
              <strong>Phone:</strong>
              {isEditing ? <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="e.g., +1234567890" /> : <span>{user.phone || 'Not provided'}</span>}
            </div>
            <div className="profile-detail">
              <strong>Age:</strong>
              {isEditing ? <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="e.g., 30" /> : <span>{user.age || 'Not provided'}</span>}
            </div>
            <div className="profile-detail">
              <strong>Sex:</strong>
              {isEditing ? (
                <select name="sex" value={formData.sex} onChange={handleInputChange}>
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              ) : (
                <span>{user.sex || 'Not provided'}</span>
              )}
            </div>
          </div>

          <div className="profile-footer">
            {isEditing && (
              <>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>Cancel</button>
              </>
            )}
          </div>
        </form>
        
        {!isEditing && (
          <div className="profile-footer">
            <button type="button" className="btn btn-edit" onClick={handleEditClick}>
              <FaEdit /> Edit Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;


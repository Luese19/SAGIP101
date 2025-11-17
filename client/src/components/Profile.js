import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  animation: slideUp 0.5s ease-out;

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 15px;
  }
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 30px;
  margin-bottom: 30px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  position: relative;
`;

const AvatarContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const Avatar = styled.div`
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 4px solid ${props => props.selected ? '#667eea' : '#e0e0e0'};
  background: ${props => props.image ? `url(${props.image})` : props.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  
  &:hover {
    transform: scale(1.05);
    border-color: #667eea;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  @media (max-width: 768px) {
    width: 120px;
    height: 120px;
    font-size: 3rem;
  }
`;

const AvatarStatus = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 30px;
  height: 30px;
  background: #4caf50;
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;

  &.uploading {
    background: #ff9800;
    animation: pulse 1s infinite;
  }

  &.error {
    background: #f44336;
  }

  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
  }
`;

const AvatarOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.9rem;
  font-weight: 600;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Avatar}:hover & {
    opacity: 1;
  }
`;

const UploadButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const UploadButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.variant === 'primary' ? '#667eea' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.variant === 'primary' ? 'white' : '#333'};
  border: ${props => props.variant === 'primary' ? 'none' : '2px solid #e0e0e0'};
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#5a6fd8' : '#f5f5f5'};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 150px;
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
  min-width: 280px;
`;

const ProfileCompletion = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;

  .progress {
    width: 60px;
    height: 6px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 3px;
    overflow: hidden;

    .bar {
      height: 100%;
      background: white;
      transition: width 0.3s ease;
    }
  }
`;

const ProfileName = styled.input`
  width: 100%;
  padding: 15px 20px;
  border: 2px solid ${props => props.error ? '#f44336' : '#e0e0e0'};
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  background: ${props => props.disabled ? '#f8f9fa' : 'white'};
  
  &:focus {
    outline: none;
    border-color: ${props => props.error ? '#f44336' : '#667eea'};
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }

  &:disabled {
    background: #f8f9fa;
    color: #333;
  }

  @media (max-width: 768px) {
    font-size: 1.3rem;
    padding: 12px 16px;
  }
`;

const ProfileBio = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  max-height: 120px;
  margin-bottom: 15px;
  transition: border-color 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #999;
  }
`;

const ProfileEmail = styled.div`
  color: #666;
  font-size: 1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '📧';
  }
`;

const ProfileStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 15px;
  border-radius: 12px;
  text-align: center;
  border: 1px solid #e0e0e0;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: 1.4rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: #666;
  font-weight: 500;
`;

const ProfileActions = styled.div`
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-top: 20px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;

  &.save {
    background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
    }
  }
  
  &.cancel {
    background: #f8f9fa;
    color: #333;
    border: 2px solid #e0e0e0;
    
    &:hover:not(:disabled) {
      background: #e9ecef;
      border-color: #ccc;
    }
  }
  
  &.edit {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const Message = styled.div`
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &.success {
    background: linear-gradient(135deg, #e6f7e6 0%, #c8e6c9 100%);
    color: #2e7d32;
    border: 1px solid #4caf50;
  }
  
  &.error {
    background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
    color: #c62828;
    border: 1px solid #f44336;
  }

  &.info {
    background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
    color: #1565c0;
    border: 1px solid #2196f3;
  }
`;

const DefaultAvatars = styled.div`
  margin-top: 25px;
  text-align: center;
`;

const DefaultAvatarsTitle = styled.h4`
  color: #333;
  margin-bottom: 15px;
  font-size: 1.1rem;
`;

const DefaultAvatarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
  gap: 12px;
  max-width: 400px;
  margin: 0 auto;
`;

const DefaultAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.gradient || props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 3px solid ${props => props.selected ? '#667eea' : 'transparent'};
  position: relative;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    border-radius: 50%;
    border: 2px solid ${props => props.selected ? '#667eea' : 'transparent'};
    opacity: ${props => props.selected ? 1 : 0};
    transition: opacity 0.3s ease;
  }

  &:hover::after {
    opacity: 1;
  }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff40;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Enhanced image compression utility - optimized for Firebase Firestore limits
const compressImage = (file, maxWidth = 120, quality = 0.5) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate dimensions to fit within maxWidth while maintaining aspect ratio
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = Math.floor(img.width * ratio);
        const newHeight = Math.floor(img.height * ratio);
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw image with better quality settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'medium'; // Balanced quality vs size
        
        // Fill background with white to avoid black backgrounds for transparent images
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, newWidth, newHeight);
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Convert to blob with optimized compression
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to compress image'));
          }
        }, 'image/jpeg', quality);
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

// Calculate profile completion percentage
const calculateProfileCompletion = (profile) => {
  let completed = 0;
  const total = 4; // displayName, photoURL, bio, avatarColor
  
  if (profile?.displayName?.trim()) completed++;
  if (profile?.photoURL) completed++;
  if (profile?.bio?.trim()) completed++;
  if (profile?.avatarColor || profile?.photoURL) completed++;
  
  return Math.round((completed / total) * 100);
};

function Profile() {
  const { currentUser, userProfile, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [avatarImage, setAvatarImage] = useState(userProfile?.photoURL || null);
  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.avatarColor || null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const fileInputRef = useRef(null);

  const defaultAvatars = [
    { emoji: '🎯', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { emoji: '🎮', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
    { emoji: '🏆', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
    { emoji: '🎪', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
    { emoji: '🌟', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
    { emoji: '🚀', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { emoji: '⚡', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
    { emoji: '🔥', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { emoji: '💎', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { emoji: '🌈', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
    { emoji: '🌙', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
    { emoji: '☀️', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }
  ];

  // Validate inputs
  const validateInputs = useCallback(() => {
    const errors = {};
    
    if (!displayName.trim()) {
      errors.displayName = 'Display name is required';
    } else if (displayName.trim().length < 2) {
      errors.displayName = 'Display name must be at least 2 characters';
    } else if (displayName.trim().length > 30) {
      errors.displayName = 'Display name must be less than 30 characters';
    }

    if (bio.trim() && bio.length > 200) {
      errors.bio = 'Bio must be less than 200 characters';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [displayName, bio]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select a valid image file', type: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size should be less than 5MB', type: 'error' });
      return;
    }

    setUploading(true);
    setMessage({ text: 'Processing image...', type: 'info' });

    try {
      // Compress image to very small size to ensure it works with Firebase
      const compressedFile = await compressImage(file, 120, 0.4);
      
      // Convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        
        // Check if the base64 string is still too long (safety check)
        if (base64Data && base64Data.length > 50000) {
          setMessage({ text: 'Image is too large even after compression. Please try a smaller image.', type: 'error' });
          setUploading(false);
          return;
        }
        
        setAvatarImage(base64Data);
        setSelectedAvatar(null);
        setIsEditing(true);
        setMessage({ text: 'Image uploaded successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        setUploading(false);
      };
      
      reader.onerror = () => {
        setMessage({ text: 'Failed to process image. Please try again.', type: 'error' });
        setUploading(false);
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Image compression error:', error);
      setMessage({ text: 'Failed to process image. Please try again.', type: 'error' });
      setUploading(false);
    }
  };

  const handleDefaultAvatarSelect = (avatar, index) => {
    setSelectedAvatar(avatar);
    setAvatarImage(null);
    setIsEditing(true);
    setMessage({ text: 'Avatar selected!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const handleSave = async () => {
    if (!validateInputs()) {
      setMessage({ text: 'Please fix the errors above', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const profileData = {
        displayName: displayName.trim(),
        bio: bio.trim(),
        photoURL: avatarImage,
        avatarColor: selectedAvatar,
        updatedAt: new Date().toISOString()
      };

      const result = await updateProfile(profileData);
      
      if (result.success) {
        setIsEditing(false);
        setValidationErrors({});
        setMessage({ text: 'Profile updated successfully! 🎉', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } else {
        setMessage({ text: result.error || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(userProfile?.displayName || '');
    setBio(userProfile?.bio || '');
    setAvatarImage(userProfile?.photoURL || null);
    setSelectedAvatar(userProfile?.avatarColor || null);
    setIsEditing(false);
    setValidationErrors({});
    setMessage({ text: '', type: '' });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setMessage({ text: 'Edit mode enabled', type: 'info' });
  };

  const profileCompletion = calculateProfileCompletion(userProfile);

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarSection>
          <AvatarContainer>
            <Avatar 
              image={avatarImage}
              gradient={selectedAvatar?.gradient}
              selected={!!(avatarImage || selectedAvatar)}
              onClick={isEditing ? () => fileInputRef.current?.click() : undefined}
            >
              {!avatarImage && !selectedAvatar && (
                (userProfile?.displayName?.charAt(0)?.toUpperCase() || '?')
              )}
              
              {isEditing && (
                <AvatarOverlay>
                  <span>Click to Change</span>
                </AvatarOverlay>
              )}
              
              <AvatarStatus className={uploading ? 'uploading' : ''}>
                {uploading ? <LoadingSpinner /> : '✓'}
              </AvatarStatus>
            </Avatar>
          </AvatarContainer>
          
          {isEditing && (
            <UploadButtons>
              <UploadButton 
                variant="primary" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Processing...' : '📷 Upload'}
              </UploadButton>
              {avatarImage && (
                <UploadButton 
                  variant="secondary"
                  onClick={() => {
                    setAvatarImage(null);
                    setIsEditing(true);
                  }}
                >
                  🗑️ Remove
                </UploadButton>
              )}
            </UploadButtons>
          )}
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </AvatarSection>

        <ProfileInfo>
          <ProfileCompletion>
            <span>Profile: {profileCompletion}%</span>
            <div className="progress">
              <div className="bar" style={{ width: `${profileCompletion}%` }}></div>
            </div>
          </ProfileCompletion>
          
          {isEditing ? (
            <>
              <ProfileName
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
                error={validationErrors.displayName}
                disabled={loading}
              />
              {validationErrors.displayName && (
                <div style={{ color: '#f44336', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '10px' }}>
                  {validationErrors.displayName}
                </div>
              )}
              
              <ProfileBio
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself (optional)"
                maxLength={200}
                disabled={loading}
              />
              {validationErrors.bio && (
                <div style={{ color: '#f44336', fontSize: '0.85rem', marginTop: '-10px', marginBottom: '10px' }}>
                  {validationErrors.bio}
                </div>
              )}
            </>
          ) : (
            <>
              <ProfileName
                value={displayName}
                disabled={true}
              />
              {bio && (
                <ProfileBio
                  value={bio}
                  disabled={true}
                  style={{ 
                    background: '#f8f9fa', 
                    color: '#333',
                    border: '1px solid #e0e0e0'
                  }}
                />
              )}
            </>
          )}
          
          <ProfileEmail>{currentUser?.email}</ProfileEmail>
          
          <ProfileStats>
            <StatItem>
              <StatValue>{userProfile?.stats?.gamesPlayed || 0}</StatValue>
              <StatLabel>Games Played</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{userProfile?.stats?.gamesWon || 0}</StatValue>
              <StatLabel>Games Won</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{Math.round(((userProfile?.stats?.gamesWon || 0) / Math.max(userProfile?.stats?.gamesPlayed || 1, 1)) * 100)}%</StatValue>
              <StatLabel>Win Rate</StatLabel>
            </StatItem>
            <StatItem>
              <StatValue>{userProfile?.stats?.totalSkillPoints || 0}</StatValue>
              <StatLabel>Skill Points</StatLabel>
            </StatItem>
          </ProfileStats>
        </ProfileInfo>
      </ProfileHeader>

      {message.text && (
        <Message className={message.type}>
          {message.text}
        </Message>
      )}

      <ProfileActions>
        {!isEditing ? (
          <ActionButton className="edit" onClick={handleEdit}>
            ✏️ Edit Profile
          </ActionButton>
        ) : (
          <>
            <ActionButton 
              className="save" 
              onClick={handleSave}
              disabled={loading || uploading}
            >
              {loading ? (
                <>
                  <LoadingSpinner /> 
                  <span style={{ marginLeft: '8px' }}>Saving...</span>
                </>
              ) : (
                '💾 Save Changes'
              )}
            </ActionButton>
            <ActionButton 
              className="cancel" 
              onClick={handleCancel}
              disabled={loading || uploading}
            >
              ❌ Cancel
            </ActionButton>
          </>
        )}
      </ProfileActions>

      <DefaultAvatars>
        <DefaultAvatarsTitle>
          {isEditing ? 'Choose Your Avatar' : 'Available Avatars'}
        </DefaultAvatarsTitle>
        <DefaultAvatarsGrid>
          {defaultAvatars.map((avatar, index) => (
            <DefaultAvatar
              key={index}
              gradient={avatar.gradient}
              selected={selectedAvatar?.emoji === avatar.emoji}
              onClick={isEditing ? () => handleDefaultAvatarSelect(avatar, index) : undefined}
              title={avatar.emoji}
            >
              {avatar.emoji}
            </DefaultAvatar>
          ))}
        </DefaultAvatarsGrid>
      </DefaultAvatars>
    </ProfileContainer>
  );
}

export default Profile;
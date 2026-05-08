import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Stack,
  TextField,
  Snackbar,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { fetchProfile as fetchProfileApi, updateProfile as updateProfileApi } from './services/api';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchProfileApi();
        if (!isMounted) return;

        const profile = data.user || data;
        setUser(profile);
        setFormData({
          fullName: profile.fullName || profile.name || '',
          email: profile.email || '',
          phoneNumber: profile.phoneNumber || profile.phone || '',
        });
      } catch (e) {
        if (!isMounted) return;
        setError(e.message || 'Failed to load profile');
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSave = async () => {
    setError('');
    setIsSaving(true);
    try {
      const response = await updateProfileApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
      });

      const updated = response.user || response;
      setUser(updated);
      localStorage.setItem('userName', updated.fullName || 'User');
      setFormData({
        fullName: updated.fullName || '',
        email: updated.email || '',
        phoneNumber: updated.phoneNumber || '',
      });
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
    } catch (e) {
      setError(e.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setFormData({
      fullName: user?.fullName || user?.name || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || user?.phone || '',
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Your Profile
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {!!error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && user && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.fullName || user.name || 'Unnamed User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.2}>
                  {isEditing ? (
                    <>
                      <TextField label="Full Name" value={formData.fullName} onChange={handleChange('fullName')} fullWidth size="small" />
                      <TextField label="Email" type="email" value={formData.email} onChange={handleChange('email')} fullWidth size="small" />
                      <TextField label="Phone Number" value={formData.phoneNumber} onChange={handleChange('phoneNumber')} fullWidth size="small" />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body1">{user.email || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body1">{user.phoneNumber || user.phone || '-'}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                  {isEditing ? (
                    <>
                      <Button variant="contained" disableElevation onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="outlined" color="inherit" onClick={handleCancel} disabled={isSaving}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" disableElevation onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={2500}
        onClose={() => setSuccessMessage('')}
        message={successMessage}
      />
    </Container>
  );
};

export default ProfilePage;

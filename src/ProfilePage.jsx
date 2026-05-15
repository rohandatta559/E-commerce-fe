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
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import { addAddress, changePassword, fetchProfile as fetchProfileApi, getAddresses, updateProfile as updateProfileApi } from './services/api';

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
  const [addresses, setAddresses] = useState([]);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });

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
        const addressData = await getAddresses();
        setAddresses(addressData.addresses || []);
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

  const handlePasswordChange = async () => {
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccessMessage('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '' });
    } catch (e) {
      setError(e.message || 'Failed to change password');
    }
  };

  const saveCurrentAddress = async () => {
    try {
      await addAddress({
        label: 'Profile',
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        line1: 'Address line',
        city: 'City',
        state: 'State',
        postalCode: '000000',
      });
      const addressData = await getAddresses();
      setAddresses(addressData.addresses || []);
      setSuccessMessage('Address saved');
    } catch (e) {
      setError(e.message || 'Failed to save address');
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper
          sx={{
            p: 4,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.9), rgba(236,72,153,0.9))',
            color: 'common.white',
            borderRadius: 4,
            mb: 2,
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Your Profile
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.92 }}>
            Manage your account details and preferences
          </Typography>
        </Paper>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress sx={{ color: 'primary.main' }} />
          </Box>
        )}

        {!!error && <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>}

        {!loading && !error && user && (
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 4,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(248,250,252,0.95))',
              border: '1px solid rgba(124,58,237,0.12)',
            }}
          >
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={4} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                  fontSize: '3rem',
                  boxShadow: '0 20px 40px rgba(124,58,237,0.3)',
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {user.fullName || user.name || 'Unnamed User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>

                <Divider sx={{ my: 3, borderColor: 'rgba(124,58,237,0.2)' }} />

                <Stack spacing={2}>
                  {isEditing ? (
                    <>
                      <TextField
                        label="Full Name"
                        value={formData.fullName}
                        onChange={handleChange('fullName')}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: 'primary.main' },
                          },
                        }}
                      />
                      <TextField
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange('email')}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: 'primary.main' },
                          },
                        }}
                      />
                      <TextField
                        label="Phone Number"
                        value={formData.phoneNumber}
                        onChange={handleChange('phoneNumber')}
                        fullWidth
                        size="small"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover fieldset': { borderColor: 'primary.main' },
                          },
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(124,58,237,0.08)' }}>
                        <EmailIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email || '-'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, borderRadius: 2, bgcolor: 'rgba(236,72,153,0.08)' }}>
                        <PhoneIcon sx={{ color: 'secondary.main' }} />
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.phoneNumber || user.phone || '-'}</Typography>
                      </Box>
                    </>
                  )}
                </Stack>

                <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={isSaving}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                          boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                        }}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleCancel}
                        disabled={isSaving}
                        sx={{
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          fontWeight: 700,
                          borderColor: 'rgba(124,58,237,0.3)',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => setIsEditing(true)}
                      sx={{
                        borderRadius: 3,
                        px: 4,
                        py: 1.5,
                        fontWeight: 700,
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                      }}
                    >
                      Edit Profile
                    </Button>
                  )}
                  <Button variant="outlined" onClick={saveCurrentAddress}>Save as Address</Button>
                </Box>

                <Divider sx={{ my: 3, borderColor: 'rgba(124,58,237,0.2)' }} />
                <Typography variant="h6" sx={{ mb: 1 }}>Change Password</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField label="Current Password" type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))} />
                  <TextField label="New Password" type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))} />
                  <Button variant="contained" onClick={handlePasswordChange}>Update</Button>
                </Stack>

                <Divider sx={{ my: 3, borderColor: 'rgba(124,58,237,0.2)' }} />
                <Typography variant="h6" sx={{ mb: 1 }}>Saved Addresses</Typography>
                <List dense>
                  {addresses.map((address) => (
                    <ListItem key={address._id}>
                      <ListItemText primary={`${address.label || 'Address'} - ${address.line1 || ''}`} secondary={`${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`} />
                    </ListItem>
                  ))}
                  {addresses.length === 0 && <Typography variant="body2" color="text.secondary">No saved addresses yet.</Typography>}
                </List>
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

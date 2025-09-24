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
} from '@mui/material';
import { Person as PersonIcon, Email as EmailIcon, Phone as PhoneIcon } from '@mui/icons-material';
import API from './axiosInstance';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await API.get('/auth/profile');
        setUser(data.user || data);
      } catch (e) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


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

        {!!error && (
          <Alert severity="error">{error}</Alert>
        )}

        {!loading && !error && user && (
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems={{ xs: 'center', sm: 'flex-start' }}>
              <Avatar sx={{ width: 96, height: 96, bgcolor: 'primary.main' }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {user.name || 'Unnamed User'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack spacing={1.2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmailIcon fontSize="small" color="action" />
                    <Typography variant="body1">{user.email || '—'}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body1">{user.phoneNumber || user.phone || '—'}</Typography>
                  </Box>
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', gap: 1.5 }}>
                  <Button variant="contained" disableElevation>
                    Edit Profile
                  </Button>
                  <Button variant="outlined" color="inherit">
                    Change Password
                  </Button>
                </Box>
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>
    </Container>
  );
};

export default ProfilePage;

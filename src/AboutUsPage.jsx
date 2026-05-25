import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';

const AboutUsPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          About Us
        </Typography>
        <Box sx={{ display: 'grid', gap: 1.5 }}>
          <Typography color="text.secondary">
            Welcome to Shoply. We are focused on making online shopping simple, reliable, and enjoyable.
          </Typography>
          <Typography color="text.secondary">
            Our mission is to bring quality products, fair prices, and fast service to every customer.
          </Typography>
          <Typography color="text.secondary">
            Thank you for being part of our journey.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default AboutUsPage;

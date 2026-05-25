import React, { useState } from 'react';
import { Box, Container, Paper, Typography, TextField, Button } from '@mui/material';

const ContactUsPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Contact Us
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Have questions or need help? Send us a message and our support team will get back to you soon.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2 }}>
          <TextField
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={4}
          />
          <Button type="submit" variant="contained" size="large">
            Send Message
          </Button>
        </Box>

        {submitted && (
          <Typography color="success.main" sx={{ mt: 3 }}>
            Thank you! Your message has been received. We will reply as soon as possible.
          </Typography>
        )}
      </Paper>
    </Container>
  );
};

export default ContactUsPage;

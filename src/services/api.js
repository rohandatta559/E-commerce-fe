// In api.js

// Add this at the top of the file
const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrfToken=`);
  if (parts.length === 2) {
    return parts.pop().split(';').shift();
  }
  return '';
};

// Update the loginUser function
export const loginUser = async (email, password) => {
  try {
    // First, get a fresh CSRF token
    await fetch(`${API_BASE_URL}/auth/csrf-token`, {
      method: 'GET',
      credentials: 'include', // Important for sending/receiving cookies
    });

    // Then make the login request with the CSRF token
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': getCsrfToken(),
      },
      credentials: 'include', // Important for sending cookies
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

const API_BASE_URL = '/api';

export const registerUser = async (name, email, password, phoneNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        'x-csrf-token': getCsrfToken(),
      },
      body: JSON.stringify({ name, email, password, phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

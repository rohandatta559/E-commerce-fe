export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const clearAuthSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:expired'));
  }
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(`Invalid response format: ${text.substring(0, 100)}`);
  }
  
  const data = await response.json();
  
  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Login error:', error);
    throw new Error(error.message || 'Failed to login. Please try again.');
  }
};

export const registerUser = async (name, email, password, phoneNumber) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() && { 'Authorization': `Bearer ${getAuthToken()}` }),
      },
      credentials: 'include',
      body: JSON.stringify({ fullName: name, email, password, phoneNumber }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }

    return await handleResponse(response);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    clearAuthSession();
  }
};

export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Auth API
export const fetchProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Fetch profile error:', error);
    throw error;
  }
};

// Product API
export const getProducts = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/products?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error('Get products error:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get product error:', error);
    throw error;
  }
};

// Wishlist API
export const getWishlist = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get wishlist error:', error);
    throw error;
  }
};

export const addToWishlist = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ productId })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Add to wishlist error:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    throw error;
  }
};

// Cart API
export const getCart = async () => {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
};

export const addToCart = async (productId, quantity = 1) => {
  const cart = await getCart();
  const existing = cart.find((item) => item._id === productId);
  const next = existing
    ? cart.map((item) => (item._id === productId ? { ...item, quantity: item.quantity + quantity } : item))
    : [...cart, { _id: productId, quantity }];
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
};

export const updateCartItem = async (productId, quantity) => {
  const cart = await getCart();
  const next = cart.map((item) => (item._id === productId ? { ...item, quantity } : item));
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
};

export const removeFromCart = async (productId) => {
  const cart = await getCart();
  const next = cart.filter((item) => item._id !== productId);
  localStorage.setItem('cart', JSON.stringify(next));
  return next;
};

// Order API
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify(orderData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : (data.orders || []);
  } catch (error) {
    console.error('Get orders error:', error);
    throw error;
  }
};

export const getOrdersWithQuery = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/orders?${query}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};

// Search API
export const searchProducts = async (query, filters = {}) => {
  try {
    const merged = { q: query, ...filters };
    const sanitized = Object.fromEntries(
      Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );
    const queryString = new URLSearchParams(sanitized).toString();
    const response = await fetch(`${API_BASE_URL}/search?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include'
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
};

// User Profile API
export const updateProfile = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      credentials: 'include',
      body: JSON.stringify({ currentPassword, newPassword })
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};

export const submitProductReview = async (productId, payload) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  return await handleResponse(response);
};

export const validateCoupon = async (code, subtotal) => {
  const response = await fetch(`${API_BASE_URL}/coupons/validate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include',
    body: JSON.stringify({ code, subtotal })
  });
  return await handleResponse(response);
};

export const getAddresses = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/addresses`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const addAddress = async (address) => {
  const response = await fetch(`${API_BASE_URL}/auth/addresses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include',
    body: JSON.stringify(address)
  });
  return await handleResponse(response);
};

export const updateAddress = async (addressId, address) => {
  const response = await fetch(`${API_BASE_URL}/auth/addresses/${addressId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include',
    body: JSON.stringify(address)
  });
  return await handleResponse(response);
};

export const deleteAddress = async (addressId) => {
  const response = await fetch(`${API_BASE_URL}/auth/addresses/${addressId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const getAdminAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const getAdminUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const getAdminOrders = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include'
  });
  return await handleResponse(response);
};

export const updateAdminOrderStatus = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAuthToken()}`
    },
    credentials: 'include',
    body: JSON.stringify({ status })
  });
  return await handleResponse(response);
};

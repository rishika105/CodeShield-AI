import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api/v1/auth'

const register = async (userData, navigate) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    if(!response.data.success) {
      throw new Error(response.data.message || 'Registration failed!');
    }
    navigate('/dashboard')
    toast.success('Registration successful!');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      toast.error(error.response.data.message || 'Registration failed!');
    } else {
      toast.error('An error occurred during registration!');
    }
  }
  return null;
};

const login = async (userData, navigate) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);
    if(!response.data.success) {
      throw new Error(response.data.message || 'Login failed!');
    }
    navigate('/dashboard')
    toast.success('Login successful!');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      toast.error(error.response.data.message || 'Login failed!');
    } else {
      toast.error('An error occurred during login!');
    }
  }
  return null;
};

const getMe = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if(!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch user data!');
    }
    // toast.success('User data fetched successfully!');
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      toast.error(error.response.data.message || 'Failed to fetch user data!');
    } else {
      toast.error('An error occurred while fetching user data!');
    }
  }
  return null;
};

export default {
  register,
  login,
  getMe
};
import axios from "axios";

const BASE_URL = import.meta.env.VITE_EXPRESS_SERVER_URL;
const API_URL = `${BASE_URL}/users`;

const getUserProfile = async (userId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/${userId}`, config);
  console.log(response.data);
  return response.data;
};

const getLeaderboard = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/leaderboard`, config);
  console.log(response.data);
  return response.data;
};

export default {
  getUserProfile,
  getLeaderboard,
};

// axiosInstanceNoAuth.ts
import axios from 'axios';

const API_URL = 'https://logivis.com/api/'; // Replace with your backend URL

const axiosInstanceNoAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstanceNoAuth;

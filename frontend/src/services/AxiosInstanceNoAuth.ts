// axiosInstanceNoAuth.ts
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api/'; // Replace with your backend URL

const axiosInstanceNoAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstanceNoAuth;

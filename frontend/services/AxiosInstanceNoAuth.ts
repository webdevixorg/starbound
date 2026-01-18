// axiosInstanceNoAuth.ts
import axios from 'axios';
import { NEXT_PUBLIC_API_URL } from '@/utils/env';

const API_URL = NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

const axiosInstanceNoAuth = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default axiosInstanceNoAuth;

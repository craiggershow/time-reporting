import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  headers: {
    'x-api-key': process.env.EXPO_PUBLIC_API_KEY
  }
}); 
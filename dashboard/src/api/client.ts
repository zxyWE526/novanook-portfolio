import axios from 'axios';

const client = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.response.use(
  (res) => res.data,
  (err) => {
    console.error('API Error:', err);
    return Promise.reject(err);
  }
);

export default client;

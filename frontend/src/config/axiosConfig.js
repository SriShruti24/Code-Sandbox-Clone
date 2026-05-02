import axios from 'axios';

const backendHost = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:3000`;

const axiosInstance = axios.create({
    baseURL: backendHost
});

export default axiosInstance;
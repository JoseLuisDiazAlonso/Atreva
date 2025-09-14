/**Vamos a configurar el axios con el token...es decir vamos a almacenar el token en localstorage y luego configurar el axios. */

import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

//Interceptor. Lo que hace es añadir el token a cada swolicitud
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://iron-log-wine.vercel.app';
console.log('API_URL configured as:', API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setToken = async (token: string) => {
    await SecureStore.setItemAsync('token', token);
};

export const getToken = async () => {
    return await SecureStore.getItemAsync('token');
};

// ... existing code ...
export const removeToken = async () => {
    await SecureStore.deleteItemAsync('token');
};

// Workout API
export const workoutApi = {
    start: async (type: string = 'strength', notes?: string) => {
        const response = await api.post('/api/workouts/start', { type, notes });
        return response.data;
    },
    addExercise: async (workoutId: string, name: string, target?: string) => {
        const response = await api.post(`/api/workouts/${workoutId}/exercises`, { name, target });
        return response.data;
    },
    addSet: async (workoutId: string, exerciseId: string, reps: number, weight: number) => {
        const response = await api.post(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets`, { reps, weight });
        return response.data;
    },
    finish: async (workoutId: string, notes?: string) => {
        const response = await api.post(`/api/workouts/${workoutId}/finish`, { notes });
        return response.data;
    },
    getHistory: async (limit: number = 10) => {
        const response = await api.get(`/api/workouts?limit=${limit}`);
        return response.data;
    },
    getById: async (workoutId: string) => {
        const response = await api.get(`/api/workouts/${workoutId}`);
        return response.data;
    }
};

export default api;

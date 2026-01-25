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

// Auth API
export const authApi = {
    getMe: async () => {
        const response = await api.get('/api/auth/me');
        return response.data;
    },
    updateProfile: async (data: any) => {
        const response = await api.put('/api/auth/profile', data);
        return response.data;
    },
    clearData: async () => {
        const response = await api.delete('/api/auth/data');
        return response.data;
    },
    deleteAccount: async () => {
        const response = await api.delete('/api/auth/me');
        return response.data;
    },
    seedWeights: async () => {
        const response = await api.post('/api/auth/seed-weights', {});
        return response.data;
    }
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
    getActive: async () => {
        const response = await api.get('/api/workouts/active');
        return response.data;
    },
    getById: async (workoutId: string) => {
        const response = await api.get(`/api/workouts/${workoutId}`);
        return response.data;
    },
    deleteWorkout: async (workoutId: string) => {
        const response = await api.delete(`/api/workouts/${workoutId}`);
        return response.data;
    },
    deleteExercise: async (workoutId: string, exerciseId: string) => {
        const response = await api.delete(`/api/workouts/${workoutId}/exercises/${exerciseId}`);
        return response.data;
    },
    deleteSet: async (workoutId: string, exerciseId: string, setId: string) => {
        const response = await api.delete(`/api/workouts/${workoutId}/exercises/${exerciseId}/sets/${setId}`);
        return response.data;
    }
};

export default api;

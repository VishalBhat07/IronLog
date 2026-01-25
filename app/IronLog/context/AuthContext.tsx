import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { setToken, getToken, removeToken } from '../services/api';

interface AuthContextType {
    user: any;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (name: string, email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Check for stored token on mount
    useEffect(() => {
        const loadUser = async () => {
             try {
                const token = await getToken();
                if (token) {
                    // Verify token and get user data
                    const res = await api.get('/api/auth/me');
                    setUser(res.data);
                }
            } catch (error) {
                console.log('Error loading user:', error);
                // Token invalid or expired
                await removeToken();
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const signIn = async (email: string, password: string) => {
        const res = await api.post('/api/auth/login', { email, password });
        const { token } = res.data;
        await setToken(token);
        
        // Fetch user details immediately
        const userRes = await api.get('/api/auth/me');
        setUser(userRes.data);
    };

    const signUp = async (name: string, email: string, password: string) => {
        const res = await api.post('/api/auth/register', { name, email, password });
        const { token } = res.data;
        await setToken(token);
        
        const userRes = await api.get('/api/auth/me');
        setUser(userRes.data);
    };

    const signOut = async () => {
        await removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

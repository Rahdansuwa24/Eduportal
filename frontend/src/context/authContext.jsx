import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentRole, setCurrentRole] = useState('admin');
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cek Token saat pertama kali aplikasi dimuat
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await apiFetch('/auth/me');
                    setUser(userData);
                    setCurrentRole(userData.role);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Token tidak valid:', err);
                    localStorage.removeItem('token');
                    setIsAuthenticated(false);
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    // Real API Login ke Backend Express
    const login = async (email, password) => {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        localStorage.setItem('token', data.token);
        setUser(data.user);
        setCurrentRole(data.user.role);
        setIsAuthenticated(true);
        return data;
    };

    // Quick Role Switcher (untuk Kemudahan Demo / Testing)
    const switchDemoRole = (role) => {
        setCurrentRole(role);
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm font-semibold">
                ⚡ Memuat Sesi Auth EduPortal Pro...
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated, currentRole, setCurrentRole, user, login, logout, switchDemoRole }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
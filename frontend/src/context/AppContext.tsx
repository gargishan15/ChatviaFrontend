'use client'
import React, { ReactNode, createContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export const user_service = 'http://3.27.83.126:5000';
export const chat_service = 'http://3.27.83.126:3000';

export interface user {
    _id: string;
    name: string;
    email: string;
}

export interface chat {
    _id: string;
    users: string[];
    latestMessage: {
        sender: string;
        text: string;
    };
    createdAt: string;
    updatedAt: string;
    unseenCount?: number;
}

export interface chats {
    _id: string;
    user: user;      // always flattened user
    chat: chat;
}

interface AppContextType {
    user: user | null;
    loading: boolean;
    isAuth: boolean;
    setUser: React.Dispatch<React.SetStateAction<user | null>>;
    setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
    logoutUser: () => Promise<void>;
    fetchUsers: () => Promise<void>;
    fetchChats: () => Promise<void>;
    chats: chats[] | null;
    users: user[] | null;
    setChats: React.Dispatch<React.SetStateAction<chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
    children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
    const [user, setUser] = React.useState<user | null>(null);
    const [isAuth, setIsAuth] = React.useState<boolean>(false);
    const [loading, setLoading] = React.useState<boolean>(true);

    // ----------------------- FETCH USER PROFILE -----------------------
    async function fetchUserData() {
        try {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const { data } = await axios.get(`${user_service}/api/v1/profile`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUser(data);
            setIsAuth(true);
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }

    // ----------------------- LOGOUT USER -----------------------
    async function logoutUser() {
        Cookies.remove('token');
        setUser(null);
        setIsAuth(false);
        toast.success('Logged out successfully');
    }

    // ----------------------- FETCH CHATS -----------------------
    const [chats, setChats] = useState<chats[] | null>(null);

    async function fetchChats() {
        const token = Cookies.get('token');

        try {
            const { data } = await axios.get(`${chat_service}/api/v1/chat/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // 🔥 FIX: Unwrap nested user.user
            const fixedChats = data.map((item: any) => ({
                ...item,
                user: item.user?.user || item.user, // ensure always user object
            }));

            setChats(fixedChats);

        } catch (error) {
            console.log("FETCHCHATS ERROR:", error);
        }
    }

    // ----------------------- FETCH USERS -----------------------
    const [users, setUsers] = useState<user[] | null>(null);

    async function fetchUsers() {
        const token = Cookies.get('token');

        try {
            const { data } = await axios.get(`${user_service}/api/v1/user/all`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setUsers(data);
        } catch (error) {
            console.log("FETCHUSERS ERROR:", error);
        }
    }

    // ----------------------- INITIAL LOAD -----------------------
    useEffect(() => {
        fetchUserData();
        fetchChats();
        fetchUsers();
    }, []);

    return (
        <AppContext.Provider value={{
            user,
            setUser,
            isAuth,
            setIsAuth,
            loading,
            logoutUser,
            fetchUsers,
            fetchChats,
            chats,
            setChats,
            users
        }}>
            {children}
            <Toaster />
        </AppContext.Provider>
    );
};

export const useAppData = (): AppContextType => {
    const context = React.useContext(AppContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppProvider');
    }
    return context;
};

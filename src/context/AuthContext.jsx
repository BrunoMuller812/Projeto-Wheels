import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(() => {
        const storedUsers = localStorage.getItem('appUsers');
        let initialUsers = storedUsers ? JSON.parse(storedUsers) : [];

        if (!initialUsers.some(u => u.username === ADMIN_CREDENTIALS.username)) {
            initialUsers.push(ADMIN_CREDENTIALS);
        }
        return initialUsers;
    });

    useEffect(() => {
        const usersToStore = users.filter(u => u.username !== ADMIN_CREDENTIALS.username);
        localStorage.setItem('appUsers', JSON.stringify(usersToStore));
    }, [users]);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            setUser(JSON.parse(loggedInUser));
        }
    }, []);

    const isAuthenticated = !!user; 

    const login = (username, password) => {
        const foundUser = users.find(u => u.username === username && u.password === password);

        if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('loggedInUser', JSON.stringify(foundUser));
            return foundUser; 
        }
        return false;
    };

    const register = (username, password, customerId = null) => { 
        const userExists = users.some(u => u.username === username);
        if (userExists) {
            return false;
        }

        const newUser = { username, password, role: 'user', customerId }; 
        setUsers(prevUsers => [...prevUsers, newUser]);
        return true;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('loggedInUser');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
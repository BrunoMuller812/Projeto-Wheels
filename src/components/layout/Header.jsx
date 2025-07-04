import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import layoutStyles from './layoutStyles';

function Header() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header style={headerStyles.header}>
            <div style={headerStyles.emptyLeftSpacer}></div>

            <div style={headerStyles.logoContainer}>
                <Link to={isAuthenticated ? "/home" : "/login"} style={headerStyles.logoLink}>
                    <img src="/wheelSVG.png" alt="Wheels Logo" style={headerStyles.logoImage} />
                    <span style={headerStyles.logoText}>WHEELS</span>
                </Link>
            </div>
            
            <nav style={headerStyles.nav}>
                <ul style={headerStyles.navList}>
                    {isAuthenticated && (
                        <li>
                            <button onClick={handleLogout} style={headerStyles.logoutButton}>
                                SAIR
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </header>
    );
}

const headerStyles = {
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: `${layoutStyles.paddingY} ${layoutStyles.paddingX}`,
        backgroundColor: layoutStyles.primaryColor,
        color: layoutStyles.textColor,
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.25)', 
        fontFamily: layoutStyles.fontFamily,
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    emptyLeftSpacer: {
        flex: 1,
    },
    logoContainer: {
        flex: 2,
        textAlign: 'center',
    },
    logoLink: {
        display: 'inline-flex',
        alignItems: 'center',
        textDecoration: 'none',
        color: layoutStyles.textColor,
    },
    logoImage: {
        height: '35px',
        marginRight: '10px',
    },
    logoText: {
        fontSize: '24px',
        fontWeight: 'bold',
    },
    nav: {
        flex: 1,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    navList: {
        listStyle: 'none',
        margin: 0,
        padding: 0,
        display: 'flex',
        gap: '25px', 
    },

    navLink: {
        color: layoutStyles.textColor,
        textDecoration: 'none',
        fontSize: '17px',
        fontWeight: '500',
        transition: 'color 0.3s ease',
    },
    logoutButton: {
        padding: '8px 18px',
        backgroundColor: '#296fcc', 
        color: layoutStyles.textColor, 
        border: '2px solid rgba(207, 227, 255, 0.41)',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '15px',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
    },
};

export default Header;
import React from 'react'; 
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';



function HomeAdmin() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); 
    };

    const handleManageBikes = () => {
        navigate('/admin/manage-bikes');
    };

    const handleSalesRegistration = () => {
        navigate('/admin/register-sales');
    };

    const handleSalesConsultation = () => {
        navigate('/admin/consult-sales');
    };

    const handleViewAvailableBikes = () => {
        navigate('/bikes'); 
    };

    return (
            <div style={adminStyles.container}>
                <div style={adminStyles.card}>
                    <h2 style={adminStyles.welcomeTitle}>Painel Administrativo</h2>
                    <p style={adminStyles.description}>Bem-vindo, <strong style={{ color: '#007bff' }}>{user?.username}</strong>! Gerencie a Wheels com eficiência.</p>

                    <div style={adminStyles.buttonGrid}>
                        <button onClick={handleSalesRegistration} style={adminStyles.adminButton}>
                            <i className="fas fa-cash-register" style={adminStyles.buttonIcon}></i>
                            Cadastro de Vendas
                        </button>
                        <button onClick={handleSalesConsultation} style={adminStyles.adminButton}>
                            <i className="fas fa-chart-line" style={adminStyles.buttonIcon}></i>
                            Consulta de Vendas
                        </button>
                        <button onClick={handleManageBikes} style={adminStyles.adminButton}>
                            <i className="fas fa-bicycle" style={adminStyles.buttonIcon}></i>
                            Gerenciar Bicicletas
                        </button>
                        <button onClick={handleViewAvailableBikes} style={adminStyles.adminButton}>
                            <i className="fas fa-eye" style={adminStyles.buttonIcon}></i>
                            Ver Bicicletas Disponíveis
                        </button>
                    </div>

                    <button onClick={handleLogout} style={adminStyles.logoutButton}>
                        <i className="fas fa-sign-out-alt" style={adminStyles.buttonIcon}></i> Sair do Painel
                    </button>
                </div>
            </div>
    );
}

const adminStyles = {
    container: {
        marginTop: '50px',
        marginBottom: '50px',
        padding: '40px 20px',
        textAlign: 'center',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 12px 25px rgba(0, 0, 0, 0.12)',
        padding: '50px 40px',
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: '3em',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '10px',
        textTransform: 'uppercase',
        letterSpacing: '1.5px',
    },
    description: {
        fontSize: '1.2em',
        color: '#666',
        marginBottom: '50px',
        lineHeight: '1.6',
        maxWidth: '600px',
    },
    buttonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '25px',
        width: '100%',
        marginBottom: '60px',
    },
    adminButton: {
        padding: '25px 20px',
        backgroundColor: '#4a90e2',
        color: '#fff',
        border: 'none',
        borderRadius: '12px',
        fontSize: '1.3em',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        textAlign: 'center',
        textTransform: 'uppercase',
        '&:hover': {
            backgroundColor: '#357abd',
            transform: 'translateY(-5px)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
        },
        '&:active': {
            transform: 'translateY(0)',
            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        },
    },
    buttonIcon: {
        fontSize: '2.2em',
        marginBottom: '5px',
    },
    logoutButton: {
        padding: '15px 30px',
        backgroundColor: '#e74c3c',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.1em',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        '&:hover': {
            backgroundColor: '#c0392b',
            transform: 'translateY(-2px)',
        },
    },
};

export default HomeAdmin;
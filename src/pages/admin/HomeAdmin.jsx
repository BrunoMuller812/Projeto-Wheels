import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import MainLayout from '../../components/layout/MainLayout';

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
        <MainLayout>
            <div style={adminStyles.container}>
                <h2 style={adminStyles.welcomeTitle}>Bem-vindo, {user?.username} (Admin)!</h2>
                <p style={adminStyles.description}>Aqui você tem acesso às ferramentas de gerenciamento do sistema.</p>

                <div style={adminStyles.buttonGrid}>
                    <button onClick={handleSalesRegistration} style={adminStyles.adminButton}>Cadastro de Vendas</button>
                    <button onClick={handleSalesConsultation} style={adminStyles.adminButton}>Consulta de Vendas</button>
                    <button onClick={handleManageBikes} style={adminStyles.adminButton}>Gerenciar Bicicletas</button>
                    <button onClick={handleViewAvailableBikes} style={adminStyles.adminButton}>Ver Todas as Bicicletas</button>
                </div>

                <button onClick={handleLogout} style={adminStyles.logoutButton}>Sair</button>
            </div>
        </MainLayout>
    );
}

const adminStyles = {
    container: {
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    welcomeTitle: {
        fontSize: '2.5em',
        color: '#2c3e50',
        marginBottom: '15px',
    },
    description: {
        fontSize: '1.1em',
        color: '#555',
        marginBottom: '40px',
    },
    buttonGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '800px',
        marginBottom: '50px',
    },
    adminButton: {
        padding: '20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '10px',
        fontSize: '1.2em',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        '&:hover': {
            backgroundColor: '#0056b3',
            transform: 'translateY(-3px)',
        },
    },
    logoutButton: {
        padding: '12px 25px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: '600',
        transition: 'background-color 0.3s ease',
        marginTop: '30px',
    },
};

export default HomeAdmin;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth(); 

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!username || !password) {
            setError('Preencha todos os campos.');
            setLoading(false);
            return;
        }

        await new Promise(resolve => setTimeout(resolve, 500)); 

        const loggedInUser = login(username, password); 
        
        if (loggedInUser) { 
            if (loggedInUser.role === 'admin') { 
                navigate('/admin/home'); 
            } else {
                navigate('/home'); 
            }
        } else {
            setError('Credenciais inválidas. Verifique seu usuário e senha.');
        }
        setLoading(false);
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Bem-vindo ao Wheels!</h2>
                <p style={styles.subtitle}>Acesse sua conta para continuar.</p>
                <form onSubmit={handleLogin} style={styles.form}>
                    {loading && <p style={styles.message}>Verificando credenciais...</p>}
                    {error && <p style={styles.error}>{error}</p>}
                    
                    <div style={styles.inputGroup}>
                        <label htmlFor="username" style={styles.label}>Usuário</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                            placeholder="Seu nome de usuário"
                            required
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            placeholder="Sua senha"
                            required
                        />
                    </div>
                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        style={styles.secondaryButton}
                        disabled={loading}
                    >
                        Criar uma conta
                    </button>
                </form>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #2c7be5, #5e72e4)',
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        padding: '20px',
        boxSizing: 'border-box',
    },

    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        padding: '40px 35px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '25px',
        animation: 'fadeIn 0.8s ease-out',

        '@keyframes fadeIn': {
            'from': { opacity: 0, transform: 'translateY(-20px)' },
            'to': { opacity: 1, transform: 'translateY(0)' },
        },
    },

    title: {
        fontSize: '32px',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '-30px',
    },

    subtitle: {
        fontSize: '16px',
        color: '#7f8c8d',
        marginBottom: '20px',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },

    inputGroup: {
        textAlign: 'left',
    },

    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#34495e',
        marginBottom: '0px',
    },

    input: {
        width: 'calc(100% - 24px)',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid #dcdfe6',
        fontSize: '16px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        '&:hover': { borderColor: '#a7d9ff' },
        '&:focus': { borderColor: '#007bff', boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)', outline: 'none' },
    },

    button: {
        padding: '14px 20px',
        backgroundColor: '#007bff',
        color: '#ffffff',
        fontSize: '18px',
        fontWeight: '600',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginTop: '10px',
        '&:hover': { backgroundColor: '#0056b3', transform: 'translateY(-2px)' },
        '&:active': { transform: 'translateY(0)' },
    },

    secondaryButton: {
        padding: '14px 20px',
        backgroundColor: '#6c757d',
        color: '#ffffff',
        fontSize: '16px',
        fontWeight: '500',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginTop: '-10px',
        '&:hover': { backgroundColor: '#5a6268', transform: 'translateY(-2px)' },
        '&:active': { transform: 'translateY(0)' },
    },

    error: {
        color: '#e74c3c',
        backgroundColor: '#fdeded',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '20px',
        fontSize: '14px',
        border: '1px solid #e74c3c',
        fontWeight: '500',
    },

}; 

export default Login;
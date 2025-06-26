import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cpf, setCpf] = useState('');
    const [nomeCompleto, setNomeCompleto] = useState('');
    const [genero, setGenero] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [email, setEmail] = useState('');
    const [celular, setCelular] = useState('');
    const [cidade, setCidade] = useState('');
    const [pais, setPais] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { register } = useAuth();

    const formatCpf = (value) => {
        const cleaned = value.replace(/\D/g, '');
        let formatted = cleaned;
        if (cleaned.length > 3) {
            formatted = cleaned.substring(0, 3) + '.' + cleaned.substring(3);
        }
        if (cleaned.length > 6) {
            formatted = formatted.substring(0, 7) + '.' + cleaned.substring(6);
        }
        if (cleaned.length > 9) {
            formatted = formatted.substring(0, 11) + '-' + cleaned.substring(9);
        }
        return formatted.substring(0, 14);
    };

    const formatCelular = (value) => {
        const cleaned = value.replace(/\D/g, '');
        let formatted = '';

        if (cleaned.length > 0) {
            formatted = '(' + cleaned.substring(0, 2);
        }
        if (cleaned.length > 2) {
            formatted += ') ' + cleaned.substring(2, 7);
        }
        if (cleaned.length > 7) {
            formatted += '-' + cleaned.substring(7, 11);
        }
        
        if (cleaned.length <= 10 && cleaned.length > 6) {
             formatted = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2, 6) + '-' + cleaned.substring(6, 10);
        } else if (cleaned.length > 10) {
            formatted = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2, 7) + '-' + cleaned.substring(7, 11);
        } else if (cleaned.length > 2 && cleaned.length <= 6) {
            formatted = '(' + cleaned.substring(0, 2) + ') ' + cleaned.substring(2);
        } else if (cleaned.length > 0 && cleaned.length <= 2) {
             formatted = '(' + cleaned;
        }

        return formatted.substring(0, 15);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const cleanedCpf = cpf.replace(/\D/g, '');
        const cleanedCelular = celular.replace(/\D/g, '');

        if (!username || !password || !nomeCompleto || !genero || !dataNascimento || !email || !cidade || !pais || !cleanedCpf || !cleanedCelular) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            setLoading(false);
            return;
        }

        if (cleanedCpf.length !== 11) {
            setError('CPF inválido. Por favor, insira 11 dígitos numéricos.');
            setLoading(false);
            return;
        }
        if (cleanedCelular.length < 10 || cleanedCelular.length > 11) {
             setError('Celular inválido. Por favor, insira um número válido com DDD (10 ou 11 dígitos, apenas números).');
             setLoading(false);
             return;
        }

        try {
            const customerData = {
                cpf: cleanedCpf,
                nomeCompleto,
                genero,
                dataNascimento,
                email,
                celular: cleanedCelular,
                cidade,
                pais,
                primeiraCompra: new Date().toISOString().split('T')[0],
                ultimaCompra: new Date().toISOString().split('T')[0]
            };

            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(customerData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao cadastrar cliente: status ${response.status}`);
            }

            const newCustomer = await response.json();
            console.log('Cliente cadastrado na API:', newCustomer);

            const localRegistrationSuccess = register(username, password, newCustomer.customerID); 

            if (localRegistrationSuccess) {
                setSuccess('Cadastro de cliente e conta de usuário realizados com sucesso! Redirecionando para o login...');
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                setError('Erro: Cliente cadastrado na API, mas o nome de usuário já existe. Tente logar ou use outro nome de usuário.');
            }

        } catch (err) {
            console.error("Erro no cadastro:", err);
            setError(`Falha no cadastro: ${err.message || 'Erro de rede ou servidor.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Crie sua conta</h2>
                <p style={styles.subtitle}>Ache a bike perfeita!</p>
                <form onSubmit={handleRegister} style={styles.form}>
                    {loading && <p style={styles.message}>Cadastrando cliente...</p>}
                    {error && <p style={styles.error}>{error}</p>}
                    {success && <p style={styles.success}>{success}</p>}

                    <div style={styles.sectionHeader}>Dados de Login</div>
                    <div style={styles.formSection}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="regUsername" style={styles.label}>Nome de Usuário</label>
                            <input
                                id="regUsername"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                                placeholder="Seu nome de usuário"
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="regPassword" style={styles.label}>Senha</label>
                            <input
                                id="regPassword"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                                placeholder="Sua senha"
                                required
                            />
                        </div>
                    </div>

                    <div style={styles.sectionHeader}>Informações Pessoais</div>
                    <div style={styles.formSectionGrid}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="nomeCompleto" style={styles.label}>Nome Completo</label>
                            <input type="text" id="nomeCompleto" value={nomeCompleto} onChange={(e) => setNomeCompleto(e.target.value)} style={styles.input} placeholder="Nome e sobrenome" required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="cpf" style={styles.label}>CPF</label>
                            <input
                                type="text"
                                id="cpf"
                                value={cpf}
                                onChange={(e) => setCpf(formatCpf(e.target.value))}
                                style={styles.input}
                                placeholder="000.000.000-00"
                                maxLength="14"
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="genero" style={styles.label}>Gênero</label>
                            <select id="genero" value={genero} onChange={(e) => setGenero(e.target.value)} style={styles.input} required>
                                <option value="">Selecione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="dataNascimento" style={styles.label}>Data de Nascimento</label>
                            <input type="date" id="dataNascimento" value={dataNascimento} onChange={(e) => setDataNascimento(e.target.value)} style={styles.input} required />
                        </div>
                    </div>

                    <div style={styles.sectionHeader}>Contato e Localização</div>
                    <div style={styles.formSectionGrid}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="email" style={styles.label}>Email</label>
                            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} placeholder="seu.email@example.com" required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="celular" style={styles.label}>Celular</label>
                            <input
                                type="tel"
                                id="celular"
                                value={celular}
                                onChange={(e) => setCelular(formatCelular(e.target.value))}
                                style={styles.input}
                                placeholder="(XX) XXXXX-XXXX"
                                maxLength="15"
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="cidade" style={styles.label}>Cidade</label>
                            <input type="text" id="cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} style={styles.input} placeholder="Sua cidade" required />
                        </div>
                        <div style={styles.inputGroup}>
                            <label htmlFor="pais" style={styles.label}>País</label>
                            <input type="text" id="pais" value={pais} onChange={(e) => setPais(e.target.value)} style={styles.input} placeholder="Seu país" required />
                        </div>
                    </div>

                    <button type="submit" style={styles.button} disabled={loading}>
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        style={styles.secondaryButton}
                        disabled={loading}
                    >
                        Voltar para o Login
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
        marginTop: "50px",
        marginBottom: "50px",
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        padding: '40px 35px',
        width: '100%',
        maxWidth: '800px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        animation: 'fadeIn 0.8s ease-out',
        '@keyframes fadeIn': {
            'from': { opacity: 0, transform: 'translateY(-20px)' },
            'to': { opacity: 1, transform: 'translateY(0)' },
        },
    },
    title: {
        textTransform: "uppercase",
        fontSize: '40px',
        fontWeight: '700',
        color: '#2c3e50',
        marginTop: "0px",
        marginBottom: '-30px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#7f8c8d',
        marginBottom: '30px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionHeader: {
        fontSize: '1.4em',
        fontWeight: '600',
        color: '#2c3e50',
        borderBottom: '1px solid #eee',
        paddingBottom: '8px',
        marginBottom: '15px',
        textAlign: 'left',
        marginTop: '10px',
    },
    formSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
    },
    formSectionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px 20px',
        width: '100%',
    },
    inputGroup: {
        textAlign: 'left',
    },
    label: {
        display: 'block',
        fontSize: '14px',
        fontWeight: '500',
        color: '#34495e',
        marginBottom: '5px',
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
        marginTop: '30px',
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
        marginTop: '10px',
        '&:hover': { backgroundColor: '#5a6268', transform: 'translateY(-2px)' },
        '&:active': 'translateY(0)' },
    error: {
        color: '#e74c3c',
        backgroundColor: '#fdeded',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '14px',
        border: '1px solid #e74c3c',
        fontWeight: '500',
    },
    success: {
        color: '#28a745',
        backgroundColor: '#e6ffed',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '14px',
        border: '1px solid #28a745',
        fontWeight: '500',
    },
    message: {
        color: '#007bff',
        backgroundColor: '#e0f7fa',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '15px',
        fontSize: '14px',
        border: '1px solid #007bff',
        fontWeight: '500',
    }
};

export default Register;
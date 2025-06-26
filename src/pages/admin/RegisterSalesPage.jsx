import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showSuccess, showError } from '../../utils/notifications'; 

function isValidCPF(cpf) {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/[^\d]/g, ''); 
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false; 

    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
    return true;
}

const formatCpf = (value) => {
    const cleaned = value.replace(/\D/g, '');
    let formatted = '';

    if (cleaned.length <= 3) {
        formatted = cleaned;
    } else if (cleaned.length <= 6) {
        formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3)}`;
    } else if (cleaned.length <= 9) {
        formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6)}`;
    } else { 
        formatted = `${cleaned.substring(0, 3)}.${cleaned.substring(3, 6)}.${cleaned.substring(6, 9)}-${cleaned.substring(9, 11)}`;
    }
    return formatted.substring(0, 14); 
};

const formatCelular = (value) => {
    const cleaned = value.replace(/\D/g, ''); 
    let formatted = '';

    if (cleaned.length <= 2) { 
        formatted = `(${cleaned}`;
    } else if (cleaned.length <= 7) { 
        formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2)}`;
    } else if (cleaned.length <= 10) { 
        formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6, 10)}`;
    } else { 
        formatted = `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7, 11)}`;
    }
    return formatted.substring(0, 15); 
};

function RegisterSalesPage() {
    const navigate = useNavigate();
    const [flowStep, setFlowStep] = useState('choice'); 

    const handleCustomerSelectedOrCreated = (customer) => {
        navigate('/bikes', { 
            state: { 
                customerIdFromAdmin: customer.customerID, 
                customerNameFromAdmin: customer.nomeCompleto 
            } 
        });
    };
    
    const renderCurrentStep = () => {
        switch (flowStep) {
            case 'existing_customer':
                return <ExistingCustomerDropdown onCustomerFound={handleCustomerSelectedOrCreated} />;
            case 'new_customer':
                return <NewCustomerForm onCustomerCreated={handleCustomerSelectedOrCreated} />;
            case 'choice':
            default:
                return (
                    <div style={pageStyles.choiceContainer}>
                        <button style={pageStyles.choiceButton} onClick={() => setFlowStep('existing_customer')}>
                            CLIENTE CADASTRADO
                        </button>
                        <button style={pageStyles.choiceButton} onClick={() => setFlowStep('new_customer')}>
                            CADASTRAR NOVO CLIENTE
                        </button>
                    </div>
                );
        }
    };

    return (
        <div style={pageStyles.container}>
            <h1 style={pageStyles.title}>Registrar Novo Aluguel</h1>
            <p style={pageStyles.description}>Siga os passos para registrar um novo aluguel no sistema.</p>
            {renderCurrentStep()}
        </div>
    );
}

const ExistingCustomerDropdown = ({ onCustomerFound }) => {
    const [customers, setCustomers] = useState([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const response = await fetch(`https://wheels-api-r0ea.onrender.com/api/customers`);
                if (!response.ok) throw new Error('Não foi possível carregar a lista de clientes.');
                const data = await response.json();
                setCustomers(data);
            } catch (err) {
                showError("Erro ao Carregar", err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchCustomers();
    }, []);

    const handleSelectCustomer = (e) => {
        const customerId = e.target.value;
        setSelectedCustomerId(customerId);
        const found = customers.find(c => c.customerID.toString() === customerId);
        onCustomerFound(found || null); 
    };

    const selectedCustomer = customers.find(c => c.customerID.toString() === selectedCustomerId);

    if (loading) return <LoadingSpinner />; 
    return (
        <div style={formStyles.formContainer}>
            <h2 style={pageStyles.subtitle}>Selecione um Cliente</h2>
            <select value={selectedCustomerId} onChange={handleSelectCustomer} style={{...formStyles.input, marginBottom: '20px'}}>
                <option value="">Escolha um cliente</option>
                {customers.map(customer => (
                    <option key={customer.customerID} value={customer.customerID}>
                        {customer.nomeCompleto} (CPF: {customer.cpf})
                    </option>
                ))}
            </select>
            {selectedCustomer && (
                <div style={formStyles.customerDetails}>
                    <h3>Cliente Selecionado:</h3>
                    <p><strong>Nome:</strong> {selectedCustomer.nomeCompleto}</p>
                    <p><strong>CPF:</strong> {selectedCustomer.cpf}</p>
                    <p><strong>Email:</strong> {selectedCustomer.email}</p>
                    <button onClick={() => onCustomerFound(selectedCustomer)} style={formStyles.button}>
                        Prosseguir para Escolha da Bike
                    </button>
                </div>
            )}
            {!selectedCustomer && selectedCustomerId && <p style={{color: 'red', marginTop: '10px'}}>Cliente não encontrado. Selecione um cliente válido.</p>}
        </div>
    );
};

const NewCustomerForm = ({ onCustomerCreated }) => {
    const [formData, setFormData] = useState({
        nomeCompleto: '', cpf: '', genero: '', dataNascimento: '', email: '', celular: '', cidade: '', password: '', 
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'cpf') {
            setFormData(prev => ({ ...prev, [name]: formatCpf(value) })); 
        } else if (name === 'celular') {
            setFormData(prev => ({ ...prev, [name]: formatCelular(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const cleanedCpf = formData.cpf.replace(/\D/g, ''); 
        const cleanedCelular = formData.celular.replace(/\D/g, ''); 

        console.log("handleSubmit - formData:", formData);
        console.log("handleSubmit - cleanedCpf:", cleanedCpf, "length:", cleanedCpf.length);
        console.log("handleSubmit - cleanedCelular:", cleanedCelular, "length:", cleanedCelular.length);

        if (!formData.nomeCompleto || !cleanedCpf || !formData.genero || !formData.dataNascimento || !formData.email || !cleanedCelular || !formData.cidade || !formData.password) {
            showError('Campos Faltando', 'Por favor, preencha todos os campos obrigatórios.');
            setLoading(false); 
            return;
        }

        if (cleanedCelular.length < 10 || cleanedCelular.length > 11) {
            showError('Celular Inválido', 'Por favor, insira um número de celular válido com DDD (10 ou 11 dígitos numéricos).');
            setLoading(false);
            return;
        }


        setLoading(true); 
        try {
            const payload = {
                ...formData,
                cpf: cleanedCpf, 
                celular: cleanedCelular,
                pais: formData.pais || "Brasil", 
                primeiraCompra: new Date().toISOString().split('T')[0], 
                ultimaCompra: new Date().toISOString().split('T')[0], 
            };
            delete payload.password; 

            console.log("Payload enviado para API de clientes:", payload);

            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = "Erro desconhecido ao cadastrar cliente.";
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (jsonError) { /* ignore */ }
                throw new Error(errorMessage);
            }
            const newCustomer = await response.json();
            showSuccess('Sucesso!', 'Novo cliente cadastrado!');
            onCustomerCreated(newCustomer); 
        } catch (err) {
            showError('Erro no Cadastro', err.message);
        } finally {
            setLoading(false); 
        }
    };

    return (
        <div style={formStyles.formContainer}>
            <h2 style={pageStyles.subtitle}>Cadastrar Novo Cliente</h2>
            <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                <h3 style={formStyles.sectionTitle}>Dados Pessoais</h3>
                <input name="nomeCompleto" value={formData.nomeCompleto} onChange={handleChange} placeholder="Nome Completo" required style={formStyles.input} />
                <input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" required style={formStyles.input} maxLength="14" />
                <select name="genero" value={formData.genero} onChange={handleChange} required style={formStyles.input}>
                    <option value="">Selecione o Gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                </select>
                <input name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} required style={formStyles.input} />
                <input name="celular" value={formData.celular} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" required style={formStyles.input} maxLength="15" />
                
                <h3 style={formStyles.sectionTitle}>Dados de Contato/Login (Para autenticação interna)</h3>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required style={formStyles.input} />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Senha de Login" required style={formStyles.input} />
                
                <h3 style={formStyles.sectionTitle}>Localização</h3>
                <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" required style={formStyles.input} />
                <input name="pais" value={formData.pais} onChange={handleChange} placeholder="País" required style={formStyles.input} />

                <button type="submit" disabled={loading} style={formStyles.button}>
                    {loading ? 'Salvando...' : 'Salvar Cliente e Prosseguir'}
                </button>
            </form>
        </div>
    );
};

const pageStyles = {
    container: {
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        textTransform: 'uppercase',
        fontSize: '2.5em',
        color: '#2c3e50',
        marginBottom: '15px',
    },
    subtitle: {
        fontSize: '1.8em',
        color: '#34495e',
        marginBottom: '25px',
    },
    description: {
        fontSize: '1.1em',
        color: '#555',
        marginBottom: '40px',
    },
    choiceContainer: {
        display: 'flex',
        gap: '20px',
        marginTop: '30px',
    },
    choiceButton: {
        borderRadius: '10px',
        padding: '20px 40px',
        fontSize: '1.2em',
        cursor: 'pointer',
    }
};

const formStyles = {
    formContainer: {
        width: '100%',
        maxWidth: '500px',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
    },
    sectionTitle: {
        fontSize: '1.2em',
        color: '#2c3e50',
        textAlign: 'left',
        borderBottom: '2px solid #ddd',
        paddingBottom: '5px',
        marginBottom: '15px',
        marginTop: '10px',
    },
    input: {
        width: 'calc(100% - 22px)',
        padding: '10px',
        fontSize: '1em',
        borderRadius: '4px',
        border: '1px solid #ccc',
    },
    button: {
        width: '100%',
        padding: '12px',
        fontSize: '1.1em',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer',
        marginTop: '10px',
    },
    customerDetails: {
        marginTop: '20px',
        textAlign: 'left',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '5px',
    }
};

export default RegisterSalesPage;
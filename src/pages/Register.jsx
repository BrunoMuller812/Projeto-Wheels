import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showSuccess, showError } from '../../utils/notifications';

// Função de validação de CPF (sem alterações)
function isValidCPF(cpf) {
    if (typeof cpf !== 'string') return false;
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;
    let sum = 0, remainder;
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

// --- COMPONENTE PRINCIPAL DA PÁGINA (sem alterações) ---
function RegisterSalesPage() {
    const navigate = useNavigate();
    const [flowStep, setFlowStep] = useState('choice');
    const [currentCustomer, setCurrentCustomer] = useState(null);
    
    const renderCurrentStep = () => {
        switch (flowStep) {
            case 'existing_customer':
                return <ExistingCustomerDropdown onCustomerFound={setCurrentCustomer} onProceed={() => setFlowStep('bike_selection')} />;
            case 'new_customer':
                return <NewCustomerForm onCustomerCreated={setCurrentCustomer} onProceed={() => setFlowStep('bike_selection')} />;
            case 'bike_selection':
                return <BikeSelection customer={currentCustomer} />;
            case 'choice':
            default:
                return (
                    <div style={pageStyles.choiceContainer}>
                        <button style={pageStyles.choiceButton} onClick={() => setFlowStep('existing_customer')}>
                            Alugar para Cliente Existente
                        </button>
                        <button style={pageStyles.choiceButton} onClick={() => setFlowStep('new_customer')}>
                            Cadastrar Novo Cliente e Alugar
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

// --- SUB-COMPONENTE DE BUSCA (sem alterações) ---
const ExistingCustomerDropdown = ({ onCustomerFound, onProceed }) => {
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

    if (loading) return <p>Carregando lista de clientes...</p>;

    return (
        <div style={formStyles.formContainer}>
            <h2 style={pageStyles.subtitle}>Selecionar Cliente Existente</h2>
            <select value={selectedCustomerId} onChange={handleSelectCustomer} style={{...formStyles.input, marginBottom: '20px'}}>
                <option value="">-- Escolha um cliente --</option>
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
                    <p><strong>Email:</strong> {selectedCustomer.user.email}</p>
                    <button onClick={onProceed} style={formStyles.button}>
                        Prosseguir para Escolha da Bike
                    </button>
                </div>
            )}
        </div>
    );
};


// --- SUB-COMPONENTE DE CADASTRO (COM A CORREÇÃO FINAL NO PAYLOAD) ---
const NewCustomerForm = ({ onCustomerCreated, onProceed }) => {
    const [formData, setFormData] = useState({
        nomeCompleto: '',
        cpf: '',
        genero: '',
        dataNascimento: '',
        email: '',
        celular: '',
        cidade: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isValidCPF(formData.cpf)) {
            showError('CPF Inválido', 'O número de CPF digitado não parece ser válido. Por favor, verifique.');
            return;
        }
        setLoading(true);
        try {
            // ** AQUI ESTÁ A CORREÇÃO FINAL **
            // Criamos um novo objeto 'payload' com os dados do formulário
            // e adicionamos os campos que a API espera.
            const payload = {
                ...formData,
                pais: "Brasil", // Valor fixo, já que não temos o campo
                primeiraCompra: new Date().toISOString().split('T')[0],
                ultimaCompra: new Date().toISOString().split('T')[0],
                qntdAlugueis: 0,
                totalGasto: 0.0
            };

            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Enviamos o 'payload' completo em vez de apenas o 'formData'
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorMessage = errorText;
                try {
                    const errorJson = JSON.parse(errorText);
                    errorMessage = errorJson.message || errorJson.error || errorMessage;
                } catch (jsonError) {}
                throw new Error(errorMessage);
            }

            const newCustomer = await response.json();
            showSuccess('Sucesso!', 'Novo cliente cadastrado!');
            onCustomerCreated(newCustomer);
            onProceed();
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
                <input name="cpf" value={formData.cpf} onChange={handleChange} placeholder="CPF (somente números)" required style={formStyles.input} />
                <select name="genero" value={formData.genero} onChange={handleChange} required style={formStyles.input}>
                    <option value="">Selecione o Gênero</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Outro">Outro</option>
                </select>
                <input name="dataNascimento" type="date" value={formData.dataNascimento} onChange={handleChange} placeholder="Data de Nascimento" required style={formStyles.input} />
                <input name="celular" value={formData.celular} onChange={handleChange} placeholder="Celular" required style={formStyles.input} />
                
                <h3 style={formStyles.sectionTitle}>Localização</h3>
                <input name="cidade" value={formData.cidade} onChange={handleChange} placeholder="Cidade" required style={formStyles.input} />

                <h3 style={formStyles.sectionTitle}>Dados de Acesso</h3>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email de Login" required style={formStyles.input} />
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Senha" required style={formStyles.input} />
                
                <button type="submit" disabled={loading} style={formStyles.button}>
                    {loading ? 'Salvando...' : 'Salvar e Continuar'}
                </button>
            </form>
        </div>
    );
};


// --- SUB-COMPONENTE DE SELEÇÃO DE BIKE (sem alterações) ---
const BikeSelection = ({ customer }) => {
    const navigate = useNavigate();
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBikes = async () => {
            setLoading(true);
            try {
                const response = await fetch('https://wheels-api-r0ea.onrender.com/api/bikes?disponivel=true');
                if (!response.ok) throw new Error('Falha ao carregar bicicletas.');
                const data = await response.json();
                setBikes(data);
            } catch (err) {
                showError('Erro', err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBikes();
    }, []);

    const handleSelectBike = (bike) => {
        const rentalData = {
            customerId: customer.customerID,
            bikeId: bike.bikeID,
            expectedReturn: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
            observations: 'Aluguel via painel de admin'
        };

        showSuccess('Aluguel Iniciado!', `Bicicleta ${bike.modelo} alugada para ${customer.nomeCompleto}.`);
        console.log("Dados do Aluguel:", rentalData);
        navigate('/admin/home');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div style={{width: '100%'}}>
            <h2 style={pageStyles.subtitle}>Selecione uma Bicicleta para {customer.nomeCompleto}</h2>
            <div style={bikeListStyles.gridContainer}>
                {bikes.map((bike) => (
                    <div key={bike.bikeID} style={bikeListStyles.bikeItem}>
                         <h3 style={bikeListStyles.bikeModel}>{bike.modelo}</h3>
                         <p>ID: {bike.bikeID}</p>
                         <p>Valor/Hora: R$ {bike.valorHora.toFixed(2)}</p>
                         <button onClick={() => handleSelectBike(bike)} style={formStyles.button}>
                             Alugar Esta
                         </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- ESTILOS ---
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

const bikeListStyles = {
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        width: '100%',
    },
    bikeItem: {
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '15px',
        backgroundColor: 'white',
        textAlign: 'left',
    },
    bikeModel: {
        margin: 0,
        color: '#2c3e50'
    }
};


export default RegisterSalesPage;
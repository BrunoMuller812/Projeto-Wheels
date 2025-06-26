import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

function AvailableBikes() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [showRentalModal, setShowRentalModal] = useState(false);
    const [selectedBikeForRental, setSelectedBikeForRental] = useState(null);
    const [expectedReturnDateOnly, setExpectedReturnDateOnly] = useState('');
    const [expectedReturnTimeOnly, setExpectedReturnTimeOnly] = useState('');
    const [rentalObservations, setRentalObservations] = useState('');
    const [modalError, setModalError] = useState('');

    const fetchBikes = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Buscando bicicletas... A primeira requisição pode demorar um minuto.");
            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/bikes');

            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }

            const data = await response.json();
            setBikes(data);
        } catch (err) {
            console.error("Falha ao buscar bicicletas:", err);
            setError("Não foi possível carregar as bicicletas. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBikes();
    }, []);

    const filteredBikes = useMemo(() => {
        if (!searchTerm) {
            return bikes;
        }

        const lowercasedSearchTerm = searchTerm.toLowerCase();

        return bikes.filter(bike => {
            const matchesId = !isNaN(lowercasedSearchTerm) && bike.bikeID.toString().includes(lowercasedSearchTerm);
            const matchesModel = bike.modelo.toLowerCase().includes(lowercasedSearchTerm);

            return matchesId || matchesModel;
        });
    }, [bikes, searchTerm]);

    const openRentalModal = (bike) => {
        setSelectedBikeForRental(bike);
        setExpectedReturnDateOnly(''); 
        setExpectedReturnTimeOnly('');
        setRentalObservations('');
        setModalError('');
        setShowRentalModal(true);
    };

    const closeRentalModal = () => {
        setShowRentalModal(false);
        setSelectedBikeForRental(null);
        setModalError('');
    };

    const handleProceedToPayment = (e) => {
        e.preventDefault();
        setModalError('');

        const combinedExpectedReturnDate = `${expectedReturnDateOnly}T${expectedReturnTimeOnly}`;

        if (!expectedReturnDateOnly || !expectedReturnTimeOnly) {
            setModalError('Por favor, selecione a data E a hora de retorno esperada.');
            return;
        }

        const now = new Date();
        const returnDateTime = new Date(combinedExpectedReturnDate);

        if (isNaN(returnDateTime.getTime())) { 
            setModalError('Data ou hora de retorno inválida. Por favor, verifique.');
            return;
        }
        
        const minReturnTime = new Date(now.getTime() + (10 * 60 * 1000)); 

        if (returnDateTime < minReturnTime) {
            setModalError('A data e hora de retorno devem ser no futuro (pelo menos 10 minutos a partir de agora).');
            return;
        }

        if (!user || !user.customerId) {
            setModalError('Erro: Não foi possível obter seu ID de cliente. Por favor, faça login novamente.');
            return;
        }

        navigate('/payment', {
            state: {
                bike: selectedBikeForRental,
                expectedReturnDate: combinedExpectedReturnDate,
                observations: rentalObservations,
            }
        });

        closeRentalModal();
    };


    return (
        <div style={pageStyles.container}>
            <h1 style={pageStyles.title}>Bicicletas Disponíveis</h1>
            <p style={pageStyles.description}>Aqui você encontrará todas as bicicletas em nosso estoque prontas para aluguel</p>

            <div style={searchStyles.searchBoxContainer}>
                <div style={searchStyles.searchInputWrapper}>
                    <FaSearch style={searchStyles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Buscar ID ou nome"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={searchStyles.searchInput}
                    />
                </div>
            </div>
            
            {loading && <LoadingSpinner />}
            
            {error && <p style={pageStyles.errorMessage}>{error}</p>}

            {!loading && !error && filteredBikes.length === 0 && (
                <p style={pageStyles.message}>
                    {searchTerm ? `Nenhuma bicicleta encontrada para "${searchTerm}".` : 'Nenhuma bicicleta cadastrada no momento.'}
                </p>
            )}

            {!loading && !error && filteredBikes.length > 0 && (
                <div style={bikeListStyles.gridContainer}>
                    {filteredBikes.map((bike) => (
                        <div key={bike.bikeID} style={bikeListStyles.bikeItem}>
                            <div style={bikeListStyles.bikeIdWrapper}>
                                <span style={bikeListStyles.bikeId}>{bike.bikeID}</span>
                            </div>
                            <div style={bikeListStyles.bikeDetails}>
                                <h3 style={bikeListStyles.bikeModel}>{bike.modelo}</h3>
                                <p style={bikeListStyles.bikeDescription}>{bike.descricao}</p>
                                <p style={bikeListStyles.bikeType}>
                                    Tipo: <strong>{bike.infantil ? 'Infantil' : 'Adulto'}</strong>
                                </p>
                                <p style={bike.disponivel ? bikeListStyles.statusAvailable : bikeListStyles.statusUnavailable}>
                                    Status: <strong>{bike.disponivel ? 'Disponível' : 'Indisponível'}</strong>
                                </p>
                                <p style={bikeListStyles.bikeValue}>
                                    Valor por Hora: <strong>R$ {bike.valorHora.toFixed(2)}</strong>
                                </p>
                                {bike.disponivel ? (
                                    <button
                                        onClick={() => openRentalModal(bike)}
                                        style={bikeListStyles.rentButton}
                                    >
                                        ALUGAR
                                    </button>
                                ) : (
                                    <button
                                        style={bikeListStyles.unavailableButton}
                                        disabled
                                    >
                                        INDISPONÍVEL
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showRentalModal && selectedBikeForRental && (
                <div style={modalStyles.overlay}>
                    <div style={modalStyles.modal}>
                        <h3 style={modalStyles.modalTitle}>Alugar: {selectedBikeForRental.modelo} (ID: {selectedBikeForRental.bikeID})</h3>
                        <form onSubmit={handleProceedToPayment} style={modalStyles.form}>
                            {modalError && <p style={modalStyles.errorMessage}>{modalError}</p>}
                            
                            <div style={modalStyles.inputGroup}>
                                <label htmlFor="expectedReturnDate" style={modalStyles.label}>Data de Retorno Esperada:</label>
                                <input
                                    type="date" 
                                    id="expectedReturnDate"
                                    value={expectedReturnDateOnly}
                                    onChange={(e) => setExpectedReturnDateOnly(e.target.value)}
                                    style={modalStyles.input}
                                    required
                                />
                            </div>
                            <div style={modalStyles.inputGroup}>
                                <label htmlFor="expectedReturnTime" style={modalStyles.label}>Hora de Retorno Esperada:</label>
                                <input
                                    type="time" 
                                    id="expectedReturnTime"
                                    value={expectedReturnTimeOnly}
                                    onChange={(e) => setExpectedReturnTimeOnly(e.target.value)}
                                    style={modalStyles.input}
                                    required
                                />
                            </div>

                            <div style={modalStyles.inputGroup}>
                                <label htmlFor="observations" style={modalStyles.label}>Observações (opcional):</label>
                                <textarea
                                    id="observations"
                                    value={rentalObservations}
                                    onChange={(e) => setRentalObservations(e.target.value)}
                                    style={modalStyles.textarea}
                                    rows="3"
                                ></textarea>
                            </div>

                            <div style={modalStyles.buttonGroup}>
                                <button 
                                    type="submit" 
                                    style={modalStyles.primaryButton} 
                                    disabled={!!modalError || !user?.customerId} 
                                >
                                    Prosseguir para Pagamento
                                </button>
                                <button type="button" onClick={closeRentalModal} style={modalStyles.secondaryButton}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

const pageStyles = {
    container: {
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))'
    },
    title: {
        textTransform: "uppercase",
        fontSize: '2.5em',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    description: {
        fontSize: '1.2em',
        color: '#555',
        marginBottom: '30px',
    },
    message: {
        fontSize: '1.1em',
        color: '#666',
        marginTop: '20px',
    },
    errorMessage: {
        fontSize: '1.1em',
        color: 'red',
        marginTop: '20px',
    },
};

const searchStyles = {
    searchBoxContainer: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '30px',
    },
    searchInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '25px',
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        padding: '0',
    },
    searchIcon: {
        padding: '10px 15px',
        fontSize: '1.2em',
        color: '#888',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        flexGrow: 1,
        padding: '10px 15px 10px 0',
        fontSize: '1.1em',
        border: 'none',
        outline: 'none',
        background: 'none',
        color: '#333',
        '::placeholder': {
            color: '#aaa',
            opacity: '1',
        },
    },
};

const bikeListStyles = {
    gridContainer: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '30px',
        marginTop: '40px',
        justifyContent: 'center',
    },
    bikeItem: {
        backgroundColor: '#fff',
        padding: '15px',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        width: 'auto',
        border: '1px solid #eee',
        textAlign: 'left',
        minHeight: '180px',
    },
    bikeIdWrapper: {
        flexShrink: 0,
        marginRight: '15px',
        paddingRight: '15px',
        borderRight: '2px solid #ddd',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bikeId: {
        fontSize: '2.8em',
        fontWeight: 'bold',
        color: '#007bff',
    },
    bikeDetails: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    bikeModel: {
        fontSize: '1.5em',
        color: '#2c3e50',
        marginBottom: '0px',
        textTransform: 'capitalize',
        fontWeight: 'bold',
    },
    bikeDescription: {
        fontSize: '0.95em',
        color: '#666',
        marginBottom: '0px',
        lineHeight: '1.2',
        maxHeight: '3.6em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    bikeType: {
        fontSize: '0.9em',
        color: '#444',
        marginBottom: '0px',
    },
    statusAvailable: {
        fontSize: '0.95em',
        color: 'green',
        fontWeight: 'bold',
        marginBottom: '0px',
    },
    statusUnavailable: {
        fontSize: '0.95em',
        color: 'red',
        fontWeight: 'bold',
        marginBottom: '0px',
    },
    bikeValue: {
        fontSize: '1em',
        color: '#333',
        fontWeight: 'bold',
        marginTop: '5px',
        marginBottom: '10px',
    },
    rentButton: {
        padding: '8px 15px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '0.95em',
        fontWeight: '600',
        alignSelf: 'flex-start',
        transition: 'background-color 0.3s ease',
        marginTop: 'auto',
    },
    unavailableButton: {
        padding: '8px 15px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'not-allowed',
        fontSize: '0.95em',
        fontWeight: '600',
        alignSelf: 'flex-start',
        marginTop: 'auto',
    }
};

const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'left',
        position: 'relative',
    },
    modalTitle: {
        fontSize: '1.8em',
        color: '#2c3e50',
        marginBottom: '20px',
        textAlign: 'center',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    inputGroup: {
        marginBottom: '10px',
    },
    label: {
        display: 'block',
        fontSize: '1em',
        color: '#34495e',
        marginBottom: '5px',
        fontWeight: 'bold',
    },
    input: {
        width: 'calc(100% - 22px)',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #dcdfe6',
        fontSize: '1em',
    },
    textarea: {
        width: 'calc(100% - 22px)',
        padding: '10px',
        borderRadius: '5px',
        border: '1px solid #dcdfe6',
        fontSize: '1em',
        resize: 'vertical',
    },
    buttonGroup: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '10px',
        marginTop: '20px',
    },
    primaryButton: {
        padding: '10px 20px',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
    },
    secondaryButton: {
        padding: '10px 20px',
        backgroundColor: '#6c757d',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '1em',
        transition: 'background-color 0.3s ease',
    },
    errorMessage: {
        color: '#e74c3c',
        backgroundColor: '#fdeded',
        padding: '8px',
        borderRadius: '5px',
        marginBottom: '10px',
        fontSize: '0.9em',
        border: '1px solid #e74c3c',
    },
};

export default AvailableBikes;
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { showConfirmation, showSuccess, showError } from '../../utils/notifications';


const CustomerRatingModal = ({ show, onClose, onRate, customerName, bikeModel }) => {
    const [rating, setRating] = useState(0); 

    const handleStarClick = (starIndex) => {
        setRating(starIndex + 1); 
    };

    const handleConfirmRating = () => {
        onRate(rating); 
        onClose(); 
    };

    if (!show) return null;

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h2 style={modalStyles.title}>Avaliação do Cliente</h2>
                <p style={modalStyles.description}>Pergunte ao cliente {customerName} a respeito da experiência de aluguel para com a bike {bikeModel}.</p>
                
                <div style={ratingModalStyles.starsContainer}>
                    {[...Array(5)].map((_, index) => (
                        <span
                            key={index}
                            style={{
                                ...ratingModalStyles.star,
                                color: index < rating ? '#FFD700' : '#ccc' 
                            }}
                            onClick={() => handleStarClick(index)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <div style={modalStyles.buttonGroup}>
                    <button style={modalStyles.secondaryButton} type="button" onClick={onClose}>Não Avaliar</button>
                    <button 
                        style={modalStyles.submitButton} 
                        type="button" 
                        onClick={handleConfirmRating} 
                        disabled={rating === 0} 
                    >
                        Confirmar Avaliação
                    </button>
                </div>
            </div>
        </div>
    );
};

const AddBikeModal = ({ show, onClose, onBikeAdded }) => {
    const [newBike, setNewBike] = useState({
        bikeID: '', modelo: '', dataAquisicao: '', taxaAtraso: '', taxaDano: '',
        descricao: '', infantil: false, valorHora: '', disponivel: true,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewBike(prevState => ({ ...prevState, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/bikes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newBike,
                    bikeID: parseInt(newBike.bikeID),
                    taxaAtraso: parseFloat(newBike.taxaAtraso),
                    taxaDano: parseFloat(newBike.taxaDano),
                    valorHora: parseFloat(newBike.valorHora),
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Falha ao cadastrar bicicleta.');
            }
            showSuccess('Sucesso!', 'Bicicleta cadastrada com sucesso!');
            onBikeAdded();
            onClose();
        } catch (err) {
            setError(err.message);
            showError('Erro no Cadastro', err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!show) return null;

    return (
        <div style={modalStyles.overlay}>
            <div style={modalStyles.modal}>
                <h2 style={modalStyles.title}>Cadastrar Nova Bicicleta</h2>
                <form onSubmit={handleSubmit} style={modalStyles.form}>
                    <input style={modalStyles.input} name="bikeID" value={newBike.bikeID} onChange={handleChange} placeholder="ID da Bicicleta (Ex: 101)" required type="number" />
                    <input style={modalStyles.input} name="modelo" value={newBike.modelo} onChange={handleChange} placeholder="Modelo da Bicicleta" required />
                    <input style={modalStyles.input} name="dataAquisicao" value={newBike.dataAquisicao} onChange={handleChange} type="date" required />
                    <input style={modalStyles.input} name="valorHora" value={newBike.valorHora} onChange={handleChange} placeholder="Valor por Hora (Ex: 15.50)" required type="number" step="0.01" />
                    <input style={modalStyles.input} name="taxaAtraso" value={newBike.taxaAtraso} onChange={handleChange} placeholder="Taxa de Atraso por Hora" required type="number" step="0.01" />
                    <input style={modalStyles.input} name="taxaDano" value={newBike.taxaDano} onChange={handleChange} placeholder="Taxa de Dano (valor fixo)" required type="number" step="0.01" />
                    <textarea style={modalStyles.textarea} name="descricao" value={newBike.descricao} onChange={handleChange} placeholder="Descrição" required />
                    <div style={modalStyles.checkboxContainer}>
                        <label><input name="infantil" type="checkbox" checked={newBike.infantil} onChange={handleChange} /> É infantil?</label>
                        <label><input name="disponivel" type="checkbox" checked={newBike.disponivel} onChange={handleChange} /> Disponível para aluguel?</label>
                    </div>
                    
                    {error && <p style={modalStyles.error}>{error}</p>}
                    
                    <div style={modalStyles.buttonGroup}>
                        <button style={modalStyles.cancelButton} type="button" onClick={onClose} disabled={isSubmitting}>Cancelar</button>
                        <button style={modalStyles.submitButton} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Cadastrando...' : 'Cadastrar Bicicleta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

function ManageBikesPage() {
    const navigate = useNavigate();
    const [bikes, setBikes] = useState([]);
    const [activeRentals, setActiveRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false); 
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [currentRentalForRating, setCurrentRentalForRating] = useState(null); 

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = 'https://wheels-api-r0ea.onrender.com';
            const [bikesResponse, rentalsResponse] = await Promise.all([
                fetch(`${baseUrl}/api/bikes`),
                fetch(`${baseUrl}/api/current-rentals`),
            ]);

            const bikesData = bikesResponse.ok && bikesResponse.status !== 204 ? await bikesResponse.json() : [];
            const rentalsData = rentalsResponse.ok && rentalsResponse.status !== 204 ? await rentalsResponse.json() : [];
            
            setBikes(bikesData);
            setActiveRentals(rentalsData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturnBike = async (bike) => {
        const rental = activeRentals.find(r => r.bike?.bikeID === bike.bikeID);
        if (!rental) {
            showError("Erro Inesperado", "Não foi possível encontrar os dados do aluguel ativo para esta bicicleta.");
            return;
        }

        const now = new Date();
        const expectedReturn = new Date(rental.expectedReturn);
        
        if (now > expectedReturn) {
            const hoursLate = Math.ceil((now - expectedReturn) / (1000 * 60 * 60));
            const lateFee = hoursLate * bike.taxaAtraso;
            
            const result = await showConfirmation(
                'Devolução Atrasada!',
                `Multa calculada de R$${lateFee.toFixed(2)}. Deseja prosseguir para a página de pagamento?`
            );

            if (result.isConfirmed) {
                navigate('/payment', { 
                    state: {
                        bike: bike,
                        rentalIdForReturn: rental.rentalID,
                        lateFee: lateFee,
                        customerIdForReturn: rental.customer?.customerID 
                    } 
                });
            }
        } else {
            const result = await showConfirmation(
                'Confirmar Devolução?',
                `Deseja finalizar o aluguel da bicicleta "${bike.modelo}"? Não há multa por atraso.`
            );

            if (result.isConfirmed) {
                try {
                    const response = await fetch(`https://wheels-api-r0ea.onrender.com/api/current-rentals/${rental.rentalID}/return`, { method: 'POST' });
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(errorText || 'Falha ao finalizar aluguel.');
                    }
                    const successMessage = await response.text();
                    showSuccess('Devolvida!', successMessage);
                    setCurrentRentalForRating(rental); 
                    setShowRatingModal(true); 
                } catch (err) {
                    showError('Erro', err.message);
                }
            }
        }
    };

    const handleCustomerRating = (rating) => {
        console.log(`Cliente avaliou com ${rating} estrelas para o aluguel ${currentRentalForRating?.rentalID}`);
        showSuccess('Avaliação Registrada', `Obrigado por avaliar com ${rating} estrelas!`);
        fetchData(); 
    };


    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <p style={{ color: 'red' }}>Erro ao carregar dados: {error}</p>;

        return (
            <table style={pageStyles.table}>
                <thead>
                    <tr>
                        <th style={pageStyles.th}>ID</th>
                        <th style={pageStyles.th}>Modelo</th>
                        <th style={pageStyles.th}>Status</th>
                        <th style={pageStyles.th}>Alugada por</th>
                        <th style={pageStyles.th}>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {bikes.map(bike => {
                        const rentalInfo = activeRentals.find(r => r.bike?.bikeID === bike.bikeID);
                        const isRented = !!rentalInfo;
                        
                        return (
                            <tr key={bike.bikeID}>
                                <td style={pageStyles.td}>{bike.bikeID}</td>
                                <td style={pageStyles.td}>{bike.modelo}</td>
                                <td style={pageStyles.td}>
                                    <span style={isRented ? pageStyles.statusRented : pageStyles.statusAvailable}>
                                        {isRented ? 'Alugada' : 'Disponível'}
                                    </span>
                                </td>
                                <td style={pageStyles.td}>{isRented ? rentalInfo.customer?.nomeCompleto : '-'}</td>
                                <td style={pageStyles.td}>
                                    {isRented ? (
                                        <button onClick={() => handleReturnBike(bike)} style={pageStyles.actionButton}>Dar Baixa</button>
                                    ) : (
                                        <button disabled style={pageStyles.actionButtonDisabled}>Devolvida</button>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        );
    };

    return (
        <div style={pageStyles.container}>
            <div style={pageStyles.header}>
                <h1 style={pageStyles.title}>Gerenciar Bicicletas</h1>
                <button onClick={() => setShowAddModal(true)} style={pageStyles.addButton}>+ Adicionar Bicicleta</button>
            </div>
            <p style={pageStyles.description}>Adicione novas bicicletas ou gerencie as devoluções das que estão em uso.</p>
            {renderContent()}
            <AddBikeModal show={showAddModal} onClose={() => setShowAddModal(false)} onBikeAdded={fetchData} />
            
            {showRatingModal && currentRentalForRating && (
                <CustomerRatingModal 
                    show={showRatingModal} 
                    onClose={() => { setShowRatingModal(false); fetchData(); }} 
                    onRate={handleCustomerRating} 
                    customerName={currentRentalForRating.customer?.nomeCompleto || 'Cliente'}
                    bikeModel={currentRentalForRating.bike?.modelo || 'Bicicleta'}
                />
            )}
        </div>
    );
}

const pageStyles = {
    container: { padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
    title: { fontSize: '2.5em', color: '#2c3e50', margin: 0, textTransform: 'uppercase' },
    description: { textAlign: 'center', fontSize: '1.1em', color: '#555', marginBottom: '40px' },
    addButton: { padding: '10px 20px', fontSize: '1em', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
    th: { backgroundColor: '#4a69bd', color: 'white', padding: '12px 15px', textAlign: 'left' },
    td: { padding: '10px 15px', borderBottom: '1px solid #ddd' },
    statusAvailable: { color: 'green', fontWeight: 'bold' },
    statusRented: { color: '#e74c3c', fontWeight: 'bold' },
    actionButton: { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '5px' },
    actionButtonDisabled: { padding: '8px 12px', cursor: 'not-allowed', backgroundColor: '#bdc3c7', color: 'white', border: 'none', borderRadius: '5px' },
};

const modalStyles = {
    overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '90%', maxWidth: '500px' },
    title: { marginTop: 0 },
    description: { fontSize: '1em', color: '#555', marginBottom: '15px' }, 
    form: { display: 'flex', flexDirection: 'column', gap: '15px' },
    input: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc' },
    textarea: { padding: '10px', fontSize: '1em', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' },
    checkboxContainer: { display: 'flex', gap: '20px' },
    buttonGroup: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' },
    submitButton: { padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#007bff', color: 'white', cursor: 'pointer' },
    cancelButton: { padding: '10px 20px', border: 'none', borderRadius: '5px', backgroundColor: '#6c757d', color: 'white', cursor: 'pointer' },
    error: { color: 'red', marginTop: '10px' }
};

const ratingModalStyles = {
    starsContainer: {
        fontSize: '2.5em', 
        color: '#ccc', 
        cursor: 'pointer',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'center',
        gap: '5px', 
    },
    star: {
        transition: 'color 0.2s ease', 
        '&:hover': {
            color: '#FFD700', 
        }
    }
};

export default ManageBikesPage;
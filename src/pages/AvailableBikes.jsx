import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';

function AvailableBikes() {
    const [bikes, setBikes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBikes = async () => {
            try {
                console.log("Buscando bicicletas... A primeira requisição pode demorar um pouco.");
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

            {loading && <p style={pageStyles.message}>Carregando bicicletas... Isso pode levar um minuto na primeira vez.</p>}
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
                                        onClick={() => alert(`Você clicou em alugar a ${bike.modelo} (ID: ${bike.bikeID})`)}
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
    }
};

const searchStyles = {
    searchBoxContainer: {
        width: '49%',
        display: 'flex',
        justifyContent: 'flex-start',
        marginBottom: '30px',
    },
    searchInputWrapper: {
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        maxWidth: '600px',
        backgroundColor: '#fff',
        border: '1px solid #ccc',
        borderRadius: '10px',
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

export default AvailableBikes;
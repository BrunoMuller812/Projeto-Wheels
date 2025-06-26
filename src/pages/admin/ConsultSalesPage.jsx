import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

function ConsultSalesPage() {
    const [activeRentals, setActiveRentals] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeView, setActiveView] = useState('active');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = 'https://wheels-api-r0ea.onrender.com';
                const [activeRentalsResponse, salesHistoryResponse] = await Promise.all([
                    fetch(`${baseUrl}/api/current-rentals`),
                    fetch(`${baseUrl}/api/sales`)
                ]);

                if (!activeRentalsResponse.ok || !salesHistoryResponse.ok) {
                    throw new Error('Falha ao buscar dados da API.');
                }
                
                const activeRentalsData = activeRentalsResponse.status === 204 ? [] : await activeRentalsResponse.json();
                const salesHistoryData = salesHistoryResponse.status === 204 ? [] : await salesHistoryResponse.json();

                setActiveRentals(activeRentalsData);
                setSalesHistory(salesHistoryData);

            } catch (err) {
                setError(err.message);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1000); 
            }
        };

        fetchData();
    }, []);

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (error) return <p style={{ color: 'red' }}>Erro ao carregar dados: {error}</p>;
    
        return (
            <>
                <div style={pageStyles.navButtons}>
                    <button 
                        style={activeView === 'active' ? pageStyles.buttonActive : pageStyles.button}
                        onClick={() => setActiveView('active')}
                    >
                        Aluguéis Ativos ({activeRentals.length})
                    </button>
                    <button 
                        style={activeView === 'history' ? pageStyles.buttonActive : pageStyles.button}
                        onClick={() => setActiveView('history')}
                    >
                        Histórico de Aluguéis ({salesHistory.length})
                    </button>
                </div>
                
                {activeView === 'active' && (
                    <section style={pageStyles.section}>
                        <h2>Aluguéis Ativos no Momento</h2>
                        {activeRentals.length > 0 ? (
                            <table style={pageStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={pageStyles.th}>Rental ID</th>
                                        <th style={pageStyles.th}>Cliente</th>
                                        <th style={pageStyles.th}>Bicicleta (Modelo)</th>
                                        <th style={pageStyles.th}>Início do Aluguel</th>
                                        <th style={pageStyles.th}>Devolução Esperada</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {activeRentals.map(rental => (
                                        <tr key={rental.rentalID}>
                                            <td style={pageStyles.td}>{rental.rentalID}</td>
                                            <td style={pageStyles.td}>{rental.customer?.nomeCompleto || 'N/A'}</td>
                                            <td style={pageStyles.td}>{rental.bike?.modelo || 'N/A'}</td>
                                            <td style={pageStyles.td}>{new Date(rental.rentalStart).toLocaleString('pt-BR')}</td>
                                            <td style={pageStyles.td}>{new Date(rental.expectedReturn).toLocaleString('pt-BR')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Não há aluguéis ativos no momento.</p>
                        )}
                    </section>
                )}

                {activeView === 'history' && (
                    <section style={pageStyles.section}>
                        <h2>Histórico de Aluguéis Finalizados</h2>
                        {salesHistory.length > 0 ? (
                             <table style={pageStyles.table}>
                                <thead>
                                    <tr>
                                        <th style={pageStyles.th}>Sale ID</th>
                                        <th style={pageStyles.th}>Cliente</th>
                                        <th style={pageStyles.th}>Bicicleta (Modelo)</th>
                                        <th style={pageStyles.th}>Data</th>
                                        <th style={pageStyles.th}>Valor Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {salesHistory.map(sale => (
                                        <tr key={sale.saleID}>
                                            <td style={pageStyles.td}>{sale.saleID}</td>
                                            <td style={pageStyles.td}>{sale.customerDetails?.nomeCompleto || 'N/A'}</td>
                                            <td style={pageStyles.td}>{sale.bikeDetails?.modelo || 'N/A'}</td>
                                            <td style={pageStyles.td}>{new Date(sale.dateDetails.data).toLocaleDateString('pt-BR')}</td>
                                            <td style={pageStyles.td}>R$ {sale.valorTotal.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>Não há registros no histórico de aluguéis.</p>
                        )}
                    </section>
                )}
            </>
        );
    };

    return (
        <div style={pageStyles.container}>
            <h1 style={pageStyles.title}>Consulta de Vendas</h1>
            <p style={pageStyles.description}>Selecione uma visualização abaixo para consultar os dados.</p>
            {renderContent()}
        </div>
    );
}


const pageStyles = {
    container: {
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
    },
    title: { 
        fontSize: '2.5em', color: '#2c3e50', marginBottom: '15px', textTransform: 'uppercase'
    },
    description: { 
        fontSize: '1.1em', color: '#555', marginBottom: '40px' 
    },
    navButtons: { 
        marginBottom: '40px', display: 'flex', justifyContent: 'center', gap: '20px' 
    },
    button: { 
        padding: '10px 20px', fontSize: '1em', cursor: 'pointer', border: '1px solid #4a69bd', backgroundColor: 'white', color: '#4a69bd', borderRadius: '5px' 
    },
    buttonActive: { 
        padding: '10px 20px', fontSize: '1em', cursor: 'pointer', border: '1px solid #4a69bd', backgroundColor: '#4a69bd', color: 'white', borderRadius: '5px' 
    },
    section: { 
        width: '100%', marginBottom: '40px' 
    },
    table: { 
        width: '100%', borderCollapse: 'collapse', marginTop: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
    },
    th: { 
        backgroundColor: '#4a69bd', color: 'white', padding: '12px 15px' 
    },
    td: { 
        padding: '10px 15px', borderBottom: '1px solid #ddd' 
    },
};

export default ConsultSalesPage;
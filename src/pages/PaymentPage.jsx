import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { jsPDF } from 'jspdf';

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [customerDetails, setCustomerDetails] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [customerError, setCustomerError] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    const { bike, expectedReturnDate, observations } = location.state || {};

    useEffect(() => {
        if (!bike || !expectedReturnDate || !user || !user.customerId) {
            console.error("Dados de aluguel incompletos ou usuário não logado com customerId. Redirecionando.");
            const timer = setTimeout(() => {
                navigate('/bikes', { replace: true });
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [bike, expectedReturnDate, user, user?.customerId, navigate]);

    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (!user?.customerId) {
                setCustomerError('ID do cliente não disponível para buscar detalhes. Tente relogar.');
                setLoadingCustomer(false);
                return;
            }
            try {
                const response = await fetch(`https://wheels-api-r0ea.onrender.com/api/customers/${user.customerId}`);
                if (!response.ok) {
                    const errorJson = await response.json();
                    throw new Error(errorJson.message || `status ${response.status}`);
                }
                const data = await response.json();
                setCustomerDetails(data);
            } catch (err) {
                console.error("Falha ao buscar detalhes do cliente:", err);
                setCustomerError(`Não foi possível carregar os detalhes do cliente: ${err.message}`);
            } finally {
                setLoadingCustomer(false);
            }
        };

        if (user && user.customerId) {
            fetchCustomerDetails();
        }
    }, [user, user?.customerId]);

    let totalValue = 0;
    const rentalStartTime = new Date();
    const rentalEndTime = new Date(expectedReturnDate);

    if (isNaN(rentalStartTime.getTime()) || isNaN(rentalEndTime.getTime())) {
        console.warn("Datas de aluguel inválidas. Usando valor por hora da bike (1h) como total.");
        totalValue = bike?.valorHora || 0;
    } else {
        const timeDiffMs = rentalEndTime.getTime() - rentalStartTime.getTime();
        const hoursDiff = timeDiffMs / (1000 * 60 * 60);

        if (hoursDiff <= 0) {
            console.warn("Data de retorno no passado ou igual à data de início. Valor de 1 hora aplicada.");
            totalValue = bike?.valorHora || 0;
        } else {
            totalValue = (bike?.valorHora || 0) * Math.ceil(hoursDiff);
        }
    }

    const formattedReturnDate = new Date(expectedReturnDate).toLocaleString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const handleConfirmPayment = async () => {
        if (!selectedPaymentMethod) {
            alert('Por favor, selecione uma forma de pagamento.');
            return;
        }
        alert(`Pagamento com "${selectedPaymentMethod}" efetuado com sucesso (fictício)!`);

        if (!user?.customerId || !bike?.bikeID || !expectedReturnDate) {
            alert('Erro: Dados incompletos para registrar o aluguel na API. Tente novamente.');
            console.error("Tentativa de aluguel com dados incompletos:", { user, bike, expectedReturnDate });
            navigate('/bikes', { replace: true });
            return;
        }

        try {
            const rentalData = {
                customerId: user.customerId,
                bikeId: bike.bikeID,
                expectedReturn: `${expectedReturnDate}:00`,
                observations: observations
            };

            const response = await fetch('https://wheels-api-r0ea.onrender.com/api/current-rentals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rentalData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Erro ao registrar aluguel: status ${response.status}`);
            }

            alert(`Aluguel da "${bike.modelo}" registrado na API! Redirecionando para as bikes.`);
            navigate('/bikes');

        } catch (err) {
            console.error("Falha ao registrar aluguel na API:", err);
            alert(`Erro ao finalizar aluguel: ${err.message}. Por favor, tente novamente.`);
            navigate('/bikes');
        }
    };

    const handleDownloadContract = () => {
        if (!customerDetails || !bike) {
            alert("Detalhes do cliente ou da bicicleta não carregados. Não é possível gerar o contrato.");
            return;
        }

        const doc = new jsPDF();

        let yPos = 20;

        doc.setFontSize(16);
        doc.text("Contrato de Aluguel de Bicicleta - Wheels", 105, yPos, { align: 'center' });
        yPos += 10;
        doc.setFontSize(10);
        doc.text("------------------------------------------------------------------------------------------------------------------------------------------------------------------", 10, yPos);
        yPos += 10;

        doc.setFontSize(12);
        doc.text(`Data do Contrato: ${new Date().toLocaleString('pt-BR')}`, 15, yPos);
        yPos += 15;

        doc.setFontSize(14);
        doc.text("Dados do Cliente:", 15, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.text(`Nome Completo: ${customerDetails.nomeCompleto || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`CPF: ${customerDetails.cpf || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`Email: ${customerDetails.email || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`Celular: ${customerDetails.celular || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`Endereço: ${customerDetails.cidade || 'Não informado'}, ${customerDetails.pais || 'Não informado'}`, 20, yPos); yPos += 15;

        doc.setFontSize(14);
        doc.text("Dados da Bicicleta:", 15, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.text(`Modelo: ${bike.modelo || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`ID da Bicicleta: ${bike.bikeID || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`Descrição: ${bike.descricao || 'Não informado'}`, 20, yPos); yPos += 7;
        doc.text(`Tipo: ${bike.infantil ? 'Infantil' : 'Adulto'}`, 20, yPos); yPos += 7;
        doc.text(`Valor por Hora: R$${bike.valorHora.toFixed(2)}`, 20, yPos); yPos += 15;

        doc.setFontSize(14);
        doc.text("Detalhes do Aluguel:", 15, yPos);
        yPos += 8;
        doc.setFontSize(12);
        doc.text(`Data e Hora de Retorno Esperada: ${formattedReturnDate}`, 20, yPos); yPos += 7;
        doc.text(`Observações: ${observations || 'Nenhuma.'}`, 20, yPos); yPos += 7;
        doc.text(`Total Estimado a Pagar: R$${totalValue.toFixed(2)}`, 20, yPos); yPos += 15;

        doc.setFontSize(14);
        doc.text("Termos e Condições:", 15, yPos);
        yPos += 8;
        doc.setFontSize(10);
        const terms = [
            "1. O aluguel da bicicleta é por hora, com arredondamento para cima.",
            "2. Danos à bicicleta serão avaliados e cobrados separadamente.",
            "3. Atrasos na devolução podem gerar taxas adicionais.",
            "4. O cliente é responsável pela segurança e integridade da bicicleta durante o período de aluguel.",
        ];
        terms.forEach(term => {
            doc.text(term, 20, yPos, { maxWidth: 170 });
            yPos += 6;
        });
        yPos += 15;

        doc.setFontSize(12);
        doc.text("Assinaturas:", 15, yPos);
        yPos += 15;
        doc.text("_________________________           _________________________", 20, yPos);
        yPos += 7;
        doc.text("Assinatura do Cliente                         Assinatura da Wheels", 30, yPos);
        yPos += 7;
        doc.text(`(Nome: ${customerDetails.nomeCompleto || 'Cliente'})`, 20, yPos);

        doc.save(`Contrato_Aluguel_Bike_${customerDetails.cpf || 'cliente'}_${bike.bikeID}.pdf`);
    };

    if (loadingCustomer) {
        return (
            <MainLayout>
                <div style={paymentStyles.loadingContainer}>
                    <p style={paymentStyles.message}>Carregando detalhes do cliente...</p>
                </div>
            </MainLayout>
        );
    }

    if (customerError) {
        return (
            <MainLayout>
                <div style={paymentStyles.loadingContainer}>
                    <p style={paymentStyles.errorMessage}>Erro: {customerError}</p>
                    <button onClick={() => navigate('/bikes', { replace: true })} style={paymentStyles.cancelButton}>Voltar</button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div style={paymentStyles.container}>
                <div style={paymentStyles.card}>
                    <h2 style={paymentStyles.title}>Confirmação e Pagamento</h2>
                    <p style={paymentStyles.subtitle}>Revise os detalhes do seu aluguel antes de prosseguir com o pagamento.</p>

                    <div style={paymentStyles.summary}>
                        <p style={paymentStyles.summaryItem}>
                            <strong>Cliente:</strong> {customerDetails?.nomeCompleto || 'N/A'} (CPF: {customerDetails?.cpf || 'N/A'})
                        </p>
                        <p style={paymentStyles.summaryItem}><strong>Bicicleta:</strong> {bike.modelo} (ID: {bike.bikeID})</p>
                        <p style={paymentStyles.summaryItem}><strong>Devolução Esperada:</strong> {formattedReturnDate}</p>
                        {observations && <p style={paymentStyles.summaryItem}><strong>Observações:</strong> {observations}</p>}
                        <p style={paymentStyles.totalValue}>Total a Pagar: <strong>R${totalValue.toFixed(2)}</strong></p>
                    </div>

                    <h3 style={paymentStyles.paymentMethodsTitle}>Escolha a Forma de Pagamento</h3>
                    <div style={paymentStyles.paymentOptions}>
                        <div
                            style={{ ...paymentStyles.paymentOptionBox, ...(selectedPaymentMethod === 'Dinheiro' && paymentStyles.paymentOptionBoxSelected) }}
                            onClick={() => setSelectedPaymentMethod('Dinheiro')}
                        >
                            Dinheiro
                        </div>
                        <div
                            style={{ ...paymentStyles.paymentOptionBox, ...(selectedPaymentMethod === 'Cartão de Crédito' && paymentStyles.paymentOptionBoxSelected) }}
                            onClick={() => setSelectedPaymentMethod('Cartão de Crédito')}
                        >
                            Cartão de Crédito
                        </div>
                        <div
                            style={{ ...paymentStyles.paymentOptionBox, ...(selectedPaymentMethod === 'Cartão de Débito' && paymentStyles.paymentOptionBoxSelected) }}
                            onClick={() => setSelectedPaymentMethod('Cartão de Débito')}
                        >
                            Cartão de Débito
                        </div>
                        <div
                            style={{ ...paymentStyles.paymentOptionBox, ...(selectedPaymentMethod === 'Pix' && paymentStyles.paymentOptionBoxSelected) }}
                            onClick={() => setSelectedPaymentMethod('Pix')}
                        >
                            Pix
                        </div>
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        style={paymentStyles.confirmPaymentButton}
                        disabled={!selectedPaymentMethod}
                    >
                        FINALIZAR PAGAMENTO
                    </button>

                    <button
                        onClick={handleDownloadContract}
                        style={paymentStyles.downloadButton}
                    >
                        Baixar Contrato
                    </button>

                    <button
                        onClick={() => navigate('/bikes', { replace: true })}
                        style={paymentStyles.cancelButton}
                    >
                        Cancelar e Voltar para Bikes
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

const paymentStyles = {
    container: {
        marginTop: "50px",
        marginBottom: "50px",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
        background: 'linear-gradient(135deg, #f0f2f5, #e0e4eb)',
        padding: '20px',
        boxSizing: 'border-box',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
        padding: '40px 35px',
        width: '100%',
        maxWidth: '650px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        animation: 'fadeIn 0.8s ease-out',
        '@keyframes fadeIn': {
            'from': { opacity: 0, transform: 'translateY(-20px)' },
            'to': { opacity: 1, transform: 'translateY(0)' },
        },
    },
    title: {
        textTransform: "uppercase",
        fontSize: '2.2em',
        fontWeight: '700',
        color: '#2c3e50',
        marginBottom: '0px',
    },
    subtitle: {
        fontSize: '1em',
        color: '#7f8c8d',
        marginBottom: '40px',
    },
    summary: {
        backgroundColor: '#f8f9fa',
        border: '1px solid #e9ecef',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '30px',
        textAlign: 'left',
    },
    summaryItem: {
        fontSize: '1.1em',
        color: '#34495e',
        marginBottom: '8px',
        lineHeight: '1.4',
    },
    totalValue: {
        fontSize: '1.3em',
        color: '#007bff',
        marginTop: '15px',
        fontWeight: 'bold',
        borderTop: '1px solid #eee',
        paddingTop: '15px',
    },
    paymentMethodsTitle: {
        fontSize: '1.5em',
        color: '#2c3e50',
        marginBottom: '20px',
    },
    paymentOptions: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '30px',
        alignItems: 'center',
    },
    paymentOptionBox: {
        backgroundColor: '#f0f0f0',
        border: '2px solid #ddd',
        borderRadius: '8px',
        padding: '15px',
        width: '80%',
        maxWidth: '400px',
        cursor: 'pointer',
        fontSize: '1.1em',
        fontWeight: '500',
        color: '#333',
        transition: 'all 0.3s ease',
        textAlign: 'center',
        '&:hover': {
            borderColor: '#007bff',
            backgroundColor: '#e6f7ff',
        },
    },
    paymentOptionBoxSelected: {
        backgroundColor: '#007bff',
        borderColor: '#007bff',
        color: '#fff',
        boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)',
    },
    confirmPaymentButton: {
        padding: '15px 25px',
        backgroundColor: '#28a745',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1.2em',
        fontWeight: '700',
        transition: 'background-color 0.3s ease, transform 0.2s ease',
        marginTop: '20px',
        width: '100%',
        '&:hover': {
            backgroundColor: '#218838',
            transform: 'translateY(-2px)',
        },
        '&:disabled': {
            backgroundColor: '#cccccc',
            cursor: 'not-allowed',
            transform: 'none',
        },
    },
    downloadButton: {
        padding: '12px 20px',
        backgroundColor: '#0056b3',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: '500',
        transition: 'background-color 0.3s ease',
        marginTop: '15px',
        width: '100%',
    },
    cancelButton: {
        padding: '12px 20px',
        backgroundColor: '#dc3545',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1em',
        fontWeight: '500',
        transition: 'background-color 0.3s ease',
        marginTop: '10px',
        width: '100%',
    },
    message: {
        color: '#007bff',
        backgroundColor: '#e0f7fa',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        fontSize: '0.9em',
        border: '1px solid #007bff',
    },
    errorMessage: {
        color: '#e74c3c',
        backgroundColor: '#fdeded',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        fontSize: '0.9em',
        border: '1px solid #e74c3c',
    },
    successMessage: {
        color: '#28a745',
        backgroundColor: '#e6ffed',
        padding: '10px',
        borderRadius: '8px',
        marginBottom: '10px',
        fontSize: '0.9em',
        border: '1px solid #28a745',
    }
};

export default PaymentPage;
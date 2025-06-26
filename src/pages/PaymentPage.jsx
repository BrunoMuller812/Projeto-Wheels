// src/pages/PaymentPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../components/layout/MainLayout';
import { jsPDF } from 'jspdf';
import { showSuccess, showError } from '../utils/notifications'; // <-- IMPORTAÇÃO

function PaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    // Dados podem vir de um novo aluguel OU de uma devolução com multa
    const { bike, expectedReturnDate, observations, rentalIdForReturn, lateFee, customerIdForReturn } = location.state || {};
    
    // Identifica se é um pagamento de multa ou um novo aluguel
    const isLateFeePayment = !!(rentalIdForReturn && lateFee > 0);
    
    // Para um novo aluguel, o cliente é o usuário logado. Para devolução, pode ser outro.
    const customerIdToFetch = isLateFeePayment ? customerIdForReturn : user?.customerId;

    const [customerDetails, setCustomerDetails] = useState(null);
    const [loadingCustomer, setLoadingCustomer] = useState(true);
    const [customerError, setCustomerError] = useState(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');

    // ... (useEffects para validação e busca de cliente continuam os mesmos) ...
     useEffect(() => {
        const isNewRentalDataMissing = !bike || !expectedReturnDate;
        const isReturnDataMissing = !bike || !rentalIdForReturn;

        if ((!isLateFeePayment && isNewRentalDataMissing) || (isLateFeePayment && isReturnDataMissing)) {
            console.error("Dados de aluguel ou devolução incompletos. Redirecionando.");
            navigate('/bikes', { replace: true });
        }
    }, [bike, expectedReturnDate, rentalIdForReturn, isLateFeePayment, navigate]);
    
    useEffect(() => {
        const fetchCustomerDetails = async () => {
            if (!customerIdToFetch) {
                setCustomerError('ID do cliente não disponível para buscar detalhes. Tente relogar.');
                setLoadingCustomer(false);
                return;
            }
            setLoadingCustomer(true);
            try {
                const response = await fetch(`https://wheels-api-r0ea.onrender.com/api/customers/${customerIdToFetch}`);
                if (!response.ok) {
                    throw new Error(`Não foi possível carregar os dados do cliente (status: ${response.status})`);
                }
                const data = await response.json();
                setCustomerDetails(data);
            } catch (err) {
                console.error("Falha ao buscar detalhes do cliente:", err);
                setCustomerError(err.message);
            } finally {
                setLoadingCustomer(false);
            }
        };

        fetchCustomerDetails();
    }, [customerIdToFetch]);


    // Lógica de cálculo do valor a pagar
    let totalValue = 0;
    let paymentTitle = "Confirmação e Pagamento";
    let paymentSubtitle = "Revise os detalhes do seu aluguel antes de prosseguir com o pagamento.";
    
    if (isLateFeePayment) {
        totalValue = lateFee;
        paymentTitle = "Pagamento de Multa por Atraso";
        paymentSubtitle = `Pagamento referente à devolução do aluguel ID: ${rentalIdForReturn}`;
    } else if (bike && expectedReturnDate) {
        const rentalStartTime = new Date();
        const rentalEndTime = new Date(expectedReturnDate);
        if (!isNaN(rentalStartTime.getTime()) && !isNaN(rentalEndTime.getTime())) {
            const timeDiffMs = rentalEndTime.getTime() - rentalStartTime.getTime();
            const hoursDiff = timeDiffMs / (1000 * 60 * 60);
            totalValue = (bike?.valorHora || 0) * Math.ceil(Math.max(1, hoursDiff));
        }
    }
    
    const formattedReturnDate = expectedReturnDate ? new Date(expectedReturnDate).toLocaleString('pt-BR', {
        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
    }) : 'N/A';
    
    const handleConfirmPayment = async () => {
        if (!selectedPaymentMethod) {
            // alert('Por favor, selecione uma forma de pagamento.'); // <-- MUDANÇA
            showError('Atenção', 'Por favor, selecione uma forma de pagamento.');
            return;
        }
        
        // Opcional: remover este alerta fictício ou trocá-lo por um mais simples
        // showSuccess('Processando...', `Iniciando pagamento com "${selectedPaymentMethod}".`);

        if (isLateFeePayment) {
            try {
                const response = await fetch(`https://wheels-api-r0ea.onrender.com/api/current-rentals/${rentalIdForReturn}/return`, {
                    method: 'POST',
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(errorText || 'Falha ao finalizar o aluguel após pagamento da multa.');
                }
                const successMessage = await response.text();
                // alert(successMessage); // <-- MUDANÇA
                await showSuccess('Pagamento Recebido!', successMessage);
                navigate('/admin/manage-bikes');
            } catch (err) {
                // alert(`Erro ao finalizar aluguel: ${err.message}`); // <-- MUDANÇA
                showError('Erro ao Finalizar', err.message);
            }
        } else {
            try {
                const rentalData = {
                    customerId: user.customerId,
                    bikeId: bike.bikeID,
                    expectedReturn: `${expectedReturnDate}:00`,
                    observations: observations
                };
                const response = await fetch('https://wheels-api-r0ea.onrender.com/api/current-rentals', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(rentalData),
                });
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || `Erro ao registrar aluguel: status ${response.status}`);
                }
                // alert(`Aluguel da "${bike.modelo}" registrado na API!`); // <-- MUDANÇA
                await showSuccess('Aluguel Confirmado!', `A bicicleta "${bike.modelo}" foi alugada com sucesso.`);
                navigate('/bikes');
            } catch (err) {
                // alert(`Erro ao registrar aluguel: ${err.message}`); // <-- MUDANÇA
                showError('Erro no Aluguel', err.message);
            }
        }
    };
    
    const handleDownloadContract = () => {
        if (!customerDetails || !bike) {
            // alert("Detalhes do cliente ou da bicicleta não carregados. Não é possível gerar o contrato."); // <-- MUDANÇA
            showError("Dados Incompletos", "Detalhes do cliente ou da bicicleta não foram carregados. Não é possível gerar o contrato.");
            return;
        }
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("Contrato de Aluguel de Bicicleta - Wheels", 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Data do Contrato: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);

        doc.setFontSize(16);
        doc.text("1. Detalhes do Locatário (Cliente)", 20, 45);
        doc.setFontSize(12);
        doc.text(`Nome: ${customerDetails.nomeCompleto}`, 25, 52);
        doc.text(`CPF: ${customerDetails.cpf}`, 25, 59);
        doc.text(`Email: ${customerDetails.user.email}`, 25, 66);
        
        doc.setFontSize(16);
        doc.text("2. Detalhes da Bicicleta Alugada", 20, 80);
        doc.setFontSize(12);
        doc.text(`ID da Bicicleta: ${bike.bikeID}`, 25, 87);
        doc.text(`Modelo: ${bike.modelo}`, 25, 94);
        doc.text(`Descrição: ${bike.descricao}`, 25, 101);
        
        doc.setFontSize(16);
        doc.text("3. Condições do Aluguel", 20, 115);
        doc.setFontSize(12);
        doc.text(`Valor por Hora: R$ ${bike.valorHora.toFixed(2)}`, 25, 122);
        doc.text(`Data e Hora da Devolução Prevista: ${formattedReturnDate}`, 25, 129);
        doc.text(`Observações Iniciais: ${observations || 'Nenhuma'}`, 25, 136);
        doc.text(`Valor Total Previsto: R$ ${totalValue.toFixed(2)}`, 25, 143);
        
        doc.setFontSize(16);
        doc.text("4. Termos e Condições", 20, 160);
        doc.setFontSize(10);
        doc.text("a) O locatário é responsável por qualquer dano ou perda da bicicleta.", 25, 167);
        doc.text(`b) Uma taxa de atraso de R$ ${bike.taxaAtraso.toFixed(2)} por hora será aplicada.`, 25, 174);
        doc.text(`c) Em caso de dano, uma taxa fixa de R$ ${bike.taxaDano.toFixed(2)} será cobrada.`, 25, 181);
        doc.text("d) O locatário declara ter recebido a bicicleta em perfeitas condições de uso.", 25, 188);

        doc.setLineWidth(0.5);
        doc.line(40, 220, 170, 220);
        doc.setFontSize(12);
        doc.text("Assinatura do Locatário", 75, 225);
        
        doc.save(`Contrato_Aluguel_Bike_${customerDetails.cpf || 'cliente'}_${bike.bikeID}.pdf`);
        showSuccess("Download Iniciado", "O contrato em PDF foi gerado com sucesso."); // <-- MUDANÇA BÔNUS
    };

    // ... (O JSX de retorno continua o mesmo, sem alterações) ...
    if (loadingCustomer) {
        return (
            <MainLayout>
                <div style={paymentStyles.loadingContainer}>
                    <p style={paymentStyles.message}>Carregando detalhes do pagamento...</p>
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
                    <h2 style={paymentStyles.title}>{paymentTitle}</h2>
                    <p style={paymentStyles.subtitle}>{paymentSubtitle}</p>

                    <div style={paymentStyles.summary}>
                        <p style={paymentStyles.summaryItem}>
                            <strong>Cliente:</strong> {customerDetails?.nomeCompleto || 'N/A'} (CPF: {customerDetails?.cpf || 'N/A'})
                        </p>
                        <p style={paymentStyles.summaryItem}><strong>Bicicleta:</strong> {bike?.modelo} (ID: {bike?.bikeID})</p>
                        
                        {!isLateFeePayment && (
                            <>
                                <p style={paymentStyles.summaryItem}><strong>Devolução Esperada:</strong> {formattedReturnDate}</p>
                                {observations && <p style={paymentStyles.summaryItem}><strong>Observações:</strong> {observations}</p>}
                            </>
                        )}
                        
                        <p style={paymentStyles.totalValue}>Total a Pagar: <strong>R${totalValue.toFixed(2)}</strong></p>
                    </div>

                    <h3 style={paymentStyles.paymentMethodsTitle}>Escolha a Forma de Pagamento</h3>
                    <div style={paymentStyles.paymentOptions}>
                        {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'].map(method => (
                             <div
                                key={method}
                                style={{ ...paymentStyles.paymentOptionBox, ...(selectedPaymentMethod === method && paymentStyles.paymentOptionBoxSelected) }}
                                onClick={() => setSelectedPaymentMethod(method)}
                            >
                                {method}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={handleConfirmPayment}
                        style={paymentStyles.confirmPaymentButton}
                        disabled={!selectedPaymentMethod}
                    >
                        FINALIZAR PAGAMENTO
                    </button>

                    {!isLateFeePayment && (
                        <button
                            onClick={handleDownloadContract}
                            style={paymentStyles.downloadButton}
                        >
                            Baixar Contrato
                        </button>
                    )}

                    <button
                        onClick={() => navigate(isLateFeePayment ? '/admin/manage-bikes' : '/bikes', { replace: true })}
                        style={paymentStyles.cancelButton}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}

// Seu objeto de estilos completo, sem alterações.
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
        '&:disabled': {
            backgroundColor: '#cccccc',
            cursor: 'not-allowed',
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
};


export default PaymentPage;
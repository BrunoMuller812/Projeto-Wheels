import MainLayout from '../../components/layout/MainLayout'; 

function RegisterSalesPage() {
    return (
        <MainLayout>
            <div style={pageStyles.container}>
                <h1 style={pageStyles.title}>Cadastro de Vendas</h1>
                <p style={pageStyles.description}>Página o administrador para registrar novas vendas/aluguéis manualmente.</p>
            </div>
        </MainLayout>
    );
}

const pageStyles = {
    container: {
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        minHeight: 'calc(100vh - var(--header-height) - var(--footer-height))',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: '2.5em',
        color: '#2c3e50',
        marginBottom: '15px',
    },
    description: {
        fontSize: '1.1em',
        color: '#555',
        marginBottom: '40px',
    },
};

export default RegisterSalesPage;
import { Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import Register from './pages/Register';
import AvailableBikes from './pages/AvailableBikes'; 

import HomeAdmin from './pages/admin/HomeAdmin';
import RegisterSalesPage from './pages/admin/RegisterSalesPage';
import ConsultSalesPage from './pages/admin/ConsultSalesPage';
import ManageBikesPage from './pages/admin/ManageBikes';

import PaymentPage from './pages/PaymentPage'; 
import { PrivateRoute } from './components/PrivateRoute';
import { useAuth } from './context/AuthContext'; 

import MainLayout from './components/layout/MainLayout';

const AdminRoute = ({ children }) => {
    const { user, isAuthenticated } = useAuth(); 
    
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/home" replace />;
    }

    return children;
};

const AppLayout = () => {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
};

function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                <Route path="/home" element={<Home />} />
                <Route path="/bikes" element={<AvailableBikes />} />
                <Route path="/payment" element={<PaymentPage />} />
            </Route>

            <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
                <Route path="/admin/home" element={<HomeAdmin />} />
                <Route path="/admin/register-sales" element={<RegisterSalesPage />} />
                <Route path="/admin/consult-sales" element={<ConsultSalesPage />} />
                <Route path="/admin/manage-bikes" element={<ManageBikesPage />} />
            </Route>

            <Route path="*" element={
                <MainLayout>
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <h2>404 - Página Não Encontrada</h2>
                        <p>Desculpe, a página que você está procurando não existe.</p>
                        <Link to="/home" style={{ color: '#007bff', textDecoration: 'none', marginTop: '20px', display: 'inline-block' }}>
                            Voltar para o Início
                        </Link>
                    </div>
                </MainLayout>
            } />
        </Routes>
    );
}

export default App;
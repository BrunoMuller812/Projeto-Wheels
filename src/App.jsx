import { Routes, Route, Navigate, Link } from 'react-router-dom';
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


function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
                path="/home"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <Home />
                        </MainLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/bikes"
                element={
                    <PrivateRoute>
                        <MainLayout>
                            <AvailableBikes />
                        </MainLayout>
                    </PrivateRoute>
                }
            />

            <Route
                path="/admin/home" 
                element={
                    <AdminRoute> 
                        <HomeAdmin />
                    </AdminRoute>
                }
            />

            <Route
                path="/admin/register-sales"
                element={
                    <AdminRoute>
                        <RegisterSalesPage />
                    </AdminRoute>
                }
            />
            <Route
                path="/admin/consult-sales"
                element={
                    <AdminRoute>
                        <ConsultSalesPage />
                    </AdminRoute>
                }
            />
            
            <Route
                path="/admin/manage-bikes"
                element={
                    <AdminRoute>
                        <ManageBikesPage />
                    </AdminRoute>
                }
            />

            <Route
                path="/payment"
                element={
                    <PrivateRoute> 
                        <PaymentPage /> 
                    </PrivateRoute>
                }
            />

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
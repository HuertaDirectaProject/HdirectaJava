import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ProtectedRoute from "./components/GlobalComponents/ProtectedRoute";
import AuthLayout from "./layout/AuthLayout";
import MainLayout from "./layout/MainLayout";
import DashboardLayout from "./layout/DashboardLayout";
import { Landing } from "./pages/Landing/Landing";
import { HomePage } from "./pages/Main/HomePage";
import { Dashboard } from "./pages/Dashboard/Dashboard";
import { DashboardGraficos } from "./pages/Dashboard/DashboardGraficos";
import { MensajesAreaSocial } from "./pages/Dashboard/MensajesAreaSocial";
import { DashboardAgregarProducto } from "./pages/Dashboard/DashboardAgregarProducto";
import { DashboardFavorites } from "./pages/Dashboard/DashboardFavorites";
import { ActualizacionUsuario } from "./pages/Dashboard/ActualizacionUsuario";
import { DashboardAdmin } from "./pages/DashboardAdmin/DashboardAdmin";
import { AdminDashboardLayout } from "./layout/AdminDashboardLayout";
import { AdminStats } from "./pages/DashboardAdmin/AdminStats";
import { AdminUsers } from "./pages/DashboardAdmin/AdminUsers";
import { AdminProducts } from "./pages/DashboardAdmin/AdminProducts";
import { AdminReports } from "./pages/DashboardAdmin/AdminReports";
import { AdminConfig } from "./pages/DashboardAdmin/AdminConfig";
import { AdminRegister } from "./pages/DashboardAdmin/AdminRegister";
import QuienesSomos from "./pages/About/QuienesSomos";
import ProductDetailPage from "./pages/AboutProduct/ProductDetailPage";
import { CartProvider } from "./contexts/CartContext";
import ScrollToTop from "./components/GlobalComponents/ScrollToTop";
import { ProductosPage } from "./pages/Main/ProductosPage/ProductosPage";
import ProductsByCategoryPage from "./pages/Main/CategoryPage/ProductsByCategoryPage";
import { CategoryPage } from "./pages/Main/CategoryPage/CategoryPage";
import PaymentLayout from "./layout/PaymentLayaout.tsx";
import CheckoutSummaryPage from "./pages/Payment/CheckoutSummaryPage.tsx";
import MercadoPagoPayment from "./pages/Payment/MercadoPagoPayment.tsx";
import StatusSucesfull from "./pages/Payment/StatusSucesfull.tsx";
import StatusPending from "./pages/Payment/StatusPending.tsx";
import StatusFailure from "./pages/Payment/StatusFailure.tsx";
import { SMSVerification } from "./pages/Auth/SMSVerification.tsx";
import { PaymentProvider } from "./contexts/PaymentContext";
import RegisterMobilePage from "./pages/Auth/RegisterMobilePage.tsx";
import { ForgotPasswordMobile } from "./pages/Auth/ForgotPasswordMobile.tsx";


function App() {
    return (
        <CartProvider>
            <BrowserRouter>
                <ScrollToTop />
                <Routes>

                    {/* Landing */}
                    <Route element={<MainLayout navbarProps={{ showInicio: true, showQuienesSomos: true }} />}>
                        <Route path="/" element={<Landing />} />
                        <Route path="/QuienesSomos" element={<QuienesSomos />} />
                        <Route path="/quienes-somos" element={<QuienesSomos />} />
                        <Route path="/quienessomos" element={<QuienesSomos />} />
                    </Route>

                    {/* Auth */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/forgot-password-mobile" element={<ForgotPasswordMobile />} />
                        <Route path="/RegisterMobile" element={<RegisterMobilePage />} />
                    </Route>

                    {/* SMS - flujo de login, sin protección */}
                    <Route path="/verify-sms" element={<SMSVerification />} />

                    <Route path="*" element={<Navigate to="/" />} />

                    {/* Rutas protegidas */}
                    <Route element={<ProtectedRoute />}>

                        <Route element={<MainLayout navbarProps={{ showProductos: true, showCategorias: true, showAddProduct: true, showCart: true, showProfile: true, showQuienesSomos: false }} />}>
                            <Route path="/HomePage" element={<HomePage />} />
                        </Route>

                        <Route element={<MainLayout navbarProps={{ showInicio: true, showProductos: true, showCategorias: true, showAddProduct: true, showCart: true, showProfile: true, showQuienesSomos: true }} />}>
                            <Route path="/producto/:id" element={<ProductDetailPage />} />
                        </Route>

                        <Route element={<MainLayout navbarProps={{ showInicio: true, showProductos: true, showCategorias: true, showCart: true, showProfile: true }} />}>
                            <Route path="/categoria/:slug" element={<ProductsByCategoryPage />} />
                        </Route>

                        <Route element={<MainLayout navbarProps={{ showInicio: true, showProductos: true, showProfile: true, showQuienesSomos: true }} />}>
                            <Route path="/CategoryPage" element={<CategoryPage />} />
                        </Route>

                        <Route element={<MainLayout navbarProps={{ showInicio: true, showProductos: true, showCategorias: true, showCart: true, showProfile: true }} />}>
                            <Route path="/Productos" element={<ProductosPage />} />
                        </Route>

                        <Route element={<DashboardLayout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/misFavoritos" element={<DashboardFavorites />} />
                            <Route path="/DashBoardGraficos" element={<DashboardGraficos />} />
                            <Route path="/MensajesAreaSocial" element={<MensajesAreaSocial />} />
                            <Route path="/DashBoardAgregarProducto" element={<DashboardAgregarProducto />} />
                            <Route path="/actualizacionUsuario" element={<ActualizacionUsuario />} />
                        </Route>


                        <Route element={<PaymentProvider><PaymentLayout /></PaymentProvider>}>
                            <Route path="/payment/checkout" element={<CheckoutSummaryPage />} />
                            <Route path="/payment/MercadoPayment" element={<MercadoPagoPayment />} />
                            <Route path="/payment/success" element={<StatusSucesfull />} />
                            <Route path="/payment/pending" element={<StatusPending />} />
                            <Route path="/payment/failure" element={<StatusFailure />} />
                        </Route>

                    </Route>

                    {/* Admin */}
                    <Route element={<ProtectedRoute requireAdmin />}>
                        <Route element={<AdminDashboardLayout />}>
                            <Route path="/admin-dashboard" element={<DashboardAdmin />} />
                            <Route path="/admin/stats" element={<AdminStats />} />
                            <Route path="/admin/usuarios" element={<AdminUsers />} />
                            <Route path="/admin/productos" element={<AdminProducts />} />
                            <Route path="/admin/reportes" element={<AdminReports />} />
                            <Route path="/admin/config" element={<AdminConfig />} />
                            <Route path="/admin/registrar" element={<AdminRegister />} />
                            <Route path="/admin/perfil" element={<ActualizacionUsuario />} />
                        </Route>
                    </Route>

                    {/* Auth */}
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/forgot-password-mobile" element={<ForgotPasswordMobile />} />
                        <Route path="/RegisterMobile" element={<RegisterMobilePage />} />

                    </Route>

                    <Route path="*" element={<Navigate to="/" />} />

                </Routes>
            </BrowserRouter>
        </CartProvider>
    );
}

export default App;
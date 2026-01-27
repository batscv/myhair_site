import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import Bestsellers from "./pages/Bestsellers";
import NewArrivals from "./pages/NewArrivals";
import CategoryProducts from "./pages/CategoryProducts";
import Offers from "./pages/Offers";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminCoupons from "./pages/admin/AdminCoupons";
import AdminPopups from "./pages/admin/AdminPopups";
import { AdminLayout } from "./components/AdminLayout";
import { CartProvider } from "./context/CartContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/produto/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/perfil" element={<Profile />} />
            <Route path="/produtos" element={<Products />} />
            <Route path="/mais-vendidos" element={<Bestsellers />} />
            <Route path="/lancamentos" element={<NewArrivals />} />
            <Route path="/categoria/:name" element={<CategoryProducts />} />
            <Route path="/ofertas" element={<Offers />} />

            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="produtos" element={<AdminProducts />} />
              <Route path="categorias" element={<AdminCategories />} />
              <Route path="banners" element={<AdminBanners />} />
              <Route path="marcas" element={<AdminBrands />} />
              <Route path="pedidos" element={<AdminOrders />} />
              <Route path="usuarios" element={<AdminUsers />} />
              <Route path="avaliacoes" element={<AdminReviews />} />
              <Route path="cupons" element={<AdminCoupons />} />
              <Route path="popups" element={<AdminPopups />} />
              <Route path="configuracoes" element={<AdminSettings />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;

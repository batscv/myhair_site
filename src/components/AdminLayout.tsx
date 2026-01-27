import { useState } from "react";
import { Link, useNavigate, Outlet } from "react-router-dom";
import {
    LayoutDashboard,
    Package,
    Tags,
    Image as ImageIcon,
    LogOut,
    Menu,
    X,
    User,
    Users,
    MessageSquare,
    Star,
    ShoppingBag,
    Tag,
    Settings
} from "lucide-react";
import { Button } from "./ui/button";

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: MessageSquare, label: "Avaliações", path: "/admin/avaliacoes" },
    { icon: Users, label: "Clientes", path: "/admin/usuarios" },
    { icon: ShoppingBag, label: "Pedidos", path: "/admin/pedidos" },
    { icon: Package, label: "Produtos", path: "/admin/produtos" },
    { icon: Tags, label: "Categorias", path: "/admin/categorias" },
    { icon: Tag, label: "Cupons", path: "/admin/cupons" },
    { icon: MessageSquare, label: "Pop-ups", path: "/admin/popups" },
    { icon: ImageIcon, label: "Banners", path: "/admin/banners" },
    { icon: Star, label: "Marcas", path: "/admin/marcas" },
    { icon: Settings, label: "Configurações", path: "/admin/configuracoes" },
];

export function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("adminUser");
        navigate("/admin/login");
    };

    return (
        <div className="flex h-screen bg-secondary/30">
            {/* Sidebar */}
            <aside className={`${isSidebarOpen ? "w-64" : "w-20"} bg-charcoal text-white transition-all duration-300 flex flex-col`}>
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen && (
                        <h1 className="text-xl font-serif font-bold tracking-tight">
                            <span>MY</span>
                            <span className="text-primary"> ADMIN</span>
                        </h1>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded">
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                        >
                            <item.icon size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            {isSidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 w-full rounded-lg hover:bg-rose/20 text-rose-400 transition-colors"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="text-sm font-medium">Sair</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white border-b border-border p-4 flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-medium text-foreground capitalize">
                        {window.location.pathname.split("/").pop() || "Dashboard"}
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">Admin</span>
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                            <User size={18} className="text-primary" />
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

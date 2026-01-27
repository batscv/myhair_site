import { Search, User, ShoppingBag, Menu, X, Star, Package, Sparkles, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "./CartDrawer";
import { Link, useLocation } from "react-router-dom";
import { fetchSettings } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { name: "Produtos", path: "/produtos", icon: Package },
  { name: "Mais Vendidos", path: "/mais-vendidos", icon: Star },
  { name: "Lançamentos", path: "/lancamentos", icon: Sparkles },
  { name: "Cabelos", path: "/categoria/cabelos" },
  { name: "Maquiagem", path: "/categoria/maquiagem" },
  { name: "Skincare", path: "/categoria/skincare" },
  { name: "Ofertas", path: "/ofertas" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItems, totalPrice } = useCart();
  const location = useLocation();

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { fetchSearchSuggestions } = await import("@/lib/api");
          const data = await fetchSearchSuggestions(searchQuery);
          setSuggestions(data);
        } catch (e) {
          console.error(e);
        }
      } else {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const topBarText = settings?.header_top_bar || "Frete Grátis para compras acima de 299 ECV";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="bg-charcoal text-primary-foreground text-[10px] md:text-xs py-2 text-center uppercase tracking-widest font-bold">
        <span>{topBarText} | total: {totalPrice.toFixed(2)} ECV</span>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl md:text-3xl font-serif font-bold tracking-tight">
              <span className="text-foreground">MY</span>
              <span className="text-primary"> HAIR</span>
            </h1>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8 relative">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar produtos, marcas..."
                className="input-search pr-10 bg-secondary/50 border-none focus:bg-white"
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
                onFocus={() => setShowSuggestions(true)}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-secondary/30 border-b border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sugestões de Produtos</p>
                </div>
                <div className="max-h-[300px] overflow-auto">
                  {suggestions.map((item: any) => (
                    <Link
                      key={item.id}
                      to={`/produto/${item.id}`}
                      className="flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors border-b border-border/50 last:border-none"
                      onClick={() => {
                        setSearchQuery("");
                        setShowSuggestions(false);
                      }}
                    >
                      <img src={item.image} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-bold text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs font-bold text-primary">{Number(item.price || 0).toFixed(2)} ECV</p>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to={`/produtos?search=${searchQuery}`}
                  className="block p-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-colors"
                  onClick={() => setShowSuggestions(false)}
                >
                  Ver todos os resultados
                </Link>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-4">
            {localStorage.getItem("user") ? (
              <div className="flex items-center gap-1 md:gap-4">
                <Link to="/perfil" className="flex items-center gap-1 md:gap-2 group">
                  <span className="text-xs font-bold hidden sm:inline text-foreground/80 group-hover:text-primary transition-colors">
                    Olá, {JSON.parse(localStorage.getItem("user")!).nome.split(' ')[0]}
                  </span>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-all">
                    <User size={18} className="text-primary" />
                  </div>
                </Link>
                <button
                  title="Sair"
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.reload();
                  }}
                  className="p-2 text-muted-foreground hover:text-rose-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                <Link to="/login"><User size={20} className="text-foreground" /></Link>
              </Button>
            )}

            <CartDrawer>
              <Button variant="ghost" size="icon" className="relative group h-10 w-10">
                <ShoppingBag size={20} className="text-foreground group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center shadow-lg">
                    {totalItems}
                  </span>
                )}
              </Button>
            </CartDrawer>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden lg:block bg-white/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-4">
          <ul className="flex items-center justify-center gap-10 py-3">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link
                  to={cat.path}
                  className={`relative py-1 text-[11px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === cat.path ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-foreground/70"
                    } ${cat.name === "Ofertas" ? "text-rose-600" : ""}`}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-border shadow-2xl animate-in slide-in-from-top duration-300">
          <nav className="p-6">
            <ul className="space-y-6">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    to={cat.path}
                    className={`flex items-center justify-between text-xs font-bold uppercase tracking-widest ${location.pathname === cat.path ? "text-primary" : "text-foreground"
                      }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>{cat.name}</span>
                    {cat.icon && <cat.icon size={16} className="text-primary/40" />}
                  </Link>
                </li>
              ))}
              <li className="pt-4 border-t border-border">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                  <User size={18} className="text-primary" />
                  <span>Minha Conta</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

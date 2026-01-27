import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchCategories } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Filter, Search, DollarSign, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export default function ProductsPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedCategory, setSelectedCategory] = useState<string>("Tudo");
    const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
    const [priceRange, setPriceRange] = useState([0, 5000]);

    useEffect(() => {
        const search = searchParams.get("search");
        if (search !== null) {
            setSearchQuery(search);
        }
    }, [searchParams]);

    const { data: products, isLoading, refetch } = useQuery({
        queryKey: ['products', selectedCategory, searchQuery, priceRange],
        queryFn: () => fetchProducts({
            category: selectedCategory === "Tudo" ? undefined : selectedCategory,
            search: searchQuery,
            minPrice: priceRange[0],
            maxPrice: priceRange[1]
        })
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });

    return (
        <div className="min-h-screen bg-secondary/20 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 translate-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Explorar Produtos</h1>
                        <p className="text-muted-foreground mt-1 tracking-tight">Encontre os melhores tratamentos na moeda real (ECV)</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar produto ou marca..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none shadow-sm transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar de Filtros */}
                    <aside className="w-full lg:w-72 space-y-6">
                        {/* Categorias */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                <Filter size={14} className="text-primary" />
                                <span>Categorias</span>
                            </div>
                            <div className="space-y-1">
                                <button
                                    onClick={() => setSelectedCategory("Tudo")}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategory === "Tudo" ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                                >
                                    Tudo
                                </button>
                                {categories?.map((cat: any) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.nome)}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all ${selectedCategory === cat.nome ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"}`}
                                    >
                                        {cat.nome}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Filtro de Preço */}
                        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                            <div className="flex items-center gap-2 mb-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                                <DollarSign size={14} className="text-primary" />
                                <span>Faixa de Preço</span>
                            </div>
                            <div className="px-2">
                                <Slider
                                    defaultValue={[0, 5000]}
                                    max={5000}
                                    step={50}
                                    value={priceRange}
                                    onValueChange={setPriceRange}
                                    className="mb-6"
                                />
                                <div className="flex justify-between items-center text-xs font-bold font-serif text-foreground bg-secondary/30 p-3 rounded-xl">
                                    <span>{priceRange[0]} ECV</span>
                                    <span className="text-muted-foreground font-sans uppercase text-[8px]">Até</span>
                                    <span>{priceRange[1]} ECV</span>
                                </div>
                            </div>
                        </div>

                        {/* Reset Filtros */}
                        <button
                            onClick={() => {
                                setSelectedCategory("Tudo");
                                setSearchQuery("");
                                setPriceRange([0, 5000]);
                            }}
                            className="w-full py-4 border border-dashed border-border rounded-2xl text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:bg-secondary/20 hover:text-foreground transition-all flex items-center justify-center gap-2"
                        >
                            <X size={14} /> Limpar Todos os Filtros
                        </button>
                    </aside>

                    {/* Grid de Produtos */}
                    <div className="flex-1">
                        {isLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-border" />)}
                            </div>
                        ) : !products || products.length === 0 ? (
                            <div className="py-24 text-center bg-white/50 rounded-3xl border border-dashed border-border flex flex-col items-center justify-center">
                                <div className="bg-secondary/20 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                                    <Search size={40} className="text-muted-foreground/20" />
                                </div>
                                <h3 className="text-2xl font-serif font-bold text-foreground mb-2">Nenhum resultado</h3>
                                <p className="text-muted-foreground max-w-xs mx-auto">Não encontramos produtos com os critérios selecionados. Tente ajustar sua busca.</p>
                                <button
                                    onClick={() => { setSelectedCategory("Tudo"); setPriceRange([0, 5000]); setSearchQuery(""); }}
                                    className="mt-8 px-8 py-3 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-charcoal/90 transition-all"
                                >
                                    Ver Todos os Produtos
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products?.map((product: any) => (
                                    <div key={product.id} className="animate-in fade-in duration-500">
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}


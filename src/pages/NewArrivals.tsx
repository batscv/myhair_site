import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sparkles, Zap, Clock } from "lucide-react";

export default function NewArrivalsPage() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const newArrivals = products?.filter((p: any) => p.tag === 'new');

    return (
        <div className="min-h-screen bg-secondary/10 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground rounded-3xl p-8 mb-12 relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Sparkles size={24} />
                            </div>
                            <span className="font-bold tracking-widest text-xs uppercase">Tendências & Novidades</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Lançamentos</h1>
                        <p className="text-white/80 text-lg">Descubra em primeira mão as últimas inovações e as fórmulas mais modernas que acabaram de chegar.</p>
                    </div>

                    {/* Decorative icons */}
                    <div className="absolute right-[-30px] top-[-30px] opacity-10">
                        <Zap size={240} className="fill-white" />
                    </div>
                    <div className="absolute right-[5%] bottom-[-40px] opacity-10">
                        <Clock size={160} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-border" />)}
                    </div>
                ) : !newArrivals || newArrivals.length === 0 ? (
                    <div className="py-20 text-center">
                        <h3 className="text-xl font-bold opacity-30 italic">Nenhum lançamento novo no momento. Fique de olho!</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {newArrivals?.map((product: any) => (
                            <div key={product.id} className="relative group">
                                <div className="absolute -top-3 -left-3 z-10 bg-charcoal text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                                    NOVIDADE
                                </div>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Benefits section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
                    <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Zap className="text-primary" size={24} />
                        </div>
                        <h4 className="font-bold mb-2">Exclusividade</h4>
                        <p className="text-sm text-muted-foreground">Produtos selecionados que você só encontra aqui.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="text-primary" size={24} />
                        </div>
                        <h4 className="font-bold mb-2">Inovação</h4>
                        <p className="text-sm text-muted-foreground">Fórmulas de última geração para resultados profissionais.</p>
                    </div>
                    <div className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-primary" size={24} />
                        </div>
                        <h4 className="font-bold mb-2">Rapidez</h4>
                        <p className="text-sm text-muted-foreground">Receba as novidades do mercado mundial em tempo recorde.</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

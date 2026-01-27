import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Trophy, TrendingUp, Star } from "lucide-react";

export default function BestsellersPage() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const bestsellers = products?.filter((p: any) => p.tag === 'bestseller');

    return (
        <div className="min-h-screen bg-secondary/10 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="bg-charcoal text-white rounded-3xl p-8 mb-12 relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Trophy className="text-primary" size={24} />
                            </div>
                            <span className="text-primary font-bold tracking-widest text-xs uppercase">Favoritos dos Clientes</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Mais Vendidos</h1>
                        <p className="text-white/60 text-lg">Os produtos preferidos de quem não abre mão da excelência em beleza e cuidado capilar.</p>
                    </div>

                    {/* Decorative icons */}
                    <div className="absolute right-[-20px] top-[-20px] opacity-10">
                        <Star size={240} className="text-primary fill-primary" />
                    </div>
                    <div className="absolute right-[10%] bottom-[-50px] opacity-5">
                        <TrendingUp size={180} />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-border" />)}
                    </div>
                ) : bestsellers?.length === 0 ? (
                    <div className="py-20 text-center">
                        <h3 className="text-xl font-bold opacity-30 italic">Nenhum bestseller definido no momento.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {bestsellers?.map((product: any) => (
                            <div key={product.id} className="relative group">
                                <div className="absolute -top-3 -left-3 z-10 bg-primary text-primary-foreground text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                                    TOP VENDIDO
                                </div>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}

                {/* Proof section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center pb-12">
                    <div className="p-6">
                        <div className="text-3xl font-serif font-bold text-charcoal mb-2">+15.000</div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Clientes Satisfeitos</p>
                    </div>
                    <div className="p-6 border-x border-border">
                        <div className="text-3xl font-serif font-bold text-charcoal mb-2">4.9/5</div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Avaliação Média</p>
                    </div>
                    <div className="p-6">
                        <div className="text-3xl font-serif font-bold text-charcoal mb-2">100%</div>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Originalidade Garantida</p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

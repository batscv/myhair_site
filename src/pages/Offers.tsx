import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Percent, Tag } from "lucide-react";

export default function OffersPage() {
    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const offers = products?.filter((p: any) =>
        (p.originalPrice && p.price < p.originalPrice) || p.tag === 'sale'
    );

    return (
        <div className="min-min-h-screen bg-rose/5 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="bg-rose-600 text-white rounded-3xl p-8 mb-12 relative overflow-hidden shadow-xl">
                    <div className="relative z-10 max-w-2xl">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Percent size={24} />
                            </div>
                            <span className="font-bold tracking-widest text-xs uppercase">Preços Imbatíveis</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Aproveite as Ofertas</h1>
                        <p className="text-white/80 text-lg">As melhores marcas com descontos exclusivos. Não perca a chance de garantir seus favoritos.</p>
                    </div>

                    <div className="absolute right-[-20px] top-[-20px] opacity-10">
                        <Tag size={240} className="fill-white rotate-12" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-border" />)}
                    </div>
                ) : !offers || offers.length === 0 ? (
                    <div className="py-20 text-center">
                        <h3 className="text-xl font-bold opacity-30 italic">No momento não temos ofertas ativas. Volte logo!</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {offers?.map((product: any) => (
                            <div key={product.id} className="relative group">
                                <div className="absolute -top-3 -left-3 z-10 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg transform -rotate-12 group-hover:rotate-0 transition-transform">
                                    OFERTA ESPECIAL
                                </div>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

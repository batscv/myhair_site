import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";
import { ProductCard } from "@/components/ProductCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useParams } from "react-router-dom";
import { Scissors, Sparkles, Heart } from "lucide-react";

export default function CategoryProducts() {
    const { name } = useParams<{ name: string }>();
    const categoryName = name ? name.charAt(0).toUpperCase() + name.slice(1) : "";

    const { data: products, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    });

    const filteredProducts = products?.filter((p: any) =>
        p.category?.toLowerCase() === name?.toLowerCase()
    );

    const getIcon = () => {
        switch (name?.toLowerCase()) {
            case 'cabelos': return <Scissors className="text-primary" size={24} />;
            case 'maquiagem': return <Sparkles className="text-primary" size={24} />;
            case 'skincare': return <Heart className="text-primary" size={24} />;
            default: return <Sparkles className="text-primary" size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-background font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-primary/10 rounded-xl">
                            {getIcon()}
                        </div>
                        <span className="text-primary font-bold tracking-widest text-xs uppercase">Categoria</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground capitalize">{categoryName}</h1>
                    <div className="h-1 w-20 bg-primary mt-4 rounded-full" />
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="aspect-[3/4] bg-white animate-pulse rounded-2xl border border-border" />)}
                    </div>
                ) : !filteredProducts || filteredProducts.length === 0 ? (
                    <div className="py-24 text-center bg-secondary/20 rounded-3xl border border-dashed border-border">
                        <h3 className="text-xl font-bold opacity-30 italic">Em breve teremos produtos incríveis nesta categoria.</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts?.map((product: any) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

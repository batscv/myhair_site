import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { BrandsCarousel } from "@/components/BrandsCarousel";
import { ProductGrid } from "@/components/ProductGrid";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";
import { PromoPopup } from "@/components/PromoPopup";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "@/lib/api";

const Index = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    retry: 1
  });

  // Garante que products seja um array antes de filtrar
  const safeProducts = Array.isArray(products) ? products : [];

  const bestSellerProducts = safeProducts.filter((p: any) => p.tag === 'bestseller');
  const newProducts = safeProducts.filter((p: any) => p.tag === 'new');

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-bold mb-2">Erro de Conexão</h2>
        <p className="text-muted-foreground mb-4">Não foi possível conectar ao servidor da API.</p>
        <pre className="text-xs bg-secondary p-2 rounded max-w-full overflow-auto mb-4">{(error as Error).message}</pre>
        <button onClick={() => window.location.reload()} className="btn-gold px-6 py-2 rounded-full">Tentar Novamente</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-32 md:pt-44">
        <HeroBanner />

        <BrandsCarousel />

        {isLoading ? (
          <div className="py-20 text-center">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-48 bg-muted rounded mb-8"></div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-6xl px-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-muted rounded-lg"></div>)}
              </div>
            </div>
          </div>
        ) : (
          <>
            <ProductGrid
              title="Mais Vendidos"
              products={bestSellerProducts}
              viewAllLink="/mais-vendidos"
            />

            <div className="bg-cream">
              <ProductGrid
                title="Lançamentos"
                products={newProducts}
                viewAllLink="/lancamentos"
              />
            </div>
          </>
        )}

        <Newsletter />
      </main>

      <Footer />
      <PromoPopup />
    </div>
  );
};

export default Index;

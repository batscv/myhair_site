import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductInfo } from "@/components/ProductInfo";
import { ProductTabs } from "@/components/ProductTabs";
import { ProductGrid } from "@/components/ProductGrid";
import { ChevronRight, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProductById, fetchReviewsByProduct, fetchProducts } from "@/lib/api";

const ProductDetail = () => {
  const { id } = useParams();
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id!),
    enabled: !!id
  });

  const { data: products } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => fetchReviewsByProduct(id!),
    enabled: !!id
  });

  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Carregando produto...</p>
    </div>
  );

  if (error || !product) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
      <p>Produto não encontrado.</p>
      <Link to="/" className="btn-gold px-6 py-2 rounded-full">Voltar para Home</Link>
    </div>
  );

  // Calcula estatísticas reais das avaliações
  const dynamicRating = reviews?.length > 0
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.estrelas, 0) / reviews.length).toFixed(1)
    : product.rating;

  const dynamicReviewCount = reviews?.length || product.reviewCount;

  const productWithDynamicStats = {
    ...product,
    rating: Number(dynamicRating),
    reviewCount: dynamicReviewCount
  };

  const relatedProducts = Array.isArray(products)
    ? products.filter((p: any) => p.category === product.category && p.id !== product.id).slice(0, 4)
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8 pt-32 md:pt-44 text-foreground bg-background">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight size={14} />
          <span className="hover:text-foreground transition-colors cursor-pointer">
            {product.category || "Cabelos"}
          </span>
          <ChevronRight size={14} />
          <span className="text-foreground">{product.brand}</span>
        </nav>

        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          <ProductGallery images={product.images || [product.image]} />
          <ProductInfo product={productWithDynamicStats} />
        </div>

        {/* Tabs Section */}
        {product.mostrar_modo_uso === 1 && product.modo_uso && (
          <section className="mb-16 bg-secondary/20 p-8 rounded-3xl border border-border animate-in fade-in duration-500">
            <h3 className="text-xl font-serif font-bold text-foreground mb-4 flex items-center gap-2">
              <Sparkles size={20} className="text-primary" />
              Modo de Uso
            </h3>
            <div className="text-muted-foreground whitespace-pre-line leading-relaxed">
              {product.modo_uso}
            </div>
          </section>
        )}
        <ProductTabs product={productWithDynamicStats} />

        {/* Related Products */}
        <section className="mt-16">
          <ProductGrid
            title="Produtos Relacionados"
            products={relatedProducts}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

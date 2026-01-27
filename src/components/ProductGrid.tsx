import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  title: string;
  products: Array<{
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    tag?: "bestseller" | "new";
    rating: number;
  }>;
  viewAllLink?: string;
}

export function ProductGrid({ title, products, viewAllLink }: ProductGridProps) {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h2 className="section-title">{title}</h2>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Ver Todos →
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

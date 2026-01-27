import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    image: string;
    tag?: "bestseller" | "new";
    rating: number;
    estoque: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;

  const discount = originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  return (
    <Link to={`/produto/${product.id}`} className="card-product group block">
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Tags */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.tag === "bestseller" && (
            <span className="tag-bestseller">Mais Vendido</span>
          )}
          {product.tag === "new" && (
            <span className="tag-new">Lançamento</span>
          )}
          {discount > 0 && (
            <span className="tag-badge bg-charcoal text-primary-foreground">
              -{discount}%
            </span>
          )}
          {product.estoque === 0 && (
            <span className="tag-badge bg-rose-500 text-white font-black">
              ESGOTADO
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button className="absolute top-3 right-3 p-2 bg-background/90 rounded-full opacity-0 group-hover:opacity-100 hover:bg-background transition-all duration-300 shadow-sm">
          <Heart size={18} className="text-foreground" />
        </button>

        {/* Quick add button */}
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-charcoal/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            onClick={handleAddToCart}
            disabled={product.estoque === 0}
            className={`w-full btn-gold rounded-full text-sm ${product.estoque === 0 ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            <ShoppingBag size={16} className="mr-2" />
            {product.estoque === 0 ? 'Indisponível' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
          {product.brand}
        </p>
        <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2 min-h-[40px]">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-xs ${i < product.rating ? "text-primary" : "text-border"
                }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-foreground">
            {price.toFixed(2)} ECV
          </span>
          {originalPrice > 0 && (
            <span className="text-xs text-muted-foreground line-through">
              {originalPrice.toFixed(2)} ECV
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          ou 6x de {(price / 6).toFixed(2)} ECV
        </p>
      </div>
    </Link>
  );
}

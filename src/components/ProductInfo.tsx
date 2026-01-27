import { useState, useEffect } from "react";
import { Heart, ShoppingBag, Truck, ShieldCheck, RotateCcw, Minus, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  product: {
    id: number;
    name: string;
    brand: string;
    price: number;
    originalPrice?: number;
    rating: number;
    reviewCount?: number;
    description?: string;
    sku?: string;
    image: string;
    estoque: number;
    variations?: Array<{ id: number; nome: string; estoque: number }>;
  };
}

export function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariation, setSelectedVariation] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (product.variations?.length > 0 && !selectedVariation) {
      setSelectedVariation(product.variations[0]);
    }
  }, [product.variations]);

  const price = Number(product.price) || 0;
  // ... (discount and prices unchanged)

  const handleAddToCart = () => {
    addItem({ ...product, selectedVariation }, quantity);
  };

  const handleBuyNow = () => {
    toast.success("Redirecionando para o checkout...");
  };

  return (
    <div className="space-y-6">
      {/* ... (Header, Title, Rating, Price unchanged) */}

      {/* Variation Selector */}
      {product.variations?.length > 0 && (
        <div className="space-y-3">
          <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            Escolha uma opção
          </span>
          <div className="flex flex-wrap gap-2">
            {product.variations.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariation(v)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${selectedVariation?.id === v.id
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border hover:border-muted-foreground text-muted-foreground"
                  }`}
              >
                {v.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-foreground">Quantidade:</span>
        <div className="flex items-center border border-border rounded-full">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="p-2 hover:bg-secondary rounded-l-full transition-colors"
          >
            <Minus size={18} />
          </button>
          <span className="px-4 text-lg font-medium">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            disabled={selectedVariation ? quantity >= selectedVariation.estoque : quantity >= (product.estoque || 99)}
            className="p-2 hover:bg-secondary rounded-r-full transition-colors font-bold"
          >
            <Plus size={18} />
          </button>
        </div>
        {selectedVariation && (
          <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
            {selectedVariation.estoque} disponíveis
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          variant="outline"
          className="flex-1 py-6 rounded-full border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
        >
          <ShoppingBag size={20} className="mr-2" />
          Adicionar ao Carrinho
        </Button>
        <Button
          onClick={handleBuyNow}
          className="flex-1 py-6 btn-gold rounded-full"
        >
          Comprar Agora
        </Button>
        <Button
          variant="outline"
          size="icon"
          className={`h-14 w-14 rounded-full border-2 transition-all ${isFavorite ? "bg-rose text-white border-rose" : "border-border hover:border-rose hover:text-rose"
            }`}
          onClick={() => {
            setIsFavorite(!isFavorite);
            toast.success(isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos");
          }}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </Button>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-full">
            <Truck size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Frete Grátis</p>
            <p className="text-xs text-muted-foreground">Acima de R$ 299</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-full">
            <ShieldCheck size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Produto Original</p>
            <p className="text-xs text-muted-foreground">100% autêntico</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-secondary rounded-full">
            <RotateCcw size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Troca Fácil</p>
            <p className="text-xs text-muted-foreground">Até 30 dias</p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Star, ThumbsUp, User, PenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewsByProduct } from "@/lib/api";
import { ReviewForm } from "./ReviewForm";
import { Link } from "react-router-dom";

interface ProductReviewsProps {
  productId: number;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [showForm, setShowForm] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<number[]>([]);

  const { data: reviews, isLoading, refetch } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: () => fetchReviewsByProduct(productId),
    enabled: !!productId
  });

  const isUserLoggedIn = !!localStorage.getItem("user");

  // Cálculos de distribuição
  const totalReviews = reviews?.length || 0;
  const ratingCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews?.filter((r: any) => r.estrelas === stars).length || 0
  }));

  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.estrelas, 0) / totalReviews).toFixed(1)
    : "0.0";

  const handleHelpful = (reviewId: number) => {
    if (!helpfulClicked.includes(reviewId)) {
      setHelpfulClicked([...helpfulClicked, reviewId]);
    }
  };

  if (isLoading) return <div className="py-10 text-center text-muted-foreground">Carregando avaliações...</div>;

  return (
    <div className="space-y-8">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 bg-secondary/50 rounded-2xl">
        {/* Average rating */}
        <div className="text-center md:text-left">
          <div className="flex items-baseline justify-center md:justify-start gap-2 mb-2">
            <span className="text-5xl font-bold text-foreground">{averageRating}</span>
            <span className="text-2xl text-muted-foreground">/5</span>
          </div>
          <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={24}
                className={i < Math.round(Number(averageRating)) ? "text-primary fill-primary" : "text-border"}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Baseado em {totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}
          </p>
        </div>

        {/* Rating distribution */}
        <div className="space-y-2">
          {ratingCounts.map((item) => (
            <div key={item.stars} className="flex items-center gap-3">
              <span className="text-sm font-medium w-16 flex items-center gap-1">
                {item.stars} <Star size={12} className="text-primary fill-primary" />
              </span>
              <Progress
                value={totalReviews > 0 ? (item.count / totalReviews) * 100 : 0}
                className="h-2 flex-1"
              />
              <span className="text-sm text-muted-foreground w-10 text-right">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write review trigger or warning */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-foreground font-serif">
          Opinões dos Clientes
        </h3>
        {!showForm && (
          isUserLoggedIn ? (
            <Button onClick={() => setShowForm(true)} variant="outline" className="rounded-full gap-2 border-primary text-primary hover:bg-primary/10">
              <PenLine size={18} /> Escrever Avaliação
            </Button>
          ) : (
            <p className="text-xs text-muted-foreground">
              <Link to="/login" className="text-primary font-bold hover:underline">Faça login</Link> para avaliar este produto.
            </p>
          )
        )}
      </div>

      {showForm && (
        <ReviewForm
          productId={productId}
          onSuccess={() => { setShowForm(false); refetch(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Reviews list */}
      <div className="space-y-6">
        {reviews?.map((review: any) => (
          <div key={review.id} className="border-b border-border pb-6 last:border-0 hover:bg-secondary/5 transition-colors p-4 rounded-xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={20} className="text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{review.author}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-bold uppercase">
                      Verificado
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(review.data_criacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.estrelas ? "text-primary fill-primary" : "text-border"}
                  />
                ))}
              </div>
            </div>

            <h4 className="font-bold text-foreground mb-1">{review.titulo}</h4>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">{review.comentario}</p>

            <button
              onClick={() => handleHelpful(review.id)}
              className={`flex items-center gap-2 text-xs transition-colors p-1.5 rounded-lg ${helpfulClicked.includes(review.id)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-secondary"
                }`}
              disabled={helpfulClicked.includes(review.id)}
            >
              <ThumbsUp size={14} />
              <span>
                Útil ({helpfulClicked.includes(review.id) ? 1 : 0})
              </span>
            </button>
          </div>
        ))}

        {reviews?.length === 0 && !showForm && (
          <div className="text-center py-10 bg-secondary/20 rounded-2xl border-2 border-dashed border-border">
            <p className="text-muted-foreground">Este produto ainda não possui avaliações. Seja o primeiro!</p>
          </div>
        )}
      </div>
    </div>
  );
}

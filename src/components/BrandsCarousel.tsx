import { ChevronLeft, ChevronRight, Bookmark } from "lucide-react";
import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMarcas } from "@/lib/api";

const defaultBrands = [
  { nome: "L'Oréal Professionnel", logo: "LP" },
  { nome: "Kérastase", logo: "KS" },
  { nome: "Redken", logo: "RD" },
  { nome: "Wella", logo: "WL" },
];

export function BrandsCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: apiMarcas, isLoading } = useQuery({
    queryKey: ['marcas'],
    queryFn: fetchMarcas
  });

  const brands = apiMarcas && apiMarcas.length > 0 ? apiMarcas : [];

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!isLoading && brands.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">Marcas em Destaque</h2>
            <p className="text-muted-foreground text-sm">Trabalhamos com os melhores parceiros internacionais</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 rounded-full border border-border hover:bg-secondary transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {brands.map((brand: any) => (
            <div
              key={brand.id || brand.nome}
              className="flex-shrink-0 group cursor-pointer"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl flex items-center justify-center border border-border group-hover:border-primary/50 group-hover:shadow-lg transition-all duration-300 p-6">
                {brand.imagem_url ? (
                  <img src={brand.imagem_url} alt={brand.nome} className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                ) : (
                  <span className="text-2xl md:text-3xl font-serif font-bold text-foreground/70 group-hover:text-primary transition-colors">
                    {brand.nome.substring(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-widest text-center text-muted-foreground group-hover:text-foreground transition-colors">
                {brand.nome}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

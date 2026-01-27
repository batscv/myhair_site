import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchBanners } from "@/lib/api";

const defaultBanners = [
  {
    id: 1,
    titulo: "Cuide dos seus cabelos",
    subtitulo: "com as melhores marcas profissionais",
    link: "#",
    tag: "Até 40% OFF",
    imagem_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1600&h=600&fit=crop"
  }
];

export function HeroBanner() {
  const { data: apiBanners } = useQuery({
    queryKey: ['banners'],
    queryFn: fetchBanners
  });

  const banners = apiBanners && apiBanners.length > 0 ? apiBanners : defaultBanners;
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const banner = banners[currentBanner];

  return (
    <section className="relative overflow-hidden bg-charcoal min-h-[350px] md:min-h-[450px] flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <picture key={banner.id}>
          {banner.imagem_mobile_url && (
            <source media="(max-width: 768px)" srcSet={banner.imagem_mobile_url} />
          )}
          <img
            src={banner.imagem_url}
            className="w-full h-full object-cover transition-all duration-1000"
            alt={banner.titulo}
          />
        </picture>
        {/* Overlay para contraste do texto - apenas o necessário */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 md:from-black/60 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        {(banner.mostrar_texto !== 0) && (
          <div className="max-w-3xl animate-fade-up">
            {banner.tag && (
              <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-widest rounded-sm mb-3">
                {banner.tag}
              </span>
            )}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-3 leading-tight">
              {banner.titulo}
            </h2>
            <p className="text-base md:text-lg text-white/80 mb-6 max-w-lg">
              {banner.subtitulo}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" className="btn-gold px-8 py-5 text-sm rounded-full shadow-lg hover:shadow-gold/20 transition-all font-bold" asChild>
                <a href={banner.link || "#"}>Ver Ofertas</a>
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-5 text-sm rounded-full border-white text-white hover:bg-white hover:text-charcoal transition-all font-bold">
                Explorar
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors z-20"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/80 hover:bg-background shadow-md transition-colors z-20"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
      {/* Dots */}
      {banners.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${index === currentBanner
                ? "bg-primary w-8"
                : "bg-white/20 hover:bg-white/40"
                }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

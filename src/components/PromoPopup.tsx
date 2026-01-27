import { useState, useEffect } from "react";
import { X, ExternalLink } from "lucide-react";
import { fetchActivePopup } from "@/lib/api";
import { Button } from "./ui/button";

export function PromoPopup() {
    const [popup, setPopup] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const hasSeenPopup = sessionStorage.getItem("hasSeenPromoPopup");

        if (!hasSeenPopup) {
            const loadPopup = async () => {
                try {
                    const activePopup = await fetchActivePopup();
                    if (activePopup) {
                        setPopup(activePopup);
                        // Pequeno delay para não aparecer instantaneamente
                        setTimeout(() => setIsOpen(true), 2000);
                    }
                } catch (error) {
                    console.error("Erro ao carregar popup:", error);
                }
            };
            loadPopup();
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        sessionStorage.setItem("hasSeenPromoPopup", "true");
    };

    if (!isOpen || !popup) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 border border-white/20">
                {/* Botão Fechar */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal rounded-full transition-colors backdrop-blur-md"
                >
                    <X size={20} />
                </button>

                {/* Imagem (Clicável se houver link) */}
                <div className="relative aspect-[4/3] sm:aspect-video overflow-hidden">
                    {popup.link ? (
                        <a href={popup.link} onClick={handleClose}>
                            <img
                                src={popup.imagem}
                                alt={popup.titulo}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </a>
                    ) : (
                        <img
                            src={popup.imagem}
                            alt={popup.titulo}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Conteúdo Contextual */}
                <div className="p-8 text-center space-y-4">
                    {popup.titulo && (
                        <h3 className="text-2xl font-serif font-bold text-foreground">
                            {popup.titulo}
                        </h3>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                        {popup.link && (
                            <Button asChild className="btn-gold rounded-full px-8 py-6 w-full sm:w-auto font-bold shadow-gold/20">
                                <a href={popup.link} onClick={handleClose}>
                                    Aproveitar Agora <ExternalLink size={16} className="ml-2" />
                                </a>
                            </Button>
                        )}
                        <button
                            onClick={handleClose}
                            className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Talvez mais tarde
                        </button>
                    </div>
                </div>

                {/* Decoração sutil */}
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}

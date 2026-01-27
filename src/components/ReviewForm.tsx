import { useState } from "react";
import { Star, X } from "lucide-react";
import { Button } from "./ui/button";
import { postReview } from "@/lib/api";
import { toast } from "sonner";

interface ReviewFormProps {
    productId: number;
    onSuccess: () => void;
    onCancel: () => void;
}

export function ReviewForm({ productId, onSuccess, onCancel }: ReviewFormProps) {
    const [estrelas, setEstrelas] = useState(5);
    const [hover, setHover] = useState(0);
    const [titulo, setTitulo] = useState("");
    const [comentario, setComentario] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user.id) {
            toast.error("Você precisa estar logado para avaliar.");
            return;
        }

        setIsLoading(true);
        try {
            await postReview({
                usuario_id: user.id,
                produto_id: productId,
                estrelas,
                titulo,
                comentario
            });
            toast.success("Avaliação enviada! Obrigado pelo feedback.");
            onSuccess();
        } catch (error) {
            toast.error("Erro ao enviar avaliação.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-border shadow-sm animate-fade-in relative">
            <button onClick={onCancel} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={20} />
            </button>

            <h4 className="text-xl font-serif font-bold mb-4">Sua Avaliação</h4>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-sm font-medium mb-2 block">Quantas estrelas?</label>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="transition-all hover:scale-110"
                                onClick={() => setEstrelas(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                            >
                                <Star
                                    size={28}
                                    className={`${star <= (hover || estrelas) ? "text-primary fill-primary" : "text-border"
                                        } transition-colors`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Título (Opcional)</label>
                    <input
                        value={titulo}
                        onChange={(e) => setTitulo(e.target.value)}
                        placeholder="Ex: Excelente produto!"
                        className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Seu Comentário</label>
                    <textarea
                        required
                        rows={4}
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        placeholder="Conte-nos o que você achou deste produto..."
                        className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancel} className="rounded-full">Cancelar</Button>
                    <Button type="submit" disabled={isLoading} className="btn-gold rounded-full px-8">
                        {isLoading ? "Enviando..." : "Postar Avaliação"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

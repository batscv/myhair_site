import { useQuery } from "@tanstack/react-query";
import { fetchAdminReviews, approveReview, deleteReview } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MessageSquare, Check, Trash2, Star, User, Package, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

export default function AdminReviews() {
    const { data: reviews, isLoading, refetch } = useQuery({
        queryKey: ['admin-reviews'],
        queryFn: fetchAdminReviews
    });

    const handleApprove = async (id: number) => {
        try {
            await approveReview(id);
            toast.success("Avaliação aprovada!");
            refetch();
        } catch (e) {
            toast.error("Erro ao aprovar avaliação");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta avaliação permanentemente?")) return;
        try {
            await deleteReview(id);
            toast.success("Avaliação excluída!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir avaliação");
        }
    };

    const pendingCount = reviews?.filter((r: any) => !r.aprovado).length || 0;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold font-serif text-foreground">Moderação de Avaliações</h3>
                    <p className="text-muted-foreground text-sm">Gerencie o que os clientes estão dizendo sobre seus produtos.</p>
                </div>
                {pendingCount > 0 && (
                    <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 border border-amber-200">
                        <Clock size={14} /> {pendingCount} Pendentes
                    </div>
                )}
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white rounded-2xl animate-pulse border border-border" />)}
                </div>
            ) : !reviews || reviews.length === 0 ? (
                <div className="bg-white p-20 text-center rounded-3xl border border-dashed border-border opacity-50">
                    <MessageSquare size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-serif">Nenhuma avaliação recebida até o momento.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reviews.map((review: any) => (
                        <div key={review.id} className={`bg-white p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col ${!review.aprovado ? 'border-amber-200 shadow-sm bg-amber-50/10' : 'border-border'}`}>
                            {!review.aprovado && (
                                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Pendente</div>
                            )}

                            <div className="flex gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-secondary overflow-hidden flex-shrink-0 border border-border">
                                    <img src={review.produto_imagem} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">
                                        <Package size={10} /> {review.produto_nome}
                                    </div>
                                    <h5 className="text-sm font-bold truncate text-foreground">{review.titulo}</h5>
                                    <div className="flex gap-0.5 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} size={12} className={i < review.estrelas ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-secondary/30 p-4 rounded-2xl flex-1 mb-4 italic text-sm text-foreground/80 leading-relaxed">
                                "{review.comentario}"
                            </div>

                            <div className="flex items-center justify-between mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                        {review.author?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="text-[10px]">
                                        <p className="font-bold text-foreground">{review.author}</p>
                                        <p className="text-muted-foreground">{new Date(review.data_criacao).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {!review.aprovado ? (
                                        <Button
                                            size="sm"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-9 px-4 text-xs font-bold gap-2"
                                            onClick={() => handleApprove(review.id)}
                                        >
                                            <Check size={14} /> Aprovar
                                        </Button>
                                    ) : (
                                        <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-widest mr-2">
                                            <Check size={12} /> Exibindo
                                        </div>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-rose-500 hover:bg-rose-50 rounded-xl h-9 w-9 flex items-center justify-center p-0"
                                        onClick={() => handleDelete(review.id)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

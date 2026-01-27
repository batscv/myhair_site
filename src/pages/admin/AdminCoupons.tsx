import { useQuery } from "@tanstack/react-query";
import { fetchAdminCoupons, createCoupon, deleteCoupon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Tag, Calendar, X, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCoupons() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: coupons, isLoading, refetch } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: fetchAdminCoupons
    });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await createCoupon({
                codigo: data.codigo as string,
                tipo: data.tipo as string,
                valor: parseFloat(data.valor as string),
                validade: data.validade || null
            });
            toast.success("Cupom criado!");
            setIsModalOpen(false);
            refetch();
        } catch (e: any) {
            toast.error(e.message);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Excluir este cupom?")) return;
        try {
            await deleteCoupon(id);
            toast.success("Cupom removido!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando cupons...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Cupons de Desconto</h3>
                <Button onClick={() => setIsModalOpen(true)} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Novo Cupom
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Código</th>
                            <th className="p-4 font-semibold">Tipo</th>
                            <th className="p-4 font-semibold">Valor</th>
                            <th className="p-4 font-semibold">Validade</th>
                            <th className="p-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {coupons?.map((coupon: any) => (
                            <tr key={coupon.id} className="hover:bg-secondary/10 transition-colors text-sm">
                                <td className="p-4 font-bold text-primary">{coupon.codigo}</td>
                                <td className="p-4 capitalize">{coupon.tipo}</td>
                                <td className="p-4 font-bold">
                                    {coupon.tipo === 'percentual' ? `${coupon.valor}%` : `${coupon.valor} ECV`}
                                </td>
                                <td className="p-4 text-xs text-muted-foreground">
                                    {coupon.validade ? new Date(coupon.validade).toLocaleDateString() : 'Sem Expiração'}
                                </td>
                                <td className="p-4">
                                    <Button onClick={() => handleDelete(coupon.id)} variant="ghost" size="icon" className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-full"><Trash2 size={16} /></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h4 className="text-xl font-bold font-serif">Criar Novo Cupom</h4>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Código do Cupom</label>
                                <input name="codigo" required placeholder="EX: BELEZA10" className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 uppercase" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Tipo</label>
                                    <select name="tipo" required className="w-full p-2.5 bg-secondary border border-border rounded-lg">
                                        <option value="percentual">Percentual (%)</option>
                                        <option value="fixo">Fixo (ECV)</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Valor</label>
                                    <input name="valor" type="number" step="0.01" required className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Validade (Opcional)</label>
                                <input name="validade" type="date" className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8"><Save size={18} className="mr-2" /> Criar Cupom</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

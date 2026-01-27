import { useQuery } from "@tanstack/react-query";
import { fetchAdminPopups, savePopup, deletePopup, togglePopupStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, X, Save, Image as ImageIcon, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminPopups() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPopup, setEditingPopup] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data: popups, isLoading, refetch } = useQuery({
        queryKey: ['admin-popups'],
        queryFn: fetchAdminPopups
    });

    const handleEdit = (popup: any) => {
        setEditingPopup(popup);
        setImagePreview(popup.imagem);
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await savePopup({
                ...editingPopup,
                ...data,
                image: imageFile || editingPopup?.imagem,
                ativo: editingPopup?.ativo || false
            });
            toast.success(editingPopup ? "Popup atualizado!" : "Popup criado!");
            setIsModalOpen(false);
            setEditingPopup(null);
            setImageFile(null);
            setImagePreview(null);
            refetch();
        } catch (e) {
            toast.error("Erro ao salvar popup");
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Excluir este popup?")) return;
        try {
            await deletePopup(id);
            toast.success("Popup removido!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir");
        }
    };

    const handleToggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            await togglePopupStatus(id, !currentStatus);
            toast.success(!currentStatus ? "Popup ativado!" : "Popup desativado!");
            refetch();
        } catch (e) {
            toast.error("Erro ao alterar status");
        }
    };

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando popups...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h3 className="text-xl font-bold font-serif text-foreground">Pop-ups Promocionais</h3>
                    <p className="text-xs text-muted-foreground">Gerencie as janelas de promoção que aparecem ao carregar o site.</p>
                </div>
                <Button onClick={() => { setEditingPopup(null); setImagePreview(null); setImageFile(null); setIsModalOpen(true); }} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Novo Pop-up
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {popups?.map((popup: any) => (
                    <div key={popup.id} className={`bg-white rounded-2xl border ${popup.ativo ? 'border-primary shadow-md shadow-primary/5' : 'border-border'} overflow-hidden group transition-all`}>
                        <div className="aspect-[16/9] relative overflow-hidden bg-secondary/30">
                            {popup.imagem ? (
                                <img src={popup.imagem} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon size={32} /></div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button
                                    onClick={() => handleToggleStatus(popup.id, popup.ativo)}
                                    className={`p-2 rounded-full shadow-sm transition-all ${popup.ativo ? 'bg-primary text-white' : 'bg-white text-muted-foreground hover:text-foreground'}`}
                                    title={popup.ativo ? "Desativar" : "Ativar"}
                                >
                                    {popup.ativo ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <div>
                                <h4 className="font-bold text-foreground line-clamp-1">{popup.titulo || "Sem Título"}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`w-2 h-2 rounded-full ${popup.ativo ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                        {popup.ativo ? 'Ativo no site' : 'Desativado'}
                                    </span>
                                </div>
                            </div>

                            {popup.link && (
                                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                                    <ExternalLink size={12} />
                                    <a href={popup.link} target="_blank" rel="noreferrer" className="hover:underline line-clamp-1">{popup.link}</a>
                                </div>
                            )}

                            <div className="flex gap-2 pt-2">
                                <Button onClick={() => handleEdit(popup)} variant="secondary" className="flex-1 h-9 rounded-xl text-xs font-bold">Editar</Button>
                                <Button onClick={() => handleDelete(popup.id)} variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:bg-rose-50 rounded-xl"><Trash2 size={16} /></Button>
                            </div>
                        </div>
                    </div>
                ))}

                {popups?.length === 0 && (
                    <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-border text-center">
                        <ImageIcon size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                        <p className="text-muted-foreground italic">Nenhum pop-up cadastrado ainda.</p>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-auto border border-border animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
                            <h4 className="text-xl font-bold font-serif">{editingPopup ? "Editar Pop-up" : "Novo Pop-up"}</h4>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Título de Referência</label>
                                <input name="titulo" defaultValue={editingPopup?.titulo} placeholder="Ex: Promoção de Natal" className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Link de Destino (Opcional)</label>
                                <input name="link" defaultValue={editingPopup?.link} placeholder="Ex: /ofertas ou https://wa.me/..." className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Imagem do Pop-up</label>
                                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-dashed border-border">
                                    <div className="w-32 aspect-video rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon size={24} /></div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
                                        <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-tighter">Recomendado: 800x600px ou proporção 4:3</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-8">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8"><Save size={18} className="mr-2" /> Salvar Pop-up</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

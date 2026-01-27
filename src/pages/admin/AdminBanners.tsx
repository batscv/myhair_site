import { useQuery } from "@tanstack/react-query";
import { fetchBanners, saveBanner, deleteBanner } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Save, Edit } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBanners() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
    const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
    const [mostrarTexto, setMostrarTexto] = useState(true);

    const { data: banners, isLoading, refetch } = useQuery({
        queryKey: ['admin-banners'],
        queryFn: fetchBanners
    });

    const handleEdit = (banner: any) => {
        setEditingBanner(banner);
        setImagePreview(banner.imagem_url);
        setMobileImagePreview(banner.imagem_mobile_url);
        setMostrarTexto(banner.mostrar_texto !== 0); // Consider null/undefined as true
        setIsModalOpen(true);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isMobile: boolean) => {
        const file = e.target.files?.[0];
        if (file) {
            if (isMobile) {
                setMobileImageFile(file);
                setMobileImagePreview(URL.createObjectURL(file));
            } else {
                setImageFile(file);
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente excluir este banner?")) return;
        try {
            await deleteBanner(id);
            toast.success("Banner excluído!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir banner");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (!imageFile && !editingBanner) {
            toast.error("Selecione a imagem principal (Desktop)");
            return;
        }

        try {
            await saveBanner({
                ...data,
                id: editingBanner?.id,
                image: imageFile,
                mobile_image: mobileImageFile,
                image_url: editingBanner?.imagem_url,
                mobile_image_url: editingBanner?.imagem_mobile_url,
                mostrar_texto: mostrarTexto
            });
            toast.success(editingBanner ? "Banner atualizado!" : "Banner criado!");
            setIsModalOpen(false);
            setEditingBanner(null);
            setImageFile(null);
            setImagePreview(null);
            setMobileImageFile(null);
            setMobileImagePreview(null);
            refetch();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar banner");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Gerenciar Banners</h3>
                <Button onClick={() => { setEditingBanner(null); setImagePreview(null); setImageFile(null); setMobileImagePreview(null); setMobileImageFile(null); setMostrarTexto(true); setIsModalOpen(true); }} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Novo Banner
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map(i => <div key={i} className="h-48 bg-secondary animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {banners?.map((banner: any) => (
                        <div key={banner.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden group relative transition-all hover:shadow-md">
                            <div className="relative h-48 bg-secondary">
                                <img src={banner.imagem_url} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                            </div>
                            <div className="p-4">
                                <span className={`text-[10px] font-bold uppercase mb-1 block ${banner.mostrar_texto ? 'text-primary' : 'text-muted-foreground'}`}>
                                    {banner.mostrar_texto ? 'Texto Ativo' : 'Texto Oculto'}
                                </span>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-foreground line-clamp-1">{banner.titulo || "Sem Título"}</h4>
                                        <p className="text-sm text-muted-foreground line-clamp-1">{banner.subtitulo || "Sem subtítulo"}</p>
                                    </div>
                                    <div className="flex flex-col gap-2 items-end">
                                        {banner.imagem_mobile_url && (
                                            <span className="flex items-center gap-1 text-[10px] bg-secondary px-2 py-0.5 rounded-full font-bold">
                                                📱 Mobile
                                            </span>
                                        )}
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button onClick={() => handleEdit(banner)} variant="secondary" size="icon" className="h-8 w-8 bg-white border border-border rounded-full hover:bg-slate-50">
                                                <Edit size={14} />
                                            </Button>
                                            <Button onClick={() => handleDelete(banner.id)} variant="destructive" size="icon" className="h-8 w-8 rounded-full">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {banners?.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-secondary/10">
                            <ImageIcon className="mx-auto text-muted-foreground mb-4" size={48} />
                            <p className="text-muted-foreground font-medium">Nenhum banner cadastrado para a vitrine.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal / Form Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-white rounded-t-2xl sticky top-0 z-10">
                            <h4 className="text-xl font-bold font-serif text-foreground">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h4>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Versão Desktop (Principal)</label>
                                    <div className="p-4 bg-secondary/30 rounded-xl border border-dashed border-border text-center">
                                        {imagePreview ? (
                                            <img src={imagePreview} className="w-full h-32 object-cover rounded-lg mb-4" />
                                        ) : (
                                            <div className="h-32 flex items-center justify-center text-muted-foreground">
                                                <ImageIcon size={40} className="opacity-20" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            required={!editingBanner}
                                            onChange={(e) => handleImageChange(e, false)}
                                            className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Versão Mobile (Opcional)</label>
                                    <div className="p-4 bg-secondary/30 rounded-xl border border-dashed border-border text-center">
                                        {mobileImagePreview ? (
                                            <img src={mobileImagePreview} className="w-full h-32 object-cover rounded-lg mb-4" />
                                        ) : (
                                            <div className="h-32 flex items-center justify-center text-muted-foreground">
                                                <ImageIcon size={40} className="opacity-20" />
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, true)}
                                            className="text-xs w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-secondary/20 file:text-muted-foreground"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Título</label>
                                    <input name="titulo" defaultValue={editingBanner?.titulo} placeholder="Ex: Coleção de Verão" className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">TAG / Oferta</label>
                                    <input name="tag" defaultValue={editingBanner?.tag} placeholder="Ex: 50% OFF" className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Subtítulo</label>
                                <input name="subtitulo" defaultValue={editingBanner?.subtitulo} placeholder="Descrição curta do banner" className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Link de Destino</label>
                                    <input name="link" defaultValue={editingBanner?.link} placeholder="/produtos..." className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Ordem (0-99)</label>
                                    <input name="ordem" type="number" defaultValue={editingBanner?.ordem || 0} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-secondary/10 rounded-xl border border-border">
                                <input
                                    type="checkbox"
                                    id="mostrar_texto"
                                    checked={mostrarTexto}
                                    onChange={(e) => setMostrarTexto(e.target.checked)}
                                    className="w-5 h-5 accent-primary"
                                />
                                <label htmlFor="mostrar_texto" className="text-sm font-bold text-foreground cursor-pointer">
                                    Mostrar textos (Título/Botão) na frente deste banner
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8 rounded-full shadow-gold"><Save size={18} className="mr-2" /> Salvar Banner</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

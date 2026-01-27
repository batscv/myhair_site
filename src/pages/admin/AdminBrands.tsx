import { useQuery } from "@tanstack/react-query";
import { fetchMarcas, saveMarca, deleteMarca } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Image as ImageIcon, X, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminBrands() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data: marcas, isLoading, refetch } = useQuery({
        queryKey: ['admin-marcas'],
        queryFn: fetchMarcas
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Deseja realmente excluir esta marca?")) return;
        try {
            await deleteMarca(id);
            toast.success("Marca excluída!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir marca");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        if (!imageFile) {
            toast.error("Selecione uma imagem para a marca");
            return;
        }

        try {
            await saveMarca({
                ...data,
                image: imageFile
            });
            toast.success("Marca criada com sucesso!");
            setIsModalOpen(false);
            setImageFile(null);
            setImagePreview(null);
            refetch();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao salvar marca");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Marcas em Destaque</h3>
                <Button onClick={() => { setImagePreview(null); setImageFile(null); setIsModalOpen(true); }} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Nova Marca
                </Button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square bg-secondary animate-pulse rounded-xl" />)}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {marcas?.map((marca: any) => (
                        <div key={marca.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden group relative transition-all hover:shadow-md aspect-square flex flex-col items-center justify-center p-4">
                            <div className="w-full h-full flex items-center justify-center">
                                <img src={marca.imagem_url} alt={marca.nome} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="mt-2 text-center">
                                <p className="text-xs font-bold text-foreground truncate w-full">{marca.nome}</p>
                            </div>
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8 rounded-full shadow-lg"
                                    onClick={() => handleDelete(marca.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </div>
                    ))}

                    {marcas?.length === 0 && (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl bg-secondary/10">
                            <ImageIcon className="mx-auto text-muted-foreground mb-4" size={48} />
                            <p className="text-muted-foreground font-medium">Nenhuma marca cadastrada.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Modal / Form Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center bg-white rounded-t-2xl">
                            <h4 className="text-xl font-bold font-serif text-foreground">Nova Marca</h4>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Logotipo da Marca</label>
                                <div className="p-4 bg-secondary/30 rounded-xl border border-dashed border-border text-center">
                                    {imagePreview ? (
                                        <div className="h-32 flex items-center justify-center mb-4">
                                            <img src={imagePreview} className="max-h-full max-w-full object-contain rounded-lg" />
                                        </div>
                                    ) : (
                                        <div className="h-32 flex items-center justify-center text-muted-foreground">
                                            <ImageIcon size={40} className="opacity-20" />
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        required
                                        onChange={handleImageChange}
                                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Marca</label>
                                <input name="nome" required placeholder="Ex: L'Oréal" className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Ordem (0-99)</label>
                                <input name="ordem" type="number" defaultValue={0} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="rounded-full">Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8 rounded-full shadow-gold"><Save size={18} className="mr-2" /> Salvar Marca</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

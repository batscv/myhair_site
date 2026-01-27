import { useQuery } from "@tanstack/react-query";
import { fetchCategories, saveCategory, deleteCategory } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Tag, X, Save, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminCategories() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const { data: categories, isLoading, refetch } = useQuery({
        queryKey: ['admin-categories'],
        queryFn: fetchCategories
    });

    const handleEdit = (cat: any) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
        try {
            await deleteCategory(id);
            toast.success("Categoria excluída!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir categoria");
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await saveCategory({
                ...data,
                id: editingCategory?.id
            });
            toast.success(editingCategory ? "Categoria atualizada!" : "Categoria criada com sucesso!");
            setIsModalOpen(false);
            setEditingCategory(null);
            refetch();
        } catch (e) {
            toast.error("Erro ao salvar categoria");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Gerenciar Categorias</h3>
                <Button onClick={() => setIsModalOpen(true)} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Nova Categoria
                </Button>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold w-24">ID</th>
                            <th className="p-4 font-semibold">Nome da Categoria</th>
                            <th className="p-4 font-semibold">Descrição</th>
                            <th className="p-4 font-semibold text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {categories?.map((cat: any) => (
                            <tr key={cat.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="p-4 text-sm font-mono text-muted-foreground">#{cat.id}</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                            <Tag size={14} />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{cat.nome}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-muted-foreground line-clamp-1">{cat.descricao || "Sem descrição"}</td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-slate-600 hover:bg-slate-100 rounded-full"
                                            onClick={() => handleEdit(cat)}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-full"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal / Form Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h4 className="text-xl font-bold font-serif text-foreground">{editingCategory ? "Editar Categoria" : "Nova Categoria"}</h4>
                            <button onClick={() => { setIsModalOpen(false); setEditingCategory(null); }} className="p-2 hover:bg-secondary rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Nome da Categoria</label>
                                <input name="nome" required defaultValue={editingCategory?.nome} placeholder="Ex: Maquiagem" className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Descrição</label>
                                <textarea name="descricao" rows={3} defaultValue={editingCategory?.descricao} placeholder="O que define esta categoria?" className="w-full p-2.5 bg-secondary border border-border rounded-lg resize-none" />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); setEditingCategory(null); }} className="rounded-full">Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8 rounded-full shadow-gold"><Save size={18} className="mr-2" /> Salvar Alterações</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

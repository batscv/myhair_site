import { useQuery } from "@tanstack/react-query";
import { fetchProducts, saveProduct, deleteProduct, fetchCategories } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, X, Save, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminProducts() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [variations, setVariations] = useState<any[]>([]);

    // Filtros
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Todas");
    const [filterTag, setFilterTag] = useState("Todas");

    const { data: products, isLoading, refetch } = useQuery({
        queryKey: ['admin-products'],
        queryFn: fetchProducts
    });

    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: fetchCategories
    });

    const filteredProducts = products?.filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "Todas" || p.category === filterCategory;
        const matchesTag = filterTag === "Todas" || p.tag === filterTag;
        return matchesSearch && matchesCategory && matchesTag;
    });

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setImagePreview(product.image);
        setVariations(product.variations || []);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            await deleteProduct(id);
            toast.success("Produto excluído!");
            refetch();
        } catch (e) {
            toast.error("Erro ao excluir produto");
        }
    };


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        try {
            await saveProduct({
                ...editingProduct,
                ...data,
                variations: data.tem_variacoes === 'true' || data.tem_variacoes === '1' ? variations : [],
                modo_uso: data.modo_uso,
                mostrar_modo_uso: data.mostrar_modo_uso === 'true' || data.mostrar_modo_uso === '1',
                tem_variacoes: data.tem_variacoes === 'true' || data.tem_variacoes === '1'
            });
            toast.success(editingProduct?.id ? "Produto atualizado!" : "Produto criado!");
            setIsModalOpen(false);
            setEditingProduct(null);
            setImageFile(null);
            setImagePreview(null);
            refetch();
        } catch (e) {
            toast.error("Erro ao salvar produto");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Gerenciar Produtos</h3>
                <Button onClick={() => { setEditingProduct(null); setImagePreview(null); setImageFile(null); setIsModalOpen(true); }} className="btn-gold rounded-full px-6">
                    <Plus size={18} className="mr-2" /> Novo Produto
                </Button>
            </div>

            {/* BARRA DE FILTROS */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-border shadow-sm">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou marca..."
                        className="w-full pl-10 pr-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground italic text-xs">🔍</div>
                </div>
                <select
                    className="p-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                >
                    <option value="Todas">Todas as Categorias</option>
                    {categories?.map((c: any) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
                <select
                    className="p-2 bg-secondary/50 border border-border rounded-lg text-sm outline-none"
                    value={filterTag}
                    onChange={(e) => setFilterTag(e.target.value)}
                >
                    <option value="Todas">Todas as Seções</option>
                    <option value="bestseller">Mais Vendidos</option>
                    <option value="new">Lançamentos</option>
                </select>
            </div>

            <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-semibold">Produto</th>
                            <th className="p-4 font-semibold">SKU / Marca</th>
                            <th className="p-4 font-semibold">Preço</th>
                            <th className="p-4 font-semibold">Estoque</th>
                            <th className="p-4 font-semibold">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredProducts?.map((product: any) => (
                            <tr key={product.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="p-4 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
                                        <img src={product.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground line-clamp-1">{product.name}</p>
                                        <p className="text-xs text-primary">{product.category}</p>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <p className="text-sm font-medium">{product.sku}</p>
                                    <p className="text-xs text-muted-foreground">{product.brand}</p>
                                </td>
                                <td className="p-4 text-sm font-bold text-foreground">
                                    {Number(product.price).toFixed(2)} ECV
                                </td>
                                <td className="p-4">
                                    <span className={`text-xs font-bold ${product.estoque > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {product.estoque} un.
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <Button onClick={() => handleEdit(product)} variant="ghost" size="icon" className="h-9 w-9 text-slate-600 hover:bg-slate-100 rounded-full"><Edit size={16} /></Button>
                                        <Button onClick={() => handleDelete(product.id)} variant="ghost" size="icon" className="h-9 w-9 text-rose-600 hover:bg-rose-50 rounded-full"><Trash2 size={16} /></Button>
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
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-auto border border-border">
                        <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white z-10">
                            <h4 className="text-xl font-bold font-serif">{editingProduct ? "Editar Produto" : "Novo Produto"}</h4>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-secondary rounded-full"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Nome do Produto</label>
                                <input name="name" required defaultValue={editingProduct?.name} className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Marca</label>
                                <input name="brand" required defaultValue={editingProduct?.brand} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Categoria</label>
                                <select name="category_id" required className="w-full p-2.5 bg-secondary border border-border rounded-lg" defaultValue={editingProduct?.category_id || 1}>
                                    {categories?.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Preço (ECV)</label>
                                <input name="price" type="number" step="0.01" required defaultValue={editingProduct?.price} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Preço Original (Opcional)</label>
                                <input name="originalPrice" type="number" step="0.01" defaultValue={editingProduct?.originalPrice} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Estoque Disponível</label>
                                <input name="estoque" type="number" required defaultValue={editingProduct?.estoque || 0} className="w-full p-2.5 bg-secondary border border-border rounded-lg focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-xs font-bold uppercase text-muted-foreground">URL da Imagem do Produto</label>
                                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl border border-dashed border-border">
                                    <div className="w-24 h-24 rounded-lg bg-secondary border border-border overflow-hidden flex-shrink-0">
                                        {(imagePreview) ? (
                                            <img src={imagePreview} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            name="image"
                                            placeholder="https://exemplo.com/imagem.png"
                                            defaultValue={editingProduct?.image || ""}
                                            onChange={(e) => setImagePreview(e.target.value)}
                                            className="w-full p-2.5 bg-secondary border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-2">Cole o link da imagem (hospedada em Imgur, GitHub, etc).</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">SKU</label>
                                <input name="sku" required defaultValue={editingProduct?.sku} className="w-full p-2.5 bg-secondary border border-border rounded-lg" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">TAG</label>
                                <select name="tag" className="w-full p-2.5 bg-secondary border border-border rounded-lg" defaultValue={editingProduct?.tag || ""}>
                                    <option value="">Nenhuma</option>
                                    <option value="bestseller">Mais Vendido</option>
                                    <option value="new">Lançamento</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 space-y-1">
                                <label className="text-xs font-bold uppercase text-muted-foreground">Descrição</label>
                                <textarea name="description" rows={3} defaultValue={editingProduct?.description} className="w-full p-2.5 bg-secondary border border-border rounded-lg resize-none" />
                            </div>

                            <div className="md:col-span-2 space-y-4 border-t border-border pt-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border flex-1">
                                        <input
                                            type="checkbox"
                                            name="mostrar_modo_uso"
                                            id="mostrar_modo_uso"
                                            value="true"
                                            defaultChecked={editingProduct?.mostrar_modo_uso === 1}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <label htmlFor="mostrar_modo_uso" className="text-[10px] font-bold uppercase text-foreground cursor-pointer">Mostrar Modo de Uso no Site</label>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-border flex-1">
                                        <input
                                            type="checkbox"
                                            name="tem_variacoes"
                                            id="tem_variacoes"
                                            value="true"
                                            defaultChecked={editingProduct?.tem_variacoes === 1}
                                            className="w-4 h-4 accent-primary"
                                        />
                                        <label htmlFor="tem_variacoes" className="text-[10px] font-bold uppercase text-foreground cursor-pointer">Habilitar Variações (Tamanhos/Tons)</label>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold uppercase text-muted-foreground">Modo de Uso</label>
                                    <textarea name="modo_uso" rows={4} defaultValue={editingProduct?.modo_uso} placeholder="Instruções de como utilizar o produto..." className="w-full p-2.5 bg-secondary border border-border rounded-lg resize-none" />
                                </div>
                            </div>


                            <div className="md:col-span-2 space-y-4">
                                <div className="flex justify-between items-center bg-secondary/30 p-4 rounded-xl border border-border">
                                    <h5 className="text-xs font-black uppercase tracking-widest text-primary">Variações (Tamanho/Tom)</h5>
                                    <Button type="button" size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => setVariations([...variations, { nome: "", estoque: 0 }])}>
                                        + Adicionar Opção
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {variations.map((v, idx) => (
                                        <div key={idx} className="flex gap-2 items-center bg-white p-2 border border-border rounded-lg animate-in slide-in-from-left-2">
                                            <input
                                                placeholder="Ex: 250ml ou Louro 8.0"
                                                value={v.nome}
                                                className="flex-1 p-2 text-sm bg-secondary rounded outline-none"
                                                onChange={(e) => {
                                                    const newV = [...variations];
                                                    newV[idx].nome = e.target.value;
                                                    setVariations(newV);
                                                }}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Estoque"
                                                value={v.estoque}
                                                className="w-20 p-2 text-sm bg-secondary rounded outline-none"
                                                onChange={(e) => {
                                                    const newV = [...variations];
                                                    newV[idx].estoque = parseInt(e.target.value) || 0;
                                                    setVariations(newV);
                                                }}
                                            />
                                            <button type="button" onClick={() => setVariations(variations.filter((_, i) => i !== idx))} className="p-2 text-rose-500 hover:bg-rose-50 rounded">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="btn-gold px-8"><Save size={18} className="mr-2" /> Salvar Alterações</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

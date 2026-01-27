import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { fetchUserProfile, updateUserProfile, fetchUserOrders } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
    User, Mail, Phone, MapPin, Lock, Save, Camera,
    ChevronRight, ShoppingBag, Package, Truck, CheckCircle, Clock
} from "lucide-react";

export default function Profile() {
    const userJson = localStorage.getItem("user");
    const initialUser = userJson ? JSON.parse(userJson) : null;

    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        telefone: "",
        morada: "",
        senha: "",
        confirmarSenha: ""
    });

    const { data: profile, isLoading, refetch } = useQuery({
        queryKey: ['user-profile', initialUser?.id],
        queryFn: () => fetchUserProfile(initialUser?.id),
        enabled: !!initialUser?.id
    });

    const { data: orders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['user-orders', initialUser?.id],
        queryFn: () => fetchUserOrders(initialUser?.id),
        enabled: !!initialUser?.id
    });

    const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'enviado': return <Truck size={14} className="text-blue-500" />;
            case 'entregue': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'pago': return <CheckCircle size={14} className="text-emerald-500" />;
            case 'processando': return <Clock size={14} className="text-amber-500" />;
            default: return <Clock size={14} className="text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'enviado': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'entregue': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'pago': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
            case 'processando': return 'bg-amber-50 text-amber-700 border-amber-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    useEffect(() => {
        if (profile) {
            setFormData(prev => ({
                ...prev,
                nome: profile.nome || "",
                email: profile.email || "",
                telefone: profile.telefone || "",
                morada: profile.morada || ""
            }));
        }
    }, [profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.senha && formData.senha !== formData.confirmarSenha) {
            toast.error("As senhas não coincidem!");
            return;
        }

        try {
            await updateUserProfile(initialUser.id, {
                nome: formData.nome,
                email: formData.email,
                telefone: formData.telefone,
                morada: formData.morada,
                senha: formData.senha
            });

            // Atualiza o localStorage com os novos dados básicos
            const updatedUser = { ...initialUser, nome: formData.nome, email: formData.email, telefone: formData.telefone, morada: formData.morada };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast.success("Perfil atualizado com sucesso!");
            setFormData(prev => ({ ...prev, senha: "", confirmarSenha: "" }));
            refetch();
        } catch (error: any) {
            toast.error("Erro ao atualizar perfil.");
        }
    };

    if (!initialUser) {
        return (
            <div className="min-h-screen bg-background pt-44 text-center">
                <Header />
                <h2 className="text-2xl font-bold">Você precisa estar logado.</h2>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/10 font-sans">
            <Header />

            <main className="container mx-auto px-4 py-8 pt-32 md:pt-44">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">Meu Perfil</h1>
                        <p className="text-muted-foreground mt-2">Gerencie suas informações pessoais e configurações de conta.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-3xl border border-border shadow-sm text-center">
                                <div className="relative inline-block mb-4">
                                    <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-serif font-bold">
                                        {formData.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-border shadow-sm hover:bg-secondary transition-colors">
                                        <Camera size={16} className="text-muted-foreground" />
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-foreground">{formData.nome}</h3>
                                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">Cliente MY HAIR</p>
                            </div>

                            <div className="bg-charcoal text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                                <h4 className="font-bold mb-2 relative z-10">Privacidade</h4>
                                <p className="text-xs text-white/60 relative z-10">Suas fotos e dados estão protegidos por criptografia de ponta a ponta.</p>
                                <Lock className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24" />
                            </div>
                        </div>

                        {/* Edit Form */}
                        <div className="lg:col-span-2">
                            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-border shadow-sm space-y-8">
                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Dados Pessoais</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Nome Completo</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <input name="nome" value={formData.nome} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">E-mail</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" required />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Telefone / Contacto</label>
                                            <div className="relative">
                                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <input name="telefone" value={formData.telefone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="(00) 00000-0000" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-muted-foreground">Morada / Endereço Completo</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-3 text-muted-foreground" size={16} />
                                            <textarea name="morada" value={formData.morada} onChange={handleChange} rows={3} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none" placeholder="Rua, número, bairro, cidade e CEP..." />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <h4 className="text-sm font-bold uppercase tracking-widest text-primary border-b border-primary/10 pb-2">Segurança</h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Nova Palavra-passe</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <input name="senha" type="password" value={formData.senha} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Deixe em branco para manter" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-muted-foreground">Confirmar Palavra-passe</label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                                <input name="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-secondary/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" placeholder="Repita a nova senha" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-border flex justify-end">
                                    <Button type="submit" className="btn-gold px-12 py-6 rounded-full font-bold shadow-gold/20 hover:shadow-gold/40 transition-all">
                                        <Save size={18} className="mr-2" /> Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        </div>

                        {/* Order History */}
                        <div className="lg:col-span-3 mt-12">
                            <div className="mb-6 flex items-center justify-between">
                                <h2 className="text-2xl font-serif font-bold text-foreground">Meus Pedidos</h2>
                                <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                    {orders?.length || 0} Registros
                                </span>
                            </div>

                            {isLoadingOrders ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-border" />)}
                                </div>
                            ) : !orders || orders.length === 0 ? (
                                <div className="bg-white p-12 rounded-3xl border border-dashed border-border text-center">
                                    <ShoppingBag size={48} className="mx-auto text-muted-foreground opacity-20 mb-4" />
                                    <p className="text-muted-foreground italic">Você ainda não realizou nenhum pedido.</p>
                                    <Button asChild variant="link" className="text-primary mt-2 font-bold uppercase text-xs tracking-widest">
                                        <a href="/produtos">Ir para a Loja</a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order: any) => (
                                        <div key={order.id} className="bg-white rounded-3xl border border-border shadow-sm overflow-hidden hover:shadow-md transition-all group">
                                            <div className="p-6 flex flex-wrap items-center justify-between gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center text-primary">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black uppercase tracking-widest text-foreground">Pedido #{order.id}</p>
                                                        <p className="text-xs text-muted-foreground">{new Date(order.data_pedido).toLocaleDateString()}</p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4">
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold uppercase text-muted-foreground">Total</p>
                                                        <p className="text-sm font-black text-primary">{Number(order.valor_total).toFixed(2)} ECV</p>
                                                    </div>

                                                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${getStatusColor(order.status)}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Order Details (Expandable) */}
                                            <div className="bg-secondary/20 px-6 py-4 border-t border-border/50">
                                                <div className="space-y-3">
                                                    {order.itens?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <img src={item.imagem} className="w-8 h-8 rounded-lg object-cover" />
                                                                <div>
                                                                    <p className="text-xs font-bold text-foreground">{item.produto_nome}</p>
                                                                    <p className="text-[10px] text-muted-foreground">{item.quantidade}x {Number(item.preco_unitario).toFixed(2)} ECV</p>
                                                                </div>
                                                            </div>
                                                            <span className="text-xs font-bold text-foreground">{(item.quantidade * item.preco_unitario).toFixed(2)} ECV</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

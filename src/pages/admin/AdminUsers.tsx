import { useQuery } from "@tanstack/react-query";
import { fetchAdminUsers, fetchUserOrdersHistory, updateUserRole } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Users, Shield, ShieldAlert, History, Mail, Phone, MapPin, Search, ChevronRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminUsers() {
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: users, isLoading, refetch } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchAdminUsers
    });

    const { data: orderHistory, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['user-order-history', selectedUser?.id],
        queryFn: () => fetchUserOrdersHistory(selectedUser?.id),
        enabled: !!selectedUser
    });

    const handleToggleRole = async (user: any) => {
        const newRole = user.tipo === 'admin' ? 'cliente' : 'admin';
        const confirmMsg = user.tipo === 'admin'
            ? `Tem certeza que deseja remover o acesso Admin de ${user.nome}?`
            : `Deseja promover ${user.nome} para Administrador?`;

        if (!confirm(confirmMsg)) return;

        try {
            await updateUserRole(user.id, newRole);
            toast.success(`Nível de acesso alterado para ${newRole}!`);
            refetch();
            if (selectedUser?.id === user.id) setSelectedUser({ ...selectedUser, tipo: newRole });
        } catch (e) {
            toast.error("Erro ao alterar nível de acesso");
        }
    };

    const filteredUsers = users?.filter((u: any) =>
        u.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-2xl font-bold font-serif text-foreground">Gestão de Clientes</h3>
                    <p className="text-muted-foreground text-sm">Visualize sua base de clientes e gerencie permissões.</p>
                </div>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou email..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Users List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] uppercase font-black tracking-widest">
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Contacto</th>
                                    <th className="p-4">Nível</th>
                                    <th className="p-4 text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {isLoading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={4} className="p-8 bg-white/50"></td>
                                        </tr>
                                    ))
                                ) : filteredUsers?.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground italic">Nenhum usuário encontrado.</td>
                                    </tr>
                                ) : (
                                    filteredUsers?.map((user: any) => (
                                        <tr key={user.id} className={`hover:bg-secondary/10 transition-colors group cursor-pointer ${selectedUser?.id === user.id ? 'bg-primary/5' : ''}`} onClick={() => setSelectedUser(user)}>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary font-serif">
                                                        {user.nome.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-foreground line-clamp-1">{user.nome}</p>
                                                        <p className="text-[10px] text-muted-foreground">Cadastrado em {new Date(user.data_cadastro).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-xs text-foreground font-medium">{user.email}</p>
                                                <p className="text-[10px] text-muted-foreground">{user.telefone || "Sem telefone"}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${user.tipo === 'admin' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {user.tipo}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button size="icon" variant="ghost" className="rounded-full h-8 w-8 hover:bg-white hover:shadow-sm">
                                                    <ChevronRight size={16} className="text-muted-foreground" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* User Details & History */}
                <div className="lg:col-span-1">
                    {!selectedUser ? (
                        <div className="bg-secondary/20 h-full rounded-3xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                            <Users size={32} className="opacity-30" />
                            <p className="text-sm">Selecione um cliente ao lado para visualizar o dossiê completo, histórico de compras e gerenciar permissões.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden sticky top-6 animate-in slide-in-from-right duration-300">
                            <div className="p-6 bg-charcoal text-white relative">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/20 backdrop-blur-sm flex items-center justify-center text-2xl font-serif font-bold text-primary">
                                        {selectedUser.nome.charAt(0).toUpperCase()}
                                    </div>
                                    <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><Shield size={16} /></button>
                                </div>
                                <h4 className="text-xl font-bold font-serif">{selectedUser.nome}</h4>
                                <p className="text-xs text-white/50">{selectedUser.email}</p>
                                <Shield className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24" />
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Informações de Contato */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Informações de Contato</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Phone size={14} className="text-primary" />
                                            <span>{selectedUser.telefone || "Não informado"}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-xs text-muted-foreground">
                                            <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                            <span className="leading-relaxed">{selectedUser.morada || "Ainda não cadastrou morada"}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Histórico de Compras */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center justify-between">
                                        Histórico de Compras
                                        <span className="bg-secondary text-foreground px-2 py-0.5 rounded text-[8px]">{orderHistory?.length || 0} PEDIDOS</span>
                                    </h5>
                                    <div className="space-y-2 max-h-60 overflow-auto pr-2 scrollbar-hide">
                                        {isLoadingHistory ? (
                                            <div className="h-20 bg-secondary/20 rounded-xl animate-pulse" />
                                        ) : !orderHistory || orderHistory.length === 0 ? (
                                            <div className="text-center py-8 bg-secondary/10 rounded-2xl border border-dashed border-border">
                                                <ShoppingBag size={24} className="mx-auto text-muted-foreground opacity-30 mb-2" />
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase">Nenhum pedido feito</p>
                                            </div>
                                        ) : (
                                            orderHistory.map((order: any) => (
                                                <div key={order.id} className="p-3 bg-secondary/20 rounded-xl flex items-center justify-between hover:bg-secondary/30 transition-colors">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-foreground">Pedido #{order.id}</p>
                                                        <p className="text-[8px] text-muted-foreground uppercase">{new Date(order.data_pedido).toLocaleDateString()} • {order.total_itens} itens</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] font-bold text-primary">{Number(order.valor_total).toFixed(2)} ECV</p>
                                                        <p className={`text-[7px] uppercase font-black px-1 rounded border ${order.status === 'entregue' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                                            {order.status}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Controles de Acesso */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Controle de Acesso</h5>
                                    {selectedUser.tipo === 'admin' ? (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between text-rose-600 border-rose-100 hover:bg-rose-50 hover:text-rose-700 h-11"
                                            onClick={() => handleToggleRole(selectedUser)}
                                        >
                                            <span className="flex items-center gap-2 text-xs font-bold">
                                                <ShieldAlert size={16} /> Remover Admin
                                            </span>
                                            <ChevronRight size={14} />
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            className="w-full justify-between text-indigo-600 border-indigo-100 hover:bg-indigo-50 hover:text-indigo-700 h-11"
                                            onClick={() => handleToggleRole(selectedUser)}
                                        >
                                            <span className="flex items-center gap-2 text-xs font-bold">
                                                <Shield size={16} /> Tornar Administrador
                                            </span>
                                            <ChevronRight size={14} />
                                        </Button>
                                    )}
                                    <p className="text-[9px] text-muted-foreground leading-relaxed italic">
                                        * Administradores podem gerenciar produtos, banners, pedidos e outros usuários. Tenha cautela ao promover alguém.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

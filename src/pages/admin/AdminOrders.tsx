import { useQuery } from "@tanstack/react-query";
import { fetchAdminOrders, fetchAdminOrderDetail, updateOrderStatus } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Eye, CheckCircle, Truck, XCircle, Search, Clock, MapPin, User, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminOrders() {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: orders, isLoading, refetch } = useQuery({
        queryKey: ['admin-orders'],
        queryFn: fetchAdminOrders
    });

    const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
        queryKey: ['admin-order-detail', selectedOrderId],
        queryFn: () => fetchAdminOrderDetail(selectedOrderId!),
        enabled: !!selectedOrderId
    });

    const handleStatusChange = async (id: number, status: string) => {
        try {
            await updateOrderStatus(id, status);
            toast.success("Status atualizado!");
            refetch();
            if (selectedOrderId === id) setSelectedOrderId(null);
        } catch (e) {
            toast.error("Erro ao atualizar status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'processando': return 'bg-amber-100 text-amber-600 border-amber-200';
            case 'pago': return 'bg-blue-100 text-blue-600 border-blue-200';
            case 'enviado': return 'bg-indigo-100 text-indigo-600 border-indigo-200';
            case 'entregue': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
            case 'cancelado': return 'bg-rose-100 text-rose-600 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const filteredOrders = orders?.filter((o: any) =>
        o.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toString() === searchTerm
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold font-serif text-foreground">Gestão de Pedidos</h3>
                <div className="relative w-full max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por ID ou Cliente..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-full text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-2 space-y-4">
                    {isLoading ? (
                        [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl animate-pulse border border-border" />)
                    ) : filteredOrders?.length === 0 ? (
                        <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-border">
                            <ShoppingBag className="mx-auto text-muted-foreground mb-4 opacity-20" size={48} />
                            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
                        </div>
                    ) : (
                        filteredOrders?.map((order: any) => (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrderId(order.id)}
                                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md flex items-center justify-between ${selectedOrderId === order.id ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-border'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl ${getStatusColor(order.status)}`}>
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-bold text-foreground">Pedido #{order.id}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {order.cliente_nome} • {new Date(order.data_pedido).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-foreground">{Number(order.valor_total).toFixed(2)} ECV</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">Clica para detalhes</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Order Detail View */}
                <div className="lg:col-span-1">
                    {!selectedOrderId ? (
                        <div className="bg-secondary/20 h-full rounded-3xl border border-dashed border-border p-8 flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                            <Eye size={32} className="opacity-30" />
                            <p className="text-sm">Selecione um pedido ao lado para visualizar os detalhes e gerenciar o envio.</p>
                        </div>
                    ) : isLoadingDetail ? (
                        <div className="bg-white p-8 rounded-3xl border border-border animate-pulse space-y-6">
                            <div className="h-6 w-1/2 bg-secondary rounded" />
                            <div className="h-24 w-full bg-secondary rounded" />
                            <div className="space-y-4">
                                <div className="h-4 w-full bg-secondary rounded" />
                                <div className="h-4 w-full bg-secondary rounded" />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border border-border shadow-xl overflow-hidden sticky top-6">
                            <div className="p-6 bg-charcoal text-white">
                                <div className="flex justify-between items-start mb-4">
                                    <h4 className="text-lg font-bold font-serif">Detalhes do Pedido</h4>
                                    <button onClick={() => setSelectedOrderId(null)} className="p-1 hover:bg-white/10 rounded-full transition-colors"><Eye size={16} /></button>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(orderDetail.status)}`}>
                                        {orderDetail.status}
                                    </div>
                                    <span className="text-xs text-white/60">#{orderDetail.id} • {new Date(orderDetail.data_pedido).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Cliente Info */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cliente & Entrega</h5>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <User size={16} className="text-primary" />
                                            <span className="font-bold">{orderDetail.cliente_nome}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Mail size={16} />
                                            <span>{orderDetail.cliente_email}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <Phone size={16} />
                                            <span>{orderDetail.cliente_telefone || "Não informado"}</span>
                                        </div>
                                        <div className="flex items-start gap-3 text-xs text-muted-foreground">
                                            <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                                            <span>{orderDetail.endereco_entrega}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Itens do Pedido */}
                                <div className="space-y-4">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Produtos ({orderDetail.itens.length})</h5>
                                    <div className="space-y-3 max-h-60 overflow-auto pr-2">
                                        {orderDetail.itens.map((item: any) => (
                                            <div key={item.id} className="flex gap-3 items-center">
                                                <div className="w-10 h-10 rounded-lg bg-secondary flex-shrink-0 overflow-hidden">
                                                    <img src={item.imagem} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-foreground truncate">{item.produto_nome}</p>
                                                    <p className="text-[10px] text-muted-foreground">{item.quantidade}x {Number(item.preco_unitario).toFixed(2)} ECV</p>
                                                </div>
                                                <div className="text-xs font-bold text-foreground">
                                                    {(item.quantidade * item.preco_unitario).toFixed(2)} ECV
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-4 border-t border-border flex justify-between items-center text-lg font-serif font-bold text-foreground">
                                        <span>Total</span>
                                        <span className="text-primary">{Number(orderDetail.valor_total).toFixed(2)} ECV</span>
                                    </div>
                                </div>

                                {/* Ações de Status */}
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mudar Status</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[10px] py-1 gap-2 rounded-xl hover:bg-amber-50"
                                            onClick={() => handleStatusChange(orderDetail.id, 'processando')}
                                        >
                                            <Clock size={12} /> Processando
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[10px] py-1 gap-2 rounded-xl hover:bg-blue-50"
                                            onClick={() => handleStatusChange(orderDetail.id, 'pago')}
                                        >
                                            <CheckCircle size={12} /> Pago
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[10px] py-1 gap-2 rounded-xl hover:bg-indigo-50"
                                            onClick={() => handleStatusChange(orderDetail.id, 'enviado')}
                                        >
                                            <Truck size={12} /> Enviado
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[10px] py-1 gap-2 rounded-xl hover:bg-emerald-50"
                                            onClick={() => handleStatusChange(orderDetail.id, 'entregue')}
                                        >
                                            <CheckCircle size={12} /> Entregue
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-[10px] py-1 gap-2 rounded-xl col-span-2 hover:bg-rose-50 text-rose-500"
                                            onClick={() => handleStatusChange(orderDetail.id, 'cancelado')}
                                        >
                                            <XCircle size={12} /> Cancelar Pedido
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

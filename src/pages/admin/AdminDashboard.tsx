import { useQuery } from "@tanstack/react-query";
import { fetchProducts, fetchBanners, fetchMarcas, fetchCategories, fetchAdminOrders, fetchAdminUsers, fetchAdminReviews, fetchAdminMetrics } from "@/lib/api";
import { Package, Image as ImageIcon, Star, Sparkles, Tag, Layers, ShoppingBag, Clock, Users, MessageSquare, TrendingUp, DollarSign, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#D4AF37', '#1A1A1A', '#4A4A4A', '#8E8E8E', '#C0C0C0'];

export default function AdminDashboard() {
    const { data: products } = useQuery({ queryKey: ['admin-products'], queryFn: fetchProducts });
    const { data: orders } = useQuery({ queryKey: ['admin-orders'], queryFn: fetchAdminOrders });
    const { data: users } = useQuery({ queryKey: ['admin-users'], queryFn: fetchAdminUsers });
    const { data: reviews } = useQuery({ queryKey: ['admin-reviews'], queryFn: fetchAdminReviews });
    const { data: metrics, isLoading: isLoadingMetrics } = useQuery({ queryKey: ['admin-metrics'], queryFn: fetchAdminMetrics });

    const stats = [
        {
            label: "Faturamento Total",
            value: `${Number(metrics?.summary?.faturamento_total || 0).toFixed(2)} ECV`,
            icon: DollarSign,
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            label: "Ticket Médio",
            value: `${Number(metrics?.summary?.ticket_medio || 0).toFixed(2)} ECV`,
            icon: TrendingUp,
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        },
        {
            label: "Pedidos Totais",
            value: metrics?.summary?.total_pedidos || 0,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Pendentes (Feedback)",
            value: reviews?.filter((r: any) => !r.aprovado).length || 0,
            icon: MessageSquare,
            color: "text-amber-600",
            bg: "bg-amber-50"
        },
        {
            label: "Total Clientes",
            value: users?.length || 0,
            icon: Users,
            color: "text-indigo-600",
            bg: "bg-indigo-50"
        },
        {
            label: "Total Produtos",
            value: products?.length || 0,
            icon: Package,
            color: "text-slate-600",
            bg: "bg-slate-50"
        },
    ];

    if (isLoadingMetrics) return <div className="p-12 text-center text-muted-foreground">Carregando métricas...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com Resumo Financeiro */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
                        <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                        <div>
                            <h3 className="text-muted-foreground text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfico de Faturamento */}
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold font-serif text-foreground">Faturamento Mensal</h3>
                            <p className="text-xs text-muted-foreground">Crescimento de receita nos últimos meses</p>
                        </div>
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics?.monthly || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748B' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [`${Number(value).toFixed(2)} ECV`, 'Faturamento']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de Categorias */}
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold font-serif text-foreground">Mix de Categorias</h3>
                            <p className="text-xs text-muted-foreground">Vendas por categoria de produto</p>
                        </div>
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                    </div>
                    <div className="h-[300px] w-full flex items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={metrics?.categories || []}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {(metrics?.categories || []).map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="w-1/3 space-y-3">
                            {(metrics?.categories || []).map((entry, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-xs font-medium text-foreground truncate">{entry.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Pedidos Recentes */}
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-secondary/10">
                    <h3 className="font-bold font-serif text-foreground">Últimos Pedidos</h3>
                    <button className="text-xs font-bold text-primary hover:underline">Ver todos</button>
                </div>
                <div className="p-0">
                    <table className="w-full text-left">
                        <thead className="bg-white text-[10px] uppercase font-black tracking-widest text-muted-foreground border-b">
                            <tr>
                                <th className="p-4">ID</th>
                                <th className="p-4">Cliente</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Valor</th>
                                <th className="p-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {(metrics?.recent || []).map((order: any) => (
                                <tr key={order.id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="p-4 text-xs font-bold">#{order.id}</td>
                                    <td className="p-4 text-sm">{order.cliente_nome}</td>
                                    <td className="p-4 text-xs text-muted-foreground">{new Date(order.data_pedido).toLocaleDateString()}</td>
                                    <td className="p-4 text-sm font-bold">{Number(order.valor_total).toFixed(2)} ECV</td>
                                    <td className="p-4">
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${order.status === 'pago' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                order.status === 'cancelado' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


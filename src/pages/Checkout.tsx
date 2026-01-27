import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ChevronLeft,
    MapPin,
    Phone,
    User as UserIcon,
    MessageCircle,
    ShoppingBag
} from "lucide-react";
import { toast } from "sonner";

import { createOrder, fetchSettings, validateCoupon } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Tag } from "lucide-react";

export default function Checkout() {
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const navigate = useNavigate();

    const { data: settings } = useQuery({
        queryKey: ['settings'],
        queryFn: fetchSettings
    });

    const [formData, setFormData] = useState({
        nome: "",
        telefone: "",
        endereco: "",
        cidade: "",
        pontoReferencia: ""
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
    const [isValidating, setIsValidating] = useState(false);

    const discountValue = appliedCoupon
        ? (appliedCoupon.tipo === 'percentual'
            ? (totalPrice * (appliedCoupon.valor / 100))
            : appliedCoupon.valor)
        : 0;

    const finalPrice = Math.max(0, totalPrice - discountValue);

    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                nome: user.nome || "",
                telefone: user.telefone || "",
                endereco: user.morada || ""
            }));
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsValidating(true);
        try {
            const coupon = await validateCoupon(couponCode);
            setAppliedCoupon(coupon);
            toast.success(`Cupom ${coupon.codigo} aplicado!`);
        } catch (err: any) {
            toast.error(err.message);
            setAppliedCoupon(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleFinalize = async (e: React.FormEvent) => {
        e.preventDefault();

        if (items.length === 0) {
            toast.error("Seu carrinho está vazio");
            return;
        }

        const fullAddress = `${formData.endereco}, ${formData.cidade} ${formData.pontoReferencia ? '(' + formData.pontoReferencia + ')' : ''}`;

        // 1. Salvar no banco de dados se logado
        if (user) {
            try {
                await createOrder({
                    usuario_id: user.id,
                    valor_total: finalPrice,
                    endereco_entrega: fullAddress,
                    itens: items.map(item => ({
                        produto_id: item.id,
                        quantidade: item.quantity,
                        preco_unitario: item.price
                    }))
                });
            } catch (err) {
                console.error("Erro ao salvar pedido no banco:", err);
                toast.error("Houve um problema ao processar seu pedido no sistema.");
            }
        }

        // 2. Gerar mensagem para o WhatsApp
        const whatsappNumber = settings?.contact_whatsapp || "5511999999999";

        let message = `*Novo Pedido - My Hair Beauty Hub*\n\n`;
        message += `*Cliente:* ${formData.nome}\n`;
        message += `*Telefone:* ${formData.telefone}\n`;
        message += `*Endereço:* ${fullAddress}\n`;
        message += `\n*Itens do Pedido:*\n`;

        items.forEach(item => {
            const variationText = item.selectedVariation ? ` [${item.selectedVariation.nome}]` : "";
            message += `- ${item.quantity}x ${item.name}${variationText} (${item.price.toFixed(2)} ECV)\n`;
        });

        if (appliedCoupon) {
            message += `\n*Cupom:* ${appliedCoupon.codigo} (-${discountValue.toFixed(2)} ECV)`;
        }

        message += `\n*Total: ${finalPrice.toFixed(2)} ECV*`;

        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

        window.open(whatsappUrl, "_blank");

        toast.success("Pedido finalizado com sucesso!");
        clearCart();
        navigate("/");
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Header />
                <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
                    <ShoppingBag size={80} className="text-muted-foreground opacity-20 mb-6" />
                    <h2 className="text-2xl font-serif font-bold mb-2">Carrinho Vazio</h2>
                    <p className="text-muted-foreground mb-8">Você precisa adicionar produtos ao carrinho antes de fazer o checkout.</p>
                    <Button asChild className="btn-gold rounded-full px-8">
                        <Link to="/">Voltar às Compras</Link>
                    </Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />

            <main className="container mx-auto px-4 py-8 lg:py-16">
                <div className="flex items-center gap-2 mb-8">
                    <Button variant="ghost" size="sm" asChild className="rounded-full">
                        <Link to="/"><ChevronLeft size={20} className="mr-1" /> Voltar</Link>
                    </Button>
                    <h1 className="text-3xl font-serif font-bold">Finalizar Pedido</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Form Section */}
                    <div className="space-y-8 animate-fade-up">
                        <div className="bg-white p-8 rounded-2xl border border-border shadow-sm">
                            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                                <MapPin className="text-primary" /> Dados de Entrega
                            </h2>

                            <form id="checkout-form" onSubmit={handleFinalize} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="nome" className="text-xs font-bold uppercase text-muted-foreground">Nome Completo</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="nome"
                                            name="nome"
                                            required
                                            value={formData.nome}
                                            onChange={handleChange}
                                            placeholder="Como deseja ser chamado?"
                                            className="pl-10 h-12 bg-secondary/50"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="telefone" className="text-xs font-bold uppercase text-muted-foreground">Telefone / WhatsApp</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                        <Input
                                            id="telefone"
                                            name="telefone"
                                            required
                                            value={formData.telefone}
                                            onChange={handleChange}
                                            placeholder="(00) 00000-0000"
                                            className="pl-10 h-12 bg-secondary/50"
                                        />
                                    </div>
                                </div>

                                <Separator className="my-6" />

                                <div className="space-y-1">
                                    <Label htmlFor="endereco" className="text-xs font-bold uppercase text-muted-foreground">Endereço (Rua, Número, Bairro)</Label>
                                    <Input
                                        id="endereco"
                                        name="endereco"
                                        required
                                        value={formData.endereco}
                                        onChange={handleChange}
                                        placeholder="Ex: Rua das Flores, 123 - Centro"
                                        className="h-12 bg-secondary/50"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <Label htmlFor="cidade" className="text-xs font-bold uppercase text-muted-foreground">Cidade / Estado</Label>
                                        <Input
                                            id="cidade"
                                            name="cidade"
                                            required
                                            value={formData.cidade}
                                            onChange={handleChange}
                                            placeholder="Ex: São Paulo - SP"
                                            className="h-12 bg-secondary/50"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="pontoReferencia" className="text-xs font-bold uppercase text-muted-foreground">Ponto de Referência</Label>
                                        <Input
                                            id="pontoReferencia"
                                            name="pontoReferencia"
                                            value={formData.pontoReferencia}
                                            onChange={handleChange}
                                            placeholder="Ex: Próximo ao mercado"
                                            className="h-12 bg-secondary/50"
                                        />
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="bg-primary/5 p-6 rounded-2xl border border-primary/20">
                            <p className="text-sm text-primary font-medium flex items-center gap-2">
                                <MessageCircle size={20} /> Pagamento e entrega serão combinados via WhatsApp.
                            </p>
                        </div>
                    </div>

                    {/* Review Section */}
                    <div className="space-y-8 lg:sticky lg:top-32 h-fit animate-fade-up" style={{ animationDelay: "100ms" }}>
                        <div className="bg-charcoal text-white p-8 rounded-2xl shadow-xl">
                            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2">
                                Resumo do Pedido
                            </h2>

                            <ScrollArea className="h-64 mb-6 pr-4">
                                <div className="space-y-4">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-start gap-4">
                                            <div className="flex gap-3">
                                                <div className="w-12 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold line-clamp-1">{item.name}</p>
                                                    <p className="text-xs text-white/60">{item.quantity}x {item.price.toFixed(2)} ECV</p>
                                                </div>
                                            </div>
                                            <span className="text-sm font-bold">{(item.price * item.quantity).toFixed(2)} ECV</span>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <Separator className="bg-white/10 mb-6" />

                            <div className="space-y-4 mb-8">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Cupom de desconto"
                                        className="bg-white/10 border-white/20 text-white placeholder:text-white/30 h-10"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    />
                                    <Button
                                        onClick={handleApplyCoupon}
                                        disabled={isValidating}
                                        className="h-10 px-4 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                                    >
                                        Aplicar
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-white/60">
                                        <span>Subtotal</span>
                                        <span>{totalPrice.toFixed(2)} ECV</span>
                                    </div>
                                    {appliedCoupon && (
                                        <div className="flex justify-between text-sm text-green-400">
                                            <span className="flex items-center gap-1"><Tag size={12} /> Desconto ({appliedCoupon.codigo})</span>
                                            <span>-{discountValue.toFixed(2)} ECV</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-white/60">
                                        <span>Frete</span>
                                        <span className="text-green-400">Grátis</span>
                                    </div>
                                    <div className="flex justify-between items-baseline pt-4">
                                        <span className="text-xl font-bold">Total</span>
                                        <span className="text-lg font-bold text-primary">{finalPrice.toFixed(2)} ECV</span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                form="checkout-form"
                                type="submit"
                                className="w-full py-8 btn-gold rounded-full text-lg font-bold shadow-gold group"
                            >
                                Finalizar no WhatsApp
                                <MessageCircle className="ml-2 group-hover:scale-110 transition-transform" size={24} />
                            </Button>

                            <p className="text-center text-[10px] text-white/40 mt-6 uppercase tracking-widest font-bold">
                                Entrega rápida & Segura
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

import { Link } from "react-router-dom";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet";
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from "lucide-react";
import { Button } from "./ui/button";
import { useCart } from "@/context/CartContext";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";

export function CartDrawer({ children }: { children: React.ReactNode }) {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

    return (
        <Sheet>
            <SheetTrigger asChild>
                {children}
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col h-screen p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle className="flex items-center gap-2 font-serif">
                        <ShoppingBag className="text-primary" />
                        Seu Carrinho ({totalItems})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-hidden">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-secondary/10">
                            <ShoppingBag size={64} className="text-muted-foreground mb-4 opacity-20" />
                            <p className="text-lg font-medium text-foreground">Seu carrinho está vazio</p>
                            <p className="text-sm text-muted-foreground mt-2">Escolha produtos incríveis para começar sua rotina de beleza.</p>
                        </div>
                    ) : (
                        <ScrollArea className="h-full px-6">
                            <div className="py-6 space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="h-24 w-24 rounded-xl bg-secondary overflow-hidden flex-shrink-0 border border-border">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-[10px] font-bold uppercase text-primary tracking-wider">{item.brand}</p>
                                            <h4 className="text-sm font-bold text-foreground line-clamp-2">{item.name}</h4>
                                            {item.selectedVariation && (
                                                <p className="text-[9px] font-black uppercase text-primary/60 bg-primary/5 inline-block px-1.5 py-0.5 rounded">
                                                    {item.selectedVariation.nome}
                                                </p>
                                            )}
                                            <p className="text-xs font-bold text-foreground">
                                                {Number(item.price).toFixed(2)} ECV
                                            </p>

                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center border border-border rounded-full bg-secondary/50">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="p-1 hover:text-primary transition-colors"
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="text-rose-500 hover:text-rose-600 transition-colors p-1"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t bg-secondary/20">
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold text-foreground">{totalPrice.toFixed(2)} ECV</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Frete</span>
                                <span className="text-green-600 font-medium">Grátis</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-baseline">
                                <span className="text-lg font-bold text-foreground">Total</span>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-primary">{totalPrice.toFixed(2)} ECV</p>
                                    <p className="text-[10px] text-muted-foreground">ou 6x de {(totalPrice / 6).toFixed(2)} ECV</p>
                                </div>
                            </div>
                        </div>

                        <Button asChild className="w-full py-7 btn-gold rounded-full font-bold shadow-gold group">
                            <Link to="/checkout" className="flex items-center justify-center">
                                Finalizar Compra
                                <CreditCard className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </Link>
                        </Button>
                        <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest font-bold">
                            Compra 100% Segura & Original
                        </p>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

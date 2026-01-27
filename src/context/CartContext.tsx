import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { saveCart, fetchCart } from "../lib/api";

interface CartItem {
    id: number;
    name: string;
    price: number;
    image: string;
    quantity: number;
    brand: string;
    selectedVariation?: { id: number; nome: string };
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: any, quantity: number) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        const saved = localStorage.getItem("cart");
        return saved ? JSON.parse(saved) : [];
    });

    const user = JSON.parse(localStorage.getItem("user") || "null");

    // Sync to LocalStorage and Backend
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));

        if (user?.id) {
            saveCart(user.id, items).catch(console.error);
        }
    }, [items, user?.id]);

    // Initial Load from Backend
    useEffect(() => {
        if (user?.id) {
            fetchCart(user.id).then(remoteItems => {
                if (remoteItems && remoteItems.length > 0) {
                    setItems(remoteItems);
                }
            }).catch(console.error);
        }
    }, [user?.id]);

    const addItem = (product: any, quantity: number) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === product.id);
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    price: Number(product.price),
                    image: product.image,
                    brand: product.brand,
                    quantity,
                    selectedVariation: product.selectedVariation,
                },
            ];
        });
        toast.success(`${quantity}x ${product.name} adicionado ao carrinho!`);
    };

    const removeItem = (id: number) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        toast.info("Produto removido do carrinho");
    };

    const updateQuantity = (id: number, quantity: number) => {
        if (quantity <= 0) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
        localStorage.removeItem("cart");
    };

    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}

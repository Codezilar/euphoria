// contexts/CartContext.tsx
"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";

interface CartItem {
  _id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity: number, productSnapshot?: any) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartCount: () => number;
  getCartTotal: () => number;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId, isSignedIn } = useAuth();

  // Load cart from database when user signs in
  useEffect(() => {
    if (isSignedIn && userId) {
      loadCart();
    } else {
      setCartItems([]);
    }
  }, [isSignedIn, userId]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string, quantity: number, productSnapshot?: any) => {
    if (!isSignedIn) {
      window.location.href = "/sign-in?redirect_url=" + encodeURIComponent(window.location.href);
      return;
    }

    try {
      setLoading(true);
      const body: any = { productId, quantity };
      if (productSnapshot) body.productSnapshot = productSnapshot;

      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(prev => {
          const existingIndex = prev.findIndex(item => item.productId === productId);
          if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = updatedItem;
            return updated;
          }
          return [...prev, updatedItem];
        });
        
        toast.success(`Added ${quantity} item(s) to cart`);
      } else {
        const error = await response.text();
        toast.error(error || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error("Failed to add to cart");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId, quantity }),
      });

      if (response.ok) {
        const updatedItem = await response.json();
        setCartItems(prev =>
          prev.map(item =>
            item.productId === productId ? updatedItem : item
          )
        );
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
      toast.error("Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/cart?productId=${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCartItems(prev => prev.filter(item => item.productId !== productId));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      toast.error("Failed to remove from cart");
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isSignedIn) return;

    try {
      setLoading(true);
      // You might want to add a bulk delete endpoint
      const promises = cartItems.map(item => 
        fetch(`/api/cart?productId=${item.productId}`, { method: "DELETE" })
      );
      await Promise.all(promises);
      setCartItems([]);
      toast.success("Cart cleared");
    } catch (error) {
      console.error("Failed to clear cart:", error);
      toast.error("Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    // This would typically fetch product prices from your database
    // For now, returns 0 - you'll need to implement this with product data
    return 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartCount,
        getCartTotal,
        loading,
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
"use client";

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { ImBin } from "react-icons/im";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ShoppingBag, ArrowLeft, Minus, Plus } from "lucide-react";
import Link from "next/link";

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  userId: string;
}

interface Product {
  id: string;
  _id?: string;
  title: string;
  price: number;
  images?: string[];
  description?: string;
  stock?: number;
  categories?: Array<{ id: string; title: string; image?: string }>;
  isActive?: boolean;
  isFeatured?: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [productDetails, setProductDetails] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.push("/sign-in?redirect_url=" + encodeURIComponent("/cart"));
      return;
    }
    fetchCartItems();
  }, [isSignedIn]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/cart');
      
      if (!response.ok) throw new Error('Failed to fetch cart');
      
      const items = await response.json();
      setCartItems(items);

      // If the API returned populated product objects, use them directly and
      // avoid calling the per-product endpoint (prevents requests for demo ids).
      const productsMap: Record<string, Product> = {};
      items.forEach((it: any) => {
        if (it.product) {
          productsMap[it.productId] = it.product;
        }
      });

      // Only attempt extra fetches for ids without a populated product (rare)
      const missingIds = Object.keys(items.reduce((acc: Record<string, boolean>, it: any) => {
        if (!productsMap[it.productId]) acc[it.productId] = true;
        return acc;
      }, {}));

      if (missingIds.length === 0) {
        setProductDetails(productsMap);
      } else {
        // Fallback: fetch details for missing ids (keeps compatibility)
        await fetchProductDetails(items);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error('Failed to load cart items');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (items: CartItem[]) => {
    const productIds = items.map(item => item.productId);
    const uniqueIds = [...new Set(productIds)];
    
    const productsMap: Record<string, Product> = {};
    
    await Promise.all(
      uniqueIds.map(async (id) => {
        try {
          const response = await fetch(`/api/products/${id}`);
          if (response.ok) {
            const data = await response.json();
            // Extract product from API response
            if (data.product) {
              productsMap[id] = data.product;
            } else if (data.success === false) {
              console.error(`Product ${id} error:`, data.message);
            }
          } else {
            console.error(`Failed to fetch product ${id}: HTTP ${response.status}`);
          }
        } catch (error) {
          console.error(`Failed to fetch product ${id}:`, error);
        }
      })
    );
    
    setProductDetails(productsMap);
  };

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const product = productDetails[item.productId];
    if (product?.stock && newQuantity > product.stock) {
      toast.error(`Only ${product.stock} items available`);
      return;
    }

    try {
      setUpdatingId(item._id);
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: item.productId,
          quantity: newQuantity,
        }),
      });

      if (!response.ok) throw new Error('Failed to update quantity');

      setCartItems(prev =>
        prev.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );
      
      toast.success('Quantity updated');
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemoveItem = async (item: CartItem) => {
    try {
      setUpdatingId(item._id);
      const response = await fetch(`/api/cart?productId=${item.productId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove item');

      setCartItems(prev => prev.filter(cartItem => cartItem._id !== item._id));
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const product = productDetails[item.productId];
      const price = product?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    router.push('/checkout');
  };

  const subtotal = calculateSubtotal();
  const totalItems = calculateTotalItems();

  if (!isSignedIn) return null;

  return (
    <div className="min-h-screen mt-[10rem] py-8">
      <div className="max-w-7xl relative pt-[5rem] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with back button */}
        <div className="mb-6 flex absolute top-0 items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-full cursor-pointer bg-gray-800 shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-white">Shopping Cart</h1>
          {!loading && cartItems.length > 0 && (
            <span className="ml-auto text-sm text-gray-200">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-400">Loading your cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty Cart
          <div className="bg-gray-800 rounded-2xl shadow-xl p-12 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingBag className="w-24 h-24 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-8">
              Looks like you haven't added any items to your cart yet
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-purple-600 rounded-4xl text-white hover:bg-purple-700 transition-colors font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          // Cart with Items
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const product = productDetails[item.productId];
                const isUpdating = updatingId === item._id;
                
                return (
                  <div
                    key={item._id}
                    className={`bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-opacity duration-300 ${
                      isUpdating ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row p-4 gap-4">
                      {/* Product Image */}
                      <div className="relative w-full sm:w-32 h-32 flex-shrink-0">
                        <Image
                          src={product?.images?.[0] || '/placeholder.png'}
                          alt={product?.title || 'Product'}
                          fill
                          className="object-cover rounded-2xl"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {product?.title || 'Loading...'}
                        </h3>
                        
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {product?.description || 'No description available'}
                        </p>

                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-400">Qty:</span>
                            <div className="flex items-center border border-gray-700 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                disabled={item.quantity <= 1 || isUpdating}
                                className="px-3 py-1 text-gray-400 hover:bg-gray-700 disabled:opacity-50 rounded-l-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-1 text-white font-medium border-x border-gray-700">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                disabled={product?.stock ? item.quantity >= product.stock : false || isUpdating}
                                className="px-3 py-1 text-gray-400 hover:bg-gray-700 disabled:opacity-50 rounded-r-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              ₦{((product?.price || 0) * item.quantity).toFixed(2)}
                            </span>
                            <button
                              onClick={() => handleRemoveItem(item)}
                              disabled={isUpdating}
                              className="p-2 text-red-500 hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                              <ImBin className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Stock Warning */}
                        {product?.stock && product.stock < 10 && (
                          <p className="mt-2 text-xs text-yellow-400">
                            Only {product.stock} left in stock!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl shadow-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Order Summary
                  </span>
                </h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="font-medium text-white">
                      ₦{subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className="text-green-600 dark:text-green-400">Calculated at checkout</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-700 pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-white">Total</span>
                    <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ₦{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  disabled={cartItems.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Proceed to Checkout
                </button>
                
                <Link
                  href="/"
                  className="block text-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors mt-4"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
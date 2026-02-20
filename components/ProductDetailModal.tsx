"use client";
import React, { useState, useEffect } from "react";
import { X, Star, Minus, Plus, Check } from "lucide-react";
import { GiShoppingCart } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useCart } from "@/contexts/CartContext";
import toast from "react-hot-toast";

// Shared interface for product data
interface Category {
  _id?: string;
  id?: string;
  title: string;
  image?: string;
}

interface Product {
  id?: string;
  _id?: string;
  productId?: string;
  title: string;
  description?: string;
  price?: number;
  stock?: number;
  displayPrice?: string;
  stockStatus?: string;
  averageRating?: number;
  totalReviews?: number;
  ratingDisplay?: string;
  isFeatured?: boolean;
  isActive?: boolean;
  categories?: Category[];
  category?: string;
  images?: string[];
  image?: string;
  src?: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
  ratings?: {
    userId: string;
    rating: number;
    review?: string;
    createdAt: Date;
  }[];
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  colorScheme?: "purple" | "pink";
}

export function ProductDetailModal({
  product,
  isOpen,
  onClose,
  colorScheme = "purple",
}: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { addToCart, loading: cartLoading } = useCart();

  // Color theme based on colorScheme
  const colors = {
    purple: {
      primary: "purple",
      gradientFrom: "from-purple-600",
      gradientTo: "to-pink-600",
      hoverFrom: "hover:from-purple-700",
      hoverTo: "hover:to-pink-700",
      border: "border-purple-500",
      shadow: "shadow-purple-500/20",
      text: "text-purple-400",
      lightText: "text-purple-300",
      bgLight: "bg-purple-500/10",
      accent: "bg-pink-500",
    },
    pink: {
      primary: "pink",
      gradientFrom: "from-pink-600",
      gradientTo: "to-purple-600",
      hoverFrom: "hover:from-pink-700",
      hoverTo: "hover:to-purple-700",
      border: "border-pink-500",
      shadow: "shadow-pink-500/20",
      text: "text-pink-400",
      lightText: "text-pink-300",
      bgLight: "bg-pink-500/10",
      accent: "bg-pink-500",
    },
  };

  const theme = colors[colorScheme];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Get all images from product
  const allImages = product.images ||
    (product.image ? [product.image] :
      (product.src ? [product.src] : ["/placeholder.png"]));

  // Get product ID
  const productId = product._id || product.id || product.productId || "";

  // Get price
  const price = product.price || parseFloat(product.displayPrice?.replace("$", "") || "0");

  // Get stock
  const stock = product.stock || 0;

  // Calculate average rating
  const averageRating = product.averageRating ||
    (product.ratings && product.ratings.length > 0
      ? product.ratings.reduce((acc, r) => acc + r.rating, 0) / product.ratings.length
      : parseFloat(product.ratingDisplay || "0"));

  // Get total reviews
  const totalReviews = product.totalReviews || (product.ratings?.length || 0);

  const stockStatus = product.stockStatus ||
    (stock === 0 ? "Out of Stock"
      : stock < 10 ? "Low Stock"
        : "In Stock");

  const handleAddToCart = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to add items to cart");
      router.push("/sign-in?redirect_url=" + encodeURIComponent(window.location.href));
      return;
    }

    // Defensive: ensure we have a valid product id before calling addToCart
    if (!productId || typeof productId !== "string" || productId.trim() === "") {
      toast.error("Unable to add to cart: missing product identifier");
      console.error("ProductDetailModal: missing productId", { product });
      return;
    }

    try {
      setIsAddingToCart(true);
      // Remove the product snapshot parameter - now only passing productId and quantity
      await addToCart(String(productId), quantity);
      
      toast.success(
        <div className="flex items-center gap-3">
          <Check className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-semibold">Added to Cart!</p>
            <p className="text-sm text-gray-600">
              {quantity} × {product.title} - ₦{(price * quantity).toFixed(2)}
            </p>
          </div>
        </div>,
        {
          duration: 3000,
          position: "top-right",
        }
      );

      console.log(`Added ${quantity} of ${product.title} to cart - Total: ₦${(price * quantity).toFixed(2)}`);
    } catch (error) {
      toast.error("Failed to add to cart. Please try again.");
      console.error("Add to cart error:", error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue");
      router.push("/sign-in?redirect_url=" + encodeURIComponent(window.location.href));
      return;
    }

    // Defensive: ensure we have a valid product id before calling addToCart
    if (!productId || typeof productId !== "string" || productId.trim() === "") {
      toast.error("Unable to proceed: missing product identifier");
      console.error("ProductDetailModal.buyNow: missing productId", { product });
      return;
    }

    try {
      setIsBuyingNow(true);
      // Remove the product snapshot parameter - now only passing productId and quantity
      await addToCart(String(productId), quantity);
      
      toast.success("Item added to cart! Redirecting to checkout...");
      
      // Small delay to show success message
      setTimeout(() => {
        if (product.link) {
          // If it's an external product, open in new tab
          window.open(product.link, "_blank");
        } else {
          // Navigate to checkout page
          router.push("/checkout");
        }
      }, 500);
    } catch (error) {
      toast.error("Failed to process your request. Please try again.");
      console.error("Buy now error:", error);
    } finally {
      setIsBuyingNow(false);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate subtotal
  const subtotal = price * quantity;

  // Don't render if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
      <div
        className={`relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-neutral-900 via-neutral-900 to-black rounded-3xl overflow-y-auto transition-all duration-500 transform shadow-2xl ${
          isOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-10"
        }`}
        style={{
          border: "1px solid rgba(255, 255, 255, 0.05)",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-black/60 hover:bg-black/90 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Modal Content */}
        <div className="p-6 md:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900 border border-white/5 shadow-xl">
                <img
                  src={allImages[selectedImage]}
                  alt={`${product.title} - Main view`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />

                {/* Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  {product.isFeatured && (
                    <span className={`bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} text-white text-sm px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1.5`}>
                      <Star className="w-3.5 h-3.5" />
                      Featured
                    </span>
                  )}
                  <span className={`text-sm px-3 py-1.5 rounded-full font-medium shadow-lg flex items-center gap-1.5 ${
                    stockStatus === "In Stock"
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/20"
                      : stockStatus === "Low Stock"
                        ? "bg-yellow-600/20 text-yellow-300 border border-yellow-500/20"
                        : "bg-red-600/20 text-red-300 border border-red-500/20"
                    }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      stockStatus === "In Stock" ? "bg-emerald-400"
                        : stockStatus === "Low Stock" ? "bg-yellow-400"
                          : "bg-red-400"
                      }`} />
                    {stockStatus}
                  </span>
                </div>
              </div>

              {/* Thumbnail Images */}
              {allImages.length > 1 && (
                <div className="space-y-3">
                  <p className="text-sm text-neutral-400 font-medium">Product Gallery</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                          selectedImage === index
                            ? `${theme.border} scale-105 shadow-lg ${theme.shadow}`
                            : "border-transparent hover:border-neutral-600 hover:scale-105"
                        }`}
                        aria-label={`View image ${index + 1}`}
                      >
                        <img
                          src={img}
                          alt={`${product.title} - View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {selectedImage === index && (
                          <div className={`absolute inset-0 ${theme.bgLight} flex items-center justify-center`}>
                            <Check className={`w-5 h-5 ${theme.text}`} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="flex flex-col">
              {/* Categories */}
              {product.categories && product.categories.length > 0 && (
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((cat, index) => (
                      <span
                        key={cat._id || cat.id || index}
                        className="px-3 py-1.5 text-sm rounded-full bg-neutral-800/50 text-neutral-300 border border-white/5 hover:bg-neutral-700/50 transition-colors duration-200"
                      >
                        {cat.title}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                {product.title}
              </h1>

              {/* Product ID */}
              {productId && (
                <p className="text-sm text-neutral-500 mb-4 font-mono">
                  ID: {productId.slice(-8)}
                </p>
              )}

              {/* Price Section */}
              <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 border border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-4xl font-bold text-white mb-1">
                      ₦{price.toFixed(2)}
                    </div>
                    {stock < 10 && stock > 0 && (
                      <div className="flex items-center gap-2 text-sm text-yellow-400">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                        Only {stock} left in stock!
                      </div>
                    )}
                  </div>

                  {/* Rating */}
                  {averageRating > 0 && (
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(averageRating) 
                                  ? "text-yellow-400 fill-yellow-400" 
                                  : "text-neutral-600 fill-neutral-700"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-semibold text-white ml-2">
                          {averageRating.toFixed(1)}
                        </span>
                      </div>
                      {totalReviews > 0 && (
                        <span className="text-sm text-neutral-400">
                          {totalReviews} review{totalReviews !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 ${theme.accent} rounded-full`} />
                    Product Description
                  </h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-neutral-300 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Product Details Grid */}
              <div className="bg-neutral-900/30 rounded-2xl p-6 mb-8 border border-white/5 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  Product Specifications
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Status</div>
                    <div className={`font-semibold flex items-center gap-2 ${
                      product.isActive ? "text-emerald-400" : "text-red-400"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        product.isActive ? "bg-emerald-400" : "bg-red-400"
                      }`} />
                      {product.isActive !== undefined ? (product.isActive ? "Active" : "Inactive") : "Active"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Stock</div>
                    <div className={`font-semibold flex items-center gap-2 ${
                      stock > 0 ? "text-green-400" : "text-red-400"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        stock > 0 ? "bg-green-400" : "bg-red-400"
                      }`} />
                      {stock} units
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Featured</div>
                    <div className={`font-semibold flex items-center gap-2 ${
                      product.isFeatured ? `${theme.text}` : "text-neutral-400"
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        product.isFeatured ? `${theme.accent}` : "bg-neutral-400"
                      }`} />
                      {product.isFeatured ? "Yes" : "No"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Added</div>
                    <div className="text-white font-medium">
                      {formatDate(product.createdAt)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Updated</div>
                    <div className="text-white font-medium">
                      {formatDate(product.updatedAt)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-neutral-500 uppercase tracking-wider">Category</div>
                    <div className="text-white font-medium">
                      {product.categories?.[0]?.title || product.category || "Premium"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="mt-auto pt-6 border-t border-white/10">
                {/* Quantity Selector */}
                {stock > 0 && (
                  <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-neutral-900/30 border border-white/5">
                    <div>
                      <div className="text-neutral-300 font-medium mb-1">Quantity</div>
                      <div className="text-sm text-neutral-500">Select how many items you want</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 bg-black/30 rounded-xl p-1">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={quantity <= 1 || isAddingToCart || isBuyingNow}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-4 h-4 text-white" />
                        </button>
                        <span className="w-12 text-center text-xl font-bold text-white">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                          className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={quantity >= stock || isAddingToCart || isBuyingNow}
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <span className="text-sm text-neutral-400">
                        Max: {stock}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {stock > 0 ? (
                    <>
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart || isBuyingNow || cartLoading}
                        className={`flex-1 bg-gradient-to-r ${theme.gradientFrom} ${theme.gradientTo} text-white px-8 py-4 rounded-xl font-semibold ${theme.hoverFrom} ${theme.hoverTo} transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
                      >
                        {isAddingToCart ? (
                          <>
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <div className="text-left">
                              <div>Adding to Cart...</div>
                              <div className="text-sm opacity-90">Please wait</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <GiShoppingCart className="text-2xl" />
                            <div className="text-left">
                              <div>Add to Cart</div>
                              <div className="text-sm opacity-90">₦{subtotal.toFixed(2)} total</div>
                            </div>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleBuyNow}
                        disabled={isBuyingNow || isAddingToCart || cartLoading}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isBuyingNow ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Processing...
                          </div>
                        ) : (
                          "Buy Now"
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      disabled
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-xl font-semibold opacity-50 cursor-not-allowed shadow-inner"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <X className="w-5 h-5" />
                        Out of Stock
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
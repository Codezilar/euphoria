"use client";
import React, { useState, useEffect } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu"
import { cn } from "@/lib/utils";
import { GiShoppingCart } from "react-icons/gi";
import { motion } from "motion/react";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useCart } from "@/contexts/CartContext";

export function Nav() {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navbar className="top-10" />
    </div>
  );
}

function Navbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCartCount, loading: cartLoading } = useCart();
  
  // Get cart count
  const cartCount = getCartCount();

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          setCategories(data.categories);
        } else {
          console.error('Failed to fetch categories:', data.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to truncate description
  const truncateDescription = (desc: string, maxLength: number = 60) => {
    if (!desc) return "No description";
    return desc.length > maxLength ? `${desc.substring(0, maxLength)}...` : desc;
  };

  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <HoveredLink href="/">
          <motion.p
            transition={{ duration: 0.3 }}
            className="cursor-pointer text-white font-black hover:opacity-[0.9]"
          >
            Home
          </motion.p>
        </HoveredLink>
        
        <MenuItem setActive={setActive} active={active} item="Categories">
          <div className="text-sm grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[100%] md:max-h-80 overflow-y-auto shadow-[inset_0_-10px_12px_-8px_rgba(0,0,0,0.35)]">

            {loading ? (
              // Loading skeleton - 6 items for 3 columns
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 h-32 w-full rounded-md mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              ))
            ) : categories.length > 0 ? (
              // Render actual categories with original images
              categories.map((category) => (
                <ProductItem
                  key={category.id}
                  title={category.title}
                  href={`/categories/${category.id}`}
                  src={category.img} // Use original image from database
                  description={truncateDescription(category.description)}
                />
              ))
            ) : (
              // Fallback if no categories
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No categories found</p>
              </div>
            )}
          </div>
        </MenuItem>
        
        <MenuItem setActive={setActive} active={active} item="Help">
          <div className="flex flex-col space-y-4 text-sm">
            <HoveredLink href="/about-us">About Us</HoveredLink>
            <HoveredLink href="/contact-us">Contact Us</HoveredLink>
            <HoveredLink href="/contact-us">Support</HoveredLink>
            <HoveredLink href="/faq">FAQ</HoveredLink>
          </div>
        </MenuItem>
        
        <Link href={'/cart'} className="cart_nav relative group">
          <div className="relative">
            <GiShoppingCart className="text-2xl group-hover:scale-110 transition-transform duration-200" />
            {cartCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 shadow-lg border-2 border-white"
              >
                {cartCount > 99 ? '99+' : cartCount}
              </motion.div>
            )}
            {/* Pulsing dot when loading */}
            {cartLoading && (
              <motion.span
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
              />
            )}
          </div>
          
          {/* Optional tooltip */}
          {cartCount > 0 && (
            <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              {cartCount} item{cartCount !== 1 ? 's' : ''} in cart
            </span>
          )}
        </Link>
        
        <SignedOut>
          <HoveredLink href="/">
            <button className="auth_btn">
              Login
            </button>
          </HoveredLink>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </Menu>
    </div>
  );
}
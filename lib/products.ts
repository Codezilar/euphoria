// /lib/products.ts
// This file should only be imported in Server Components

import mongoose from 'mongoose';
import ProductModel from '@/models/Product';
import { connectToDatabase } from './db';

// Import models to register them
import '@/models/Category';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  categories: Array<{
    id: string;
    title: string;
    image?: string;
  }>;
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getFiveProducts(): Promise<Product[]> {
  try {
    await connectToDatabase();
    
    const products = await ProductModel.find({ isActive: { $ne: false } })
      .populate('categories', 'title image')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    
    return products.map((product: any) => ({
      id: product._id.toString(),
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      categories: product.categories?.map((cat: any) => ({
        id: cat._id.toString(),
        title: cat.title,
        image: cat.image
      })) || [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString()
    }));
    
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    
    await connectToDatabase();
    
    const product = await ProductModel.findById(id)
      .populate('categories', 'title image')
      .lean();
    
    if (!product) return null;
    
    return {
      id: product._id.toString(),
      title: product.title || '',
      description: product.description || '',
      price: product.price || 0,
      images: product.images || [],
      categories: product.categories?.map((cat: any) => ({
        id: cat._id.toString(),
        title: cat.title,
        image: cat.image
      })) || [],
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: product.updatedAt?.toISOString() || new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}
"use client"
import { CanvasRevealEffectDemo } from '@/components/CanvasRevealEffectDemo'
import { Card } from '@/components/Card'
import { GoogleGeminiEffectDemo } from '@/components/Gemini'
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Category {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface Product {
  id: string; 
  title: string;
  description: string;
  price: number;
  stock: number;
  categories: string[];
  images: string[];
  isFeatured: boolean;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
  createdAt: string;
  updatedAt: string;
}

export default function CategoryDetailPage() { // Add "export default" here
  const params = useParams()
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryData()
    fetchProductData()
  }, [params.id])

  const fetchCategoryData = async () => {
    try {
      setLoading(true)
      const categoryId = params.id as string
      
      if (!categoryId) {
        throw new Error('Category ID is required')
      }

      const res = await fetch(`/api/categories/${categoryId}`)
      
      if (!res.ok) {
        throw new Error(`Failed to fetch category: ${res.status}`)
      }
      
      const data = await res.json()
      
      if (data.success && data.category) {
        setCategory(data.category)
      } else {
        throw new Error(data.message || 'Failed to load category data')
      }
    } catch (error) {
      console.error('Error fetching category:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProductData = async () =>  {
    setLoading(true)
    const categoryId = params.id as string
    try {
      const res = await fetch(`/api/products?category=${categoryId}`)
      if (!res.ok) {
        throw new Error(`Failed to fetch products: ${res.status}`)
      }
      const data = await res.json()
      if (data.success && data.products) {
        setProducts(data.products)
      } else {
        throw new Error(data.message || 'Failed to load product data')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div>
        <GoogleGeminiEffectDemo />
        
        <div className="card">
          <div className="card-container">
            <Card products={products} />
          </div>
        </div>
    </div>
  )
}
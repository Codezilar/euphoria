"use client"
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import { useEffect, useState } from "react";

export function AnimatedTestimonialsDemo() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        
        if (data.success) {
          const formattedCategories = data.categories.map((cat: any) => ({
            title: cat.title,
            description: cat.description,
            image: cat.img,
          }));
          setCategories(formattedCategories);
          console.log('Categories:', formattedCategories);
        } else {
          console.error('Failed to fetch categories:', data.message);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  return <AnimatedTestimonials loading={loading} categories={categories} />
}

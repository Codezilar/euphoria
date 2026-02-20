"use client";
import { useScroll, useTransform } from "motion/react";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { GoogleGeminiEffect } from "./ui/google-gemini-effect";

interface Category {
  id: string;
  title: string;
  description: string;
  image?: string;
}

export function GoogleGeminiEffectDemo() {
  const params = useParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const pathLengthFirst = useTransform(scrollYProgress, [0, 0.8], [0.2, 1.2]);
  const pathLengthSecond = useTransform(scrollYProgress, [0, 0.8], [0.15, 1.2]);
  const pathLengthThird = useTransform(scrollYProgress, [0, 0.8], [0.1, 1.2]);
  const pathLengthFourth = useTransform(scrollYProgress, [0, 0.8], [0.05, 1.2]);
  const pathLengthFifth = useTransform(scrollYProgress, [0, 0.8], [0, 1.2]);

  // Fetch category data when component mounts
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Get category ID from params (adjust based on your URL structure)
        const categoryId = params.id as string;
        
        if (!categoryId) {
          throw new Error("Category ID not found");
        }
        
        const res = await fetch(`/api/categories/${categoryId}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch category: ${res.status}`);
        }
        
        const data = await res.json();
        
        if (data.success && data.category) {
          setCategory(data.category);
        } else {
          throw new Error(data.message || "Failed to load category data");
        }
      } catch (err: any) {
        console.error("Error fetching category:", err);
        setError(err.message || "Failed to load category");
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [params.id]);

  if (loading) {
    return (
      <div
        className="h-[400vh] dark:border dark:border-white/[0.1] relative pt-40 overflow-clip"
        ref={ref}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-white text-lg">Loading category data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="h-[400vh] dark:border dark:border-white/[0.1] relative pt-40 overflow-clip"
        ref={ref}
      >
        <div className="flex items-center justify-center h-full">
          <p className="text-red-400 text-lg">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-[400vh] dark:border dark:border-white/[0.1] relative pt-40 overflow-clip"
      ref={ref}
    >
      <GoogleGeminiEffect
        pathLengths={[
          pathLengthFirst,
          pathLengthSecond,
          pathLengthThird,
          pathLengthFourth,
          pathLengthFifth,
        ]}
        title={category?.title || "Category Title"}
        description={category?.description || "Category description"}
        img={category?.image || "/placeholder-category.png"}
      />
    </div>
  );
}
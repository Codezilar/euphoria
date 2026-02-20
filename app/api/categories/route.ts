import { NextRequest, NextResponse } from 'next/server';
import Category from '@/models/Category';
import connectMongoDB from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectMongoDB();
    
    // Get all categories
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .select('title description image createdAt updatedAt')
      .lean();

    // Transform data for DataGrid
    const transformedCategories = categories.map((category, index) => ({
      id: category._id?.toString(),
      _id: category._id?.toString(),
      title: category.title,
      description: category.description,
      img: category.image,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    }));

    return NextResponse.json(
      { 
        success: true,
        categories: transformedCategories 
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('❌ Error fetching categories:', error);
    return NextResponse.json(
      { 
        success: false,
        message: 'Error fetching categories',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; 
import connectMongoDB from "@/lib/mongodb";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    const { productId, quantity } = await req.json();

    // Validate input
    if (!productId || !quantity || quantity < 1) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Verify product exists in database
    let productExists = false;
    try {
      if (mongoose.Types.ObjectId.isValid(productId)) {
        const product = await Product.findById(productId).lean();
        productExists = !!product;
      }
    } catch (e) {
      console.warn("Failed to verify product:", e);
    }

    if (!productExists) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Try to find existing cart item
    let cartItem = await Cart.findOne({ userId, productId });

    if (cartItem) {
      // Update quantity if exists
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item
      cartItem = await Cart.create({
        userId,
        productId,
        quantity,
      });
    }

    // Return the created/updated cart item
    return NextResponse.json(cartItem);
  } catch (error: any) {
    console.error("[CART_POST]", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return new NextResponse("Item already in cart", { status: 409 });
    }
    
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    
    const cartItems = await Cart.find({ userId }).sort({ createdAt: -1 }).lean(); // Most recent first

    // Populate product details for each cart item
    const enriched = await Promise.all(
      cartItems.map(async (item: any) => {
        const pid = item.productId;
        let product = null;

        try {
          if (pid && typeof pid === "string" && mongoose.Types.ObjectId.isValid(pid)) {
            product = await Product.findById(pid).lean();
          }
        } catch (e) {
          console.warn("Failed to populate product for cart item:", e);
        }

        // If product not found, return cart item without product data
        // You might want to handle this differently (e.g., remove from cart)
        if (!product) {
          console.warn(`Product ${pid} not found for cart item`);
        }

        return { ...item, product };
      })
    );

    return NextResponse.json(enriched);
  } catch (error: any) {
    console.error("[CART_GET]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    const { productId, quantity } = await req.json();

    if (!productId || !quantity || quantity < 1) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const cartItem = await Cart.findOneAndUpdate(
      { userId, productId },
      { quantity },
      { new: true } // Return updated document
    );

    if (!cartItem) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    return NextResponse.json(cartItem);
  } catch (error: any) {
    console.error("[CART_PATCH]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return new NextResponse("Product ID required", { status: 400 });
    }

    const result = await Cart.findOneAndDelete({ userId, productId });

    if (!result) {
      return new NextResponse("Cart item not found", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[CART_DELETE]", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
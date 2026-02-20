// /data/index.tsx
// This file contains ONLY static data for client components
// NO database imports, NO mongoose, NO async functions

import { FaBoxesPacking } from "react-icons/fa6";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { ImGift } from "react-icons/im";

import { BsBoxes } from "react-icons/bs";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { SiGoogleanalytics } from "react-icons/si";
import { FaSignsPost } from "react-icons/fa6";
import { FaBoxesStacked } from "react-icons/fa6";
import { FaUsers } from "react-icons/fa";

// Demo items for InfiniteMenu (static fallback)
export const items = [
  {
    image: 'https://picsum.photos/300/300?grayscale',
    link: '/',
    title: 'Premium Vibrator',
    description: 'Experience ultimate pleasure',
    category: 'Vibrators',
    details: { materials: [], features: [], care: [] }
  },
  {
    image: 'https://picsum.photos/400/400?grayscale',
    link: '/',
    title: 'Massage Wand',
    description: 'Powerful and versatile',
    category: 'Massagers',
    details: { materials: [], features: [], care: [] }
  },
  {
    image: 'https://picsum.photos/500/500?grayscale',
    link: '/',
    title: 'Silicone Dildo',
    description: 'Realistic and body-safe',
    category: 'Dildos',
    details: { materials: [], features: [], care: [] }
  },
  {
    image: 'https://picsum.photos/600/600?grayscale',
    link: '/',
    title: 'BDSM Set',
    description: 'Explore your desires',
    category: 'BDSM',
    details: { materials: [], features: [], care: [] }
  },
  {
    image: 'https://picsum.photos/700/700?grayscale',
    link: '/',
    title: 'Lubricant',
    description: 'Premium smooth glide',
    category: 'Lubricants',
    details: { materials: [], features: [], care: [] }
  }
];

// Admin links (static)
export const links = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <TbLayoutDashboardFilled />,
  },
  {
    label: "Post Category",
    href: "/category_post",
    icon: <BsBoxes />,
  },
  {
    label: "Categories",
    href: "/category_list",
    icon: <FaBoxesPacking />,
  },
  {
    label: "Post Product",
    href: "/product_post",
    icon: <FaSignsPost />,
  },
  {
    label: "Products",
    href: "/product_list",
    icon: <FaBoxesStacked />,
  },
  {
    label: "Orders",
    href: "/orders",
    icon: <ImGift />,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: <SiGoogleanalytics />,
  },
  {
    label: "Users",
    href: "/users",
    icon: <FaUsers />,
  },
];

// Dummy data for admin tables (static)
export const initialRows = [
  { 
    id: 1, 
    title: 'Website Redesign Project',
    price: "2000",
    img: "https://picsum.photos/seed/website/80/60" 
  },
  { 
    id: 2, 
    title: 'Mobile App Development',
    price: "2000",
    img: "https://picsum.photos/seed/mobile/80/60" 
  },
  { 
    id: 3, 
    title: 'Database Migration',
    price: "2000",
    img: "https://picsum.photos/seed/database/80/60" 
  },
  { 
    id: 4, 
    title: 'API Integration',
    price: "2000",
    img: "https://picsum.photos/seed/api/80/60" 
  },
];

export const category = [
  { 
    id: 1, 
    title: 'Website Redesign Project',
    description: "2000",
    img: "https://picsum.photos/seed/website/80/60" 
  },
  { 
    id: 2, 
    title: 'Mobile App Development',
    description: "2000",
    img: "https://picsum.photos/seed/mobile/80/60" 
  },
  { 
    id: 3, 
    title: 'Database Migration',
    description: "2000",
    img: "https://picsum.photos/seed/database/80/60" 
  },
  { 
    id: 4, 
    title: 'API Integration',
    description: "2000",
    img: "https://picsum.photos/seed/api/80/60" 
  },
  { 
    id: 5, 
    title: 'Cloud Infrastructure Setup',
    description: "2000",
    img: "https://picsum.photos/seed/cloud/80/60" 
  },
];
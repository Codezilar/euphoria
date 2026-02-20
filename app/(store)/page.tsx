// /app/(store)/page.tsx
import Hero from "@/components/Hero";
import InfiniteMenu from '@/components/InfiniteMenu';
import { 
  getInfiniteMenuItems, 
  getProductsByCategoryTitle,
  getFeaturedProducts 
} from "@/lib/server-data";
import { AppleCardsCarouselDemo } from "@/components/AppleCardsCarouselDemo";
import { AnimatedTestimonialsDemo } from "@/components/AnimatedTestimonialsDemo";
import { BentoGridDemo } from "@/components/BentoGridDemo";
import { HeroParallaxDemo } from "@/components/HeroParallaxDemo";

export const dynamic = 'force-dynamic';

const Page = async () => {
  const infiniteMenuItems = await getInfiniteMenuItems();
  const personal = await getProductsByCategoryTitle("Personal Pleasure Vibrators", 6);
  const bdsm = await getProductsByCategoryTitle("BDSM & Sensual Exploration Kits", 6);
  const mens = await getProductsByCategoryTitle("Men's Pleasure", 6);
  const lubricant = await getProductsByCategoryTitle("Lubricants & Enhancers", 6);
  const couple = await getProductsByCategoryTitle("Couples & Intimacy", 6);
  const lingerieProducts = await getProductsByCategoryTitle("Lingerie", 7);
  const featuredProducts = await getFeaturedProducts(15);
  
  return (
    <div>
      <Hero />
      <div style={{ height: '600px', position: 'relative' }}>
        <InfiniteMenu items={infiniteMenuItems}/>
      </div>
      <AppleCardsCarouselDemo title={"Personal Pleasure Vibrators"} items={personal} />
      <BentoGridDemo title={"Personal Pleasure Vibrators"} items={personal} />
      <AppleCardsCarouselDemo title={"BDSM & Sensual Exploration Kits"} items={bdsm}/>
      <HeroParallaxDemo products={featuredProducts} />
      <AppleCardsCarouselDemo title={"Men's Pleasure"} items={mens} />
      <AnimatedTestimonialsDemo />
    </div>
  );
};

export default Page;
import Footer from "@/components/Footer";
import { InfiniteMovingCardsDemo } from "@/components/InfiniteMovingCardsDemo";
import { Nav } from "@/components/Nav";
import DarkVeil from "@/components/DarkVeil";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div style={{ width: "100%", height: "100vh", position: "fixed"}} className="-z-1">
        <DarkVeil />
      </div>
      <div style={{ width: '100%', height: "100vh", position: 'fixed' }}>
          {/* <LiquidEther
              colors={[ '#5227FF', '#FF9FFC', '#B19EEF' ]}
              mouseForce={20}
              cursorSize={100}
              isViscous={false}
              viscous={30}
              iterationsViscous={32}
              iterationsPoisson={32}
              resolution={0.5}
              isBounce={false}
              autoDemo={true}
              autoSpeed={0.5}
              autoIntensity={2.2}
              takeoverDuration={0.25}
              autoResumeDelay={3000}
              autoRampDuration={0.6}
          /> */}
      </div>
      <Nav />
      {children}
      <InfiniteMovingCardsDemo />
        <Footer />
    </>
  );
}
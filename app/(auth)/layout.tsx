import { AuthStep } from "@/components/AuthStep";
import "./auth.css"
import DarkVeil from "@/components/DarkVeil";
import LiquidEther from "@/components/LiquidEther";



const RootLayout = ({children}: Readonly<{ children: React.ReactNode;}>) => {
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
    <main className="auth">
        <div className='sign_left'>
          <AuthStep />
        </div>
        <section className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
            <div className="w-full flex items-center justify-center">
                {children}
            </div>
        </section>
    </main>
    </>
  )
}

export default RootLayout
import Header from '../components/Header'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Ticker from '../components/Ticker'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import DisclaimerModal from '../components/DisclaimerModal'

export default function Home() {
  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-background-dark">
      <DisclaimerModal />
      <Header />
      
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] glow-effect rounded-full blur-3xl opacity-40"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent"></div>
        </div>
        
        <Hero />
        <Stats />
        <Ticker />
        <CTA />
      </main>

      <Footer />
    </div>
  )
}

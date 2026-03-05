import Header from '../components/Header'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Ticker from '../components/Ticker'
import CTA from '../components/CTA'
import Footer from '../components/Footer'
import DisclaimerModal from '../components/DisclaimerModal'
import SEO from '../components/SEO'

export default function Home() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "name": "CekReput",
        "url": "https://cekreput.com",
        "logo": "https://cekreput.com/favicon.svg",
        "description": "Platform database penipuan Indonesia untuk cek reputasi rekening bank, nomor telepon, e-wallet, dan ID game penipu.",
        "foundingDate": "2026",
        "areaServed": "ID",
        "sameAs": [
          "https://twitter.com/cekreput",
          "https://facebook.com/cekreput",
          "https://instagram.com/cekreput"
          // TODO: Update with actual social media URLs
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "support@cekreput.com",
          "availableLanguage": "Indonesian"
          // TODO: Update with actual support email
        }
      },
      {
        "@type": "WebSite",
        "name": "CekReput",
        "url": "https://cekreput.com",
        "description": "Cek reputasi rekening bank, nomor telepon, e-wallet, dan ID game penipu. Database penipuan Indonesia terlengkap.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://cekreput.com/results?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }

  return (
    <>
      <SEO
        title="Cek Rekening & Telepon Penipu"
        description="Cek reputasi rekening bank, nomor telepon, e-wallet, dan ID game penipu. Database penipuan Indonesia terlengkap dengan verifikasi laporan real-time. Lindungi diri Anda dari penipuan online."
        keywords="cek rekening penipu, cek nomor telepon penipu, database penipuan, cek e-wallet penipu, cek ID game penipu, verifikasi rekening, laporan penipuan Indonesia"
        canonical="https://cekreput.com/"
        structuredData={structuredData}
      />
      <div className="bg-background-dark text-slate-100 font-display min-h-screen flex flex-col antialiased selection:bg-primary selection:text-background-dark">
        <DisclaimerModal />
        <Header />

        <main className="flex-grow flex flex-col relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] glow-effect rounded-full blur-3xl opacity-40"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-background-dark to-transparent"></div>
          </div>

          <Hero />
          <Stats />
          <Ticker />
          <CTA />
        </main>

        <Footer />
      </div>
    </>
  )
}

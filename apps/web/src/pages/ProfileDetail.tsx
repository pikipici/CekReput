import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { perpetratorsApi, type Perpetrator } from '../lib/api'
import ProfileNavbar from '../components/profile/ProfileNavbar'
import ProfileHero from '../components/profile/ProfileHero'
import TimelineChart from '../components/profile/TimelineChart'
import DetailedReports from '../components/profile/DetailedReports'
import CommunityDiscussion from '../components/profile/CommunityDiscussion'
import RelatedData from '../components/profile/RelatedData'
import ProfileFooter from '../components/profile/ProfileFooter'
import SEO from '../components/SEO'

export default function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [perpetrator, setPerpetrator] = useState<Perpetrator | null>(null)

  const matchedGameId = searchParams.get('gameId')
  const matchedGameType = searchParams.get('gameType')

  useEffect(() => {
    if (id) {
      perpetratorsApi.getById(id).then(({ data, error }) => {
        if (!error && data?.perpetrator) {
          setPerpetrator(data.perpetrator)
        }
      })
    }
  }, [id])

  const displayName = perpetrator
    ? (matchedGameId || perpetrator.bankName || perpetrator.entityName || perpetrator.accountNumber || perpetrator.phoneNumber || 'Unknown')
    : 'Memuat Profil...'

  const threatLevelText = perpetrator?.threatLevel === 'danger' ? 'Bahaya' : perpetrator?.threatLevel === 'warning' ? 'Waspada' : 'Aman'

  return (
    <>
      <SEO
        title={`${displayName} - ${threatLevelText || 'Profil'}`}
        description={perpetrator ? `Profil ${displayName}: ${perpetrator.totalReports} laporan, ${perpetrator.verifiedReports} terverifikasi. Tingkat ancaman: ${threatLevelText}. Lihat detail laporan penipuan di CekReput.` : 'Lihat profil detail laporan penipuan di CekReput'}
        keywords={`profil ${displayName}, laporan penipuan, ${perpetrator?.accountType || 'rekening'} penipu, database penipuan`}
        canonical={`https://cekreput.com/profile/${id}`}
        ogType="profile"
      />
      <div className="bg-background-dark font-display text-slate-100 antialiased min-h-screen flex flex-col">
      <ProfileNavbar />

      <main className="flex-grow container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Link className="hover:text-primary" to="/results">Laporan</Link>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="text-white font-medium">{displayName}</span>
        </div>

        <ProfileHero 
          perpetrator={perpetrator} 
          matchedGameId={matchedGameId} 
          matchedGameType={matchedGameType} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Timeline & Reports */}
          <div className="lg:col-span-2 space-y-6">
            <TimelineChart perpetratorId={id} />
            <DetailedReports perpetratorId={id} />
          </div>

          {/* Right Column: Community & Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <CommunityDiscussion />
            {matchedGameId && perpetrator && (
              <RelatedData perpetrator={perpetrator} />
            )}
          </div>
        </div>
      </main>

      <ProfileFooter />
    </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { perpetratorsApi, type Perpetrator } from '../lib/api'
import ProfileNavbar from '../components/profile/ProfileNavbar'
import ProfileHero from '../components/profile/ProfileHero'
import ActivityTimeline from '../components/profile/ActivityTimeline'
import DetailedReports from '../components/profile/DetailedReports'
import CommunityDiscussion from '../components/profile/CommunityDiscussion'
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

        <main className="flex-grow container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Link className="hover:text-primary" to="/results">Laporan</Link>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-white font-medium">{displayName}</span>
          </div>

          {/* Profile Hero */}
          <ProfileHero
            perpetrator={perpetrator}
            matchedGameId={matchedGameId}
            matchedGameType={matchedGameType}
          />

          {/* Activity Timeline (Simple List) */}
          <ActivityTimeline perpetratorId={id} />

          {/* Detailed Reports */}
          <DetailedReports perpetratorId={id} />

          {/* Community Discussion */}
          <CommunityDiscussion />
        </main>

        <ProfileFooter />
      </div>
    </>
  )
}

import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import ProfileForm from '../components/profile/ProfileForm'
import ProfileSidebar from '../components/profile/ProfileSidebar'
import { getProfile } from '../services/authService'
import { getDocuments } from '../services/documentService'
import { getFavorites } from '../services/favoriteService'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    uploadedCount: 0, savedCount: 0, totalViews: 0, totalDownloads: 0,
  })

  useEffect(() => {
    getProfile().then((res) => {
      const currentUser = res.user
      setProfile(currentUser)

      Promise.all([getDocuments(), getFavorites()]).then(([documents, favorites]) => {
        const myDocuments = documents.filter((doc) => doc.user_id === currentUser.id)

        setStats({
          uploadedCount: myDocuments.length,
          savedCount: favorites.length,
          totalViews: myDocuments.reduce((sum, d) => sum + (d.view_count || 0), 0),
          totalDownloads: myDocuments.reduce((sum, d) => sum + (d.download_count || 0), 0),
        })
      }).catch(console.error)
    }).catch(console.error)
  }, [])

  if (!profile) return null // TODO: skeleton/loading nếu muốn

  return (
    <>
      <Header isAuthenticated />

      <main className="profile-page">
        <div className="profile-layout">
          <ProfileSidebar profile={profile} stats={stats} />
          <ProfileForm profile={profile} />
        </div>
      </main>
    </>
  )
}

export default ProfilePage
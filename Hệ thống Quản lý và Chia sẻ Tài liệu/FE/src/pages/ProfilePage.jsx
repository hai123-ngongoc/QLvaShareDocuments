import { useEffect, useState } from 'react'
import Header from '../components/layout/Header'
import ProfileForm from '../components/profile/ProfileForm'
import ProfileSidebar from '../components/profile/ProfileSidebar'
import ChangePasswordForm from '../components/profile/ChangePasswordForm'
import NotificationPanel from '../components/profile/NotificationPanel'
import { getProfile } from '../services/authService'
import { getDocuments } from '../services/documentService'
import { getFavorites } from '../services/favoriteService'
import { getInitials } from '../utils/userDisplay'

function ProfilePage() {
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('Chỉnh sửa hồ sơ')
  const [stats, setStats] = useState({
    uploadedCount: 0, savedCount: 0, totalViews: 0, totalDownloads: 0,
  })

  const handleProfileUpdate = (updatedUser) => {
    const initials = getInitials(updatedUser)
    const displayName = updatedUser.username
    const joinedYear = updatedUser.created_at
      ? new Date(updatedUser.created_at).getFullYear().toString()
      : '2026'

    setProfile({
      ...updatedUser,
      initials,
      displayName,
      joinedYear,
    })
  }

  useEffect(() => {
    getProfile().then((res) => {
      const currentUser = res.user
      const initials = getInitials(currentUser)
      const displayName = currentUser.username
      const joinedYear = currentUser.created_at
        ? new Date(currentUser.created_at).getFullYear().toString()
        : '2026'

      const mappedUser = {
        ...currentUser,
        initials,
        displayName,
        joinedYear,
      }
      setProfile(mappedUser)

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
          <ProfileSidebar
            profile={profile}
            stats={stats}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          {activeTab === 'Chỉnh sửa hồ sơ' && (
            <ProfileForm profile={profile} onProfileUpdate={handleProfileUpdate} />
          )}
          {activeTab === 'Đổi mật khẩu' && (
            <ChangePasswordForm />
          )}
          {activeTab === 'Thông báo' && <NotificationPanel />}
        </div>
      </main>
    </>
  )
}

export default ProfilePage
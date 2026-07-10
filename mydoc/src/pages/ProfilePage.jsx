import Header from '../components/layout/Header'
import ProfileForm from '../components/profile/ProfileForm'
import ProfileSidebar from '../components/profile/ProfileSidebar'
import { getCurrentUserProfile, getMyLibraryStats } from '../data/homeSelectors'

const profile = getCurrentUserProfile()
const stats = getMyLibraryStats()

function ProfilePage() {
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

import Header from '../components/layout/Header'
import ProfileForm from '../components/profile/ProfileForm'
import ProfileSidebar from '../components/profile/ProfileSidebar'
import useAuthModal from '../hooks/useAuthModal'
import { getCurrentUserProfile, getMyLibraryStats } from '../data/homeSelectors'

function getInitials(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'
  )
}

function createSessionProfile(user) {
  if (!user) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    created_at: user.created_at,
    initials: getInitials(user.username),
    displayName: user.username,
    joinedYear: new Date(user.created_at).getFullYear().toString(),
    school: 'Chưa có dữ liệu',
    faculty: 'Chưa có dữ liệu',
    studentId: 'Chưa có dữ liệu',
  }
}

function ProfilePage() {
  const { currentUser } = useAuthModal()
  const profile = getCurrentUserProfile(currentUser?.id) ?? createSessionProfile(currentUser)
  const stats = getMyLibraryStats(currentUser?.id)

  if (!profile) return null

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

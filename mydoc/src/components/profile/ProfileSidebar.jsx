import {
  Bell,
  Building2,
  Lock,
  LogOut,
  Mail,
  Pencil,
  School,
} from 'lucide-react'

const menuItems = [
  { label: 'Chỉnh sửa hồ sơ', icon: Pencil, active: true },
  { label: 'Đổi mật khẩu', icon: Lock },
  { label: 'Thông báo', icon: Bell },
]

function ProfileSidebar({ profile, stats }) {
  const profileInfo = [
    { label: profile.email, icon: Mail },
    // TODO: cần backend bổ sung school trong bảng users/profile, tạm dùng fallback.
    { label: profile.school, icon: School },
    // TODO: cần backend bổ sung faculty trong bảng users/profile, tạm dùng fallback.
    { label: profile.faculty, icon: Building2 },
  ]
  const statItems = [
    { label: 'Tài liệu đã upload', value: stats.uploadedCount.toLocaleString() },
    { label: 'Đã lưu', value: stats.savedCount.toLocaleString() },
    { label: 'Tổng lượt tải', value: stats.totalDownloads.toLocaleString() },
    { label: 'Tổng lượt xem', value: stats.totalViews.toLocaleString() },
  ]

  return (
    <aside className="profile-sidebar" aria-label="Thông tin hồ sơ">
      <section className="profile-card profile-card--identity">
        <span className="profile-avatar profile-avatar--large" aria-hidden="true">
          {profile.initials}
        </span>
        <h1>{profile.displayName}</h1>
        <span className="profile-join-badge">Tham gia từ {profile.joinedYear}</span>

        <div className="profile-info-list">
          {profileInfo.map((item) => (
            <div className="profile-info-item" key={item.label}>
              <item.icon size={15} strokeWidth={2} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-card profile-card--stats">
        <h2>Thống kê</h2>
        <div className="profile-stat-list">
          {statItems.map((stat) => (
            <div className="profile-stat-row" key={stat.label}>
              <span>{stat.label}</span>
              <strong>
                {stat.icon && <stat.icon size={14} strokeWidth={2} fill="currentColor" />}
                {stat.value}
              </strong>
            </div>
          ))}
        </div>
      </section>

      <nav className="profile-card profile-menu" aria-label="Cài đặt hồ sơ">
        {menuItems.map((item) => (
          <button
            className={`profile-menu-item ${item.active ? 'profile-menu-item--active' : ''}`}
            type="button"
            key={item.label}
          >
            <item.icon size={16} strokeWidth={2} />
            <span>{item.label}</span>
          </button>
        ))}

        <div className="profile-menu-divider" />

        <button className="profile-menu-item profile-menu-item--danger" type="button">
          <LogOut size={16} strokeWidth={2} />
          <span>Đăng xuất</span>
        </button>
      </nav>
    </aside>
  )
}

export default ProfileSidebar

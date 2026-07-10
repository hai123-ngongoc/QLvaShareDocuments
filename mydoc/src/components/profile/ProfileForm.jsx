import { Camera, Pencil } from 'lucide-react'

function ProfileForm({ profile }) {
  return (
    <section className="profile-panel" aria-labelledby="profile-form-title">
      <div className="profile-panel__heading">
        <Pencil size={18} strokeWidth={2.2} />
        <h2 id="profile-form-title">Chỉnh sửa hồ sơ</h2>
      </div>

      <form className="profile-form" onSubmit={(event) => event.preventDefault()}>
        <fieldset>
          <legend>Thông tin cá nhân</legend>

          <div className="profile-form-grid">
            <label className="profile-field">
              <span>Tên người dùng</span>
              <input type="text" defaultValue={profile.username} />
            </label>

            <label className="profile-field">
              <span>Email</span>
              <input type="email" defaultValue={profile.email} disabled />
            </label>

            <label className="profile-field">
              <span>Vai trò</span>
              <input type="text" defaultValue={profile.role} />
            </label>

            <label className="profile-field">
              <span>ID</span>
              <input type="text" defaultValue={profile.id} disabled />
            </label>
          </div>
        </fieldset>

        <section className="profile-photo-section" aria-labelledby="profile-photo-title">
          <h3 id="profile-photo-title">Ảnh đại diện</h3>
          <div className="profile-photo-upload">
            <div className="profile-photo-copy">
              <span className="profile-avatar profile-avatar--small" aria-hidden="true">
                {profile.initials}
              </span>
              <div>
                <strong>Tải ảnh mới lên</strong>
                <span>PNG, JPG tối đa 2 MB</span>
              </div>
            </div>

            <button className="button button--outline profile-photo-button" type="button">
              <Camera size={16} strokeWidth={2} />
              Chọn ảnh
            </button>
          </div>
        </section>

        <div className="profile-form-actions">
          <button className="button button--outline" type="button">
            Hủy
          </button>
          <button className="button button--primary" type="submit">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProfileForm

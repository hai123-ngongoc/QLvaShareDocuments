import { useState, useRef, useEffect } from 'react'
import { Camera, Pencil } from 'lucide-react'
import { updateProfile } from '../../services/authService'
import useAuthModal from '../../hooks/useAuthModal'
import { API_URL } from '../../services/api'

function ProfileForm({ profile, onProfileUpdate }) {
  const [username, setUsername] = useState(profile.username || '')
  const [email, setEmail] = useState(profile.email || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)

  const fileInputRef = useRef(null)
  const { setUser } = useAuthModal()

  useEffect(() => {
    setUsername(profile.username || '')
    setEmail(profile.email || '')
    setAvatarFile(null)
    setAvatarPreview(null)
    setMessage({ text: '', type: '' })
  }, [profile])

  const handleChooseFile = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ text: 'File ảnh vượt quá dung lượng 2 MB cho phép.', type: 'error' })
        return
      }
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
      setMessage({ text: '', type: '' })
    }
  }

  const handleCancel = () => {
    setUsername(profile.username || '')
    setEmail(profile.email || '')
    setAvatarFile(null)
    setAvatarPreview(null)
    setMessage({ text: '', type: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    if (!username.trim()) {
      setMessage({ text: 'Tên người dùng không được để trống.', type: 'error' })
      setIsLoading(false)
      return
    }

    if (!email.trim()) {
      setMessage({ text: 'Email không được để trống.', type: 'error' })
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('username', username.trim())
      formData.append('email', email.trim())
      if (avatarFile) {
        formData.append('avatar', avatarFile)
      }

      const res = await updateProfile(formData)
      if (res.success && res.user) {
        setUser(res.user)
        localStorage.setItem('user', JSON.stringify(res.user))
        if (onProfileUpdate) {
          onProfileUpdate(res.user)
        }
        setMessage({ text: 'Cập nhật hồ sơ thành công!', type: 'success' })
      }
    } catch (error) {
      console.error(error)
      setMessage({ text: error.message || 'Lỗi hệ thống khi cập nhật hồ sơ.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="profile-panel" aria-labelledby="profile-form-title">
      <div className="profile-panel__heading">
        <Pencil size={18} strokeWidth={2.2} />
        <h2 id="profile-form-title">Chỉnh sửa hồ sơ</h2>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Thông tin cá nhân</legend>

          <div className="profile-form-grid">
            <label className="profile-field">
              <span>Tên người dùng</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </label>

            <label className="profile-field">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="profile-field">
              <span>Vai trò</span>
              <input type="text" defaultValue={profile.role} disabled />
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
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" />
                ) : profile.avatar ? (
                  <img src={`${API_URL}${profile.avatar}`} alt="Avatar" />
                ) : (
                  profile.initials
                )}
              </span>
              <div>
                <strong>Tải ảnh mới lên</strong>
                <span>PNG, JPG tối đa 2 MB</span>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: 'none' }}
            />

            <button
              className="button button--outline profile-photo-button"
              type="button"
              onClick={handleChooseFile}
            >
              <Camera size={16} strokeWidth={2} />
              Chọn ảnh
            </button>
          </div>
        </section>

        {message.text && (
          <div
            className={`profile-form-message ${
              message.type === 'error' ? 'message-danger' : 'message-success'
            }`}
            style={{
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              marginTop: '15px',
              backgroundColor: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
              color: message.type === 'error' ? '#ef4444' : '#10b981',
              border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
            }}
          >
            {message.text}
          </div>
        )}

        <div className="profile-form-actions">
          <button
            className="button button--outline"
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button className="button button--primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProfileForm

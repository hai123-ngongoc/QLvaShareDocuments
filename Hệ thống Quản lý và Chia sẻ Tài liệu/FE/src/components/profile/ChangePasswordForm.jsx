import { useState } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { changePassword } from '../../services/authService'

function ChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowOldPassword(false)
    setShowNewPassword(false)
    setShowConfirmPassword(false)
    setMessage({ text: '', type: '' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsLoading(true)
    setMessage({ text: '', type: '' })

    if (!oldPassword || !newPassword || !confirmPassword) {
      setMessage({ text: 'Vui lòng điền đầy đủ tất cả các trường.', type: 'error' })
      setIsLoading(false)
      return
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'Mật khẩu mới phải có ít nhất 6 ký tự.', type: 'error' })
      setIsLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Mật khẩu mới và mật khẩu xác nhận không khớp.', type: 'error' })
      setIsLoading(false)
      return
    }

    try {
      const res = await changePassword({ oldPassword, newPassword })
      if (res.success) {
        setMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' })
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      }
    } catch (error) {
      console.error(error)
      setMessage({ text: error.message || 'Lỗi khi đổi mật khẩu.', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="profile-panel" aria-labelledby="password-form-title">
      <div className="profile-panel__heading">
        <Lock size={18} strokeWidth={2.2} />
        <h2 id="password-form-title">Đổi mật khẩu</h2>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <fieldset>
          <legend>Cài đặt bảo mật</legend>

          <div className="profile-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <label className="profile-field">
              <span>Mật khẩu cũ</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ paddingRight: '40px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-soft, #9ca3af)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showOldPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="profile-field">
              <span>Mật khẩu mới</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: '40px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-soft, #9ca3af)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showNewPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>

            <label className="profile-field">
              <span>Xác nhận mật khẩu mới</span>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                  style={{ paddingRight: '40px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--text-soft, #9ca3af)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </label>
          </div>
        </fieldset>

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

        <div className="profile-form-actions" style={{ marginTop: '30px' }}>
          <button
            className="button button--outline"
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Hủy
          </button>
          <button className="button button--primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Đang lưu...' : 'Lưu mật khẩu'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ChangePasswordForm

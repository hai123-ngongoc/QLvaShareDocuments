import { Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { login, register } from '../../services/authService'
import logo from '../../assets/logo.png'

function LoginModal({ isOpen, mode = 'login', onClose, onModeChange, onSuccess, pendingAction }) {
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const emailInputRef = useRef(null)
  const usernameInputRef = useRef(null)
  const isRegisterMode = mode === 'register'
  const resetAndClose = useCallback(() => {
    setErrorMessage('')
    setIsSubmitting(false)
    setPassword('')
    setConfirmPassword('')
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') resetAndClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.setTimeout(() => {
      if (isRegisterMode) usernameInputRef.current?.focus()
      else emailInputRef.current?.focus()
    }, 0)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isRegisterMode, resetAndClose])

  const switchMode = (nextMode) => {
    setErrorMessage('')
    setIsSubmitting(false)
    setPassword('')
    setConfirmPassword('')
    onModeChange(nextMode)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isSubmitting) return

    setErrorMessage('')

    if (isRegisterMode && !username.trim()) {
      setErrorMessage('Vui lòng nhập tên người dùng.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập email và mật khẩu.')
      return
    }

    if (isRegisterMode && password !== confirmPassword) {
      setErrorMessage('Mật khẩu nhập lại chưa khớp.')
      return
    }

    setIsSubmitting(true)

    try {
      if (isRegisterMode) {
        await register({ username: username.trim(), email: email.trim(), password })
      }

      const data = await login({ username: email.trim(), password })

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setIsSubmitting(false)
      setPassword('')
      setConfirmPassword('')
      onSuccess()
    } catch (error) {
      setIsSubmitting(false)
      setErrorMessage(error.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  if (!isOpen) return null

  return (
    <div className="login-modal" role="presentation" onMouseDown={resetAndClose}>
      <section
        className="login-card login-card--modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="login-modal__close" type="button" aria-label="Đóng" onClick={resetAndClose}>
          <X size={20} strokeWidth={2} />
        </button>

        <a className="login-brand" href="/" aria-label="DOC homepage">
          <img src={logo} alt="" />
          <span>DOC</span>
        </a>

        <div className="login-heading">
          <h1 id="login-title">{isRegisterMode ? 'Đăng ký' : 'Đăng nhập'}</h1>
          <p>
            {isRegisterMode
              ? 'Tạo tài khoản để lưu, tải và chia sẻ tài liệu học tập.'
              : 'Truy cập thư viện tài liệu học tập và quản lý tài liệu của bạn.'}
          </p>
          {pendingAction?.label && (
            <small className="login-pending-action">{pendingAction.label}</small>
          )}
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {errorMessage && (
            <p className="login-error" id="login-error" role="alert">
              {errorMessage}
            </p>
          )}

          {isRegisterMode && (
            <div className="login-field">
              <label htmlFor="register-username">Tên người dùng</label>
              <span className="login-input">
                <User size={18} strokeWidth={2} aria-hidden="true" />
                <input
                  id="register-username"
                  ref={usernameInputRef}
                  type="text"
                  placeholder="Ví dụ: demo_user"
                  autoComplete="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  aria-describedby={errorMessage ? 'login-error' : undefined}
                  aria-invalid={Boolean(errorMessage)}
                />
              </span>
            </div>
          )}

          <div className="login-field">
            <label htmlFor="login-identifier">Email</label>
            <span className="login-input">
              <Mail size={18} strokeWidth={2} aria-hidden="true" />
              <input
                id="login-identifier"
                ref={emailInputRef}
                type="text"
                placeholder="han@example.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                aria-describedby={errorMessage ? 'login-error' : undefined}
                aria-invalid={Boolean(errorMessage)}
              />
            </span>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <span className="login-input">
              <Lock size={18} strokeWidth={2} aria-hidden="true" />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu"
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-describedby={errorMessage ? 'login-error' : undefined}
                aria-invalid={Boolean(errorMessage)}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? (
                  <EyeOff size={18} strokeWidth={2} />
                ) : (
                  <Eye size={18} strokeWidth={2} />
                )}
              </button>
            </span>
          </div>

          {isRegisterMode && (
            <div className="login-field">
              <label htmlFor="register-confirm-password">Nhập lại mật khẩu</label>
              <span className="login-input">
                <Lock size={18} strokeWidth={2} aria-hidden="true" />
                <input
                  id="register-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  aria-describedby={errorMessage ? 'login-error' : undefined}
                  aria-invalid={Boolean(errorMessage)}
                />
              </span>
            </div>
          )}

          {!isRegisterMode && (
            <div className="login-options">
              <label htmlFor="remember-login">
                <input id="remember-login" type="checkbox" />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          <button
            className="button button--primary login-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="login-spinner" aria-hidden="true" />}
            {isSubmitting
              ? isRegisterMode
                ? 'Đang đăng ký...'
                : 'Đang đăng nhập...'
              : isRegisterMode
                ? 'Đăng ký'
                : 'Đăng nhập'}
          </button>
        </form>

        <p className="login-register">
          {isRegisterMode ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}{' '}
          <button
            className="login-inline-action"
            type="button"
            onClick={() => switchMode(isRegisterMode ? 'login' : 'register')}
          >
            {isRegisterMode ? 'Đăng nhập' : 'Đăng ký ngay'}
          </button>
        </p>
      </section>
    </div>
  )
}

export default LoginModal

import { Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import logo from '../../assets/logo.png'
import useAuthModal from '../../hooks/useAuthModal'
import useScrollDirection from '../../hooks/useScrollDirection'

function Header({ showThemeToggle = true, variant = 'default', isAuthenticated: authOverride }) {
  const isVisible = useScrollDirection()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isProfileVariant = variant === 'profile'
  const {
    isAuthenticated: modalAuthenticated,
    openLoginModal,
    openRegisterModal,
  } = useAuthModal()
  const isAuthenticated = authOverride ?? modalAuthenticated

  // check nếu document đã được render trước khi truy cập classList để tránh lỗi khi render phía server
  const [isLight, setIsLight] = useState(() => {
    return typeof document !== 'undefined' && document.documentElement.classList.contains('light-theme')
  })

  // check nếu document đã được render trước khi truy cập classList để tránh lỗi khi render phía server
  useEffect(() => {
    if (isLight) document.documentElement.classList.add('light-theme')
    else document.documentElement.classList.remove('light-theme')
  }, [isLight])

  const themeToggle = showThemeToggle && (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Chuyển giao diện sáng/tối"
      onClick={() => setIsLight(!isLight)}
    >
      {isLight ? '🌙' : '☀️'}
    </button>
  )

  return (
    <header
      className={`site-header ${isProfileVariant ? 'site-header--profile' : ''} ${
        isVisible ? 'site-header--visible' : 'site-header--hidden'
      } ${isAuthenticated ? '' : 'site-header--guest'} ${
        isMenuOpen ? 'site-header--menu-open' : ''
      }`}
    >
      <div className="site-header__inner">
        <a className="brand" href="/" aria-label="DOC homepage">
          <img className="brand__mark" src={logo} alt="" />
          <span>DOC</span>
        </a>

        <button
          className="site-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? <X size={22} strokeWidth={2} /> : <Menu size={22} strokeWidth={2} />}
        </button>

        <nav className="site-nav" aria-label="Điều hướng chính">
          <a href="/courses" onClick={() => setIsMenuOpen(false)}>
            {isProfileVariant ? 'Học phần' : '📚 Học phần'}
          </a>
          {isAuthenticated && (
            <a href="/library" onClick={() => setIsMenuOpen(false)}>
              {isProfileVariant ? 'Thư viện của tôi' : '👤 Thư viện của tôi'}
            </a>
          )}
        </nav>

        <div className="site-actions">
          {isAuthenticated ? (
            <>
              <a className="button button--ghost" href="/upload">
                + Upload
              </a>
              {themeToggle}
              <a className="avatar" href="/profile" aria-label="Tài khoản Gia Hân">
                GH
              </a>
            </>
          ) : (
            <>
              {themeToggle}
              <span className="site-actions__divider" aria-hidden="true" />
              <button
                className="button button--ghost site-login-button"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  openLoginModal({
                    label: 'Đăng nhập để tiếp tục sử dụng DocHub.',
                  })
                }}
              >
                Đăng nhập
              </button>
              <button
                className="button button--primary"
                type="button"
                onClick={() => {
                  setIsMenuOpen(false)
                  openRegisterModal()
                }}
              >
                Đăng ký
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

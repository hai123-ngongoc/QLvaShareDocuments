import { FileText, LogOut, Menu, Settings, Shield, User, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/logo.png'
import useAuthModal from '../../hooks/useAuthModal'
import useScrollDirection from '../../hooks/useScrollDirection'
import { getInitials } from '../../utils/userDisplay'
import { API_URL } from '../../services/api'

const THEME_STORAGE_KEY = 'theme'

function getInitialLightTheme() {
  if (typeof window === 'undefined') return false

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (storedTheme === 'light') return true
  if (storedTheme === 'dark') return false

  return document.documentElement.classList.contains('light-theme')
}

function Header({ showThemeToggle = true, variant = 'default', isAuthenticated: authOverride }) {
  const isVisible = useScrollDirection()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const accountMenuRef = useRef(null)
  const isProfileVariant = variant === 'profile'
  const {
    isAuthenticated: modalAuthenticated,
    logout,
    openLoginModal,
    openRegisterModal,
    user,
  } = useAuthModal()
  const isAuthenticated = authOverride ?? modalAuthenticated
  const isAdmin = user?.role === 'admin'
  
  const avatarLabel = user ? getInitials(user) : 'GH'
  const accountName = user?.username || 'Tài khoản'
  const accountEmail = user?.email || 'Chưa có email'

  const [isLight, setIsLight] = useState(getInitialLightTheme)

  // check nếu document đã được render trước khi truy cập classList để tránh lỗi khi render phía server
  useEffect(() => {
    if (isLight) {
      document.documentElement.classList.add('light-theme')
      window.localStorage.setItem(THEME_STORAGE_KEY, 'light')
    } else {
      document.documentElement.classList.remove('light-theme')
      window.localStorage.setItem(THEME_STORAGE_KEY, 'dark')
    }
  }, [isLight])

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAccountMenuOpen])

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

  const renderAvatar = () => {
    if (user?.avatar) {
      return <img src={`${API_URL}${user.avatar}`} alt={user.username} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
    }
    return avatarLabel
  }

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
          {isAuthenticated && isAdmin && (
            <a href="/admin" onClick={() => setIsMenuOpen(false)}>
              Quản trị
            </a>
          )}
          {isAuthenticated && !isAdmin && (
            <a href="/library" onClick={() => setIsMenuOpen(false)}>
              {isProfileVariant ? 'Thư viện của tôi' : '👤 Thư viện của tôi'}
            </a>
          )}
        </nav>

        <div className="site-actions">
          {isAuthenticated ? (
            <>
              {!isAdmin && (
                <a className="button button--ghost" href="/upload">
                  + Upload
                </a>
              )}
              {themeToggle}
              <div className="account-menu" ref={accountMenuRef}>
                <button
                  className="avatar account-menu__trigger"
                  type="button"
                  aria-label="Mở menu tài khoản"
                  aria-expanded={isAccountMenuOpen}
                  aria-haspopup="menu"
                  onClick={() => setIsAccountMenuOpen((current) => !current)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, overflow: 'hidden' }}
                >
                  {renderAvatar()}
                </button>

                {isAccountMenuOpen && (
                  <div className="account-dropdown" role="menu">
                    <div className="account-dropdown__profile">
                      <span className="account-dropdown__avatar" aria-hidden="true" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {renderAvatar()}
                      </span>
                      <div>
                        <strong>{accountName}</strong>
                        <span>{accountEmail}</span>
                      </div>
                    </div>

                    <div className="account-dropdown__list">
                      <a
                        className="account-dropdown__item"
                        href={isAdmin ? '/admin' : '/profile'}
                        role="menuitem"
                        onClick={() => {
                          setIsAccountMenuOpen(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        {isAdmin ? <Shield size={18} /> : <User size={18} />}
                        {isAdmin ? 'Quản trị' : 'Trang cá nhân'}
                      </a>

                      {!isAdmin && (
                        <a
                          className="account-dropdown__item"
                          href="/library"
                          role="menuitem"
                          onClick={() => {
                            setIsAccountMenuOpen(false)
                            setIsMenuOpen(false)
                          }}
                        >
                          <FileText size={18} />
                          Tài liệu của tôi
                        </a>
                      )}

                      <a
                        className="account-dropdown__item"
                        href="/profile#settings"
                        role="menuitem"
                        onClick={() => {
                          setIsAccountMenuOpen(false)
                          setIsMenuOpen(false)
                        }}
                      >
                        <Settings size={18} />
                        Cài đặt
                      </a>
                    </div>

                    <button
                      className="account-dropdown__item account-dropdown__logout"
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsAccountMenuOpen(false)
                        setIsMenuOpen(false)
                        logout()
                      }}
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
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
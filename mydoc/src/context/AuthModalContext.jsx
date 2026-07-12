import { useCallback, useEffect, useMemo, useState } from 'react'
import LoginModal from '../components/auth/LoginModal'
import { users } from '../data/mockDatabase'
import AuthModalContext from './authModalContextValue'

const AUTH_STORAGE_KEY = 'dochub_mock_user'

function getStoredUser() {
  if (typeof window === 'undefined') return null

  try {
    const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY)
    return storedUser ? JSON.parse(storedUser) : null
  } catch {
    return null
  }
}

export function AuthModalProvider({ children, initialOpen = false, initialMode = 'login' }) {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser())
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredUser()))
  const [isLoginOpen, setIsLoginOpen] = useState(initialOpen)
  const [authMode, setAuthMode] = useState(initialMode)
  const [pendingAction, setPendingAction] = useState(null)

  useEffect(() => {
    if (!isLoginOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isLoginOpen])

  const closeLoginModal = useCallback(() => {
    setIsLoginOpen(false)
    setPendingAction(null)

    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      window.history.replaceState(null, '', '/')
    }
  }, [])

  const openLoginModal = useCallback((action = null) => {
    setAuthMode('login')
    setPendingAction(action)
    setIsLoginOpen(true)
  }, [])

  const openRegisterModal = useCallback((action = null) => {
    setAuthMode('register')
    setPendingAction(action)
    setIsLoginOpen(true)
  }, [])

  const requireAuth = useCallback(
    (action) => {
      if (isAuthenticated) {
        action?.onSuccess?.()
        return
      }

      openLoginModal(action)
    },
    [isAuthenticated, openLoginModal],
  )

  const completeLogin = useCallback(() => {
    const actionToResume = pendingAction

    setIsAuthenticated(true)
    setIsLoginOpen(false)
    setPendingAction(null)

    if (window.location.pathname === '/login' || window.location.pathname === '/register') {
      window.history.replaceState(null, '', '/')
    }

    window.setTimeout(() => {
      actionToResume?.onSuccess?.()
    }, 0)
  }, [pendingAction])

  const loginWithCredentials = useCallback(
    ({ email, password }) => {
      const matchedUser = users.find((user) => {
        return user.email === email.trim() && user.password === password
      })

      if (!matchedUser) {
        return {
          ok: false,
          message: 'Email hoặc mật khẩu chưa đúng.',
        }
      }

      setCurrentUser(matchedUser)
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(matchedUser))
      completeLogin()

      return { ok: true }
    },
    [completeLogin],
  )

  const registerMockUser = useCallback(
    ({ username, email, password }) => {
      const isExistingEmail = users.some((user) => user.email === email.trim())

      if (isExistingEmail) {
        return {
          ok: false,
          message: 'Email này đã được dùng.',
        }
      }

      const newUser = {
        id: 'mock-new-user',
        username: username.trim(),
        password,
        email: email.trim(),
        avatar: null,
        role: 'user',
        created_at: new Date().toISOString(),
      }

      setCurrentUser(newUser)
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser))
      completeLogin()

      return { ok: true }
    },
    [completeLogin],
  )

  const logout = useCallback(() => {
    setCurrentUser(null)
    setIsAuthenticated(false)
    setPendingAction(null)
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
  }, [])

  const value = useMemo(
    () => ({
      closeLoginModal,
      completeLogin,
      authMode,
      currentUser,
      isAuthenticated,
      isLoginOpen,
      loginWithCredentials,
      logout,
      openLoginModal,
      openRegisterModal,
      pendingAction,
      registerMockUser,
      requireAuth,
      setAuthMode,
    }),
    [
      authMode,
      closeLoginModal,
      completeLogin,
      currentUser,
      isAuthenticated,
      isLoginOpen,
      loginWithCredentials,
      logout,
      openLoginModal,
      openRegisterModal,
      pendingAction,
      registerMockUser,
      requireAuth,
    ],
  )

  return (
    <AuthModalContext.Provider value={value}>
      {children}
      <LoginModal
        isOpen={isLoginOpen}
        mode={authMode}
        onClose={closeLoginModal}
        onModeChange={setAuthMode}
        onLogin={loginWithCredentials}
        onRegister={registerMockUser}
        pendingAction={pendingAction}
      />
    </AuthModalContext.Provider>
  )
}

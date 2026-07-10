import { useCallback, useEffect, useMemo, useState } from 'react'
import LoginModal from '../components/auth/LoginModal'
import AuthModalContext from './authModalContextValue'

export function AuthModalProvider({ children, initialOpen = false, initialMode = 'login' }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
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

  const value = useMemo(
    () => ({
      closeLoginModal,
      completeLogin,
      authMode,
      isAuthenticated,
      isLoginOpen,
      openLoginModal,
      openRegisterModal,
      pendingAction,
      requireAuth,
      setAuthMode,
    }),
    [
      authMode,
      closeLoginModal,
      completeLogin,
      isAuthenticated,
      isLoginOpen,
      openLoginModal,
      openRegisterModal,
      pendingAction,
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
        onSuccess={completeLogin}
        pendingAction={pendingAction}
      />
    </AuthModalContext.Provider>
  )
}

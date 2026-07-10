import { useContext } from 'react'
import AuthModalContext from '../context/authModalContextValue'

function useAuthModal() {
  const context = useContext(AuthModalContext)

  if (!context) {
    throw new Error('useAuthModal must be used inside AuthModalProvider')
  }

  return context
}

export default useAuthModal

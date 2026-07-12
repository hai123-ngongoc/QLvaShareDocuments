import HomePage from './pages/HomePage'
import { useEffect } from 'react'
import AdminPage from './pages/AdminPage'
import CourseDetailPage from './pages/CourseDetailPage'
import CourseListPage from './pages/CourseListPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import MyLibraryPage from './pages/MyLibraryPage'
import ProfilePage from './pages/ProfilePage'
import UploadPage from './pages/UploadPage'
import UploadSuccessPage from './pages/UploadSuccessPage'
import { AuthModalProvider } from './context/AuthModalContext'
import useAuthModal from './hooks/useAuthModal'
import './App.css'

function AuthRequiredPage({ children, role, pathname }) {
  const { currentUser, isAuthenticated, openLoginModal } = useAuthModal()

  useEffect(() => {
    if (!isAuthenticated) {
      openLoginModal({
        label: 'Đăng nhập để tiếp tục.',
        onSuccess: () => window.location.assign(pathname),
      })
    }
  }, [isAuthenticated, openLoginModal, pathname])

  if (!isAuthenticated) return <HomePage />

  if (role && currentUser?.role !== role) {
    return (
      <>
        <HomePage />
      </>
    )
  }

  return children
}

function RoutedPage({ pathname }) {
  const routedPathname = pathname === '/login' || pathname === '/register' ? '/' : pathname

  if (routedPathname === '/courses') {
    return <CourseListPage />
  }

  if (
    routedPathname === '/courses/detail' ||
    routedPathname === '/course-detail' ||
    /^\/courses\/\d+$/.test(routedPathname)
  ) {
    return <CourseDetailPage />
  }

  if (/^\/documents\/\d+$/.test(routedPathname)) {
    return <DocumentDetailPage />
  }

  if (routedPathname === '/library') {
    return (
      <AuthRequiredPage pathname={routedPathname}>
        <MyLibraryPage />
      </AuthRequiredPage>
    )
  }

  if (routedPathname === '/profile') {
    return (
      <AuthRequiredPage pathname={routedPathname}>
        <ProfilePage />
      </AuthRequiredPage>
    )
  }

  if (routedPathname === '/upload') {
    return (
      <AuthRequiredPage pathname={routedPathname}>
        <UploadPage />
      </AuthRequiredPage>
    )
  }

  if (routedPathname === '/upload/success') {
    return (
      <AuthRequiredPage pathname={routedPathname}>
        <UploadSuccessPage />
      </AuthRequiredPage>
    )
  }

  if (routedPathname === '/admin') {
    return (
      <AuthRequiredPage pathname={routedPathname} role="admin">
        <AdminPage />
      </AuthRequiredPage>
    )
  }

  return <HomePage />
}

function App() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/'
  const isAuthRoute = pathname === '/login' || pathname === '/register'

  return (
    <AuthModalProvider
      initialOpen={isAuthRoute}
      initialMode={pathname === '/register' ? 'register' : 'login'}
    >
      <RoutedPage pathname={pathname} />
    </AuthModalProvider>
  )
}

export default App

import HomePage from './pages/HomePage'
import CourseDetailPage from './pages/CourseDetailPage'
import CourseListPage from './pages/CourseListPage'
import DocumentDetailPage from './pages/DocumentDetailPage'
import MyLibraryPage from './pages/MyLibraryPage'
import ProfilePage from './pages/ProfilePage'
import UploadPage from './pages/UploadPage'
import UploadSuccessPage from './pages/UploadSuccessPage'
import AdminPage from './pages/AdminPage'
import { AuthModalProvider } from './context/AuthModalContext'
import './App.css'

function RoutedPage({ pathname }) {
  const routedPathname = pathname === '/login' || pathname === '/register' ? '/' : pathname

  if (routedPathname === '/admin') {
    return <AdminPage />
  }

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
    return <MyLibraryPage />
  }

  if (routedPathname === '/profile') {
    return <ProfilePage />
  }

  if (routedPathname === '/upload') {
    return <UploadPage />
  }

  if (routedPathname === '/upload/success') {
    return <UploadSuccessPage />
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

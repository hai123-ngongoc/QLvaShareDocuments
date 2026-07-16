import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSearch from '../components/home/HeroSearch'
import StatCard from '../components/home/StatCard'
import SuggestedDocuments from '../components/home/SuggestedDocuments'
import PopularCourses from '../components/home/PopularCourses'
import UploadCallout from '../components/home/UploadCallout'
import anhnenbenphai from '../assets/anhnenbenphai.png'
import anhnenbentrai from '../assets/anhnenbentrai.png'
import { useEffect, useState } from 'react'
import { getPublicNewDocuments } from '../services/documentService'
import { getCourses } from '../services/courseService'
import { getStats } from '../services/statsService'

const DOCUMENTS_PER_PAGE = 8

function HomePage() {
  const [documents, setDocuments] = useState([])
  const [documentPage, setDocumentPage] = useState(1)
  const [documentSortBy, setDocumentSortBy] = useState('newest')
  const [totalDocuments, setTotalDocuments] = useState(0)
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({ documents: 0, courses: 0, users: 0 })

  useEffect(() => {
    getCourses().then(setCourses).catch(console.error)
    getStats().then(setStats).catch(console.error)
  }, [])

  useEffect(() => {
    let isCurrentRequest = true

    getPublicNewDocuments(documentPage, DOCUMENTS_PER_PAGE, documentSortBy)
      .then((data) => {
        if (!isCurrentRequest) return
        setDocuments(data.items || [])
        setTotalDocuments(Number(data.totalItems) || 0)
      })
      .catch(console.error)

    return () => {
      isCurrentRequest = false
    }
  }, [documentPage, documentSortBy])

  const handleDocumentSortChange = (nextSortBy) => {
    if (nextSortBy === documentSortBy) return
    setDocumentSortBy(nextSortBy)
    setDocumentPage(1)
  }

  return (
    <>
      <Header />

      <main className="home-page">
        <section className="hero-stage" aria-label="Tìm kiếm và thống kê">
          <img
            className="hero-illustration hero-illustration--left"
            src={anhnenbentrai}
            alt=""
            aria-hidden="true"
          />
          <img
            className="hero-illustration hero-illustration--right"
            src={anhnenbenphai}
            alt=""
            aria-hidden="true"
          />

          <div className="hero-stage__content">
            <HeroSearch />

            <section className="stats-grid relative z-10 mt-14 grid grid-cols-3 divide-x divide-slate-200 dark:divide-white/10 rounded-2xl border border-slate-200 bg-white px-8 py-6 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
              <StatCard icon="📄" value={stats.documents.toLocaleString('en-US')} label="Tài liệu" />
              <StatCard icon="📚" value={stats.courses.toLocaleString('en-US')} label="Học phần" />
              <StatCard icon="👥" value={stats.users.toLocaleString('en-US')} label="Người dùng" />
            </section>
          </div>
        </section>

        <UploadCallout />

        <SuggestedDocuments
          title="Có thể bạn sẽ quan tâm"
          documents={documents}
          currentPage={documentPage}
          pageSize={DOCUMENTS_PER_PAGE}
          totalItems={totalDocuments}
          onPageChange={setDocumentPage}
          sortBy={documentSortBy}
          onSortChange={handleDocumentSortChange}
          getDocumentHref={(document) => `/documents/${document.id}`}
        />

        <PopularCourses courses={courses} totalCourses={stats.courses} />
      </main>

      <Footer />
    </>
  )
}

export default HomePage

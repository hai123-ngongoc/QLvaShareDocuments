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
import { getDocuments } from '../services/documentService'
import { getCourses } from '../services/courseService'
import { getStats } from '../services/statsService'

function HomePage() {
  const [documents, setDocuments] = useState([])
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState({ documents: 0, courses: 0, users: 0 })
  useEffect(() => {
    getDocuments().then(setDocuments).catch(console.error)
    getCourses().then(setCourses).catch(console.error)
    getStats().then(setStats).catch(console.error)
  }, [])
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
          title="Tài liệu công khai mới"
          documents={documents}
          getDocumentHref={(document) => `/documents/${document.id}`}
        />

        <PopularCourses courses={courses} totalCourses={stats.courses} />
      </main>

      <Footer />
    </>
  )
}

export default HomePage
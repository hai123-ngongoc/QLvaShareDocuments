import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import HeroSearch from '../components/home/HeroSearch'
import StatCard from '../components/home/StatCard'
import SuggestedDocuments from '../components/home/SuggestedDocuments'
import PopularCourses from '../components/home/PopularCourses'
import UploadCallout from '../components/home/UploadCallout'
import anhnenbenphai from '../assets/anhnenbenphai.png'
import anhnenbentrai from '../assets/anhnenbentrai.png'
import { mockDocuments } from '../data/mockDocuments'
import { mockCourses } from '../data/mockCourses'

function HomePage() {
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
              <StatCard icon="📄" value="12,480" label="Tài liệu" />
              <StatCard icon="📚" value="86" label="Học phần" />
              <StatCard icon="👥" value="3,200+" label="Người dùng" />
            </section>
          </div>
        </section>

        <UploadCallout />

        <SuggestedDocuments
          title="Tài liệu công khai mới"
          documents={mockDocuments}
          getDocumentHref={(document) => `/documents/${document.id}`}
        />

        <PopularCourses courses={mockCourses} />
      </main>

      <Footer />
    </>
  )
}

export default HomePage

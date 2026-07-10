import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { getCourseList } from '../data/homeSelectors'

const allCourses = getCourseList()
const COURSES_PER_PAGE = 9
const categories = ['Tất cả danh mục', ...new Set(allCourses.map((course) => course.faculty))]
const sortOptions = [
  { value: 'popular', label: 'Xem nhiều nhất' },
  { value: 'documents', label: 'Nhiều tài liệu nhất' },
  { value: 'name', label: 'Tên học phần' },
]

function CourseListPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [sortBy, setSortBy] = useState(sortOptions[0].value)
  const [currentPage, setCurrentPage] = useState(0)

  const visibleCourses = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return allCourses
      .filter((course) => {
        const matchesCategory =
          selectedCategory === categories[0] || course.faculty === selectedCategory
        const searchableText = `${course.name} ${course.code} ${course.description} ${course.faculty}`.toLowerCase()
        return matchesCategory && searchableText.includes(normalizedSearch)
      })
      .sort((firstCourse, secondCourse) => {
        if (sortBy === 'documents') {
          return secondCourse.documents - firstCourse.documents
        }

        if (sortBy === 'name') {
          return firstCourse.name.localeCompare(secondCourse.name, 'vi')
        }

        return secondCourse.views - firstCourse.views
      })
  }, [searchTerm, selectedCategory, sortBy])

  const popularCourses = useMemo(() => {
    return [...allCourses]
      .sort((firstCourse, secondCourse) => secondCourse.views - firstCourse.views)
      .slice(0, 4)
  }, [])
  const pageCount = Math.max(1, Math.ceil(visibleCourses.length / COURSES_PER_PAGE))
  const activePage = Math.min(currentPage, pageCount - 1)
  const paginatedCourses = visibleCourses.slice(
    activePage * COURSES_PER_PAGE,
    activePage * COURSES_PER_PAGE + COURSES_PER_PAGE,
  )
  const canShowNextPage = activePage < pageCount - 1

  return (
    <>
      <Header />

      <main className="home-page course-list-page">
        <section className="course-list-hero" aria-labelledby="course-list-title">
          <h1 id="course-list-title">Học phần</h1>
          <p>Tìm tài liệu theo từng học phần, lọc nhanh và khám phá nội dung liên quan.</p>
        </section>

        <form
          className="search-panel course-filter"
          aria-label="Lọc học phần"
          onSubmit={(event) => event.preventDefault()}
        >
          <label className="course-filter__search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              placeholder="Tìm tên học phần..."
              aria-label="Tìm tên học phần"
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(0)
              }}
            />
          </label>

          <label className="course-filter__select">
            <select
              aria-label="Danh mục học phần"
              value={selectedCategory}
              onChange={(event) => {
                setSelectedCategory(event.target.value)
                setCurrentPage(0)
              }}
            >
              {categories.map((category) => (
                <option value={category} key={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="course-filter__select">
            <select
              aria-label="Sắp xếp học phần"
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value)
                setCurrentPage(0)
              }}
            >
              {sortOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <button className="button button--primary" type="submit">
            Tìm kiếm
          </button>
        </form>

        <section className="course-list-grid" aria-label="Danh sách học phần">
          {paginatedCourses.map((course) => (
            <a className="document-card course-list-card" href={`/courses/${course.id}`} key={course.id}>
              <span className={`course-card__icon course-card__icon--${course.color}`}>
                {course.shortName}
              </span>
              <div>
                <h2>{course.name}</h2>
                <p>{course.description}</p>
              </div>
              <div className="document-card__meta">
                <span>{course.documents} tài liệu</span>
                <span>
                  <Eye className="meta-icon" size={15} strokeWidth={2} aria-hidden="true" />
                  {course.views.toLocaleString()} lượt xem
                </span>
              </div>
            </a>
          ))}
        </section>

        <nav className="pagination course-list-pagination" aria-label="Phân trang học phần">
          {Array.from({ length: pageCount }, (_, index) => (
            <button
              className={`pagination__item ${
                index === activePage ? 'pagination__item--active' : ''
              }`}
              type="button"
              onClick={() => setCurrentPage(index)}
              key={index}
            >
              {index + 1}
            </button>
          ))}
          {canShowNextPage && (
            <button
              className="pagination__item"
              type="button"
              aria-label="Trang tiếp theo"
              onClick={() => setCurrentPage((page) => Math.min(page + 1, pageCount - 1))}
            >
              ›
            </button>
          )}
        </nav>

        <section
          className="content-section course-popular-section"
          aria-labelledby="popular-courses-title"
        >
          <div className="section-heading section-heading--compact">
            <h2 id="popular-courses-title">Học phần phổ biến</h2>
            <a href="#course-list-title">Xem tất cả học phần →</a>
          </div>

          <div className="course-popular-grid">
            {popularCourses.map((course) => (
              <a className="stat-card course-popular-item" href={`/courses/${course.id}`} key={course.id}>
                <span className={`course-card__icon course-card__icon--${course.color}`}>
                  {course.shortName}
                </span>
                <div>
                  <strong>{course.name}</strong>
                  <span>
                    {course.documents} tài liệu ·{' '}
                    <Eye className="meta-icon" size={14} strokeWidth={2} aria-hidden="true" />
                    {course.views.toLocaleString()} lượt xem
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}

export default CourseListPage

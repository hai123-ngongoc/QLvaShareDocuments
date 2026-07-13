import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import useRevealOnce from '../../hooks/useRevealOnce'
import { getCourseBadgeLabel } from '../../utils/courseDisplay'

const COURSES_PER_PAGE = 4
const slideTransition = {
  duration: 0.35,
  ease: 'easeOut',
}

const gridVariants = {
  initial: (direction) => ({
    x: direction === 'next' ? 30 : -30,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      ...slideTransition,
      staggerChildren: 0.05,
    },
  },
  exit: (direction) => ({
    x: direction === 'next' ? -30 : 30,
    opacity: 0,
    transition: slideTransition,
  }),
}

const ICON_COLORS = ['blue', 'green', 'purple', 'orange']

const cardVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut',
    },
  },
}

function PopularCourses({ courses, totalCourses }) {
  const [sectionRef, isVisible] = useRevealOnce()
  const [currentPage, setCurrentPage] = useState(0)
  const [direction, setDirection] = useState('next')
  const pageCount = Math.max(1, Math.ceil(courses.length / COURSES_PER_PAGE))
  const activePage = Math.min(currentPage, pageCount - 1)
  const visibleCourses = useMemo(() => {
    const startIndex = activePage * COURSES_PER_PAGE
    return courses.slice(startIndex, startIndex + COURSES_PER_PAGE)
  }, [courses, activePage])
  const isFirstPage = activePage === 0
  const isLastPage = activePage >= pageCount - 1

  function showPreviousPage() {
    setDirection('prev')
    setCurrentPage((page) => Math.max(0, Math.min(page, pageCount - 1) - 1))
  }

  function showNextPage() {
    setDirection('next')
    setCurrentPage((page) => Math.min(pageCount - 1, Math.min(page, pageCount - 1) + 1))
  }

  return (
    <section
      className={`content-section content-section--courses reveal-section ${isVisible ? 'is-visible' : ''
        }`}
      id="courses"
      ref={sectionRef}
    >
      <div className="section-heading section-heading--compact">
        <h2>Học phần phổ biến</h2>
        <a href="/courses">
          Xem tất cả {Number(totalCourses ?? courses.length ?? 0).toLocaleString('en-US')} học phần →
        </a>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          className="course-grid"
          key={activePage}
          custom={direction}
          variants={gridVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {visibleCourses.map((course) => (
            <motion.a
              className="course-card group"
              href="/courses"
              key={course.id}
              variants={cardVariants}
            >
              <span
                className={`course-card__icon course-card__icon--${course.color || ICON_COLORS[course.id % ICON_COLORS.length]
                  }`}
              >
                {getCourseBadgeLabel(course, course.name || course.course_name)}
              </span>
              <div>
                <h3>{course.name || course.course_name}</h3>
                <p>
                  {Number(course.documents ?? course.documents_count ?? 0).toLocaleString()} tài liệu ·{' '}
                  <Eye className="meta-icon" size={14} strokeWidth={2} aria-hidden="true" />
                  {Number(course.views ?? 0).toLocaleString()} lượt xem
                </p>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </AnimatePresence>

      {!isFirstPage && (
        <button
          className="course-nav course-nav--prev"
          type="button"
          aria-label="Xem nhóm học phần trước"
          onClick={showPreviousPage}
        >
          ‹
        </button>
      )}
      {!isLastPage && (
        <button
          className="course-nav course-nav--next"
          type="button"
          aria-label="Xem nhóm học phần tiếp theo"
          onClick={showNextPage}
        >
          ›
        </button>
      )}
    </section>
  )
}

export default PopularCourses

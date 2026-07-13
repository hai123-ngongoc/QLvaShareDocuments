import { useState } from 'react'
import {
  Code2,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Compass,
  Database,
  FileQuestion,
  Flag,
  GraduationCap,
  Info,
  LayoutTemplate,
  LifeBuoy,
  Mail,
  Send,
  Server,
  ShieldCheck,
  Sparkles,
  Target,
  UsersRound,
} from 'lucide-react'
import Footer from '../components/layout/Footer'
import Header from '../components/layout/Header'
import logo from '../assets/logo.png'
import { getInitials } from '../utils/userDisplay'

const pageContent = {
  '/about': {
    title: 'Giới thiệu',
    intro: 'DOC là nền tảng quản lý và chia sẻ tài liệu học tập theo học phần kết hợp AI.',
    sections: [
      ['Mục tiêu', 'Giúp người học tìm kiếm, lưu trữ và chia sẻ tài liệu thuận tiện trong một hệ thống thống nhất.'],
      ['Tính năng chính', 'Quản lý tài liệu, phân loại theo học phần, thư viện cá nhân, đánh giá và hỗ trợ tóm tắt nội dung.'],
    ],
  },
  '/team': {
    title: 'Nhóm phát triển',
    intro: 'Website được xây dựng và hoàn thiện bởi đội ngũ DocHub.',
    sections: [
      ['Công việc', 'Nhóm cùng thực hiện phân tích yêu cầu, thiết kế giao diện, phát triển frontend, backend và cơ sở dữ liệu.'],
      ['Định hướng', 'Tiếp tục cải thiện trải nghiệm tìm kiếm, quản trị và chia sẻ tài liệu học tập.'],
    ],
  },
  '/project': {
    title: 'Đồ án môn học',
    intro: 'Hệ thống Quản lý và Chia sẻ Tài liệu là sản phẩm đồ án môn học của đội ngũ DocHub.',
    sections: [
      ['Phạm vi', 'Xây dựng website hỗ trợ người dùng đăng tải, tìm kiếm, xem và quản lý tài liệu theo học phần.'],
      ['Công nghệ', 'Ứng dụng gồm giao diện React, API Node.js và cơ sở dữ liệu MySQL.'],
    ],
  },
  '/faq': {
    title: 'Câu hỏi thường gặp',
    intro: 'Một số câu hỏi phổ biến khi sử dụng DOC.',
    sections: [
      ['Làm sao để upload tài liệu?', 'Đăng nhập, chọn “Upload tài liệu”, điền thông tin và gửi tài liệu để quản trị viên duyệt.'],
      ['Vì sao tài liệu chưa xuất hiện công khai?', 'Tài liệu mới cần được quản trị viên phê duyệt trước khi hiển thị với mọi người.'],
      ['Tôi tìm tài liệu theo học phần ở đâu?', 'Truy cập trang Học phần hoặc sử dụng trang Tìm kiếm tài liệu.'],
    ],
  },
  '/contact': {
    title: 'Liên hệ',
    intro: 'Bạn có thể gửi phản hồi hoặc báo lỗi cho nhóm phát triển.',
    sections: [
      ['Hỗ trợ sử dụng', 'Khi liên hệ, vui lòng mô tả thao tác, đường dẫn trang và thông báo lỗi để nhóm dễ kiểm tra.'],
      ['Phản hồi nội dung', 'Nếu phát hiện tài liệu không phù hợp, hãy cung cấp tên và đường dẫn tài liệu cần xem xét.'],
    ],
  },
  '/terms': {
    title: 'Quy định sử dụng',
    intro: 'Người dùng DOC cần tuân thủ các quy định khi đăng tải và sử dụng tài liệu.',
    sections: [
      ['Nội dung đăng tải', 'Chỉ chia sẻ tài liệu hợp pháp, đúng nội dung học tập và không xâm phạm quyền của người khác.'],
      ['Tài khoản', 'Không sử dụng tài khoản để phát tán nội dung rác, gây rối hoặc truy cập trái phép vào hệ thống.'],
      ['Kiểm duyệt', 'Quản trị viên có quyền từ chối hoặc gỡ tài liệu vi phạm quy định sử dụng.'],
    ],
  },
}

const heroIcons = {
  '/about': Info,
  '/team': UsersRound,
  '/project': GraduationCap,
  '/faq': CircleHelp,
  '/contact': Mail,
  '/terms': ShieldCheck,
}

const teamMembers = [
  { name: 'Trịnh Gia Hân', role: 'Frontend & UI/UX' },
  { name: 'Đỗ Vũ Đức Duy', role: 'AI Features' },
  { name: 'Ngô Ngọc Hải', role: 'Backend & Database' },
]

function AboutContent({ sections }) {
  const sectionIcons = [Target, Sparkles]

  return (
    <div className="footer-page__content about-content">
      {sections.map(([title, description], index) => {
        const SectionIcon = sectionIcons[index] || Info
        return (
          <section key={title}>
            <div className="footer-card__heading">
              <span className="footer-card__icon"><SectionIcon size={19} /></span>
              <h2>{title}</h2>
            </div>
            <p>{description}</p>
          </section>
        )
      })}
    </div>
  )
}

function TeamContent({ sections }) {
  const [[workTitle, workDescription], [directionTitle, directionDescription]] = sections

  return (
    <div className="footer-page__content team-content">
      <section className="team-work-card">
        <div className="footer-card__heading">
          <span className="footer-card__icon"><UsersRound size={19} /></span>
          <div>
            <h2>{workTitle}</h2>
            <p>{workDescription}</p>
          </div>
        </div>
        <div className="team-member-grid">
          {teamMembers.map((member) => (
            <article className="team-member" key={member.name}>
              <span className="team-member__avatar" aria-hidden="true">
                {getInitials(member.name)}
              </span>
              <div>
                <h3>{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section>
        <div className="footer-card__heading">
          <span className="footer-card__icon"><Compass size={19} /></span>
          <h2>{directionTitle}</h2>
        </div>
        <p>{directionDescription}</p>
      </section>
    </div>
  )
}

function ProjectContent({ sections }) {
  const [[scopeTitle, scopeDescription], [technologyTitle, technologyDescription]] = sections
  const technologies = [
    { label: 'React', icon: Code2, tone: 'blue' },
    { label: 'Node.js', icon: Server, tone: 'green' },
    { label: 'MySQL', icon: Database, tone: 'gold' },
  ]

  return (
    <div className="footer-page__content project-content">
      <section>
        <div className="footer-card__heading">
          <span className="footer-card__icon"><Target size={19} /></span>
          <h2>{scopeTitle}</h2>
        </div>
        <p>{scopeDescription}</p>
      </section>

      <section className="project-tech-card">
        <div className="footer-card__heading">
          <span className="footer-card__icon"><Code2 size={19} /></span>
          <h2>{technologyTitle}</h2>
        </div>
        <p>{technologyDescription}</p>
        <div className="technology-tags" aria-label="Công nghệ sử dụng">
          {technologies.map(({ label, icon: TechnologyIcon, tone }) => (
            <span className={`technology-tag technology-tag--${tone}`} key={label}>
              <TechnologyIcon size={15} aria-hidden="true" />
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="project-preview-card">
        <div className="footer-card__heading">
          <span className="footer-card__icon"><LayoutTemplate size={19} /></span>
          <div>
            <h2>Giao diện hệ thống</h2>
            <p>Minh họa giao diện thực tế của nền tảng DOC.</p>
          </div>
        </div>
        <div className="project-preview" role="img" aria-label="Minh họa giao diện nền tảng DOC">
          <div className="project-preview__toolbar"><i /><i /><i /></div>
          <div className="project-preview__body">
            <div className="project-preview__brand">
              <img src={logo} alt="" />
              <strong>DOC</strong>
            </div>
            <div className="project-preview__headline" />
            <div className="project-preview__search" />
            <div className="project-preview__cards"><i /><i /><i /></div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FaqContent({ sections }) {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <div className="footer-page__content faq-list">
      {sections.map(([question, answer], index) => {
        const isOpen = openIndex === index
        const answerId = `faq-answer-${index}`

        return (
          <section className={`faq-item ${isOpen ? 'faq-item--open' : ''}`} key={question}>
            <button
              className="faq-item__question"
              type="button"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
            >
              <span className="footer-card__icon"><CircleHelp size={19} /></span>
              <span>{question}</span>
              <ChevronDown className="faq-item__chevron" size={20} aria-hidden="true" />
            </button>
            <div className="faq-item__answer" id={answerId}>
              <div><p>{answer}</p></div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

function ContactContent({ sections }) {
  const [wasSubmitted, setWasSubmitted] = useState(false)
  const guideIcons = [LifeBuoy, Flag]

  const handleSubmit = (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formValues = Object.fromEntries(new FormData(form).entries())

    console.log('Contact form submitted:', formValues)
    form.reset()
    setWasSubmitted(true)
  }

  return (
    <div className="contact-layout">
      <section className="contact-form-card">
        <div className="footer-card__heading">
          <span className="footer-card__icon"><Send size={19} /></span>
          <div>
            <h2>Gửi yêu cầu hỗ trợ</h2>
            <p>Điền thông tin bên dưới, nhóm phát triển sẽ tiếp nhận phản hồi của bạn.</p>
          </div>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            <span>Họ tên</span>
            <input name="fullName" type="text" autoComplete="name" required />
          </label>
          <label>
            <span>Email</span>
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label className="contact-form__full">
            <span>Chủ đề</span>
            <select name="subject" defaultValue="" required>
              <option value="" disabled>Chọn chủ đề</option>
              <option value="bug">Báo lỗi</option>
              <option value="feedback">Góp ý</option>
              <option value="report">Báo cáo tài liệu vi phạm</option>
              <option value="other">Khác</option>
            </select>
          </label>
          <label className="contact-form__full">
            <span>Nội dung</span>
            <textarea name="message" rows="6" required />
          </label>
          <div className="contact-form__actions contact-form__full">
            <button className="button button--primary" type="submit">
              <Send size={17} aria-hidden="true" />
              Gửi
            </button>
          </div>
        </form>

        {wasSubmitted && (
          <div className="contact-success" role="status" aria-live="polite">
            <CheckCircle2 size={19} aria-hidden="true" />
            Đã gửi thành công
          </div>
        )}
      </section>

      <div className="footer-page__content contact-guides">
        {sections.map(([title, description], index) => {
          const GuideIcon = guideIcons[index] || FileQuestion
          return (
            <section key={title}>
              <div className="footer-card__heading">
                <span className="footer-card__icon"><GuideIcon size={19} /></span>
                <h2>{title}</h2>
              </div>
              <p>{description}</p>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function TermsContent({ sections }) {
  return (
    <div className="footer-page__content terms-list">
      {sections.map(([title, description]) => (
        <section key={title}>
          <div className="footer-card__heading">
            <span className="footer-card__icon"><ShieldCheck size={19} /></span>
            <h2>{title}</h2>
          </div>
          <p>{description}</p>
        </section>
      ))}
    </div>
  )
}

function FooterInfoPage({ pathname }) {
  const content = pageContent[pathname]
  const HeroIcon = heroIcons[pathname] || FileQuestion

  let pageBody = (
    <div className="footer-page__content">
      {content.sections.map(([title, description]) => (
        <section key={title}>
          <h2>{title}</h2>
          <p>{description}</p>
        </section>
      ))}
    </div>
  )

  if (pathname === '/faq') pageBody = <FaqContent sections={content.sections} />
  if (pathname === '/contact') pageBody = <ContactContent sections={content.sections} />
  if (pathname === '/terms') pageBody = <TermsContent sections={content.sections} />
  if (pathname === '/about') pageBody = <AboutContent sections={content.sections} />
  if (pathname === '/team') pageBody = <TeamContent sections={content.sections} />
  if (pathname === '/project') pageBody = <ProjectContent sections={content.sections} />

  return (
    <>
      <Header />
      <main className={`footer-page footer-page--${pathname.slice(1)}`}>
        <header className="footer-page__hero">
          <p><HeroIcon size={16} aria-hidden="true" /> DOC</p>
          <h1>{content.title}</h1>
          <span>{content.intro}</span>
          <HeroIcon className="footer-page__hero-decoration" aria-hidden="true" />
        </header>

        {pageBody}
      </main>
      <Footer />
    </>
  )
}

export default FooterInfoPage

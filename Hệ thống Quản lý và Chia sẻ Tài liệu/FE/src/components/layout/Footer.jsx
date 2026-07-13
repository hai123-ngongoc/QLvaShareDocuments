import logo from '../../assets/logo.png'

const footerGroups = [
  {
    title: 'Về chúng tôi',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Nhóm phát triển', href: '/team' },
      { label: 'Đồ án môn học', href: '/project' },
    ],
  },
  {
    title: 'Liên kết nhanh',
    links: [
      { label: 'Học phần', href: '/courses' },
      { label: 'Tìm kiếm tài liệu', href: '/#search-documents' },
      { label: 'Upload tài liệu', href: '/upload' },
      { label: 'Thư viện của tôi', href: '/library' },
    ],
  },
  {
    title: 'Hỗ trợ',
    links: [
      { label: 'Câu hỏi thường gặp', href: '/faq' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Quy định sử dụng', href: '/terms' },
    ],
  },
]

function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__main">
        <div className="site-footer__brand">
          <a className="brand" href="/" aria-label="DOC homepage">
            <img className="brand__mark" src={logo} alt="" />
            <span>DOC</span>
          </a>
          <p>
            Nền tảng chia sẻ tài liệu học tập theo học phần, được AI hỗ trợ tóm
            tắt và gợi ý nội dung liên quan.
          </p>
        </div>

        {footerGroups.map((group) => (
          <div className="footer-links" key={group.title}>
            <h2>{group.title}</h2>
            {group.links.map((link) => (
              <a href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </div>
        ))}
      </div>

      <div className="site-footer__bottom">© 2026 DocHub · Đồ án nhóm 2</div>
    </footer>
  )
}

export default Footer

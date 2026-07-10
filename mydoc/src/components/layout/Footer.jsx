import logo from '../../assets/logo.png'

const footerGroups = [
  {
    title: 'Về chúng tôi',
    links: ['Giới thiệu', 'Nhóm phát triển', 'Đồ án môn học'],
  },
  {
    title: 'Liên kết nhanh',
    links: ['Học phần', 'Tìm kiếm tài liệu', 'Upload tài liệu', 'Thư viện của tôi'],
  },
  {
    title: 'Hỗ trợ',
    links: ['Câu hỏi thường gặp', 'Liên hệ', 'Quy định sử dụng'],
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
              <a href="/" key={link}>
                {link}
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

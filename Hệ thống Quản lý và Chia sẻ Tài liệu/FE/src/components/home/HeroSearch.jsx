function HeroSearch() {
  return (
    <section className="hero-search" aria-labelledby="hero-title">
      <h1 id="hero-title">Tìm tài liệu học tập</h1>
      <p>Hơn 12,000 tài liệu được tóm tắt và gợi ý tự động</p>

      <form className="search-panel" aria-label="Tìm kiếm tài liệu">
        <input
          type="search"
          placeholder="Tìm theo môn học, tên tài liệu hoặc giảng viên"
          aria-label="Tìm theo môn học, tên tài liệu hoặc giảng viên"
        />
        <button className="button button--primary" type="submit">
          Tìm kiếm
        </button>
      </form>

      <div className="hero-actions">
        <a href="/courses" className="text-link" aria-label="Khám phá học phần">
          Khám phá học phần →
        </a>
      </div>
    </section>
  )
}

export default HeroSearch

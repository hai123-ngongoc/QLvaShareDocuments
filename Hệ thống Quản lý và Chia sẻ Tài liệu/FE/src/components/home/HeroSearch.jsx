import { useState } from 'react'

function HeroSearch() {
  const [query, setQuery] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    const keyword = query.trim()
    const params = new URLSearchParams(keyword ? { keyword } : {})
    window.location.assign(`/search?${params.toString()}`)
  }

  return (
    <section className="hero-search" id="search-documents" aria-labelledby="hero-title">
      <h1 id="hero-title">Tìm tài liệu học tập</h1>
      <p>Hơn 12,000 tài liệu được tóm tắt và gợi ý tự động</p>

      <form className="search-panel" aria-label="Tìm kiếm tài liệu" onSubmit={handleSubmit}>
        <input
          type="search"
          placeholder="Tìm theo môn học, tên tài liệu hoặc giảng viên"
          aria-label="Tìm theo môn học, tên tài liệu hoặc giảng viên"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
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

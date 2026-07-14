function UploadCallout() {
  return (
    <section className="upload-callout" aria-labelledby="upload-callout-title">
      <div className="upload-callout__copy">
        <h2 id="upload-callout-title">
          Chia sẻ tài liệu.
          <br />
          Giúp bạn học tốt hơn.
        </h2>
        <a href="#upload-document">Tìm hiểu cách hoạt động</a>
      </div>

      <a className="upload-dropzone" href="/upload" id="upload-document">
        <span className="upload-dropzone__icon" aria-hidden="true">
          ↑
        </span>
        <strong>Upload tài liệu</strong>
        <span>đề cương, slide, cheat sheet, bài tập...</span>
      </a>
    </section>
  )
}

export default UploadCallout

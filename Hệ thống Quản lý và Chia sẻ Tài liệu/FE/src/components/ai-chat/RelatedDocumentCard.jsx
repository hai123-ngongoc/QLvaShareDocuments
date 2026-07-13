import { FileArchive, FileText, FileType, Presentation } from 'lucide-react'

function getFileIcon(fileType) {
  if (fileType === 'PPTX') return <Presentation size={17} />
  if (fileType === 'DOCX') return <FileType size={17} />
  if (fileType === 'ZIP') return <FileArchive size={17} />
  return <FileText size={17} />
}

function RelatedDocumentCard({ document }) {
  return (
    <article className="ai-related-document">
      <span className="ai-related-document__icon" aria-hidden="true">{getFileIcon(document.fileType)}</span>
      <div className="ai-related-document__content">
        <strong>{document.title}</strong>
        <span>{document.course} · {document.fileType}</span>
      </div>
      <a href={`/documents/${document.id}`}>Xem</a>
    </article>
  )
}

export default RelatedDocumentCard

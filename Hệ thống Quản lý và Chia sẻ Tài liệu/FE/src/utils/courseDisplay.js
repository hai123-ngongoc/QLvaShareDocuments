export function getCourseBadgeLabel(courseOrCode, fallbackName = '?') {
  const code = typeof courseOrCode === 'string'
    ? courseOrCode
    : courseOrCode?.course_code || courseOrCode?.code || courseOrCode?.shortName || ''
  const lettersOnly = code.replace(/[0-9]/g, '').trim()

  if (lettersOnly) return lettersOnly.toUpperCase()

  return String(fallbackName || '?').trim().charAt(0).toUpperCase() || '?'
}

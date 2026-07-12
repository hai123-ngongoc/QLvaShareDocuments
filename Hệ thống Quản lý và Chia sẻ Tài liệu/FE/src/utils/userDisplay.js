export function getInitials(user) {
    if (!user) return '?'
    const source = (user.username || '').trim()
    if (!source) return '?'

    const parts = source.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return source.slice(0, 2).toUpperCase()
}
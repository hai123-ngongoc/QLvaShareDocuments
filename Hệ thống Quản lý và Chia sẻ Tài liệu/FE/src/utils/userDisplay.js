export function getInitials(userOrName) {
    if (!userOrName) return '?'

    const source = (
        typeof userOrName === 'string'
            ? userOrName
            : userOrName.username || userOrName.name || ''
    ).trim()

    if (!source) return '?'

    return source.charAt(0).toUpperCase()
}

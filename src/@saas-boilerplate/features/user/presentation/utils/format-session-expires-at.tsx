export function formatSessionExpiresAt(expiresAt: Date) {
  const date = new Date(expiresAt)
  return date.toLocaleDateString([], { hour: '2-digit', minute: '2-digit' })
}

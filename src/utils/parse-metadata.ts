export function parseMetadata<T>(
  metadata: string | undefined | null | unknown,
): T {
  if (!metadata) return {} as T

  if (typeof metadata !== 'string') {
    return metadata as T
  }

  const metadataObj = JSON.parse(metadata)
  return metadataObj as T
}

/**
 * Represents a file object.
 */
export type StorageProviderFile<TContext extends string = string> = {
  context: TContext
  identifier: string

  name: string
  extension: string
  size: number
  url: string

  file?: File
}

/**
 * Represents the credentials required for a storage provider.
 * @template TContext - The context type (e.g., 'organization', 'user', 'shared').
 */
export type StorageProviderCredentials = {
  endpoint?: string
  region?: string
  bucket?: string
  path?: string
  accessKeyId?: string
  secretAccessKey?: string
  signatureVersion?: string
}

/**
 * Represents a storage provider interface.
 */
export interface IStorageProviderAdapter {
  /**
   * Uploads a file to a specific context and returns the path.
   * @param context The context in which the file is being uploaded (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @param file The file to be uploaded.
   * @returns A Promise that resolves to the path of the uploaded file.
   */
  upload: (
    context: string,
    identifier: string,
    file: File,
  ) => Promise<StorageProviderFile>

  /**
   * Deletes a file at the specified path.
   * @param path The path of the file to be deleted.
   * @returns A Promise that resolves when the file is deleted.
   */
  delete: (path: string) => Promise<void>

  /**
   * Lists all files in a specific context.
   * @param context The context in which to list files (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @returns A Promise that resolves to an array of file paths.
   */
  list: (context: string, identifier: string) => Promise<StorageProviderFile[]>

  /**
   * Prune all files in a specific context.
   * @param context The context in which to delete files (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @returns A Promise that resolves when all files are deleted.
   */
  prune: (context: string, identifier: string) => Promise<StorageProviderFile>
}

export interface IStorageProvider<TContextTypes extends string[]> {
  /**
   * Uploads a file to a specific context and returns the path.
   * @param context The context in which the file is being uploaded (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @param file The file to be uploaded.
   * @returns A Promise that resolves to the path of the uploaded file.
   */
  upload: <TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
    file: File,
  ) => Promise<StorageProviderFile<TContext>>

  /**
   * Deletes a file at the specified path.
   * @param path The path of the file to be deleted.
   * @returns A Promise that resolves when the file is deleted.
   */
  delete: (path: TContextTypes[number]) => Promise<void>

  /**
   * Lists all files in a specific context.
   * @param context The context in which to list files (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @returns A Promise that resolves to an array of file paths.
   */
  list: <TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
  ) => Promise<StorageProviderFile<TContext>[]>

  /**
   * Prune all files in a specific context.
   * @param context The context in which to delete files (e.g., 'organization', 'user', 'shared').
   * @param id The unique identifier for the context (e.g., tenant ID, user ID).
   * @returns A Promise that resolves when all files are deleted.
   */
  prune: <TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
  ) => Promise<StorageProviderFile<TContext>>
}

/**
 * Represents the options for a storage provider.
 * @template TContextTypes - An array of context types (e.g., 'organization', 'user', 'shared').
 */
export interface StorageProviderOptions<TContextTypes extends string[]> {
  adapter: (credentials: StorageProviderOptions<any>) => IStorageProviderAdapter
  contexts?: TContextTypes

  credentials: StorageProviderCredentials

  onFileUploadStart?: (file: StorageProviderFile) => void
  onFileUploadSuccess?: (file: StorageProviderFile, url: string) => void
  onFileUploadError?: (file: StorageProviderFile, error: unknown) => void

  onFileDeleteStart?: (file: StorageProviderFile) => void
  onFileDeleteSuccess?: (file: StorageProviderFile) => void
  onFileDeleteError?: (file: StorageProviderFile, error: unknown) => void

  onPruneStart?: (context: TContextTypes[number], identifier: string) => void
  onPruneSuccess?: (context: TContextTypes[number], identifier: string) => void
  onPruneError?: (context: TContextTypes[number], error: unknown) => void
}

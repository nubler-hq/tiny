import type {
  IStorageProvider,
  IStorageProviderAdapter,
  StorageProviderFile,
  StorageProviderOptions,
} from './interfaces/storage'

export class StorageProvider<TContextTypes extends string[]>
  implements IStorageProvider<TContextTypes>
{
  private static instance: IStorageProvider<any>
  private readonly adapter: IStorageProviderAdapter
  private readonly options: StorageProviderOptions<TContextTypes>

  constructor(options: StorageProviderOptions<TContextTypes>) {
    this.adapter = options.adapter(options)
    this.options = options
  }

  async upload<TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
    file: File,
  ): Promise<StorageProviderFile<TContext>> {
    try {
      this.options.onFileUploadStart?.({
        context,
        identifier,
        name: file.name,
        extension: file.name.split('.').pop() || '',
        size: file.size,
        url: '',
        file,
      })

      const result = await this.adapter.upload(context, identifier, file)

      this.options.onFileUploadSuccess?.(result, result.url)

      return result as StorageProviderFile<TContext>
    } catch (error) {
      this.options.onFileUploadError?.(
        {
          context,
          identifier,
          name: file.name,
          extension: file.name.split('.').pop() || '',
          size: file.size,
          url: '',
          file,
        },
        error,
      )
      throw error
    }
  }

  async delete(path: TContextTypes[number]): Promise<void> {
    try {
      const file = {
        context: path,
        identifier: '',
        name: '',
        extension: '',
        size: 0,
        url: '',
      }
      this.options.onFileDeleteStart?.(file)

      await this.adapter.delete(path)

      this.options.onFileDeleteSuccess?.(file)
    } catch (error) {
      this.options.onFileDeleteError?.(
        {
          context: path,
          identifier: '',
          name: '',
          extension: '',
          size: 0,
          url: '',
        },
        error,
      )
      throw error
    }
  }

  async list<TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
  ): Promise<StorageProviderFile<TContext>[]> {
    const files = await this.adapter.list(context, identifier)
    return files as StorageProviderFile<TContext>[]
  }

  async prune<TContext extends TContextTypes[number]>(
    context: TContext,
    identifier: string,
  ): Promise<StorageProviderFile<TContext>> {
    try {
      this.options.onPruneStart?.(context, identifier)

      const result = await this.adapter.prune(context, identifier)

      this.options.onPruneSuccess?.(context, identifier)

      return result as StorageProviderFile<TContext>
    } catch (error) {
      this.options.onPruneError?.(context, error)
      throw error
    }
  }

  static adapter(
    create: (
      credentials: StorageProviderOptions<any>,
    ) => IStorageProviderAdapter,
  ): (credentials: StorageProviderOptions<any>) => IStorageProviderAdapter {
    return create
  }

  static initialize<T extends string[]>(
    options: StorageProviderOptions<T>,
  ): IStorageProvider<T> {
    if (!this.instance) {
      this.instance = new StorageProvider(options)
    }

    return this.instance
  }
}

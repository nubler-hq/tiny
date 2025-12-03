import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  CreateBucketCommand,
  PutBucketPolicyCommand,
} from '@aws-sdk/client-s3'
import { v4 as randomUUID } from 'uuid'
import type {
  StorageProviderFile,
  StorageProviderCredentials,
  IStorageProviderAdapter,
} from '../interfaces/storage'
import { StorageProvider } from '../storage.provider'

class S3StorageAdapter implements IStorageProviderAdapter {
  private client: S3Client
  private credentials: StorageProviderCredentials

  constructor(credentials: StorageProviderCredentials) {
    this.credentials = credentials

    this.client = new S3Client({
      region: credentials.region,
      endpoint: credentials.endpoint,
      forcePathStyle: true,
      tls: !credentials.endpoint?.includes('localhost'),
      credentials: {
        accessKeyId: credentials.accessKeyId || '',
        secretAccessKey: credentials.secretAccessKey || '',
      },
    })
  }

  private async convertFileToBuffer(file: File): Promise<Buffer> {
    const stream = file.stream()
    const chunks = []

    for await (const chunk of stream as any) {
      chunks.push(chunk)
    }

    return Buffer.concat(chunks)
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || ''
  }

  private getFilePath(
    context: string,
    identifier: string,
    filename: string,
  ): string {
    const basePath = `${this.credentials.path || ''}/${context}/${identifier}/`
    return `${basePath}${filename}`
  }

  private getFileUrl(path: string): string {
    return `${this.credentials.endpoint}/${this.credentials.bucket}/${path}`
  }

  async upload(
    context: string,
    identifier: string,
    file: File,
  ): Promise<StorageProviderFile> {
    const extension = this.getFileExtension(file.name)
    const filename = `${randomUUID()}.${extension}`
    const path = this.getFilePath(context, identifier, filename)
    const buffer = await this.convertFileToBuffer(file)

    const command = new PutObjectCommand({
      Bucket: this.credentials.bucket,
      Key: path,
      Body: buffer,
      ContentType: file.type,
      CacheControl: 'max-age=31536000',
      ACL: 'public-read',
    })

    await this.upsertBucket(this.credentials.bucket as string)
    await this.client.send(command)

    return {
      context,
      identifier,
      name: filename,
      extension,
      size: file.size,
      url: this.getFileUrl(path),
      file,
    }
  }

  async upsertBucket(name: string): Promise<void> {
    try {
      await this.client.send(
        new CreateBucketCommand({
          Bucket: name,
          ACL: 'public-read',
        }),
      )

      await this.client.send(
        new PutBucketPolicyCommand({
          Bucket: name,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Sid: 'PublicReadGetObject',
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${name}/*`],
              },
            ],
          }),
        }),
      )
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === 'BucketAlreadyExists' ||
          error.name === 'BucketAlreadyOwnedByYou')
      ) {
        // Bucket already exists, no action needed
        return
      }

      throw error
    }
  }

  async delete(path: string): Promise<void> {
    const key = path.replace(
      `${this.credentials.endpoint}/${this.credentials.bucket}/`,
      '',
    )

    const command = new DeleteObjectCommand({
      Bucket: this.credentials.bucket,
      Key: key,
    })

    await this.client.send(command)
  }

  async list(
    context: string,
    identifier: string,
  ): Promise<StorageProviderFile[]> {
    const basePath = this.getFilePath(context, identifier, '')

    const command = new ListObjectsV2Command({
      Bucket: this.credentials.bucket,
      Prefix: basePath,
    })

    const response = await this.client.send(command)

    return (response.Contents || []).map((item) => {
      const filename = item.Key!.split('/').pop()!
      return {
        context,
        identifier,
        name: filename,
        extension: this.getFileExtension(filename),
        size: item.Size || 0,
        url: this.getFileUrl(item.Key!),
      }
    })
  }

  async prune(
    context: string,
    identifier: string,
  ): Promise<StorageProviderFile> {
    const files = await this.list(context, identifier)

    for (const file of files) {
      await this.delete(file.url)
    }

    // Return the last file details as required by the interface
    return (
      files[files.length - 1] || {
        context,
        identifier,
        name: '',
        extension: '',
        size: 0,
        url: '',
      }
    )
  }
}

export const CompatibleS3StorageAdapter = StorageProvider.adapter(
  (options) => new S3StorageAdapter(options.credentials),
)

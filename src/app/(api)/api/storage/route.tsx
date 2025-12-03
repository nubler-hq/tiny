import { storage } from '@/services/storage'
import { NextResponse, type NextRequest } from 'next/server'

export const POST = async (request: NextRequest) => {
  const form = await request.formData()
  const file = form.get('file') as File
  const context = form.get('context') as string
  const identifier = form.get('identifier') as string

  if (!file) {
    return NextResponse.json({ error: 'File is required' }, { status: 400 })
  }

  // @ts-expect-error type mismatch
  const uploadedFile = await storage.upload(context, identifier, file)

  return NextResponse.json(uploadedFile, { status: 200 })
}

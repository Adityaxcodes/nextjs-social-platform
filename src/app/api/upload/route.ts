import { NextResponse } from 'next/server'
import { Readable } from 'stream'
import { getServerSession } from 'next-auth'
import { v2 as cloudinary } from 'cloudinary'
import { authOptions } from '../auth/[...nextauth]/route'

export const runtime = 'nodejs'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || 'uploads'
const ALLOWED_TYPES: Record<string, 'image' | 'video'> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'video/mp4': 'video',
}

const getCloudinaryConfig = () => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud_name || !api_key || !api_secret) {
    return null
  }

  return { cloud_name, api_key, api_secret }
}

const uploadBufferToCloudinary = (buffer: Buffer, file: File) => {
  return new Promise<string>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: ALLOWED_TYPES[file.type],
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        if (!result?.secure_url) {
          reject(new Error('Cloudinary did not return a secure URL'))
          return
        }

        resolve(result.secure_url)
      },
    )

    Readable.from(buffer).pipe(uploadStream)
  })
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: 'File exceeds 10MB limit' }, { status: 400 })
    }

    const cloudinaryConfig = getCloudinaryConfig()
    if (!cloudinaryConfig) {
      return NextResponse.json(
        { error: 'Cloudinary is not configured on the server' },
        { status: 500 },
      )
    }

    cloudinary.config(cloudinaryConfig)

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadBufferToCloudinary(buffer, file)

    return NextResponse.json({ url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

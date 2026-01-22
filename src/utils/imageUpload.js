import { supabase, STORAGE_BUCKET } from '../lib/supabase'
import imageCompression from 'browser-image-compression'

/**
 * Compresses an image file to reduce size
 * @param {File} file - Image file to compress
 * @returns {Promise<File>} - Compressed image file
 */
async function compressImage(file) {
  const options = {
    maxSizeMB: 1, // Maximum file size in MB (1MB target)
    maxWidthOrHeight: 1920, // Maximum width or height (good for web)
    useWebWorker: true, // Use web worker for better performance
    fileType: file.type, // Keep original file type
    initialQuality: 0.8, // Initial quality (0.8 = 80% quality)
  }

  try {
    const compressedFile = await imageCompression(file, options)
    console.log(`Compressed ${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`)
    return compressedFile
  } catch (error) {
    console.error('Compression error, using original file:', error)
    // If compression fails, return original file
    return file
  }
}

/**
 * Uploads an image file to Supabase Storage
 * @param {File} file - Image file to upload
 * @param {string} activityId - Activity ID to organize files
 * @returns {Promise<string>} - Public URL of the uploaded image
 */
export async function uploadImageToSupabase(file, activityId) {
  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate original file size (max 50MB before compression)
    const maxOriginalSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxOriginalSize) {
      throw new Error('Image size must be less than 50MB. Please compress the image first.')
    }

    // Compress image before upload
    const compressedFile = await compressImage(file)

    // Generate unique filename (use .jpg for compressed images to save space)
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    // Use .jpg for better compression, or keep original extension if it's webp
    const fileExt = file.type === 'image/webp' ? 'webp' : 'jpg'
    const fileName = `${activityId}/${timestamp}-${randomString}.${fileExt}`

    // Upload compressed file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, compressedFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: compressedFile.type
      })

    if (error) {
      throw new Error(`Upload failed: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path)

    return urlData.publicUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

/**
 * Uploads multiple image files to Supabase Storage
 * @param {File[]} files - Array of image files to upload
 * @param {string} activityId - Activity ID to organize files
 * @returns {Promise<string[]>} - Array of public URLs
 */
export async function uploadMultipleImagesToSupabase(files, activityId) {
  const uploadPromises = files.map(file => uploadImageToSupabase(file, activityId))
  return Promise.all(uploadPromises)
}

/**
 * Deletes an image from Supabase Storage
 * @param {string} imageUrl - Public URL of the image to delete
 * @returns {Promise<void>}
 */
export async function deleteImageFromSupabase(imageUrl) {
  try {
    if (!imageUrl) return

    // Extract file path from Supabase public URL
    // URL format: https://xxxxx.supabase.co/storage/v1/object/public/activity-photos/path/to/file.jpg
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    
    // Find the index of the bucket name in the path
    const bucketIndex = pathParts.indexOf(STORAGE_BUCKET)
    if (bucketIndex === -1) {
      console.error('Could not find bucket name in URL:', imageUrl)
      return
    }
    
    // Get the file path after the bucket name
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    if (!filePath) {
      console.error('Could not extract file path from URL:', imageUrl)
      return
    }

    console.log('Deleting image from Supabase:', filePath)

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting image from Supabase:', error)
      throw error
    } else {
      console.log('Successfully deleted image:', filePath)
    }
  } catch (error) {
    console.error('Error deleting image:', error)
    throw error
  }
}


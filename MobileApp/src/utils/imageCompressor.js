/**
 * imageCompressor.js
 * Compresses images using expo-image-manipulator before uploading to Supabase storage.
 * Reduces payload size, speeds up uploads, and lowers storage costs.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { supabase } from '../lib/supabase';

// Compression config
const COMPRESSION_CONFIG = {
  maxWidthPx: 1280,
  maxHeightPx: 1280,
  quality: 0.75, // 75% JPEG quality — good balance of size vs clarity
  format: ImageManipulator.SaveFormat.JPEG,
};

/**
 * Compresses an image before upload.
 * @param {string} uri - Local image URI from camera/picker
 * @param {object} options - Optional overrides for compression config
 * @returns {Promise<{uri: string, width: number, height: number, base64?: string}>}
 */
export async function compressImage(uri, options = {}) {
  const config = { ...COMPRESSION_CONFIG, ...options };

  const result = await ImageManipulator.manipulateAsync(
    uri,
    [
      {
        resize: {
          width: config.maxWidthPx,
          height: config.maxHeightPx,
        },
      },
    ],
    {
      compress: config.quality,
      format: config.format,
      base64: options.includeBase64 ?? false,
    }
  );

  return result;
}

/**
 * Compresses and uploads an image to Supabase storage.
 * @param {string} uri - Local image URI
 * @param {string} bucket - Supabase storage bucket name
 * @param {string} filePath - Destination path in the bucket (e.g. 'tickets/abc123.jpg')
 * @param {object} options - Optional compression overrides
 * @returns {Promise<{publicUrl: string, path: string, originalSize?: number, compressedSize?: number}>}
 */
export async function compressAndUpload(uri, bucket, filePath, options = {}) {
  // Step 1: Compress
  const compressed = await compressImage(uri, options);

  // Step 2: Fetch compressed image as blob
  const response = await fetch(compressed.uri);
  const blob = await response.blob();

  // Step 3: Upload to Supabase storage
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  // Step 4: Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return {
    publicUrl: urlData.publicUrl,
    path: data.path,
  };
}

/**
 * Helper: pick quality preset by use case
 */
export const QUALITY_PRESETS = {
  thumbnail: { maxWidthPx: 320, maxHeightPx: 320, quality: 0.5 },
  standard: { maxWidthPx: 1280, maxHeightPx: 1280, quality: 0.75 },
  high: { maxWidthPx: 1920, maxHeightPx: 1920, quality: 0.9 },
};
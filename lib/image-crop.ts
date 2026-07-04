import type { SupabaseClient } from '@supabase/supabase-js';

export type CropArea = { x: number; y: number; width: number; height: number };

export type CropParams = {
  crop: { x: number; y: number };
  zoom: number;
  croppedAreaPixels: CropArea;
};

// Longest edge of the exported crop. Keeps canvas.toBlob reliable and uploads small.
const MAX_OUTPUT_EDGE = 1600;

// Load via fetch → blob → object URL so remote (Supabase) images never taint the
// canvas, even when the browser cached a non-CORS response for the same URL.
export async function loadImageFromUrl(url: string): Promise<{ img: HTMLImageElement; cleanup: () => void }> {
  let objectUrl: string | null = null;
  let src = url;
  if (!url.startsWith('blob:') && !url.startsWith('data:')) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image (${res.status})`);
    objectUrl = URL.createObjectURL(await res.blob());
    src = objectUrl;
  }
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
  return { img, cleanup: () => { if (objectUrl) URL.revokeObjectURL(objectUrl); } };
}

export async function getCroppedBlob(src: string, area: CropArea): Promise<Blob> {
  const { img, cleanup } = await loadImageFromUrl(src);
  try {
    const scale = Math.min(1, MAX_OUTPUT_EDGE / Math.max(area.width, area.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(area.width * scale);
    canvas.height = Math.round(area.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas is not supported');
    ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Failed to export cropped image'))),
        'image/jpeg',
        0.85,
      );
    });
  } finally {
    cleanup();
  }
}

// Upload a photo to the pet-photos bucket, returning its public URL (null on failure).
export async function uploadPhotoBlob(
  supabase: SupabaseClient,
  body: Blob,
  ext: string,
  contentType?: string,
): Promise<string | null> {
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
  const { error } = await supabase.storage
    .from('pet-photos')
    .upload(fileName, body, contentType ? { contentType } : undefined);
  if (error) {
    console.error('Error uploading photo:', error);
    return null;
  }
  const { data } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
  return data.publicUrl;
}

'use client';
import { useEffect, useRef, useState } from 'react';
import type { CropParams } from '@/lib/image-crop';

export type ListingPhoto = {
  id: string;
  kind: 'file' | 'existing';
  originalFile?: File;
  remoteUrl?: string;
  sourceUrl: string; // original image for the cropper: object URL of the file, or the remote URL
  croppedBlob: Blob | null;
  croppedPreviewUrl: string | null;
  cropParams: CropParams | null;
};

export const MAX_PHOTOS = 5;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function displayUrl(photo: ListingPhoto): string {
  return photo.croppedPreviewUrl ?? photo.sourceUrl;
}

export function usePhotoManager() {
  const [photos, setPhotos] = useState<ListingPhoto[]>([]);
  const [primaryId, setPrimaryId] = useState<string | null>(null);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  useEffect(() => {
    // Revoke all object URLs on unmount only.
    return () => {
      for (const p of photosRef.current) {
        if (p.kind === 'file') URL.revokeObjectURL(p.sourceUrl);
        if (p.croppedPreviewUrl) URL.revokeObjectURL(p.croppedPreviewUrl);
      }
    };
  }, []);

  const addFiles = (files: FileList | File[]) => {
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`"${file.name}" is not a supported format. Please upload JPG, PNG or WebP photos.`);
        continue;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`"${file.name}" is too large. Please upload photos under ${MAX_SIZE_MB}MB.`);
        continue;
      }
      valid.push(file);
    }
    const added: ListingPhoto[] = valid.slice(0, MAX_PHOTOS - photosRef.current.length).map(file => ({
      id: crypto.randomUUID(),
      kind: 'file',
      originalFile: file,
      sourceUrl: URL.createObjectURL(file),
      croppedBlob: null,
      croppedPreviewUrl: null,
      cropParams: null,
    }));
    if (added.length === 0) return;
    const next = [...photosRef.current, ...added];
    setPhotos(next);
    setPrimaryId(curr => curr ?? next[0]?.id ?? null);
  };

  const initFromUrls = (urls: string[], primaryUrl?: string) => {
    const loaded: ListingPhoto[] = urls.map(url => ({
      id: crypto.randomUUID(),
      kind: 'existing',
      remoteUrl: url,
      sourceUrl: url,
      croppedBlob: null,
      croppedPreviewUrl: null,
      cropParams: null,
    }));
    setPhotos(loaded);
    const primary = loaded.find(p => p.remoteUrl === primaryUrl) ?? loaded[0];
    setPrimaryId(primary?.id ?? null);
  };

  const removePhoto = (id: string) => {
    const removed = photosRef.current.find(p => p.id === id);
    if (removed) {
      if (removed.kind === 'file') URL.revokeObjectURL(removed.sourceUrl);
      if (removed.croppedPreviewUrl) URL.revokeObjectURL(removed.croppedPreviewUrl);
    }
    const next = photosRef.current.filter(p => p.id !== id);
    setPhotos(next);
    setPrimaryId(curr => (curr === id ? next[0]?.id ?? null : curr));
  };

  const setPrimary = (id: string) => setPrimaryId(id);

  const applyCrop = (id: string, params: CropParams, blob: Blob) => {
    const target = photosRef.current.find(p => p.id === id);
    if (!target) return;
    if (target.croppedPreviewUrl) URL.revokeObjectURL(target.croppedPreviewUrl);
    const previewUrl = URL.createObjectURL(blob);
    setPhotos(photosRef.current.map(p =>
      p.id === id ? { ...p, croppedBlob: blob, croppedPreviewUrl: previewUrl, cropParams: params } : p
    ));
  };

  // Primary photo first, everything else in current order.
  const orderedPhotos = () => {
    const list = photosRef.current;
    const primary = list.find(p => p.id === primaryId);
    return primary ? [primary, ...list.filter(p => p.id !== primaryId)] : [...list];
  };

  return { photos, primaryId, addFiles, initFromUrls, removePhoto, setPrimary, applyCrop, orderedPhotos };
}

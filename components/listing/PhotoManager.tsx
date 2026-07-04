'use client';
import { useState } from 'react';
import PhotoCropDialog from '@/components/listing/PhotoCropDialog';
import { displayUrl, MAX_PHOTOS, type ListingPhoto } from '@/lib/use-photo-manager';
import type { CropParams } from '@/lib/image-crop';

export default function PhotoManager({
  photos,
  primaryId,
  maxPhotos = MAX_PHOTOS,
  onAddClick,
  onRemove,
  onSetPrimary,
  onApplyCrop,
}: {
  photos: ListingPhoto[];
  primaryId: string | null;
  maxPhotos?: number;
  onAddClick: () => void;
  onRemove: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onApplyCrop: (id: string, params: CropParams, blob: Blob) => void;
}) {
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const croppingPhoto = photos.find(p => p.id === croppingId) ?? null;

  return (
    <>
      <div className="photo-previews">
        {photos.map(photo => {
          const isPrimary = photo.id === primaryId;
          return (
            <div key={photo.id} className="photo-thumb-wrap">
              <img
                src={displayUrl(photo)}
                className={`photo-thumb ${isPrimary ? 'is-primary' : ''}`}
                alt="preview"
              />
              <button className="photo-remove" onClick={() => onRemove(photo.id)} aria-label="Remove photo">✕</button>
              {isPrimary ? (
                <span className="photo-primary-badge">★ Main</span>
              ) : (
                <button className="photo-star-btn" onClick={() => onSetPrimary(photo.id)} aria-label="Set as main photo">☆</button>
              )}
              <button className="photo-crop-btn" onClick={() => setCroppingId(photo.id)} aria-label="Crop photo">✂</button>
              {photo.croppedBlob && <span className="photo-adjusted-dot" title="Adjusted" />}
            </div>
          );
        })}
        {photos.length > 0 && photos.length < maxPhotos && (
          <button className="photo-add-tile" onClick={onAddClick} aria-label="Add photo">+</button>
        )}
      </div>
      {photos.length > 0 && (
        <p className="photo-manager-hint">Tap ★ to choose the main photo · ✂ to adjust</p>
      )}
      {croppingPhoto && (
        <PhotoCropDialog
          open
          imageSrc={croppingPhoto.sourceUrl}
          initialParams={croppingPhoto.cropParams}
          onApply={(params, blob) => {
            onApplyCrop(croppingPhoto.id, params, blob);
            setCroppingId(null);
          }}
          onCancel={() => setCroppingId(null)}
        />
      )}
    </>
  );
}

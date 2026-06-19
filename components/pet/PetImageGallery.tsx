'use client';

import { useState } from 'react';

export function PetImageGallery({
  petName,
  petAge,
  fallbackImage,
  gallery,
}: {
  petName: string;
  petAge: string;
  fallbackImage: string;
  gallery?: string[];
}) {
  const photos = gallery?.length ? gallery : [fallbackImage];
  const [mainImage, setMainImage] = useState(fallbackImage);
  const currentIndex = Math.max(0, photos.indexOf(mainImage));

  return (
    <>
      <div className="main-img">
        <img src={mainImage || fallbackImage} alt={petName} />
        <span className="age-label">{petAge}</span>

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setMainImage(photos[(currentIndex - 1 + photos.length) % photos.length])}
              className="img-nav-btn"
              style={{ left: '12px' }}
              aria-label="Previous photo"
            >
              ‹
            </button>
            <button
              onClick={() => setMainImage(photos[(currentIndex + 1) % photos.length])}
              className="img-nav-btn"
              style={{ right: '12px' }}
              aria-label="Next photo"
            >
              ›
            </button>
            <span className="img-counter">{currentIndex + 1} / {photos.length}</span>
          </>
        )}
      </div>

      {photos.length > 1 && (
        <div className="thumbnails">
          {photos.map((url, index) => (
            <div key={url + index} onClick={() => setMainImage(url)} className={`thumb ${mainImage === url ? 'active' : ''}`}>
              <img src={url} alt={`${petName} photo ${index + 1}`} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

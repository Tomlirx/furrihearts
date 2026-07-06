'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export function PetImageGallery({
  petName,
  fallbackImage,
  gallery,
  isFeatured = false,
}: {
  petName: string;
  fallbackImage: string;
  gallery?: string[];
  isFeatured?: boolean;
}) {
  const t = useTranslations('PetDetail.imageGallery');
  const photos = gallery?.length ? gallery : [fallbackImage];
  const [mainImage, setMainImage] = useState(fallbackImage);
  const currentIndex = Math.max(0, photos.indexOf(mainImage));

  return (
    <>
      <div className="main-img">
        <Image src={mainImage || fallbackImage} alt={petName} width={800} height={600} priority sizes="(max-width: 900px) 100vw, 640px" />
        {isFeatured && <span className="featured-tag">{t('featured')}</span>}

        {photos.length > 1 && (
          <>
            <button
              onClick={() => setMainImage(photos[(currentIndex - 1 + photos.length) % photos.length])}
              className="img-nav-btn"
              style={{ left: '12px' }}
              aria-label={t('previousPhoto')}
            >
              ‹
            </button>
            <button
              onClick={() => setMainImage(photos[(currentIndex + 1) % photos.length])}
              className="img-nav-btn"
              style={{ right: '12px' }}
              aria-label={t('nextPhoto')}
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
              <Image src={url} alt={`${petName} photo ${index + 1}`} width={80} height={72} sizes="80px" />
            </div>
          ))}
        </div>
      )}
    </>
  );
}

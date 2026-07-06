'use client';
import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedBlob, type CropArea, type CropParams } from '@/lib/image-crop';

export default function PhotoCropDialog({
  open,
  imageSrc,
  initialParams,
  onApply,
  onCancel,
}: {
  open: boolean;
  imageSrc: string;
  initialParams: CropParams | null;
  onApply: (params: CropParams, blob: Blob) => void;
  onCancel: () => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<CropArea | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState('');

  useEffect(() => {
    if (open) {
      setCrop(initialParams?.crop ?? { x: 0, y: 0 });
      setZoom(initialParams?.zoom ?? 1);
      setAreaPixels(initialParams?.croppedAreaPixels ?? null);
      setIsApplying(false);
      setApplyError('');
    }
  }, [open, imageSrc]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const handleApply = async () => {
    if (!areaPixels) return;
    setIsApplying(true);
    setApplyError('');
    try {
      const blob = await getCroppedBlob(imageSrc, areaPixels);
      onApply({ crop, zoom, croppedAreaPixels: areaPixels }, blob);
    } catch (err) {
      console.error('Crop failed:', err);
      setApplyError('Could not crop this photo. Please try again.');
      setIsApplying(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isApplying ? undefined : onCancel}>
      <div className="modal-content crop-dialog" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="crop-dialog-title">
        <h2 className="crop-dialog-title" id="crop-dialog-title">Adjust photo</h2>
        <p className="crop-dialog-hint">Drag to reposition · pinch or scroll to zoom</p>
        <div className="crop-canvas-wrap">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            initialCroppedAreaPixels={initialParams?.croppedAreaPixels}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, px) => setAreaPixels(px)}
          />
        </div>
        <div className="crop-zoom-row">
          <span>Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
          />
          <button
            className="crop-reset-btn"
            onClick={() => { setCrop({ x: 0, y: 0 }); setZoom(1); }}
            disabled={isApplying}
          >
            Reset
          </button>
        </div>
        {applyError && <div className="crop-error">{applyError}</div>}
        <div className="crop-dialog-actions">
          <button className="btn-view-full" onClick={onCancel} disabled={isApplying}>Cancel</button>
          <button className="btn-approve" onClick={handleApply} disabled={isApplying || !areaPixels}>
            {isApplying ? 'Applying…' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

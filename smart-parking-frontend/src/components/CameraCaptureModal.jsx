import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n';

function CameraCaptureModal({ onCapture, onCancel }) {
  const { t } = useTranslation();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => setError(err.message || t('cameraFailed')));

    if (!navigator.mediaDevices) {
      setError(t('cameraUnsupported'));
    }

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        onCapture(new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      },
      'image/jpeg',
      0.92
    );
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <h3>{t('scanPlate')}</h3>

        {error ? (
          <p className="parking-form-error">{error} {t('cameraCheck')}</p>
        ) : (
          <div className="camera-preview-wrap">
            <video ref={videoRef} autoPlay playsInline muted />
          </div>
        )}

        <div className="scan-buttons">
          <button type="button" className="btn" disabled={!!error} onClick={handleCapture}>
            {t('capture')}
          </button>
          <button type="button" className="btn secondary" onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraCaptureModal;

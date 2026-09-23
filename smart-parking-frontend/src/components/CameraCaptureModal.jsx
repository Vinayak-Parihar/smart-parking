import { useEffect, useRef, useState } from 'react';

function CameraCaptureModal({ onCapture, onCancel }) {
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
      .catch((err) => setError(err.message || 'Could not access the camera.'));

    if (!navigator.mediaDevices) {
      setError('Camera access is not supported in this browser.');
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
        <h3>Scan plate</h3>

        {error ? (
          <p className="parking-form-error">{error} Check camera permissions and try again.</p>
        ) : (
          <div className="camera-preview-wrap">
            <video ref={videoRef} autoPlay playsInline muted />
          </div>
        )}

        <div className="scan-buttons">
          <button type="button" className="btn" disabled={!!error} onClick={handleCapture}>
            Capture
          </button>
          <button type="button" className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default CameraCaptureModal;

const ANPR_SERVICE_URL = process.env.ANPR_SERVICE_URL || 'http://localhost:5001';

/**
 * Sends an image buffer to the ANPR microservice and returns the
 * detected plate number (or null if nothing was detected).
 *
 * @param {Buffer} imageBuffer - raw image bytes (from multer)
 * @param {string} filename - original filename (used for content-type hints)
 */
export async function scanPlate(imageBuffer, filename = 'scan.jpg') {
  const formData = new FormData();
  const blob = new Blob([imageBuffer]);
  formData.append('image', blob, filename);

  const res = await fetch(`${ANPR_SERVICE_URL}/scan`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    throw new Error(`ANPR service error: ${res.status}`);
  }

  const result = await res.json();

  if (!result.detected) {
    return null;
  }

  return {
    plateNumber: result.plateNumber,
    confidence: result.confidence
  };
}

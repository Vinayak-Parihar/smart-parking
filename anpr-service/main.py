"""
ANPR microservice — wraps fast-alpr behind a simple REST API
so the Node backend can call it over HTTP instead of dealing
with Python directly.

Run:
    uvicorn main:app --host 0.0.0.0 --port 5001

Endpoint:
    POST /scan  (multipart/form-data, field name: "image")
    -> { "detected": true, "plateNumber": "MH12AB1234", "confidence": 0.97 }
"""

import numpy as np
import cv2
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fast_alpr import ALPR

app = FastAPI(title="ANPR Microservice")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load models once at startup (not per-request — this is the slow part)
alpr = ALPR(
    detector_model="yolo-v9-t-384-license-plate-end2end",
    ocr_model="cct-xs-v2-global-model",
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/scan")
async def scan_plate(image: UploadFile = File(...)):
    contents = await image.read()
    np_arr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"detected": False, "error": "Could not decode image"}

    results = alpr.predict(frame)

    if not results:
        return {"detected": False}

    # take the highest-confidence detection
    best = max(results, key=lambda r: r.detection.confidence)
    avg_ocr_confidence = (
        sum(best.ocr.confidence) / len(best.ocr.confidence)
        if best.ocr.confidence else 0
    )

    return {
        "detected": True,
        "plateNumber": best.ocr.text,
        "confidence": round(avg_ocr_confidence, 4),
        "detectionConfidence": round(best.detection.confidence, 4),
    }

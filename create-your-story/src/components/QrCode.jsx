import { useEffect, useRef } from "react";
import QRCode from "qrcode";

// Always encodes a full absolute URL (never a bare path or code) so scanning
// works regardless of what page the guest happened to be on.
export default function QrCode({ url, size = 200 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, { width: size, margin: 1 }, () => {});
  }, [url, size]);

  return <canvas ref={canvasRef} width={size} height={size} className="rounded-lg" />;
}

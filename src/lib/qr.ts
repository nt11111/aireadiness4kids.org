/**
 * QR codes for presenter mode (brief sections 2 and 7), drawn on the server as inline SVG with the
 * `qrcode` package: no image requests, nothing for the CSP to allow, and sharp on a projector.
 */
import QRCode from "qrcode";

/** An SVG QR code for a URL. Dark ink on white with a quiet zone, which phone cameras read best. */
export async function qrSvg(url: string, label: string): Promise<string> {
  const svg = await QRCode.toString(url, { type: "svg", errorCorrectionLevel: "M", margin: 2, color: { dark: "#1C2430", light: "#FFFFFF" } });
  // Name the image for screen readers; the visible link text next to it says the same.
  return svg.replace("<svg ", `<svg role="img" aria-label="${label.replace(/[<>&"]/g, "")}" `);
}

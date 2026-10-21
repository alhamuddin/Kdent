import { ImageResponse } from "next/og";

export const alt =
  "K-Dent Dental Healthcare Center - Dentist in Chittagong";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(ellipse at 80% 10%, #075b62 0%, #0b171b 48%, #071013 100%)",
          color: "#f8ffff",
          display: "flex",
          height: "100%",
          padding: "80px",
          width: "100%",
        }}
      >
        <div
          style={{
            border: "2px solid #21b5a8",
            borderRadius: "28px",
            display: "flex",
            flexDirection: "column",
            gap: "22px",
            padding: "56px 64px",
            width: "100%",
          }}
        >
          <div
            style={{
              color: "#45d2c3",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "0.12em",
            }}
          >
            K-DENT
          </div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.12 }}>
            Dental Healthcare Center
          </div>
          <div style={{ color: "#c7dcda", fontSize: 32 }}>
            Dentist in Chowdhury Hat, Chittagong
          </div>
        </div>
      </div>
    ),
    size,
  );
}

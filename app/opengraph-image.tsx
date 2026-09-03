import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "DERANGED FAN";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.18), rgba(255,255,255,0) 28%), linear-gradient(135deg, #050505 0%, #202020 48%, #020202 100%)",
          color: "#f7f7f2"
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,85,0,0.16), rgba(255,255,255,0.04), rgba(255,85,0,0.12))"
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: 96,
              letterSpacing: 28,
              fontFamily: "Georgia, serif",
              lineHeight: 1,
              textTransform: "uppercase"
            }}
          >
            DERANGED FAN
          </div>
          <div
            style={{
              width: 220,
              height: 2,
              background: "rgba(255,255,255,0.78)"
            }}
          />
          <div
            style={{
              fontSize: 26,
              letterSpacing: 7,
              textTransform: "uppercase",
              color: "rgba(247,247,242,0.78)"
            }}
          >
            derangedfan.com
          </div>
        </div>
      </div>
    ),
    size
  );
}

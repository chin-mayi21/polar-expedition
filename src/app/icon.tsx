import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B2545",
          borderRadius: 6,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <g stroke="#127475" strokeWidth="2" strokeLinecap="round">
            <path d="M16 6v20M16 6l2.5 4M16 6l-2.5 4M16 26l2.5-4M16 26l-2.5-4" />
            <path d="M8.5 11l15 10M8.5 21l15-10" />
            <path d="M23.5 11l-15 10M23.5 21l-15-10" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}

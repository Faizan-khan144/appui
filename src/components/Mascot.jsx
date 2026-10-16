import { useId } from "react";

const clamp = (v, a = -1, b = 1) => Math.max(a, Math.min(b, v));

export default function Mascot({
  size = 120,
  mood = "idle",
  look = null,
  wave = false,
  className = "",
  style,
  sparkle = true,
  onClick,
  title,
}) {
  const raw = useId();
  const id = raw.replace(/[^a-zA-Z0-9]/g, "");
  const gBody = `gBody${id}`;
  const gGlow = `gGlow${id}`;
  const gBlush = `gBlush${id}`;
  const gEar = `gEar${id}`;

  const lx = look ? clamp(look.x) * 4.4 : 0;
  const ly = look ? clamp(look.y) * 3.4 : 0;
  const closed = mood === "sleepy";
  const happy = mood === "happy";
  const hearts = mood === "love";
  const wide = mood === "wow";

  return (
    <svg
      className={`mascot ${wave ? "wave" : ""} ${onClick ? "clickable" : ""} ${className}`}
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      aria-label={title || "Appui mascot"}
    >
      <defs>
        <linearGradient id={gBody} x1="0.2" y1="0.05" x2="0.82" y2="0.98">
          <stop offset="0" stopColor="#ffe1ad" />
          <stop offset="0.55" stopColor="#ffc9b0" />
          <stop offset="1" stopColor="#ffb0d0" />
        </linearGradient>
        <radialGradient id={gEar} cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor="#ffb6cf" />
          <stop offset="1" stopColor="#ff93b6" />
        </radialGradient>
        <radialGradient id={gGlow} cx="42%" cy="30%" r="62%">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={gBlush} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ff6f9c" stopOpacity="0.8" />
          <stop offset="1" stopColor="#ff6f9c" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="80" cy="150" rx="40" ry="7" fill="#000" opacity="0.14" transform={`translate(${lx * 2} 0)`} />

      <g className="body">
        <circle cx="47" cy="44" r="18" fill={`url(#${gBody})`} />
        <circle cx="113" cy="44" r="18" fill={`url(#${gBody})`} />
        <ellipse cx="47" cy="45" rx="8.5" ry="10.5" fill={`url(#${gEar})`} />
        <ellipse cx="113" cy="45" rx="8.5" ry="10.5" fill={`url(#${gEar})`} />

        <ellipse cx="63" cy="140" rx="12.5" ry="8.5" fill={`url(#${gBody})`} />
        <ellipse cx="97" cy="140" rx="12.5" ry="8.5" fill={`url(#${gBody})`} />

        <ellipse className="arm-l" cx="23" cy="99" rx="8.5" ry="11.5" fill={`url(#${gBody})`} transform="rotate(-24 23 99)" />
        <ellipse className="arm-r" cx="137" cy="99" rx="8.5" ry="11.5" fill={`url(#${gBody})`} transform="rotate(24 137 99)" />

        <ellipse cx="80" cy="90" rx="56" ry="54" fill={`url(#${gBody})`} />
        <ellipse cx="73" cy="64" rx="35" ry="27" fill={`url(#${gGlow})`} />
        <ellipse cx="80" cy="126" rx="34" ry="14" fill="#000" opacity="0.05" />

        <ellipse cx="43" cy="103" rx="13" ry="8.5" fill={`url(#${gBlush})`} />
        <ellipse cx="117" cy="103" rx="13" ry="8.5" fill={`url(#${gBlush})`} />

        {closed ? (
          <>
            <path d="M52 86q10 8 20 0" stroke="#3b2a35" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <path d="M88 86q10 8 20 0" stroke="#3b2a35" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          </>
        ) : happy ? (
          <>
            <path d="M52 87q10 -14 20 0" stroke="#3b2a35" strokeWidth="4.4" strokeLinecap="round" fill="none" />
            <path d="M88 87q10 -14 20 0" stroke="#3b2a35" strokeWidth="4.4" strokeLinecap="round" fill="none" />
          </>
        ) : hearts ? (
          <>
            <path d="M62 74c-5-4.6-11-0.8-11 4.6 0 5 11 11 11 11s11-6 11-11c0-5.4-6-9.2-11-4.6z" fill="#ff5f8f" />
            <path d="M98 74c-5-4.6-11-0.8-11 4.6 0 5 11 11 11 11s11-6 11-11c0-5.4-6-9.2-11-4.6z" fill="#ff5f8f" />
          </>
        ) : wide ? (
          <>
            <circle cx="62" cy="84" r="12.5" fill="#fff" />
            <circle cx={62 + lx * 0.7} cy={84 + ly * 0.7} r="6" fill="#3b2a35" />
            <circle cx={62 + lx * 0.7 + 2.3} cy={84 + ly * 0.7 - 2.3} r="1.9" fill="#fff" />
            <circle cx="98" cy="84" r="12.5" fill="#fff" />
            <circle cx={98 + lx * 0.7} cy={84 + ly * 0.7} r="6" fill="#3b2a35" />
            <circle cx={98 + lx * 0.7 + 2.3} cy={84 + ly * 0.7 - 2.3} r="1.9" fill="#fff" />
          </>
        ) : (
          <>
            <g transform={`translate(${lx} ${ly})`}>
              <ellipse className="eye" cx="62" cy="84" rx="10.5" ry="13" fill="#3b2a35" />
              <circle cx="65.5" cy="78.6" r="3.9" fill="#fff" />
              <circle cx="58.4" cy="89" r="2" fill="#fff" opacity="0.85" />
              <circle cx="68" cy="85.4" r="1.1" fill="#fff" opacity="0.7" />
            </g>
            <g transform={`translate(${lx} ${ly})`}>
              <ellipse className="eye" cx="98" cy="84" rx="10.5" ry="13" fill="#3b2a35" />
              <circle cx="101.5" cy="78.6" r="3.9" fill="#fff" />
              <circle cx="94.4" cy="89" r="2" fill="#fff" opacity="0.85" />
              <circle cx="104" cy="85.4" r="1.1" fill="#fff" opacity="0.7" />
            </g>
          </>
        )}

        {mood === "happy" || mood === "love" ? (
          <>
            <path d="M69 101q11 14 22 0z" fill="#3b2a35" />
            <path d="M76 107q4 6 8 0z" fill="#ff7aa8" />
          </>
        ) : mood === "thinking" ? (
          <circle cx="80" cy="104" r="4.2" fill="#3b2a35" />
        ) : mood === "sleepy" ? (
          <path d="M74 103q6 3 12 0" stroke="#3b2a35" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ) : mood === "wow" ? (
          <circle cx="80" cy="104" r="5.2" fill="#3b2a35" />
        ) : (
          <path d="M70 102q5 5 10 0q5 5 10 0" stroke="#3b2a35" strokeWidth="3.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        )}

        {mood === "sleepy" && (
          <text x="120" y="52" fontSize="19" fontWeight="700" fill="#b9aecb">z</text>
        )}
      </g>

      {sparkle && (
        <>
          <path className="sparkle" d="M132 26l2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4z" fill="#ffd36b" />
          <path className="sparkle s2" d="M28 46l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" fill="#8ee7ff" />
          <path className="sparkle s3" d="M139 118l1.4 3.8 3.8 1.4-3.8 1.4-1.4 3.8-1.4-3.8-3.8-1.4 3.8-1.4z" fill="#c4b5fd" />
        </>
      )}
    </svg>
  );
}

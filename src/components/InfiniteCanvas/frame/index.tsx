import * as React from "react";
import styles from "./style.module.css";

type CamState = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

function useCameraState(): CamState {
  const [cam, setCam] = React.useState<CamState>({
    x: 0,
    y: 0,
    z: 50,
    vx: 0,
    vy: 0,
    vz: 0,
  });
  const targetRef = React.useRef<CamState>({
    x: 0,
    y: 0,
    z: 50,
    vx: 0,
    vy: 0,
    vz: 0,
  });
  const smoothRef = React.useRef<CamState>({
    x: 0,
    y: 0,
    z: 50,
    vx: 0,
    vy: 0,
    vz: 0,
  });
  const rafRef = React.useRef<number>(0);

  React.useEffect(() => {
    const handler = (e: Event) => {
      targetRef.current = (e as CustomEvent<CamState>).detail;
    };
    window.addEventListener("hudCameraUpdate", handler);

    const LERP = 0.12;
    function tick() {
      const t = targetRef.current;
      const s = smoothRef.current;
      const next: CamState = {
        x: s.x + (t.x - s.x) * LERP,
        y: s.y + (t.y - s.y) * LERP,
        z: s.z + (t.z - s.z) * LERP,
        vx: t.vx,
        vy: t.vy,
        vz: t.vz,
      };
      smoothRef.current = next;
      setCam(next);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("hudCameraUpdate", handler);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return cam;
}

function useClock() {
  const [time, setTime] = React.useState(() =>
    new Date().toTimeString().slice(0, 8),
  );
  React.useEffect(() => {
    const id = setInterval(
      () => setTime(new Date().toTimeString().slice(0, 8)),
      1000,
    );
    return () => clearInterval(id);
  }, []);
  return time;
}

function fmt(n: number, dec = 1): string {
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(dec)}`;
}

const DIAL_DEG_PER_UNIT = 0.6; // 600 world-units per full revolution
const DIAL_TICK_SPACING = 20; // world units between minor ticks
const DIAL_MAJOR_EVERY = 5; // every 5th minor = 100 world units = 60° apart

function HeadingDial({ x }: { x: number }) {
  const halfRangeUnits = 185 / DIAL_DEG_PER_UNIT;
  const firstIdx = Math.floor((x - halfRangeUnits) / DIAL_TICK_SPACING);
  const lastIdx = Math.ceil((x + halfRangeUnits) / DIAL_TICK_SPACING);

  const ticks: {
    idx: number;
    rad: number;
    major: boolean;
    r0: number;
    r1: number;
    label: string | null;
  }[] = [];
  for (let idx = firstIdx; idx <= lastIdx; idx++) {
    const worldX = idx * DIAL_TICK_SPACING;
    // lower worldX values sit clockwise (right) of needle, matching compass tape
    const angleDeg = (x - worldX) * DIAL_DEG_PER_UNIT;
    if (Math.abs(angleDeg) > 182) continue;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const major = idx % DIAL_MAJOR_EVERY === 0;
    const r0 = major ? 27 : 30;
    const r1 = 34;
    // only label the front arc (±150°) so text doesn't crowd the back
    const label =
      major && Math.abs(angleDeg) <= 150 ? String(Math.round(worldX)) : null;
    ticks.push({ idx, rad, major, r0, r1, label });
  }

  return (
    <div className={styles.dialWrap}>
      <svg
        width='90'
        height='90'
        viewBox='-45 -45 90 90'
        className={styles.dialSvg}
      >
        <circle
          r='43'
          fill='none'
          stroke='currentColor'
          strokeWidth='0.5'
          opacity='0.2'
        />
        <circle
          r='36'
          fill='none'
          stroke='currentColor'
          strokeWidth='0.5'
          opacity='0.1'
        />
        {ticks.map((t) => (
          <g key={t.idx}>
            <line
              x1={Math.cos(t.rad) * t.r0}
              y1={Math.sin(t.rad) * t.r0}
              x2={Math.cos(t.rad) * t.r1}
              y2={Math.sin(t.rad) * t.r1}
              stroke='currentColor'
              strokeWidth={t.major ? 1 : 0.5}
              opacity={t.major ? 0.6 : 0.25}
            />
            {t.label && (
              <text
                x={Math.cos(t.rad) * 21}
                y={Math.sin(t.rad) * 21 + 2}
                textAnchor='middle'
                fontSize='4.5'
                fill='currentColor'
                opacity='0.55'
                fontFamily='inherit'
              >
                {t.label}
              </text>
            )}
          </g>
        ))}
        {/* fixed needle at 12 o'clock */}
        <line
          x1={0}
          y1={10}
          x2={0}
          y2={-28}
          stroke='currentColor'
          strokeWidth='1.5'
          strokeLinecap='round'
          opacity='0.9'
        />
        <circle r='2.5' fill='currentColor' opacity='0.9' />
        <circle
          r='5'
          fill='none'
          stroke='currentColor'
          strokeWidth='0.5'
          opacity='0.4'
        />
      </svg>
      <div className={styles.dialReadout}>{Math.round(x)}</div>
    </div>
  );
}

const TAPE_HEIGHT = 220; // px — vertical tape
const TAPE_WIDTH = 220; // px
const PX_PER_UNIT = 1.2; // screen pixels per world unit
const TICK_SPACING = 20; // world units between minor ticks
const MAJOR_EVERY = 5; // every Nth minor tick is major (= 100 world units)

function CompassTape({ x }: { x: number }) {
  const half = TAPE_WIDTH / 2;
  const visibleRange = half / PX_PER_UNIT + TICK_SPACING * 2;

  const firstIdx = Math.floor((x - visibleRange) / TICK_SPACING);
  const lastIdx = Math.ceil((x + visibleRange) / TICK_SPACING);

  const ticks: {
    idx: number;
    screenX: number;
    major: boolean;
    label: string | null;
  }[] = [];
  for (let idx = firstIdx; idx <= lastIdx; idx++) {
    const worldX = idx * TICK_SPACING;
    // invert sign so moving right scrolls tape rightward
    const screenX = half + (x - worldX) * PX_PER_UNIT;
    if (screenX < -TICK_SPACING || screenX > TAPE_WIDTH + TICK_SPACING)
      continue;
    const major = idx % MAJOR_EVERY === 0;
    const label = major ? String(Math.round(worldX)) : null;
    ticks.push({ idx, screenX, major, label });
  }

  return (
    <div className={styles.compassWrap}>
      <div className={styles.compassCaret}></div>
      <div className={styles.compassTrack}>
        {ticks.map((t) => (
          <div
            key={t.idx}
            className={`${styles.compassTick} ${t.major ? styles.compassMajor : ""}`}
            style={{ left: `${t.screenX}px` }}
          >
            <div className={styles.compassLine} />
            {t.label && <div className={styles.compassLabel}>{t.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function VerticalTape({ y }: { y: number }) {
  const half = TAPE_HEIGHT / 2;
  const visibleRange = half / PX_PER_UNIT + TICK_SPACING * 2;

  const firstIdx = Math.floor((y - visibleRange) / TICK_SPACING);
  const lastIdx = Math.ceil((y + visibleRange) / TICK_SPACING);

  const ticks: {
    idx: number;
    screenY: number;
    major: boolean;
    label: string | null;
  }[] = [];
  for (let idx = firstIdx; idx <= lastIdx; idx++) {
    const worldY = idx * TICK_SPACING;
    // moving up (y increases) scrolls tape upward: smaller top = higher on screen
    const screenY = half - (y - worldY) * PX_PER_UNIT;
    if (screenY < -TICK_SPACING || screenY > TAPE_HEIGHT + TICK_SPACING)
      continue;
    const major = idx % MAJOR_EVERY === 0;
    const label = major ? String(Math.round(worldY)) : null;
    ticks.push({ idx, screenY, major, label });
  }

  return (
    <div className={styles.vtapeWrap}>
      <div className={styles.vtapeReadout}>{Math.round(y)}</div>
      <div className={styles.vtapeCaret}></div>
      <div className={styles.vtapeTrack}>
        {ticks.map((t) => (
          <div
            key={t.idx}
            className={`${styles.vtapeTick} ${t.major ? styles.vtapeMajor : ""}`}
            style={{ top: `${t.screenY}px` }}
          >
            <div className={styles.vtapeLine} />
            {t.label && <div className={styles.vtapeLabel}>{t.label}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeedBar({ speed }: { speed: number }) {
  const max = 4;
  const pct = Math.min((speed / max) * 100, 100);
  return (
    <div className={styles.speedBar}>
      <div className={styles.speedLabel}>SPD</div>
      <div className={styles.speedTrack}>
        <div className={styles.speedFill} style={{ width: `${pct}%` }} />
      </div>
      <div className={styles.speedValue}>{speed.toFixed(2)}</div>
    </div>
  );
}

export function Frame() {
  const cam = useCameraState();
  const time = useClock();

  const speed = Math.sqrt(cam.vx ** 2 + cam.vy ** 2 + cam.vz ** 2);
  const gridX = Math.floor(cam.x / 110);
  const gridY = Math.floor(cam.y / 110);
  const sectorStr = `${gridX >= 0 ? "+" : ""}${gridX}/${gridY >= 0 ? "+" : ""}${gridY}`;

  return (
    <div className={styles.hud}>
      {/* Scan line */}
      <div className={styles.scanline} />

      {/* Corner brackets */}
      <div className={`${styles.corner} ${styles.tl} ${styles.hiddenMobile}`} />
      <div className={`${styles.corner} ${styles.tr}`} />
      <div className={`${styles.corner} ${styles.bl}`} />
      <div className={`${styles.corner} ${styles.br}`} />

      {/* Edge ticks */}
      <div className={`${styles.edgeTick} ${styles.tickTop}`} />
      <div className={`${styles.edgeTick} ${styles.tickBottom}`} />
      <div className={`${styles.edgeTick} ${styles.tickLeft}`} />
      <div className={`${styles.edgeTick} ${styles.tickRight}`} />

      {/* Crosshair */}
      <div className={styles.crosshair}>
        <div className={`${styles.xhairArm} ${styles.xhairC}`} />
      </div>

      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.hiddenMobile}>INFINITE CANVAS</div>
        </div>
        <div className={styles.topRight}>
          <div className={styles.dataRow}>
            <span className={styles.lbl}>HDG</span>
            <span className={`${styles.val} ${styles.mono}`}>
              {fmt(cam.x, 0)}
            </span>
          </div>
          <span className={styles.lbl}>UTC</span>
          <span className={styles.val}>{time}</span>
        </div>
      </div>

      {/* Left panel */}
      <div className={styles.leftPanel}>
        <div className={styles.panelTitle}>COORDINATES</div>
        <div className={styles.dataRow}>
          <span className={styles.lbl}>X</span>
          <span className={`${styles.val} ${styles.mono}`}>{fmt(cam.x)}</span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.lbl}>Y</span>
          <span className={`${styles.val} ${styles.mono}`}>{fmt(cam.y)}</span>
        </div>
        <div className={styles.panelDivider} />
        <div className={styles.dataRow}>
          <span className={styles.lbl}>ALT</span>
          <span className={`${styles.val} ${styles.mono}`}>
            {cam.z.toFixed(1)}
          </span>
        </div>
        <div className={styles.dataRow}>
          <span className={styles.lbl}>GRD</span>
          <span className={`${styles.val} ${styles.mono}`}>{sectorStr}</span>
        </div>
        <div className={styles.panelDivider} />
        <SpeedBar speed={speed} />
      </div>

      {/* Right panel */}
      <div className={styles.rightPanel}></div>

      {/* Right vertical tape — tracks Y */}
      <VerticalTape y={cam.y} />

      {/* Bottom bar */}
      <div className={styles.bottomBar}>
        <div className={styles.bottomLeft}>
          <span className={styles.lbl}>SECTOR</span>
          <span className={styles.val}>{sectorStr}</span>
        </div>
        <CompassTape x={cam.x} />
        <div className={styles.bottomRight}>
          <span className={styles.lbl}>OBJECTS</span>
          <span className={styles.val}>215</span>
        </div>
      </div>
    </div>
  );
}

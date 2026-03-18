import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

// Spring configs
const SPRING_OUTER = { stiffness: 38, damping: 11, mass: 1 };
const SPRING_INNER = { stiffness: 160, damping: 20, mass: 0.4 };

const wrap: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  pointerEvents: "none",
  zIndex: 2000,
  overflow: "hidden",
};

function getTouchDist(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// HUD-matching corner bracket reticle.
// Arms: 22px long (matching .corner size in frame), 8px center gap each side.
// TL: M -8 -30  L -30 -30  L -30 -8
// TR: M  8 -30  L  30 -30  L  30 -8
// BR: M 30  8   L  30  30  L   8 30
// BL: M -8  30  L -30  30  L -30  8
const BRACKETS = `
  M -8 -30 L -30 -30 L -30 -8
  M  8 -30 L  30 -30 L  30 -8
  M 30  8  L  30  30 L   8 30
  M -8  30 L -30  30 L -30  8
`;

export function SpringCursor() {
  const prefersReduced = useReducedMotion();

  // Raw cursor position
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

  // Outer brackets: slow, laggy spring
  const outerX = useSpring(rawX, SPRING_OUTER);
  const outerY = useSpring(rawY, SPRING_OUTER);

  // Inner crosshair: fast, snappy spring
  const innerX = useSpring(rawX, SPRING_INNER);
  const innerY = useSpring(rawY, SPRING_INNER);

  const [visible, setVisible] = React.useState(false);
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const lastPinchDist = React.useRef(0);

  React.useEffect(() => {
    if (prefersReduced) return;

    const onMove = (e: MouseEvent) => {
      rawX.set(e.clientX);
      rawY.set(e.clientY);
      setVisible(true);
    };

    const onLeave = () => setVisible(false);

    const onDown = () => setHasInteracted(true);

    const onTouch = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const t = e.touches[0];
        if (t) {
          rawX.set(t.clientX);
          rawY.set(t.clientY);
          setVisible(true);
          setHasInteracted(true);
        }
        lastPinchDist.current = 0;
      } else if (e.touches.length === 2) {
        const dist = getTouchDist(e.touches);
        lastPinchDist.current = dist;
      }
    };

    const onTouchEnd = () => {
      lastPinchDist.current = 0;
      setVisible(false);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [rawX, rawY, prefersReduced]);

  if (prefersReduced) return null;

  return (
    <div style={wrap}>
      {/* Outer corner brackets — lags behind cursor */}
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.45 }}
        style={{
          position: "absolute",
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      >
        <svg width="60" height="60" viewBox="-30 -30 60 60">
          <path
            d={BRACKETS}
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity="0.55"
          />
        </svg>
      </motion.div>

      {/* Center crosshair — snappy, tracks cursor closely */}
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "absolute",
          x: innerX,
          y: innerY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      >
        <svg width="16" height="16" viewBox="-8 -8 16 16">
          <line x1="-4" y1="0" x2="4" y2="0" stroke="white" strokeWidth="1" opacity="0.9" />
          <line x1="0" y1="-4" x2="0" y2="4" stroke="white" strokeWidth="1" opacity="0.9" />
        </svg>
      </motion.div>

      {/* Gesture hints — appear after 1.4s, vanish on first interaction */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            key='hints'
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.3,
              transition: { delay: 1.4, duration: 1.0 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            style={{
              position: "fixed",
              bottom: "4.5rem",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: "3rem",
              fontFamily: '"TeX Gyre Heros", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fff",
              mixBlendMode: "difference",
            }}
          >
            <span>↕ scroll</span>
            <span>⇄ drag</span>
            <span>✦ pinch</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "motion/react";

// Spring configs
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


export function SpringCursor() {
  const prefersReduced = useReducedMotion();

  // Raw cursor position
  const rawX = useMotionValue(-200);
  const rawY = useMotionValue(-200);

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
      {/* Full-viewport crosshair lines — snappy, tracks cursor closely */}
      <motion.div
        animate={{ opacity: visible ? 0.05 : 0 }}
        transition={{ duration: 0.45, delay: visible ? 0.3 : 0 }}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          width: 1,
          x: innerX,
          background: "white",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      />
      <motion.div
        animate={{ opacity: visible ? 0.05 : 0 }}
        transition={{ duration: 0.45, delay: visible ? 0.3 : 0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 1,
          y: innerY,
          background: "white",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      />

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

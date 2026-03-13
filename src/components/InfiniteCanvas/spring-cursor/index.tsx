import * as React from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

// Spring configs
const SPRING_OUTER = { stiffness: 38, damping: 11, mass: 1 };
const SPRING_INNER = { stiffness: 160, damping: 20, mass: 0.4 };
const SPRING_STRETCH = { stiffness: 90, damping: 16 };
const SPRING_ROTATE = { stiffness: 60, damping: 14 };

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

  // Outer ring: slow, laggy spring
  const outerX = useSpring(rawX, SPRING_OUTER);
  const outerY = useSpring(rawY, SPRING_OUTER);

  // Inner dot: fast, snappy spring
  const innerX = useSpring(rawX, SPRING_INNER);
  const innerY = useSpring(rawY, SPRING_INNER);

  // Velocity → drag deformation
  const vx = useVelocity(rawX);
  const vy = useVelocity(rawY);

  const speed = useTransform([vx, vy], ([dx, dy]) =>
    Math.sqrt((dx as number) ** 2 + (dy as number) ** 2),
  );

  // Rotation in direction of travel
  const rawRotate = useTransform([vx, vy], ([dx, dy]) => {
    const d = dx as number;
    const v = dy as number;
    if (Math.abs(d) < 8 && Math.abs(v) < 8) return 0;
    return (Math.atan2(v, d) * 180) / Math.PI;
  });
  const rotate = useSpring(rawRotate, SPRING_ROTATE);

  // Stretch along travel axis
  const rawScaleX = useTransform(speed, [0, 480], [1, 2.1]);
  const rawScaleY = useTransform(speed, [0, 480], [1, 0.52]);
  const stretchX = useSpring(rawScaleX, SPRING_STRETCH);
  const stretchY = useSpring(rawScaleY, SPRING_STRETCH);

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
      {/* Outer ring — lags behind, stretches and rotates with drag velocity */}
      <motion.div
        animate={{ opacity: visible ? 0.38 : 0 }}
        transition={{ duration: 0.45 }}
        style={{
          position: "absolute",
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "1px solid #fff",
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          rotate,
          scaleX: stretchX,
          scaleY: stretchY,
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      />

      {/* Mid ring — follows outer spring, stays circular, gives depth */}
      <motion.div
        animate={{ opacity: visible ? 0.1 : 0 }}
        transition={{ duration: 0.45 }}
        style={{
          position: "absolute",
          width: 110,
          height: 110,
          borderRadius: "50%",
          border: "1px solid #fff",
          x: outerX,
          y: outerY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      />

      {/* Inner dot — snappy, tracks cursor closely */}
      <motion.div
        animate={{ opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: "absolute",
          width: 5,
          height: 5,
          borderRadius: "50%",
          backgroundColor: "#fff",
          x: innerX,
          y: innerY,
          translateX: "-50%",
          translateY: "-50%",
          mixBlendMode: "difference",
          willChange: "transform, opacity",
        }}
      />

      {/* Gesture hints — appear after 1.4s, vanish on first interaction */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div
            key="hints"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.3,
              transition: { delay: 1.4, duration: 1.0 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.35 } }}
            style={{
              position: "fixed",
              bottom: "2.5rem",
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

export type CamState = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
};

export const hudBridge: { onUpdate: ((s: CamState) => void) | null } = {
  onUpdate: null,
};

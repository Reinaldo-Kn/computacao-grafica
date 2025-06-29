
import type { Matrix4, Vector3D } from '../types.ts';

export const createIdentityMatrix = (): Matrix4 => [
  [1, 0, 0, 0],
  [0, 1, 0, 0],
  [0, 0, 1, 0],
  [0, 0, 0, 1],
];

export const createTranslationMatrix = (tx: number, ty: number, tz: number): Matrix4 => [
  [1, 0, 0, tx],
  [0, 1, 0, ty],
  [0, 0, 1, tz],
  [0, 0, 0, 1],
];

export const createScalingMatrix = (sx: number, sy: number, sz: number): Matrix4 => [
  [sx, 0, 0, 0],
  [0, sy, 0, 0],
  [0, 0, sz, 0],
  [0, 0, 0, 1],
];

export const createRotationXMatrix = (angleDeg: number): Matrix4 => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [1, 0, 0, 0],
    [0, cos, -sin, 0],
    [0, sin, cos, 0],
    [0, 0, 0, 1],
  ];
};

export const createRotationYMatrix = (angleDeg: number): Matrix4 => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [cos, 0, sin, 0],
    [0, 1, 0, 0],
    [-sin, 0, cos, 0],
    [0, 0, 0, 1],
  ];
};

export const createRotationZMatrix = (angleDeg: number): Matrix4 => {
  const rad = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return [
    [cos, -sin, 0, 0],
    [sin, cos, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
};

export const multiplyMatrices = (m1: Matrix4, m2: Matrix4): Matrix4 => {
  const result: Matrix4 = createIdentityMatrix();
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      result[i][j] = 0;
      for (let k = 0; k < 4; k++) {
        result[i][j] += m1[i][k] * m2[k][j];
      }
    }
  }
  return result;
};

export const transformPoint = (p: Vector3D, m: Matrix4): Vector3D => {
    const res: Vector3D = { x: 0, y: 0, z: 0, w: 0 };
    const vec = [p.x, p.y, p.z, p.w];
    const newVec = [0, 0, 0, 0];

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            newVec[i] += m[i][j] * vec[j];
        }
    }
    
    res.x = newVec[0];
    res.y = newVec[1];
    res.z = newVec[2];
    res.w = newVec[3];

    if (res.w !== 0 && res.w !== 1) {
        res.x /= res.w;
        res.y /= res.w;
        res.z /= res.w;
    }

    return res;
};

// 3D Vector
export interface Vector3D {
  x: number;
  y: number;
  z: number;
  w: number; // Homogeneous coordinate
}

// Winged-Edge Data Structure 
export interface VertexWE extends Vector3D {
  id: number;
  edge: EdgeWE | null;
}

export interface FaceWE {
  id: number;
  edge: EdgeWE | null;
  vertexIndices: number[]; 
}

export interface EdgeWE {
  id: number;
  v1: VertexWE;
  v2: VertexWE;
  face1: FaceWE | null;
  face2: FaceWE | null;
  p1_next: EdgeWE | null; 
  p1_prev: EdgeWE | null; 
  p2_next: EdgeWE | null; 
  p2_prev: EdgeWE | null; 
}

export interface WingedEdgeMesh {
  name: string;
  vertices: VertexWE[];
  edges: EdgeWE[];
  faces: FaceWE[];
}

// 4x4 Transformation Matrix
export type Matrix4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

// Transformation state for UI controls
export interface Transformations {
  tx: number; ty: number; tz: number;
  rx: number; ry: number; rz: number;
  sx: number; sy: number; sz: number;
}

export interface DisplayObject {
  id: string;
  mesh: WingedEdgeMesh;
  transformMatrix: Matrix4;
  transformations: Transformations;
  color: string;
}
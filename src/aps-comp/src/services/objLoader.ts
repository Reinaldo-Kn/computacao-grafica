import type { WingedEdgeMesh, VertexWE, FaceWE, EdgeWE } from '../types.ts';

export const parseOBJ = (objContent: string, fileName: string): WingedEdgeMesh => {
  const vertices: VertexWE[] = [];
  const faces: FaceWE[] = [];
  const edges: EdgeWE[] = [];
  
  const lines = objContent.split('\n');
  let vertexIdCounter = 0;
  let faceIdCounter = 0;
  const edgeMap = new Map<string, EdgeWE>();

  lines.forEach(line => {
    const parts = line.trim().split(/\s+/);
    if (parts.length === 0) return;

    switch (parts[0]) {
      case 'v':
        if (parts.length >= 4) {
          vertices.push({
            id: vertexIdCounter++,
            x: parseFloat(parts[1]),
            y: parseFloat(parts[2]),
            z: parseFloat(parts[3]),
            w: 1, // Homogeneous coordinate
            edge: null,
          });
        }
        break;
      case 'f':
        if (parts.length >= 4) {
            const faceVertexIndices = parts.slice(1).map(p => parseInt(p.split('/')[0], 10) - 1);
            const face: FaceWE = { id: faceIdCounter++, edge: null, vertexIndices: faceVertexIndices };
            faces.push(face);
            
            for (let i = 0; i < faceVertexIndices.length; i++) {
                const idx1 = faceVertexIndices[i];
                const idx2 = faceVertexIndices[(i + 1) % faceVertexIndices.length];

                const v1 = vertices[idx1];
                const v2 = vertices[idx2];
                
                // Ensure consistent edge key
                const edgeKey = idx1 < idx2 ? `${idx1}-${idx2}` : `${idx2}-${idx1}`;
                let edge = edgeMap.get(edgeKey);

                if (!edge) {
                    edge = {
                        id: edges.length,
                        v1, v2,
                        face1: face, face2: null,
                        p1_next: null, p1_prev: null,
                        p2_next: null, p2_prev: null
                    };
                    edges.push(edge);
                    edgeMap.set(edgeKey, edge);
                    if (!v1.edge) v1.edge = edge;
                    if (!v2.edge) v2.edge = edge;
                } else {
                    if (!edge.face2) {
                        edge.face2 = face;
                    }
                }

                if (!face.edge) face.edge = edge;
            }
        }
        break;
      default:
        break;
    }
  });

  // Normalize mesh to fit in the viewport
  if (vertices.length > 0) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (const v of vertices) {
      minX = Math.min(minX, v.x);
      minY = Math.min(minY, v.y);
      minZ = Math.min(minZ, v.z);
      maxX = Math.max(maxX, v.x);
      maxY = Math.max(maxY, v.y);
      maxZ = Math.max(maxZ, v.z);
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const centerZ = (minZ + maxZ) / 2;

    const maxExtent = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    const TARGET_SIZE = 300; // Fit within a 300x300x300 cube for good initial visibility
    const scale = (maxExtent === 0) ? 1 : TARGET_SIZE / maxExtent;
    
    for (const v of vertices) {
        v.x = (v.x - centerX) * scale;
        v.y = (v.y - centerY) * scale;
        v.z = (v.z - centerZ) * scale;
    }
  }

  // A full winged-edge implementation would link edge loops here.
  // For this application, the current structure is sufficient for rendering.

  return { name: fileName, vertices, edges, faces };
};
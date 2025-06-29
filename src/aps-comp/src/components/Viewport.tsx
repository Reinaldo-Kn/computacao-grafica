import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import type { DisplayObject, Vector3D } from "../types.ts";
import { transformPoint } from "../utils/matrix";

interface ViewportProps {
  displayFile: DisplayObject[];
  onTransform: (deltas: {
    dTx?: number;
    dTy?: number;
    dRx?: number;
    dRy?: number;
    dS?: number;
  }) => void;
  hasSelection: boolean;
  isWireframeView: boolean;
  editingState: { objectIndex: number; vertexIndex: number | null } | null;
  onSelectVertex: (vertexIndex: number | null) => void;
  onVertexMove: (dx: number, dy: number) => void;
}

const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || !hex.startsWith("#") || (hex.length !== 4 && hex.length !== 7)) {
    return `rgba(200, 200, 200, ${alpha})`; // Default color for invalid hex
  }
  let r, g, b;
  if (hex.length === 4) {
    // Handle shorthand hex #RGB
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    // Handle #RRGGBB
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Viewport: React.FC<ViewportProps> = ({
  displayFile,
  onTransform,
  hasSelection,
  isWireframeView,
  editingState,
  onSelectVertex,
  onVertexMove,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [cursor, setCursor] = useState("cursor-default");

  const isRotating = useRef(false);
  const isPanning = useRef(false);
  const isDraggingVertex = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (container)
      setSize({ width: container.clientWidth, height: container.clientHeight });
    const handleResize = () => {
      if (container)
        setSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const projectAndMap = (point: Vector3D, width: number, height: number) => {
    const projectedX = point.x + width / 2;
    const projectedY = -point.y + height / 2;
    return { x: projectedX, y: projectedY, z: point.z };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      lastMousePosition.current = { x: e.clientX, y: e.clientY };

      if (editingState) {
        const editingObject = displayFile[editingState.objectIndex];
        if (!editingObject) return;

        const transformedVertices = editingObject.mesh.vertices.map((v) =>
          transformPoint(v, editingObject.transformMatrix)
        );
        const screenVertices = transformedVertices.map((v) =>
          projectAndMap(v, size.width, size.height)
        );

        const clickPos = { x: e.offsetX, y: e.offsetY };
        const HIT_RADIUS = 8;
        let vertexClicked = false;
        // Iterate backwards to select vertices on top first
        for (let i = screenVertices.length - 1; i >= 0; i--) {
          const v = screenVertices[i];
          const dist = Math.sqrt(
            Math.pow(clickPos.x - v.x, 2) + Math.pow(clickPos.y - v.y, 2)
          );
          if (dist < HIT_RADIUS) {
            onSelectVertex(i);
            isDraggingVertex.current = true;
            setCursor("cursor-move");
            vertexClicked = true;
            break;
          }
        }
        if (!vertexClicked) {
          onSelectVertex(null);
        }
      } else if (hasSelection) {
        if (e.button === 0) {
          // Left click for rotation
          isRotating.current = true;
          setCursor("cursor-grabbing");
        } else if (e.button === 2) {
          // Right click for panning
          isPanning.current = true;
          setCursor("cursor-grabbing");
        }
      }
    };

    const handleMouseUp = () => {
      isRotating.current = false;
      isPanning.current = false;
      isDraggingVertex.current = false;

      if (editingState) {
        setCursor("cursor-crosshair");
      } else if (hasSelection) {
        setCursor("cursor-grab");
      } else {
        setCursor("cursor-default");
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (
        !isRotating.current &&
        !isPanning.current &&
        !isDraggingVertex.current
      )
        return;
      e.preventDefault();

      const dx = e.clientX - lastMousePosition.current.x;
      const dy = e.clientY - lastMousePosition.current.y;

      if (isDraggingVertex.current) {
        onVertexMove(dx, -dy); // Invert dy for screen coords
      } else if (isRotating.current) {
        const rotationSpeed = 0.5;
        onTransform({ dRy: dx * rotationSpeed, dRx: dy * rotationSpeed });
      } else if (isPanning.current) {
        onTransform({ dTx: dx, dTy: -dy });
      }

      lastMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleWheel = (e: WheelEvent) => {
      if (hasSelection && !editingState) {
        e.preventDefault();
        const zoomSpeed = 0.001;
        const dS = -e.deltaY * zoomSpeed;
        onTransform({ dS });
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    container.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("wheel", handleWheel);
    container.addEventListener("contextmenu", handleContextMenu);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [
    hasSelection,
    onTransform,
    editingState,
    onSelectVertex,
    onVertexMove,
    size.width,
    size.height,
    displayFile,
  ]);

  useEffect(() => {
    if (editingState) {
      setCursor("cursor-crosshair");
    } else if (hasSelection) {
      setCursor("cursor-grab");
    } else {
      setCursor("cursor-default");
    }
  }, [editingState, hasSelection]);

  const renderWireframe = (obj: DisplayObject) => {
    return obj.mesh.edges.map((edge, index) => {
      const p1Transformed = transformPoint(edge.v1, obj.transformMatrix);
      const p2Transformed = transformPoint(edge.v2, obj.transformMatrix);
      const p1Screen = projectAndMap(p1Transformed, size.width, size.height);
      const p2Screen = projectAndMap(p2Transformed, size.width, size.height);
      return (
        <line
          key={`${obj.id}-edge-${index}`}
          x1={p1Screen.x}
          y1={p1Screen.y}
          x2={p2Screen.x}
          y2={p2Screen.y}
          stroke={hexToRgba(obj.color, 0.8)}
          strokeWidth="1"
        />
      );
    });
  };

  const renderFilled = (obj: DisplayObject) => {
    const facesToRender = obj.mesh.faces
      .map((face, faceIndex) => {
        if (face.vertexIndices.length < 3) return null;
        const faceVertices = face.vertexIndices.map(
          (vi) => obj.mesh.vertices[vi]
        );
        if (faceVertices.some((v) => v === undefined)) return null;
        const transformedVertices = faceVertices.map((v) =>
          transformPoint(v, obj.transformMatrix)
        );
        const avgZ =
          transformedVertices.reduce((acc, v) => acc + v.z, 0) /
          transformedVertices.length;
        const points = transformedVertices
          .map((p) => projectAndMap(p, size.width, size.height))
          .map((p) => `${p.x},${p.y}`)
          .join(" ");
        return { key: `${obj.id}-face-${faceIndex}`, points, avgZ };
      })
      .filter(
        (f): f is { key: string; points: string; avgZ: number } => f !== null
      );

    facesToRender.sort((a, b) => a.avgZ - b.avgZ);

    return facesToRender.map((faceData) => (
      <polygon
        key={faceData.key}
        points={faceData.points}
        fill={hexToRgba(obj.color, 0.3)}
        stroke={hexToRgba(obj.color, 0.6)}
        strokeWidth="0.5"
      />
    ));
  };

  const renderVerticesForEditing = (obj: DisplayObject, objIndex: number) => {
    if (!editingState || editingState.objectIndex !== objIndex) return null;

    const transformedVertices = obj.mesh.vertices.map((v) =>
      transformPoint(v, obj.transformMatrix)
    );
    const screenVertices = transformedVertices.map((v) =>
      projectAndMap(v, size.width, size.height)
    );

    return screenVertices.map((v, index) => {
      const isSelected = editingState.vertexIndex === index;
      return (
        <circle
          key={`${obj.id}-vertex-${index}`}
          cx={v.x}
          cy={v.y}
          r={isSelected ? 6 : 4}
          fill={isSelected ? "#f43f5e" : "#38bdf8"}
          stroke="#ffffff"
          strokeWidth="1.5"
          className="cursor-pointer"
        />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className={`w-full h-full bg-gray-900 border border-gray-700 rounded-lg overflow-hidden ${cursor}`}
    >
      <svg width={size.width} height={size.height}>
        <defs>
          <pattern
            id="smallGrid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="rgba(107, 114, 128, 0.2)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(107, 114, 128, 0.3)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {displayFile.map((obj, index) => (
          <g key={obj.id} className="object-group">
            {isWireframeView ? renderWireframe(obj) : renderFilled(obj)}
            {renderVerticesForEditing(obj, index)}
          </g>
        ))}
      </svg>
    </div>
  );
};

export default Viewport;

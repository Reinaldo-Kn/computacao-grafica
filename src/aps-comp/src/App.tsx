import React, { useState, useCallback, useEffect } from "react";
import type { DisplayObject, Transformations, WingedEdgeMesh } from "./types";
import { parseOBJ } from "./services/objLoader";
import {
  createIdentityMatrix,
  createTranslationMatrix,
  createScalingMatrix,
  createRotationXMatrix,
  createRotationYMatrix,
  createRotationZMatrix,
  multiplyMatrices,
} from "./utils/matrix";
import Viewport from "./components/Viewport";
import ObjectControls from "./components/ObjectControls";
import { UploadIcon, TrashIcon, PencilIcon } from "./components/icons";

type EditingState = {
  objectIndex: number;
  vertexIndex: number | null;
} | null;

const App: React.FC = () => {
  const [displayFile, setDisplayFile] = useState<DisplayObject[]>([]);
  const [selectedObjectIndex, setSelectedObjectIndex] = useState<number | null>(
    null
  );
  const [isWireframeView, setIsWireframeView] = useState(true);
  const [editingState, setEditingState] = useState<EditingState>(null);

  const [transformations, setTransformations] = useState<Transformations>({
    tx: 0,
    ty: 0,
    tz: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    sx: 1,
    sy: 1,
    sz: 1,
  });

  const defaultTransforms: Transformations = {
    tx: 0,
    ty: 0,
    tz: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    sx: 1,
    sy: 1,
    sz: 1,
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          const mesh: WingedEdgeMesh = parseOBJ(content, file.name);
          const newObject: DisplayObject = {
            id: `${file.name}-${Date.now()}`,
            mesh,
            transformMatrix: createIdentityMatrix(),
            transformations: defaultTransforms,
            color: "#34d399",
          };

          setDisplayFile((prevDisplayFile) => {
            const newIndex = prevDisplayFile.length;
            setSelectedObjectIndex(newIndex);
            setTransformations(newObject.transformations);
            if (editingState) setEditingState(null);
            return [...prevDisplayFile, newObject];
          });
        } catch (error) {
          console.error("Failed to parse OBJ file:", error);
          alert("Error parsing .obj file. Check console for details.");
        }
      };
      reader.readAsText(file);
      event.target.value = "";
    }
  };

  const handleSelectObject = (index: number) => {
    if (editingState && editingState.objectIndex !== index) {
      setEditingState(null);
    }
    const selectedObject = displayFile[index];
    if (selectedObject) {
      setSelectedObjectIndex(index);
      setTransformations(selectedObject.transformations);
    }
  };

  const handleDeleteObject = (index: number) => {
    setDisplayFile((prev) => prev.filter((_, i) => i !== index));
    if (selectedObjectIndex === index) {
      setSelectedObjectIndex(null);
      setTransformations(defaultTransforms);
    } else if (selectedObjectIndex !== null && selectedObjectIndex > index) {
      setSelectedObjectIndex((prev) => prev! - 1);
    }
    if (editingState?.objectIndex === index) {
      setEditingState(null);
    } else if (editingState !== null && editingState.objectIndex > index) {
      setEditingState((prev) => ({
        ...prev!,
        objectIndex: prev!.objectIndex - 1,
      }));
    }
  };

  const resetObjectTransform = useCallback((index: number) => {
    setTransformations(defaultTransforms);
    setDisplayFile((prev) => {
      const newDisplayFile = [...prev];
      const obj = newDisplayFile[index];
      if (obj) {
        newDisplayFile[index] = {
          ...obj,
          transformations: defaultTransforms,
          transformMatrix: createIdentityMatrix(),
        };
      }
      return newDisplayFile;
    });
  }, []);

  const handleResetFromControls = useCallback(() => {
    if (selectedObjectIndex !== null) resetObjectTransform(selectedObjectIndex);
  }, [selectedObjectIndex, resetObjectTransform]);

  const handleViewportTransform = useCallback(
    (deltas: {
      dTx?: number;
      dTy?: number;
      dRx?: number;
      dRy?: number;
      dS?: number;
    }) => {
      if (selectedObjectIndex === null || editingState) return;
      setTransformations((prev) => {
        const newSx = prev.sx + (deltas.dS || 0);
        const newSy = prev.sy + (deltas.dS || 0);
        const newSz = prev.sz + (deltas.dS || 0);
        const minScale = 0.1,
          maxScale = 5;
        return {
          ...prev,
          tx: prev.tx + (deltas.dTx || 0),
          ty: prev.ty + (deltas.dTy || 0),
          rx: (prev.rx + (deltas.dRx || 0) + 360) % 360,
          ry: (prev.ry + (deltas.dRy || 0) + 360) % 360,
          sx: Math.max(minScale, Math.min(newSx, maxScale)),
          sy: Math.max(minScale, Math.min(newSy, maxScale)),
          sz: Math.max(minScale, Math.min(newSz, maxScale)),
        };
      });
    },
    [selectedObjectIndex, editingState]
  );

  const handleColorChange = (index: number, color: string) => {
    setDisplayFile((prev) => {
      const newDisplayFile = [...prev];
      if (newDisplayFile[index])
        newDisplayFile[index] = { ...newDisplayFile[index], color };
      return newDisplayFile;
    });
  };

  const toggleEditMode = (index: number) => {
    setEditingState((prev) => {
      if (prev?.objectIndex === index) return null;
      handleSelectObject(index);
      return { objectIndex: index, vertexIndex: null };
    });
  };

  const handleSelectVertex = (vertexIndex: number | null) => {
    if (editingState) {
      setEditingState({ ...editingState, vertexIndex });
    }
  };

  const handleVertexMove = useCallback(
    (dx: number, dy: number) => {
      if (!editingState || editingState.vertexIndex === null) return;
      const { objectIndex, vertexIndex } = editingState;

      setDisplayFile((prevDf) => {
        const newDf = [...prevDf];
        const obj = newDf[objectIndex];
        if (!obj || !obj.mesh.vertices[vertexIndex]) return prevDf;

        // Create new shells to trigger React re-render, but mutate the original vertex.
        const newObjectShell = {
          ...obj,
          mesh: { ...obj.mesh, vertices: [...obj.mesh.vertices] },
        };
        newDf[objectIndex] = newObjectShell;

        const vertexToMove = newObjectShell.mesh.vertices[vertexIndex];

        const invSx = 1 / newObjectShell.transformations.sx;
        const invSy = 1 / newObjectShell.transformations.sy;

        // This is THE FIX: Mutate the vertex's properties directly.
        // The edges have a reference to this object, so they will see the update.
        vertexToMove.x += dx * invSx;
        vertexToMove.y += dy * invSy;

        return newDf;
      });
    },
    [editingState]
  );

  useEffect(() => {
    if (selectedObjectIndex === null || editingState) return;

    const t = createTranslationMatrix(
      transformations.tx,
      transformations.ty,
      transformations.tz
    );
    const s = createScalingMatrix(
      transformations.sx,
      transformations.sy,
      transformations.sz
    );
    const rx = createRotationXMatrix(transformations.rx);
    const ry = createRotationYMatrix(transformations.ry);
    const rz = createRotationZMatrix(transformations.rz);

    let finalMatrix = multiplyMatrices(ry, rx);
    finalMatrix = multiplyMatrices(rz, finalMatrix); // Z-Y-X order can feel more intuitive
    finalMatrix = multiplyMatrices(finalMatrix, s);
    finalMatrix = multiplyMatrices(t, finalMatrix);

    setDisplayFile((prev) => {
      const newDisplayFile = [...prev];
      const obj = newDisplayFile[selectedObjectIndex];
      if (obj && !editingState) {
        newDisplayFile[selectedObjectIndex] = {
          ...obj,
          transformMatrix: finalMatrix,
          transformations: transformations,
        };
      }
      return newDisplayFile;
    });
  }, [transformations, selectedObjectIndex, editingState]);

  return (
    <div className="flex h-screen font-sans">
      <aside className="w-96 bg-gray-800/50 p-6 flex flex-col space-y-6 overflow-y-auto shrink-0">
        <header>
          <h1 className="text-2xl font-bold text-white">
            Visualizador 3D - APS
          </h1>
          <p className="text-sm text-gray-400">
            Para matéria de Computação Gráfica - UTFPR
          </p>
        </header>

        <div>
          <label
            htmlFor="file-upload"
            className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700 transition-colors"
          >
            <UploadIcon className="w-5 h-5 mr-2" /> Carregar arquivo .obj
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".obj"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-200">
            Opção de Visualização
          </h2>
          <div className="bg-gray-800 p-3 rounded-md flex items-center justify-between">
            <label
              htmlFor="wireframe-toggle"
              className="font-medium text-gray-200 cursor-pointer"
            >
              Wireframe
            </label>
            <button
              role="switch"
              aria-checked={isWireframeView}
              id="wireframe-toggle"
              onClick={() => setIsWireframeView(!isWireframeView)}
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
                isWireframeView ? "bg-indigo-600" : "bg-gray-600"
              }`}
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                  isWireframeView ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex-grow space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-200">
              Arquivos Carregados
            </h2>
            {editingState && (
              <span className="text-xs font-bold text-red-400 bg-red-500/20 px-2 py-1 rounded">
                EDITANDO
              </span>
            )}
          </div>
          <div className="bg-gray-800 p-2 rounded-md space-y-2">
            {displayFile.length === 0 && (
              <p className="text-center text-gray-500 p-4">
                Nenhum objeto carregado.
              </p>
            )}
            {displayFile.map((obj, index) => (
              <div
                key={obj.id}
                onDoubleClick={() => resetObjectTransform(index)}
                className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  selectedObjectIndex === index
                    ? "bg-indigo-500/30 ring-2 ring-indigo-500"
                    : "bg-gray-700/50 hover:bg-gray-700"
                }`}
              >
                <div
                  className="flex items-center space-x-3 overflow-hidden flex-1"
                  onClick={() => handleSelectObject(index)}
                >
                  <div className="relative w-6 h-6 rounded-md shrink-0">
                    <div
                      className="w-full h-full rounded-md border-2 border-gray-600"
                      style={{ backgroundColor: obj.color }}
                    />
                    <input
                      type="color"
                      value={obj.color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                      title="Change object color"
                    />
                  </div>
                  <span
                    className="font-medium text-gray-200 truncate"
                    title={obj.mesh.name}
                  >
                    {obj.mesh.name}
                  </span>
                </div>
                <div className="flex items-center shrink-0 ml-2 space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleEditMode(index);
                    }}
                    title="Editar Vertices"
                    className={`p-1 rounded-full transition-colors ${
                      editingState?.objectIndex === index
                        ? "bg-red-500/20 text-red-400"
                        : "hover:bg-sky-500/20 text-gray-500 hover:text-sky-400"
                    }`}
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteObject(index);
                    }}
                    title="Excluir Objeto"
                    className="p-1 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedObjectIndex !== null && !editingState && (
          <ObjectControls
            transformations={transformations}
            onTransformChange={setTransformations}
            onReset={handleResetFromControls}
          />
        )}
      </aside>

      <main className="flex-1 p-4 bg-gray-900">
        <Viewport
          displayFile={displayFile}
          onTransform={handleViewportTransform}
          hasSelection={selectedObjectIndex !== null}
          isWireframeView={isWireframeView}
          editingState={editingState}
          onSelectVertex={handleSelectVertex}
          onVertexMove={handleVertexMove}
          viewRotationX={selectedObjectIndex !== null ? transformations.rx : 0}
          viewRotationY={selectedObjectIndex !== null ? transformations.ry : 0}
        />
      </main>
    </div>
  );
};

export default App;

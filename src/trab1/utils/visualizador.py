import matplotlib
matplotlib.use('TkAgg')
import matplotlib.pyplot as plt

from mpl_toolkits.mplot3d.art3d import Poly3DCollection
import numpy as np

def visualizar_mesh(mesh, destaque=None, show_labels=True):
    if destaque is None:
        destaque = {}
    fig = plt.figure()
    ax = fig.add_subplot(111, projection='3d')

    # Cores
    cor_face = 'skyblue'
    cor_face_destaque = 'orange'
    cor_arestas = 'black'
    cor_arestas_destaque = 'red'
    cor_vertices = 'blue'
    cor_vertices_destaque = 'red'

    # Plotar faces
    for face_id, face in mesh.faces.items():
        coords = [mesh.vertices[i].position for i in face.vertice_indices]
        poly = Poly3DCollection([coords], alpha=0.3)
        poly.set_edgecolor(cor_arestas)
        if destaque and face_id in destaque.get('faces', []):
            poly.set_facecolor(cor_face_destaque)
        else:
            poly.set_facecolor(cor_face)
        ax.add_collection3d(poly)

        centro = np.mean(coords, axis=0)
        if show_labels:
            ax.text(*centro, f'F{face_id}', color='black', fontsize=10)

    # Plotar arestas
    plotadas = set()
    for edge_key, edge in mesh.arestas.items():
        v_start = mesh.vertices[edge.start].position
        v_end = mesh.vertices[edge.end].position

        if (edge.end, edge.start) in plotadas or (edge.start, edge.end) in plotadas:
            continue
        plotadas.add((edge.start, edge.end))

        cor = cor_arestas_destaque if destaque and (edge.start, edge.end) in destaque.get('arestas', []) or (edge.end, edge.start) in destaque.get('arestas', []) else cor_arestas
        ax.plot(*zip(v_start, v_end), color=cor)

    # Plotar vértices
    for v_id, vert in mesh.vertices.items():
        pos = vert.position
        cor = cor_vertices_destaque if destaque and v_id in destaque.get('vertices', []) else cor_vertices
        ax.scatter(*pos, color=cor)
        if show_labels:
            ax.text(*pos, f'V{v_id}', fontsize=8, color='black')

    ax.set_xlabel('X')
    ax.set_ylabel('Y')
    ax.set_zlabel('Z')
    ax.set_title("Visualização da Malha 3D")
    plt.tight_layout()
    plt.show()

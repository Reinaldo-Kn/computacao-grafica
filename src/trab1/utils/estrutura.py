class Vertice:
    def __init__(self, index, position):
        self.index = index
        self.position = position # suas coordenadas (x,y,z)
        self.arestas = []  # um ponteiro para uma aresta qualquer que incide em v

class Face:
    def __init__(self, index, vertice_indices):
        self.index = index
        self.vertice_indices = vertice_indices # vértices que formam a face
        self.arestas = []  #  um ponteiro para uma aresta qualquer da fronteira de f

class Aresta:
    def __init__(self, start, end):
        # Dois ponteiros para os vértices da aresta
        self.start = start
        self.end = end
        
        # Dois pontos para as faces, que compartilham a aresta 
        self.left_face = None
        self.right_face = None

        # Quatro ponteiros para as outras arestas conectadas
        self.left_prev = None
        self.left_next = None
        self.right_prev = None
        self.right_next = None

class WingedEdgeMesh:
    def __init__(self):
        self.vertices = {}  
        self.arestas = {}   # (min, max) -> Aresta (com direção)
        self.faces = {}    
        
     # Cria ou retorna uma aresta entre dois vértices
    def add_aresta(self, start, end):
        key = (min(start, end), max(start, end))
        if key not in self.arestas:
            self.arestas[key] = Aresta(start, end)
        return self.arestas[key]

    def load_obj(self, filename):
        with open(filename) as f:
            lines = f.readlines()

        face_index = 1

        for line in lines:
            parts = line.strip().split()
            if not parts:
                continue

            if parts[0] == 'v':
                x, y, z = map(float, parts[1:4])
                idx = len(self.vertices) + 1
                self.vertices[idx] = Vertice(idx, (x, y, z))

            elif parts[0] == 'f':
                indices = [int(p.split('/')[0]) for p in parts[1:]]
                face = Face(face_index, indices)
                self.faces[face_index] = face

                n = len(indices)
                arestas_da_face = []

                # criação das arestas e associação a face (left ou right)
                for i in range(n):
                    v1 = indices[i]
                    v2 = indices[(i + 1) % n]  # conecta último com o primeiro
                    a = self.add_aresta(v1, v2)
                    face.arestas.append(a)
                    arestas_da_face.append((v1, v2, a))

                    if (a.start == v1 and a.end == v2): # se a direção da aresta é (v1 -> v2)
                        if a.left_face is None:
                            a.left_face = face # associa a face atual ao lado esquerdo da aresta
                        else:
                            a.right_face = face
                    else:                      
                        if a.right_face is None:
                            a.right_face = face
                        else:
                            a.left_face = face

                
                for i in range(n):
                    _, _, atual = arestas_da_face[i] # usando apenas 'a'
                    _, _, prox = arestas_da_face[(i + 1) % n]
                    _, _, ant = arestas_da_face[(i - 1) % n]

                    if atual.left_face == face: 
                        atual.left_next = prox
                        atual.left_prev = ant
                    elif atual.right_face == face:
                        atual.right_next = prox
                        atual.right_prev = ant

                face_index += 1


    def verificar_vertice(self, vertice_id):
        if vertice_id not in self.vertices:
            raise ValueError(f"Vértice {vertice_id} não encontrado.")

    def verificar_face(self, face_id):
        if face_id not in self.faces:
            raise ValueError(f"Face {face_id} não encontrada.")

    def verificar_aresta(self, v1, v2):
        key = (min(v1, v2), max(v1, v2))
        if key not in self.arestas:
            raise ValueError(f"Aresta entre vértices {v1} e {v2} não encontrada.")

    def faces_by_vertice(self, vertice_id):
        self.verificar_vertice(vertice_id)
        faces = set()
        for aresta in self.arestas.values():
            if aresta.start == vertice_id or aresta.end == vertice_id:
                if aresta.left_face:
                    faces.add(aresta.left_face.index)
                if aresta.right_face:
                    faces.add(aresta.right_face.index)
        return faces

    def arestas_by_vertice(self, vertice_id):
        self.verificar_vertice(vertice_id)
        arestas = set()
        for aresta in self.arestas.values():
            if aresta.start == vertice_id or aresta.end == vertice_id:
                arestas.add((aresta.start, aresta.end))
        return arestas

    def faces_by_aresta(self, v1, v2):
        self.verificar_aresta(v1, v2)
        key = (min(v1, v2), max(v1, v2))
        aresta = self.arestas[key]
        faces = set()
        if aresta.left_face:
            faces.add(aresta.left_face.index)
        if aresta.right_face:
            faces.add(aresta.right_face.index)
        return faces

    def arestas_by_face(self, face_id):
        self.verificar_face(face_id)
        face = self.faces[face_id]
        return set((a.start, a.end) for a in face.arestas)

    def adjacent_faces(self, face_id):
        self.verificar_face(face_id)
        face = self.faces[face_id]
        vizinhas = set()

        for aresta in face.arestas:
            if aresta.left_face and aresta.left_face.index != face_id:
                vizinhas.add(aresta.left_face.index)
            if aresta.right_face and aresta.right_face.index != face_id:
                vizinhas.add(aresta.right_face.index)
        return vizinhas

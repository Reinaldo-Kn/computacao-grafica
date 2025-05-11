# Winged Edge Mesh


## Principais Classes

### `Vertice`
Representa um ponto 3D com um identificador único (`index`) e coordenadas (`position`). Além disso, armazena uma lista de arestas incidentes ao vértice.
```python
class Vertice:
    def __init__(self, index, position):
        self.index = index
        self.position = position  
        self.arestas = []
```

### `Aresta`
Conecta dois vértices (`start` e `end`) e pode ser compartilhada por até **duas faces**: `left_face` e `right_face`. Também mantém referências (`next`, `prev`) às arestas vizinhas da face esquerda e direita.
```python
class Aresta:
    def __init__(self, start, end):
        self.start = start
        self.end = end
        self.left_face = None
        self.right_face = None
        self.left_prev = None
        self.left_next = None
        self.right_prev = None
        self.right_next = None
```

### `Face`
Representa uma **face poligonal** da malha. Armazena os índices dos vértices que a compõem e uma lista de arestas que a delimitam.
```python
class Face:
    def __init__(self, index, vertice_indices):
        self.index = index
        self.vertice_indices = vertice_indices
        self.arestas = []
```

## `WingedEdgeMesh`: Classe principal

Esta classe armazena toda a malha e oferece métodos para **carregar dados**, **navegar pela topologia**, e realizar **consultas topológicas** (por exemplo, quais são as faces adjacentes a uma dada face).

### Componentes principais:
- `self.vertices`: dicionário de vértices (`index -> Vertice`)
- `self.arestas`: dicionário de arestas, indexadas como tupla `(min(v1,v2), max(v1,v2))` para evitar duplicatas.
- `self.faces`: dicionário de faces (`index -> Face`)

## Carregamento de Arquivos `.obj`

```python
def load_obj(self, filename)
```

Este método lê um arquivo `.obj` contendo vértices (`v x y z`) e faces (`f i1 i2 i3 ...`) e monta a estrutura de dados `WingedEdgeMesh`.


## Métodos de Consulta

### `faces_by_vertice(vertice_id)`
Retorna o conjunto de índices das faces incidentes ao vértice `vertice_id`.

### `arestas_by_vertice(vertice_id)`
Retorna todas as arestas conectadas ao vértice.

### `faces_by_aresta(v1, v2)`
Retorna as faces à esquerda e à direita da aresta definida pelos vértices `v1` e `v2`.

### `arestas_by_face(face_id)`
Retorna todas as arestas da face com ID `face_id`.

### `adjacent_faces(face_id)`
Retorna todas as faces que compartilham **ao menos uma aresta** com a face de ID `face_id`. A verificação é feita ao comparar as arestas de `face` e checar se suas `left_face` ou `right_face` pertencem a outra face.

## Exemplo de Uso
```cmd
 python3 main.py cube.obj
```


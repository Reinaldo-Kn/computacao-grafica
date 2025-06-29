# 🌐 Visualizador 3D com Three.js

Este projeto é uma aplicação web interativa desenvolvida com **React**, **TypeScript** e **Three.js**, utilizando o **Vite** como empacotador para desenvolvimento frontend rápido.
Utilizou-se o conceito de matrizes 4x4 para manipulação de objetos, com coordenadas homogêneas, permitindo translações, rotações e escalas de forma eficiente.

## Como Rodar o Projeto

Siga os passos abaixo para rodar o projeto localmente:

### 1. Clone o repositório

```bash
git clone https://github.com/Reinaldo-Kn/computacao-grafica
cd src/aps-comp
```

### 2. Instale as dependências

Certifique-se de ter o **Node.js** instalado

```bash
npm install
```

### 3. Rode o servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em algo como `http://localhost:5173`.

---

## Instalação de Dependências Principais

```bash
npm install three
npm install react react-dom
npm install --save-dev typescript @types/react @types/react-dom
```

---

## Tecnologias Utilizadas

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Three.js](https://threejs.org/)

---

## Sobre as Funções

No arquivo `src/utils/matrix.ts`, estão definidas várias funções para manipulação de matrizes 4x4. As principais funções incluem:

- `createIdentityMatrix`: Cria uma matriz identidade 4x4.
- `createTranslationMatrix`: Cria uma matriz de translação 4x4.
- `createScalingMatrix`: Cria uma matriz de escala 4x4.
- `createRotationXMatrix`: Cria uma matriz de rotação em torno do eixo X.
- `createRotationYMatrix`: Cria uma matriz de rotação em torno do eixo Y.
- `createRotationZMatrix`: Cria uma matriz de rotação em torno do eixo Z.
- `multiplyMatrices`: Multiplica duas matrizes 4x4.
- `transformPoint`: Aplica uma transformação a um ponto 3D usando uma matriz 4x4.

Para abrir o .obj, você pode usar a função `loadOBJ` do arquivo `src/utils/objLoader.ts`, que utiliza o `OBJLoader` do Three.js para carregar modelos 3D no formato OBJ.

## Estrutura Winged-Edge

Também foi implementada a estrutura de dados **Winged-Edge**.

### Componentes principais:

- **`VertexWE`**: Representa um vértice, com coordenadas homogêneas `(x, y, z, w)`, um `id` único e uma referência para uma aresta incidente.

- **`EdgeWE`**: Representa uma aresta entre dois vértices (`v1`, `v2`), e guarda referências para até **duas faces adjacentes** (`face1`, `face2`) e para arestas vizinhas em cada uma dessas faces (`p1_next`, `p1_prev`, `p2_next`, `p2_prev`).

- **`FaceWE`**: Representa uma face (ex: um triângulo ou polígono), com `id`, uma aresta associada, e os índices dos vértices que compõem a face.

- **`WingedEdgeMesh`**: É o container da malha inteira. Contém arrays de vértices, arestas e faces.

---

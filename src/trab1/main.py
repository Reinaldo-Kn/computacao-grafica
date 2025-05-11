import sys
from utils.estrutura import WingedEdgeMesh
from utils.visualizador import visualizar_mesh

def main():
    if len(sys.argv) < 2:
        print("Uso: python main.py <arquivo.obj>")
        return

    mesh = WingedEdgeMesh()
    try:
        mesh.load_obj(sys.argv[1])
        print("Arquivo carregado com sucesso.")
    except Exception as e:
        print(f"Erro ao carregar o arquivo: {e}")
        return

    while True:
        print("\nEscolha uma opção:")
        print("1: Faces que compartilham um vértice")
        print("2: Arestas que compartilham um vértice")
        print("3: Faces que compartilham uma aresta")
        print("4: Arestas que compartilham uma face")
        print("5: Faces adjacentes a uma face")
        print("6: Visualizar malha")
        print("0: Sair")

        opcao = input("Opção: ")
        if opcao == '0':
            break

        elif opcao == '1':
            try:
                v = int(input("ID do vértice: "))
                faces = mesh.faces_by_vertice(v)
                print(faces)
                visualizar_mesh(mesh, destaque={'faces': faces, 'vertices': [v]})
            except ValueError as e:
                print(f"Erro: {e}")

        elif opcao == '2':
            try:
                v = int(input("ID do vértice: "))
                arestas = mesh.arestas_by_vertice(v)
                print(arestas)
                visualizar_mesh(mesh, destaque={'arestas': arestas, 'vertices': [v]})
            except ValueError as e:
                print(f"Erro: {e}")

        elif opcao == '3':
            try:
                v1 = int(input("Vértice 1: "))
                v2 = int(input("Vértice 2: "))
                faces = mesh.faces_by_aresta(v1, v2)
                print(faces)
                visualizar_mesh(mesh, destaque={'faces': faces, 'arestas': [(v1, v2), (v2, v1)], 'vertices': [v1, v2]})
            except ValueError as e:
                print(f"Erro: {e}")

        elif opcao == '4':
            try:
                f = int(input("ID da face: "))
                arestas = mesh.arestas_by_face(f)
                print(arestas)
                visualizar_mesh(mesh, destaque={'arestas': arestas, 'faces': [f]})
            except ValueError as e:
                print(f"Erro: {e}")

        elif opcao == '5':
            try:
                f = int(input("ID da face: "))
                faces = mesh.adjacent_faces(f)
                print(faces)
                visualizar_mesh(mesh, destaque={'faces': list(faces) + [f]})
            except ValueError as e:
                print(f"Erro: {e}")


        elif opcao == '6':
            try:
                visualizar_mesh(mesh)
            except Exception as e:
                print(f"Erro ao visualizar: {e}")
        else:
            print("Opção inválida.")

if __name__ == "__main__":
    main()

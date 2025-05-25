import numpy as np
import math

def criar_matriz_transformacao(transformacoes):
    """
    Constrói uma matriz de transformação 4x4 a partir de uma sequência de transformações.
    
                       
    Tipos de transformação suportados:
        - ('translacao', tx, ty, tz): Translação
        - ('escala', s): Escala uniforme
        - ('rotacao_x', angulo): Rotação em torno do eixo X (em graus)
        - ('rotacao_y', angulo): Rotação em torno do eixo Y (em graus)
        - ('rotacao_z', angulo): Rotação em torno do eixo Z (em graus)
        - ('cisalhamento', plano, fator): Cisalhamento em um plano específico
    

    """
    # Matriz identidade 4x4 como ponto de partida
    matriz_resultado = np.eye(4)
    
    for transformacao in transformacoes:
        tipo = transformacao[0]
        
        if tipo == 'translacao':
            if len(transformacao) != 4:
                raise ValueError("Translação requer 3 parâmetros: tx, ty, tz")
            tx, ty, tz = transformacao[1], transformacao[2], transformacao[3]
            matriz_translacao = criar_matriz_translacao(tx, ty, tz)
            matriz_resultado = np.dot(matriz_translacao, matriz_resultado)
            
        elif tipo == 'escala':
            if len(transformacao) != 2:
                raise ValueError("Escala requer 1 parâmetro: fator de escala uniforme")
            s = transformacao[1]
            matriz_escala = criar_matriz_escala(s, s, s)
            matriz_resultado = np.dot(matriz_escala, matriz_resultado)
            
        elif tipo == 'rotacao_x':
            if len(transformacao) != 2:
                raise ValueError("Rotação X requer 1 parâmetro: angulo (em graus)")
            angulo = transformacao[1]
            matriz_rotacao = criar_matriz_rotacao_x(angulo)
            matriz_resultado = np.dot(matriz_rotacao, matriz_resultado)
            
        elif tipo == 'rotacao_y':
            if len(transformacao) != 2:
                raise ValueError("Rotação Y requer 1 parâmetro: angulo (em graus)")
            angulo = transformacao[1]
            matriz_rotacao = criar_matriz_rotacao_y(angulo)
            matriz_resultado = np.dot(matriz_rotacao, matriz_resultado)
            
        elif tipo == 'rotacao_z':
            if len(transformacao) != 2:
                raise ValueError("Rotação Z requer 1 parâmetro: angulo (em graus)")
            angulo = transformacao[1]
            matriz_rotacao = criar_matriz_rotacao_z(angulo)
            matriz_resultado = np.dot(matriz_rotacao, matriz_resultado)
            
        elif tipo == 'cisalhamento':
            if len(transformacao) != 3:
                raise ValueError("Cisalhamento requer 2 parâmetros: plano e fator")
            plano, fator = transformacao[1], transformacao[2]
            matriz_cisalhamento = criar_matriz_cisalhamento(plano, fator)
            matriz_resultado = np.dot(matriz_cisalhamento, matriz_resultado)
            
        else:
            raise ValueError(f"Tipo de transformação '{tipo}' não reconhecido")
    
    return matriz_resultado

def criar_matriz_translacao(tx, ty, tz):
    """Cria matriz de translação 4x4"""
    matriz = np.eye(4)
    matriz[0, 3] = tx
    matriz[1, 3] = ty
    matriz[2, 3] = tz
    return matriz

def criar_matriz_escala(sx, sy, sz):
    """Cria matriz de escala 4x4"""
    matriz = np.eye(4)
    matriz[0, 0] = sx
    matriz[1, 1] = sy
    matriz[2, 2] = sz
    return matriz

def criar_matriz_rotacao_x(angulo_graus):
    """Cria matriz de rotação em torno do eixo X"""
    angulo = math.radians(angulo_graus)
    cos_a = math.cos(angulo)
    sin_a = math.sin(angulo)
    
    matriz = np.eye(4)
    matriz[1, 1] = cos_a
    matriz[1, 2] = -sin_a
    matriz[2, 1] = sin_a
    matriz[2, 2] = cos_a
    return matriz

def criar_matriz_rotacao_y(angulo_graus):
    """Cria matriz de rotação em torno do eixo Y"""
    angulo = math.radians(angulo_graus)
    cos_a = math.cos(angulo)
    sin_a = math.sin(angulo)
    
    matriz = np.eye(4)
    matriz[0, 0] = cos_a
    matriz[0, 2] = sin_a
    matriz[2, 0] = -sin_a
    matriz[2, 2] = cos_a
    return matriz

def criar_matriz_rotacao_z(angulo_graus):
    """Cria matriz de rotação em torno do eixo Z"""
    angulo = math.radians(angulo_graus)
    cos_a = math.cos(angulo)
    sin_a = math.sin(angulo)
    
    matriz = np.eye(4)
    matriz[0, 0] = cos_a
    matriz[0, 1] = -sin_a
    matriz[1, 0] = sin_a
    matriz[1, 1] = cos_a
    return matriz

def criar_matriz_cisalhamento(plano, fator):
    """
    Cria matriz de cisalhamento
    
    Args:
        plano: String indicando o plano ('xy', 'xz', 'yx', 'yz', 'zx', 'zy')
        fator: Fator de cisalhamento
    """
    matriz = np.eye(4)
    
    if plano == 'xy':
        matriz[0, 1] = fator
    elif plano == 'xz':
        matriz[0, 2] = fator
    elif plano == 'yx':
        matriz[1, 0] = fator
    elif plano == 'yz':
        matriz[1, 2] = fator
    elif plano == 'zx':
        matriz[2, 0] = fator
    elif plano == 'zy':
        matriz[2, 1] = fator
    else:
        raise ValueError(f"Plano de cisalhamento '{plano}' não reconhecido. Use: xy, xz, yx, yz, zx, zy")
    
    return matriz

def aplicar_transformacao(vertices, matriz_transformacao):
    """
    Aplica uma matriz de transformação aos vértices de um objeto 3D
    
    Args:
        vertices: Lista ou array de vértices 3D [(x, y, z), ...]
        matriz_transformacao: Matriz 4x4 de transformação
        
    Returns:
        numpy.ndarray: Vértices transformados
    """
    vertices = np.array(vertices)
    
    # Converter para coordenadas homogêneas (adicionar coluna de 1s)
    vertices_homogeneos = np.column_stack([vertices, np.ones(len(vertices))])
    
    # Aplicar transformação
    vertices_transformados = np.dot(vertices_homogeneos, matriz_transformacao.T)
    
    # Converter de volta para coordenadas 3D (remover última coluna)
    return vertices_transformados[:, :3]

def decompor_matriz_transformacao(matriz):
    """
    Decompõe uma matriz de transformação 4x4 em seus componentes básicos
    
    Args:
        matriz: Matriz 4x4 de transformação
        
    Returns:
        dict: Dicionário com translação, escala e rotação extraídas
    """
    # Extrair translação
    translacao = matriz[:3, 3]
    
    # Extrair matriz 3x3 superior esquerda
    matriz_3x3 = matriz[:3, :3]
    
    # Extrair escalas (norma de cada coluna)
    escala_x = np.linalg.norm(matriz_3x3[:, 0])
    escala_y = np.linalg.norm(matriz_3x3[:, 1])
    escala_z = np.linalg.norm(matriz_3x3[:, 2])
    
    # Remover escala para obter matriz de rotação
    matriz_rotacao = matriz_3x3.copy()
    matriz_rotacao[:, 0] /= escala_x
    matriz_rotacao[:, 1] /= escala_y
    matriz_rotacao[:, 2] /= escala_z
    
    return {
        'translacao': translacao,
        'escala': np.array([escala_x, escala_y, escala_z]),
        'matriz_rotacao': matriz_rotacao
    }

def aplicar_transformacoes_mesh(mesh, transformacoes):
    """
    Aplica transformações aos vértices da mesh e retorna uma nova mesh transformada
    
    Args:
        mesh: Objeto mesh original
        transformacoes: Lista de transformações a serem aplicadas
        
    Returns:
        tuple: (mesh_transformada, matriz_transformacao)
    """
    from copy import deepcopy
    
    # Criar matriz de transformação
    matriz = criar_matriz_transformacao(transformacoes)
    
    # Extrair vértices originais
    vertices_originais = []
    vertices_ids = []
    for v_id, vertice in mesh.vertices.items():
        vertices_originais.append(vertice.position)
        vertices_ids.append(v_id)
    
    # Aplicar transformação
    vertices_transformados = aplicar_transformacao(vertices_originais, matriz)
    
    # Criar nova mesh com vértices transformados
    mesh_transformada = deepcopy(mesh)
    
    # Atualizar posições dos vértices
    for i, v_id in enumerate(vertices_ids):
        mesh_transformada.vertices[v_id].position = vertices_transformados[i].tolist()
    
    return mesh_transformada, matriz

def menu_transformacoes():
    """
    Menu interativo para definir transformações
    
    Returns:
        list: Lista de transformações definidas pelo usuário
    """
    transformacoes = []
    
    while True:
        print("\n=== MENU DE TRANSFORMAÇÕES ===")
        print("1: Adicionar Translação")
        print("2: Adicionar Escala Uniforme")
        print("3: Adicionar Rotação X")
        print("4: Adicionar Rotação Y") 
        print("5: Adicionar Rotação Z")
        print("6: Adicionar Cisalhamento")
        print("7: Ver transformações atuais")
        print("8: Limpar todas as transformações")
        print("0: Finalizar e aplicar")
        
        opcao = input("Escolha uma opção: ")
        
        if opcao == '0':
            break
        elif opcao == '1':
            try:
                tx = float(input("Translação X: "))
                ty = float(input("Translação Y: "))
                tz = float(input("Translação Z: "))
                transformacoes.append(('translacao', tx, ty, tz))
                print(f"✓ Adicionada: Translação ({tx}, {ty}, {tz})")
            except ValueError:
                print("❌ Valores inválidos!")
                
        elif opcao == '2':
            try:
                s = float(input("Fator de escala uniforme: "))
                transformacoes.append(('escala', s))
                print(f"✓ Adicionada: Escala uniforme ({s})")
            except ValueError:
                print("❌ Valor inválido!")
                
        elif opcao == '3':
            try:
                angulo = float(input("Ângulo de rotação X (graus): "))
                transformacoes.append(('rotacao_x', angulo))
                print(f"✓ Adicionada: Rotação X ({angulo}°)")
            except ValueError:
                print("❌ Valor inválido!")
                
        elif opcao == '4':
            try:
                angulo = float(input("Ângulo de rotação Y (graus): "))
                transformacoes.append(('rotacao_y', angulo))
                print(f"✓ Adicionada: Rotação Y ({angulo}°)")
            except ValueError:
                print("❌ Valor inválido!")
                
        elif opcao == '5':
            try:
                angulo = float(input("Ângulo de rotação Z (graus): "))
                transformacoes.append(('rotacao_z', angulo))
                print(f"✓ Adicionada: Rotação Z ({angulo}°)")
            except ValueError:
                print("❌ Valor inválido!")
                
        elif opcao == '6':
            try:
                print("Planos disponíveis: xy, xz, yx, yz, zx, zy")
                plano = input("Plano de cisalhamento: ").lower()
                fator = float(input("Fator de cisalhamento: "))
                if plano in ['xy', 'xz', 'yx', 'yz', 'zx', 'zy']:
                    transformacoes.append(('cisalhamento', plano, fator))
                    print(f"✓ Adicionada: Cisalhamento {plano} ({fator})")
                else:
                    print("❌ Plano inválido!")
            except ValueError:
                print("❌ Valor inválido!")
                
        elif opcao == '7':
            if transformacoes:
                print("\n📋 Transformações atuais:")
                for i, t in enumerate(transformacoes, 1):
                    print(f"  {i}. {formatar_transformacao(t)}")
            else:
                print("📋 Nenhuma transformação definida")
                
        elif opcao == '8':
            transformacoes.clear()
            print("🗑️ Todas as transformações foram removidas")
            
        else:
            print("❌ Opção inválida!")
    
    return transformacoes

def formatar_transformacao(transformacao):
    """
    Formata uma transformação para exibição
    
    Args:
        transformacao: Tupla representando uma transformação
        
    Returns:
        str: String formatada da transformação
    """
    tipo = transformacao[0]
    
    if tipo == 'translacao':
        return f"Translação: ({transformacao[1]}, {transformacao[2]}, {transformacao[3]})"
    elif tipo == 'escala':
        return f"Escala uniforme: {transformacao[1]}"
    elif tipo.startswith('rotacao_'):
        eixo = tipo.split('_')[1].upper()
        return f"Rotação {eixo}: {transformacao[1]}°"
    elif tipo == 'cisalhamento':
        return f"Cisalhamento {transformacao[1]}: {transformacao[2]}"
    else:
        return str(transformacao)

def processar_transformacoes_interativo(mesh):
    """
    Função principal que gerencia todo o processo de transformações
    
    Args:
        mesh: Objeto mesh original
        
    Returns:
        tuple: (mesh_transformada, matriz_transformacao, sucesso)
               sucesso indica se o processo foi completado
    """
    try:
        # Menu para definir transformações
        transformacoes = menu_transformacoes()
        
        if not transformacoes:
            print("❌ Nenhuma transformação definida!")
            return None, None, False
        
        print("\n🔄 Aplicando transformações...")
        
        # Aplicar transformações
        mesh_transformada, matriz = aplicar_transformacoes_mesh(mesh, transformacoes)
        
        print("✅ Transformações aplicadas com sucesso!")
        print(f"\n📊 Matriz de transformação resultante:")
        print(matriz)
        
        return mesh_transformada, matriz, True
        
    except Exception as e:
        print(f"❌ Erro ao processar transformações: {e}")
        return None, None, False

def salvar_mesh_obj(mesh, nome_arquivo):
    """
    Salva uma mesh em formato .obj
    
    Args:
        mesh: Objeto mesh a ser salvo
        nome_arquivo: Nome do arquivo de destino
    """
    try:
        with open(nome_arquivo, 'w') as f:
            f.write("# Mesh transformada\n")
            f.write(f"# Gerada automaticamente\n\n")
            
            # Escrever vértices
            for v_id in sorted(mesh.vertices.keys()):
                pos = mesh.vertices[v_id].position
                f.write(f"v {pos[0]:.6f} {pos[1]:.6f} {pos[2]:.6f}\n")
            
            f.write("\n")
            
            # Escrever faces
            for face_id, face in mesh.faces.items():
                indices = " ".join([f"{i}//" for i in face.vertice_indices])
                f.write(f"f {indices}\n")
        
        print(f"✅ Mesh salva em: {nome_arquivo}")
        
    except Exception as e:
        print(f"❌ Erro ao salvar: {e}")
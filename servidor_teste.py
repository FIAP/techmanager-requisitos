#!/usr/bin/env python3
"""
Servidor de Teste para Demonstração de Performance
Simula um e-commerce simples com página de produtos
"""

from flask import Flask, jsonify, request
import time
import random
import logging

# Configuração de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Simulação de banco de dados
PRODUTOS = [
    {'id': 1, 'nome': 'Smartphone Samsung', 'preco': 899.99, 'categoria': 'eletrônicos'},
    {'id': 2, 'nome': 'Notebook Dell', 'preco': 2499.99, 'categoria': 'eletrônicos'},
    {'id': 3, 'nome': 'Tênis Nike', 'preco': 299.99, 'categoria': 'esportes'},
    {'id': 4, 'nome': 'Camiseta Polo', 'preco': 79.99, 'categoria': 'roupas'},
    {'id': 5, 'nome': 'Livro Python', 'preco': 49.99, 'categoria': 'livros'},
    {'id': 6, 'nome': 'Headphone JBL', 'preco': 159.99, 'categoria': 'eletrônicos'},
    {'id': 7, 'nome': 'Mochila Executiva', 'preco': 129.99, 'categoria': 'acessórios'},
    {'id': 8, 'nome': 'Relógio Casio', 'preco': 199.99, 'categoria': 'acessórios'},
    {'id': 9, 'nome': 'Perfume Importado', 'preco': 89.99, 'categoria': 'cosméticos'},
    {'id': 10, 'nome': 'Cafeteira Elétrica', 'preco': 149.99, 'categoria': 'eletrodomésticos'}
]

# Contador de requisições para simular carga
request_count = 0

@app.before_request
def antes_requisicao():
    """Executa antes de cada requisição"""
    global request_count
    request_count += 1
    logger.info(f"Requisição #{request_count} - {request.method} {request.path}")

@app.route('/')
def home():
    """Página inicial"""
    return jsonify({
        'message': 'Bem-vindo ao E-commerce de Teste!',
        'endpoints': {
            '/produtos': 'Lista todos os produtos',
            '/produtos/<id>': 'Detalhes de um produto específico',
            '/status': 'Status do servidor'
        }
    })

@app.route('/produtos')
def listar_produtos():
    """
    Endpoint principal para teste de performance
    Simula processamento variável baseado na carga
    """
    global request_count
    
    # Simula tempo de processamento baseado na carga atual
    if request_count < 50:
        # Baixa carga - resposta rápida
        delay = random.uniform(0.1, 0.5)
    elif request_count < 200:
        # Carga média - resposta moderada
        delay = random.uniform(0.5, 1.5)
    else:
        # Alta carga - resposta mais lenta
        delay = random.uniform(1.0, 2.5)
    
    # Simula falha ocasional sob alta carga
    if request_count > 300 and random.random() < 0.02:  # 2% de chance de erro
        logger.warning(f"Simulando erro de sobrecarga - Requisição #{request_count}")
        return jsonify({'error': 'Servidor sobrecarregado'}), 503
    
    # Simula processamento
    time.sleep(delay)
    
    # Filtros opcionais
    categoria = request.args.get('categoria')
    limite = request.args.get('limite', type=int)
    
    produtos = PRODUTOS.copy()
    
    if categoria:
        produtos = [p for p in produtos if p['categoria'] == categoria]
    
    if limite and limite > 0:
        produtos = produtos[:limite]
    
    response = {
        'produtos': produtos,
        'total': len(produtos),
        'tempo_processamento': f"{delay:.2f}s",
        'requisicao_numero': request_count
    }
    
    logger.info(f"Produtos retornados: {len(produtos)} - Delay: {delay:.2f}s")
    return jsonify(response)

@app.route('/produtos/<int:produto_id>')
def detalhe_produto(produto_id):
    """
    Endpoint para produto específico
    """
    # Simula processamento
    delay = random.uniform(0.2, 0.8)
    time.sleep(delay)
    
    produto = next((p for p in PRODUTOS if p['id'] == produto_id), None)
    
    if not produto:
        return jsonify({'error': 'Produto não encontrado'}), 404
    
    # Adiciona detalhes extras
    produto_detalhado = produto.copy()
    produto_detalhado.update({
        'descricao': f'Descrição detalhada do produto {produto["nome"]}',
        'estoque': random.randint(0, 100),
        'avaliacao': round(random.uniform(3.0, 5.0), 1),
        'tempo_processamento': f"{delay:.2f}s"
    })
    
    return jsonify(produto_detalhado)

@app.route('/status')
def status_servidor():
    """
    Endpoint para monitorar status do servidor
    """
    return jsonify({
        'status': 'online',
        'requisicoes_processadas': request_count,
        'produtos_cadastrados': len(PRODUTOS),
        'memoria_uso': f"{random.randint(40, 80)}%",
        'cpu_uso': f"{random.randint(20, 60)}%"
    })

@app.route('/reset')
def reset_contador():
    """
    Endpoint para resetar contador de requisições
    """
    global request_count
    request_count = 0
    logger.info("Contador de requisições resetado")
    return jsonify({'message': 'Contador resetado', 'requisicoes': request_count})

@app.errorhandler(404)
def nao_encontrado(e):
    return jsonify({'error': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def erro_interno(e):
    return jsonify({'error': 'Erro interno do servidor'}), 500

if __name__ == '__main__':
    print("=== SERVIDOR DE TESTE PARA PERFORMANCE ===")
    print("Endpoints disponíveis:")
    print("  GET /              - Página inicial")
    print("  GET /produtos      - Lista produtos (endpoint principal)")
    print("  GET /produtos/<id> - Detalhes do produto")
    print("  GET /status        - Status do servidor")
    print("  GET /reset         - Reset contador")
    print()
    print("Comportamento simulado:")
    print("  - Requisições 1-50: Resposta rápida (0.1-0.5s)")
    print("  - Requisições 51-200: Resposta moderada (0.5-1.5s)")
    print("  - Requisições 200+: Resposta lenta (1.0-2.5s)")
    print("  - Requisições 300+: 2% chance de erro 503")
    print()
    print("Servidor rodando em: http://localhost:8000")
    print("Para testar: curl http://localhost:8000/produtos")
    print()
    
    app.run(host='0.0.0.0', port=8000, debug=True) 
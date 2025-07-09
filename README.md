# Testes de Performance - Cenário de Pico de Acesso

Este projeto demonstra como implementar testes de performance para validar requisitos não funcionais, especificamente o cenário:

**CENÁRIO**: Pico de acesso  
**DADO**: 5.000 usuários simultâneos  
**QUANDO**: Acessam a página de produtos  
**ENTÃO**: O tempo de resposta deve ser < 3 segundos  
**E**: A taxa de erro deve ser < 1%

## Estrutura do Projeto

```
├── test_performance_produtos.py    # Teste completo usando Locust
├── teste_simples_performance.py    # Teste simples usando requests
├── requirements.txt                # Dependências do projeto
└── README.md                      # Este arquivo
```

## Instalação

### 1. Instalar dependências

```bash
pip install -r requirements.txt
```

### 2. Instalar Locust (para o teste avançado)

```bash
pip install locust
```

## Como Executar

### Opção 1: Teste Simples (Recomendado para aprendizado)

```bash
python teste_simples_performance.py
```

Este teste:
- Simula 100 usuários simultâneos por padrão
- Mostra resultados em tempo real
- Gera relatório final com estatísticas
- Fácil de entender e modificar

### Opção 2: Teste Avançado com Locust

```bash
# Executar o teste
locust -f test_performance_produtos.py --host=http://localhost:8000

# Ou executar em modo headless (sem interface web)
locust -f test_performance_produtos.py --host=http://localhost:8000 --users 5000 --spawn-rate 100 --run-time 10m --headless
```

#### Parâmetros do Locust:
- `--users 5000`: Número de usuários simultâneos
- `--spawn-rate 100`: Usuários adicionados por segundo
- `--run-time 10m`: Duração do teste
- `--headless`: Executa sem interface web

## Configuração do Ambiente de Teste

### Servidor Local de Exemplo

Para testar localmente, você pode criar um servidor simples:

```python
# servidor_teste.py
from flask import Flask, jsonify
import time
import random

app = Flask(__name__)

@app.route('/produtos')
def produtos():
    # Simula processamento
    time.sleep(random.uniform(0.5, 2.0))
    
    return jsonify({
        'produtos': [
            {'id': 1, 'nome': 'Produto A', 'preco': 100.00},
            {'id': 2, 'nome': 'Produto B', 'preco': 200.00},
            {'id': 3, 'nome': 'Produto C', 'preco': 150.00}
        ]
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
```

Execute com:
```bash
python servidor_teste.py
```

## Interpretação dos Resultados

### Exemplo de Saída Esperada:

```
=== ANÁLISE DOS RESULTADOS ===
Tempo total do teste: 45.23 segundos
Total de requisições: 5000
Total de erros: 12

--- ESTATÍSTICAS DE TEMPO ---
Tempo médio de resposta: 2.45s
Tempo mínimo: 0.52s
Tempo máximo: 4.12s
Requisições < 3s: 4750 (95.0%)

--- ESTATÍSTICAS DE ERRO ---
Taxa de erro: 0.24%
Requisições com sucesso: 4988

--- VERIFICAÇÃO DE CRITÉRIOS ---
✓ Tempo médio < 3s: SIM (2.45s)
✓ Taxa de erro < 1%: SIM (0.24%)

✅ TESTE APROVADO
```

### Critérios de Avaliação:

1. **Tempo de Resposta**: Média deve ser < 3 segundos
2. **Taxa de Erro**: Deve ser < 1%
3. **Disponibilidade**: Sistema deve responder às requisições
4. **Estabilidade**: Performance deve ser consistente

## Customização

### Modificar número de usuários:

```python
# Em teste_simples_performance.py
NUM_USUARIOS = 1000  # Altere aqui
```

### Modificar URL de teste:

```python
# Em teste_simples_performance.py
URL_BASE = "https://meusite.com"  # Altere aqui
```

### Adicionar novos endpoints:

```python
# Em test_performance_produtos.py
@task(2)
def acessar_carrinho(self):
    with self.client.get("/carrinho") as response:
        if response.status_code != 200:
            response.failure(f"Erro no carrinho: {response.status_code}")
```

## Ferramentas Alternativas

### Apache JMeter
```bash
# Instalar JMeter
wget https://archive.apache.org/dist/jmeter/binaries/apache-jmeter-5.5.tgz
tar -xzf apache-jmeter-5.5.tgz
./apache-jmeter-5.5/bin/jmeter
```

### Artillery.js
```bash
npm install -g artillery
artillery quick --count 1000 --num 10 http://localhost:8000/produtos
```

## Melhores Práticas

1. **Ambiente de Teste**: Use ambiente similar ao produção
2. **Dados Realistas**: Use dados que simulem cenários reais
3. **Monitoramento**: Monitore servidor durante testes
4. **Gradual**: Aumente carga gradualmente
5. **Repetição**: Execute múltiplas vezes para validar resultados

## Troubleshooting

### Erro "Connection refused"
- Verifique se o servidor está rodando
- Confirme a URL e porta corretas

### Muitos erros de timeout
- Aumente o timeout nas requisições
- Reduza número de usuários simultâneos

### Performance ruim
- Verifique recursos do servidor (CPU, memória)
- Analise logs de aplicação
- Considere otimizações de código/banco

## Próximos Passos

1. Implementar testes para outros cenários (login, checkout, etc.)
2. Adicionar monitoramento de recursos do servidor
3. Integrar com CI/CD para execução automática
4. Criar dashboards para visualização de resultados 
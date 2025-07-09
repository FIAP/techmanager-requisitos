#!/usr/bin/env python3
"""
Exemplo Simples de Teste de Performance
Cenário: Simular múltiplos usuários acessando página de produtos
"""

import requests
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
import statistics

class TestePerformance:
    def __init__(self, url_base):
        self.url_base = url_base
        self.resultados = []
        self.erros = []
        self.lock = threading.Lock()
    
    def fazer_requisicao(self, usuario_id):
        """
        Simula uma requisição de usuário para página de produtos
        """
        try:
            url = f"{self.url_base}/produtos"
            inicio = time.time()
            
            # Faz a requisição HTTP
            response = requests.get(url, timeout=5)
            
            tempo_resposta = time.time() - inicio
            
            # Thread-safe: adiciona resultado à lista
            with self.lock:
                self.resultados.append({
                    'usuario_id': usuario_id,
                    'tempo_resposta': tempo_resposta,
                    'status_code': response.status_code,
                    'sucesso': response.status_code == 200
                })
            
            print(f"Usuário {usuario_id}: {tempo_resposta:.2f}s - Status: {response.status_code}")
            
        except Exception as e:
            # Thread-safe: adiciona erro à lista
            with self.lock:
                self.erros.append({
                    'usuario_id': usuario_id,
                    'erro': str(e),
                    'tempo': time.time()
                })
            print(f"Usuário {usuario_id}: ERRO - {e}")
    
    def executar_teste(self, num_usuarios=5000, usuarios_por_segundo=100):
        """
        Executa o teste de performance
        """
        print(f"=== INICIANDO TESTE DE PERFORMANCE ===")
        print(f"Usuários simultâneos: {num_usuarios}")
        print(f"URL: {self.url_base}/produtos")
        print(f"Critérios:")
        print(f"  - Tempo de resposta < 3 segundos")
        print(f"  - Taxa de erro < 1%")
        print()
        
        inicio_teste = time.time()
        
        # Executa requisições em paralelo
        with ThreadPoolExecutor(max_workers=usuarios_por_segundo) as executor:
            # Submete todas as tarefas
            futures = [
                executor.submit(self.fazer_requisicao, i+1) 
                for i in range(num_usuarios)
            ]
            
            # Aguarda conclusão de todas as tarefas
            for future in as_completed(futures):
                try:
                    future.result()
                except Exception as e:
                    print(f"Erro na execução: {e}")
        
        tempo_total = time.time() - inicio_teste
        self.analisar_resultados(tempo_total)
    
    def analisar_resultados(self, tempo_total):
        """
        Analisa os resultados do teste
        """
        print(f"\n=== ANÁLISE DOS RESULTADOS ===")
        print(f"Tempo total do teste: {tempo_total:.2f} segundos")
        print(f"Total de requisições: {len(self.resultados)}")
        print(f"Total de erros: {len(self.erros)}")
        
        if not self.resultados:
            print("Nenhum resultado válido para analisar!")
            return
        
        # Calcula estatísticas
        tempos_resposta = [r['tempo_resposta'] for r in self.resultados]
        requisicoes_sucesso = [r for r in self.resultados if r['sucesso']]
        
        tempo_medio = statistics.mean(tempos_resposta)
        tempo_maximo = max(tempos_resposta)
        tempo_minimo = min(tempos_resposta)
        
        # Calcula taxa de erro
        total_requisicoes = len(self.resultados) + len(self.erros)
        taxa_erro = (len(self.erros) / total_requisicoes) * 100 if total_requisicoes > 0 else 0
        
        # Requisições dentro do critério (< 3 segundos)
        requisicoes_dentro_sla = sum(1 for t in tempos_resposta if t < 3.0)
        percentual_sla = (requisicoes_dentro_sla / len(tempos_resposta)) * 100
        
        print(f"\n--- ESTATÍSTICAS DE TEMPO ---")
        print(f"Tempo médio de resposta: {tempo_medio:.2f}s")
        print(f"Tempo mínimo: {tempo_minimo:.2f}s")
        print(f"Tempo máximo: {tempo_maximo:.2f}s")
        print(f"Requisições < 3s: {requisicoes_dentro_sla} ({percentual_sla:.1f}%)")
        
        print(f"\n--- ESTATÍSTICAS DE ERRO ---")
        print(f"Taxa de erro: {taxa_erro:.2f}%")
        print(f"Requisições com sucesso: {len(requisicoes_sucesso)}")
        
        # Verifica critérios
        print(f"\n--- VERIFICAÇÃO DE CRITÉRIOS ---")
        criterio_tempo = tempo_medio < 3.0
        criterio_erro = taxa_erro < 1.0
        
        print(f"✓ Tempo médio < 3s: {'SIM' if criterio_tempo else 'NÃO'} ({tempo_medio:.2f}s)")
        print(f"✓ Taxa de erro < 1%: {'SIM' if criterio_erro else 'NÃO'} ({taxa_erro:.2f}%)")
        
        resultado_final = criterio_tempo and criterio_erro
        print(f"\n{'✅ TESTE APROVADO' if resultado_final else '❌ TESTE REPROVADO'}")
        
        # Mostra alguns erros se houver
        if self.erros:
            print(f"\n--- PRIMEIROS 5 ERROS ---")
            for i, erro in enumerate(self.erros[:5]):
                print(f"{i+1}. Usuário {erro['usuario_id']}: {erro['erro']}")

# Exemplo de uso
if __name__ == "__main__":
    # Configuração do teste
    URL_BASE = "http://localhost:8000"  # Substitua pela URL real
    NUM_USUARIOS = 100  # Reduzido para teste local
    
    print("=== TESTE DE PERFORMANCE - PÁGINA DE PRODUTOS ===")
    print(f"ATENÇÃO: Este teste irá fazer {NUM_USUARIOS} requisições para {URL_BASE}")
    print("Certifique-se que o servidor está rodando!")
    print()
    
    continuar = input("Deseja continuar? (s/n): ")
    if continuar.lower() != 's':
        print("Teste cancelado.")
        exit()
    
    # Executa o teste
    teste = TestePerformance(URL_BASE)
    teste.executar_teste(num_usuarios=NUM_USUARIOS) 
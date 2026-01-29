
# Enriquecimento de referências (PMID/DOI) — Productivity Lab

## 1) Instalar dependências
```bash
pip install requests tqdm
```

## 2) Executar o script
O script lê um arquivo JSON contendo os protocolos (com campos `references` contendo "PubMed search: ...") e consulta a API do PubMed para encontrar papers reais (RCTs, Meta-análises, Guidelines).

```bash
# Exemplo básico
python reference_enricher.py --input ../data/protocols_seed.json --output ../data/protocols_enriched.json
```

### Argumentos opcionais:
- `--max-per-protocol 3`: Define o número máximo de referências a buscar por protocolo (padrão: 3).
- `--prefer-years 10`: Prioriza papers publicados nos últimos X anos (padrão: 10). Use `0` para desativar.
- `--api-key SUA_KEY`: Se você tiver uma API Key do NCBI/PubMed, use para aumentar o limite de requisições.
- `--sleep 0.34`: Tempo de espera entre requisições para evitar rate limiting (padrão: 0.34s).

## 3) Resultado
O arquivo de saída (`.enriched.json`) terá:
- O campo `references` atualizado com strings formatadas (PMID | Título | Journal...).
- Um novo campo `references_structured` com objetos JSON contendo DOI, URL, etc.
- Um campo `reference_match_status`: 
  - `auto_matched`: Encontrou resultados.
  - `needs_review`: Não encontrou resultados confiáveis automaticamente.

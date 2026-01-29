
#!/usr/bin/env python3
"""
reference_enricher.py
=====================

Enriquecedor automático de referências (PMID/DOI) para o seed JSON do Productivity Lab.

O que faz:
- Lê um arquivo JSON no schema do Productivity Lab (ex.: protocols_500.seed.json)
- Para cada protocolo, identifica consultas do tipo "PubMed search: ..."
- Busca no PubMed (E-utilities) por evidências preferenciais:
  * Practice Guideline / Guideline
  * Systematic Review / Meta-Analysis
  * Randomized Controlled Trial
- Puxa detalhes (título, journal, ano, DOI quando disponível)
- Substitui o campo "references" por referências reais (strings), mantendo compatibilidade com seu app.
- Adiciona campos opcionais:
  * references_structured: lista de objetos com pmid/doi/url/título/etc.
  * reference_match_status: "auto_matched" ou "needs_review"

Importante:
- Isso é automação “assistida”: você ainda deve revisar rapidamente se o paper achado realmente corresponde ao protocolo.
- Este script NÃO baixa PDFs nem usa fontes não-oficiais. Apenas PubMed + links públicos.

Como usar:
  pip install requests tqdm
  python reference_enricher.py --input protocols_500.seed.json --output protocols_500.enriched.json

Opcional:
  - --max-per-protocol 3   (quantas refs por protocolo)
  - --prefer-years 10      (preferir papers dos últimos X anos; 0 desliga)
  - --api-key PUBMED_API_KEY (opcional, se você tiver)
"""

import argparse
import json
import re
import time
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import requests
from tqdm import tqdm


ESEARCH_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
ESUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"

# Publication Types e filtros: tentamos puxar evidência "forte" primeiro.
PT_FILTER = (
    '("practice guideline"[Publication Type] OR "guideline"[Publication Type] OR '
    '"systematic review"[Publication Type] OR "meta-analysis"[Publication Type] OR '
    '"randomized controlled trial"[Publication Type])'
)

HUMANS_FILTER = '("humans"[MeSH Terms])'

DEFAULT_TIMEOUT = 20


@dataclass
class PubMedRef:
    pmid: str
    title: str
    journal: str
    pubdate: str
    doi: Optional[str]
    url: str

    def to_string(self) -> str:
        # Mantém um formato simples (string) compatível com o schema atual.
        doi_part = f"DOI: {self.doi} | " if self.doi else ""
        return f"PMID: {self.pmid} | {doi_part}{self.title} | {self.journal} ({self.pubdate}) | {self.url}"

    def to_obj(self) -> Dict[str, Any]:
        return {
            "pmid": self.pmid,
            "doi": self.doi,
            "title": self.title,
            "journal": self.journal,
            "pubdate": self.pubdate,
            "url": self.url,
        }


def _safe_get_json(url: str, params: Dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> Dict[str, Any]:
    r = requests.get(url, params=params, timeout=timeout)
    r.raise_for_status()
    return r.json()


def pubmed_esearch(term: str, retmax: int = 3, api_key: Optional[str] = None) -> List[str]:
    params = {
        "db": "pubmed",
        "term": term,
        "retmode": "json",
        "retmax": retmax,
        "sort": "relevance",  # bom para match semântico
    }
    if api_key:
        params["api_key"] = api_key
    data = _safe_get_json(ESEARCH_URL, params)
    return data.get("esearchresult", {}).get("idlist", [])


def pubmed_esummary(pmids: List[str], api_key: Optional[str] = None) -> List[PubMedRef]:
    if not pmids:
        return []
    params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "json",
    }
    if api_key:
        params["api_key"] = api_key
    data = _safe_get_json(ESUMMARY_URL, params)
    result = data.get("result", {})
    refs: List[PubMedRef] = []
    for pmid in pmids:
        item = result.get(str(pmid))
        if not item:
            continue
        title = (item.get("title") or "").strip().rstrip(".")
        journal = (item.get("source") or "").strip()
        pubdate = (item.get("pubdate") or "").strip()
        # DOI às vezes vem em "elocationid" (ex.: "doi: 10.xxxx/....")
        doi = None
        eloc = (item.get("elocationid") or "").strip()
        m = re.search(r"\b10\.\d{4,9}/[^\s]+", eloc)
        if m:
            doi = m.group(0).rstrip(".;,")
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        refs.append(PubMedRef(pmid=str(pmid), title=title, journal=journal, pubdate=pubdate, doi=doi, url=url))
    return refs


def build_query(protocol_title: str, goal: str, raw_query: str, prefer_years: int) -> str:
    # Extrai o que vem depois de "PubMed search:"
    q = raw_query.strip()
    # Vamos reforçar com título/objetivo caso a consulta esteja genérica.
    # Ex.: "Pomodoro foco" etc.
    # E aplicamos filtros de evidência.
    base = f"({q}) OR ({protocol_title} {goal})"
    filters = f"{PT_FILTER} AND {HUMANS_FILTER}"

    if prefer_years and prefer_years > 0:
        # PubMed aceita filtro por data com [dp] (date of publication) e intervalo:
        # "2015:3000[dp]"
        from_year = max(1900, (time.gmtime().tm_year - prefer_years))
        date_filter = f'("{from_year}"[dp] : "3000"[dp])'
        return f"({base}) AND {filters} AND {date_filter}"
    return f"({base}) AND {filters}"


def enrich_protocol(protocol: Dict[str, Any], max_per_protocol: int, prefer_years: int, api_key: Optional[str]) -> Tuple[List[str], List[Dict[str, Any]], str]:
    refs = protocol.get("references", []) or []
    searches = [r for r in refs if isinstance(r, str) and r.lower().startswith("pubmed search:")]
    if not searches:
        return refs, [], "unchanged"

    # Combina buscas do protocolo em uma consulta. Pega só a primeira por padrão.
    raw = searches[0].split(":", 1)[1].strip()
    query = build_query(protocol.get("title", ""), protocol.get("goal", ""), raw, prefer_years)

    pmids = pubmed_esearch(query, retmax=max_per_protocol, api_key=api_key)
    # fallback: se não achar nada com filtros fortes, relaxa o filtro PT (mas mantém humanos)
    if not pmids:
        relaxed = f"(({raw}) OR ({protocol.get('title','')} {protocol.get('goal','')})) AND {HUMANS_FILTER}"
        if prefer_years and prefer_years > 0:
            from_year = max(1900, (time.gmtime().tm_year - prefer_years))
            relaxed += f' AND ("{from_year}"[dp] : "3000"[dp])'
        pmids = pubmed_esearch(relaxed, retmax=max_per_protocol, api_key=api_key)

    details = pubmed_esummary(pmids, api_key=api_key)
    # Score simples: se achou ao menos 1, "auto_matched", senão precisa revisão/manual.
    status = "auto_matched" if details else "needs_review"

    references_strings = [d.to_string() for d in details] if details else refs
    references_structured = [d.to_obj() for d in details]

    return references_strings, references_structured, status


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--input", required=True, help="Arquivo seed de entrada (ex.: protocols_500.seed.json)")
    ap.add_argument("--output", required=True, help="Arquivo enriched de saída (ex.: protocols_500.enriched.json)")
    ap.add_argument("--max-per-protocol", type=int, default=3, help="Máx. de referências por protocolo")
    ap.add_argument("--prefer-years", type=int, default=10, help="Preferir últimos X anos (0 = desliga)")
    ap.add_argument("--api-key", default=None, help="Opcional: PubMed API key")
    ap.add_argument("--sleep", type=float, default=0.34, help="Pausa entre requests (segundos) para respeitar rate limits")
    args = ap.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        data = json.load(f)

    protocols = data.get("protocols")
    if not isinstance(protocols, list):
        raise SystemExit("JSON inválido: campo 'protocols' precisa ser uma lista.")

    enriched = 0
    needs_review = 0

    for p in tqdm(protocols, desc="Enriquecendo protocolos"):
        try:
            refs_str, refs_obj, status = enrich_protocol(
                p,
                max_per_protocol=args.max_per_protocol,
                prefer_years=args.prefer_years,
                api_key=args.api_key,
            )
            if status != "unchanged":
                p["references"] = refs_str
                p["references_structured"] = refs_obj
                p["reference_match_status"] = status
                enriched += 1
                if status == "needs_review":
                    needs_review += 1
            time.sleep(args.sleep)
        except Exception as e:
            # Não quebra o processo por 1 erro
            p["reference_match_status"] = "needs_review"
            p["reference_error"] = str(e)
            needs_review += 1
            time.sleep(args.sleep)

    data["generated_at"] = time.strftime("%Y-%m-%dT%H:%M:%S", time.gmtime())
    data["note"] = (data.get("note", "") + " | Referências enriquecidas via PubMed E-utilities.").strip(" |")

    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nOK ✅ Saída salva em: {args.output}")
    print(f"Protocolos processados: {len(protocols)}")
    print(f"Protocolos com refs enriquecidas: {enriched}")
    print(f"Marcados para revisão manual: {needs_review}")
    print("\nDica: comece revisando os 'needs_review' e protocolos com mais risco (ex.: 'emergente').")


if __name__ == "__main__":
    main()

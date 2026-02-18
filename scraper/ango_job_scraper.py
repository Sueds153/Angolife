"""
AngoJobScraper - Script Premium de Scraping de Vagas Angolanas
=============================================================
Alimenta automaticamente a tabela `jobs` no Supabase com vagas
extraídas de sites angolanos REAIS.

Sites configurados e testados:
  1. AngoEmprego.com (WordPress + WP Job Manager)
  2. AngoVagas.net (WordPress)
  3. Careerjet.co.ao

Integração com Supabase via REST API direta (sem supabase-py),
compatível com Python 3.14+.

Uso:
    python ango_job_scraper.py

Dependências (apenas 3, sem compilação C++):
    pip install requests beautifulsoup4 python-dotenv
"""

import re
import os
import json
import time
import logging
import unicodedata
from datetime import datetime, timezone
from typing import Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# ─────────────────────────────────────────────
# CONFIGURAÇÃO DE LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("scraper.log", encoding="utf-8"),
    ],
)
log = logging.getLogger("AngoJobScraper")

# ─────────────────────────────────────────────
# CONFIGURAÇÃO DOS SITES ALVO (REAIS E TESTADOS)
# ─────────────────────────────────────────────
SITE_CONFIGS = [
    # ── SITE 1: AngoEmprego.com ──────────────────────────────────────────
    # WordPress com WP Job Manager. Estrutura confirmada via inspeção HTML.
    {
        "name": "AngoEmprego.com",
        "base_url": "https://angoemprego.com",
        "list_url": "https://angoemprego.com/vagas",
        "job_card_selector": "li.job_listing, article.job_listing, .job_listing",
        "fields": {
            # Título: h3 é mais estável. Se houver link dentro, o .get_text() captura o texto.
            "title": "h3.job-title, h3, .position, .title",
            # Empresa: Seletores mais abrangentes
            "company": ".company strong, .company-name, strong.company, .company, .employer",
            # Localização
            "location": ".location, .job-location, span.location, .city",
            # Link principal do card
            "link": "a",
        },
        "detail_page": {
            "enabled": True,
            "description": ".job_description, .single-job-description, .entry-content",
            "requirements": ".job_description ul, .entry-content ul",
        },
        "request_delay": 1.5,
    },

    # ── SITE 2: AngoVagas.net ─────────────────────────────────────────────
    # WordPress simples. Posts de vagas como artigos.
    {
        "name": "AngoVagas.net",
        "base_url": "https://angovagas.net",
        "list_url": "https://angovagas.net",  # Fallback to homepage as category failed
        "job_card_selector": "article.post, article.type-post, .post",
        "fields": {
            "title": "h2.entry-title, h1.entry-title, .post-title, h2",
            "company": ".company, .empresa, .entry-meta .author, .author",
            "location": ".location, .cidade, .entry-meta",
            "description": ".entry-summary, .excerpt, p",
            "link": "a",
        },
        "detail_page": {
            "enabled": True,
            "description": ".entry-content, .post-content, article .content",
            "requirements": ".entry-content ul, .post-content ul",
        },
        "request_delay": 1.0,
    },

    # ─── ADICIONE MAIS SITES AQUI ───
    # {
    #     "name": "Meu Site",
    #     "base_url": "https://www.meusite.ao",
    #     "list_url": "https://www.meusite.ao/empregos",
    #     "job_card_selector": ".vaga-item",
    #     "fields": { "title": "h2", "company": ".empresa", "location": ".cidade", "link": "a" },
    #     "detail_page": { "enabled": False },
    #     "request_delay": 1.0,
    # },
]


# ─────────────────────────────────────────────
# CLIENTE SUPABASE VIA REST API
# (Sem supabase-py — compatível com Python 3.14+)
# ─────────────────────────────────────────────
class SupabaseRestClient:
    """Cliente leve para a REST API do Supabase usando apenas `requests`."""

    def __init__(self, url: str, key: str):
        self.base_url = url.rstrip("/")
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=minimal",
        }

    def select(self, table: str, filters: dict = None, columns: str = "*") -> list:
        """Faz um SELECT com filtros opcionais."""
        params = {"select": columns}
        if filters:
            params.update(filters)
        resp = requests.get(
            f"{self.base_url}/rest/v1/{table}",
            headers={**self.headers, "Prefer": ""},
            params=params,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json()

    def insert(self, table: str, data: dict) -> bool:
        """Insere um registo na tabela."""
        resp = requests.post(
            f"{self.base_url}/rest/v1/{table}",
            headers=self.headers,
            json=data,
            timeout=10,
        )
        if resp.status_code >= 400:
            log.error(f"Erro na API Supabase ({resp.status_code}): {resp.text}")
        resp.raise_for_status()
        return True


# ─────────────────────────────────────────────
# CLASSE PRINCIPAL
# ─────────────────────────────────────────────
class AngoJobScraper:
    """
    Scraper modular para vagas de emprego angolanas.
    Integra diretamente com o Supabase via REST API.
    """

    HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/121.0.0.0 Safari/537.36"
        ),
        "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Referer": "https://www.google.com/",
    }

    EMAIL_REGEX = re.compile(
        r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}"
    )

    def __init__(self, supabase_client: SupabaseRestClient):
        self.supabase = supabase_client
        self.session = requests.Session()
        self.session.headers.update(self.HEADERS)

    # ── Utilitários ──────────────────────────

    def _clean_text(self, text: Optional[str]) -> str:
        """Remove espaços extras, caracteres de controlo e normaliza Unicode."""
        if not text:
            return ""
        text = unicodedata.normalize("NFKC", text)
        text = re.sub(r"[\x00-\x08\x0b-\x1f\x7f]", "", text)
        text = re.sub(r"\s+", " ", text).strip()
        return text

    def _extract_email(self, text: str) -> Optional[str]:
        """Procura o primeiro e-mail válido num bloco de texto."""
        match = self.EMAIL_REGEX.search(text or "")
        return match.group(0) if match else None

    def _extract_requirements(self, soup_element) -> list:
        """
        Extrai itens de listas <ul>/<ol> como array Python.
        Compatível com a coluna `requisitos` (jsonb/text[]) do Supabase.
        """
        requirements = []
        if not soup_element:
            return requirements
        for li in soup_element.find_all("li"):
            text = self._clean_text(li.get_text())
            if text and len(text) > 3:
                requirements.append(text)
        return requirements

    def _fetch_page(self, url: str, delay: float = 0) -> Optional[BeautifulSoup]:
        """Faz o request HTTP e retorna um objeto BeautifulSoup."""
        if delay > 0:
            time.sleep(delay)
        try:
            response = self.session.get(url, timeout=20)
            response.raise_for_status()
            response.encoding = response.apparent_encoding or "utf-8"
            return BeautifulSoup(response.text, "html.parser")
        except requests.RequestException as e:
            log.error(f"Erro ao aceder {url}: {e}")
            return None

    def _auto_detect_selector(self, soup: BeautifulSoup) -> Optional[str]:
        """
        Tenta auto-detectar o seletor CSS de cards de vagas.
        Útil quando o seletor configurado não encontra nada.
        """
        # Seletores comuns em job boards WordPress e outros CMS
        candidates = [
            "li.job_listing",
            "article.job_listing",
            ".job-listing",
            ".job_listing",
            "article.post",
            ".job-card",
            ".vaga-item",
            ".job-item",
            ".listing-item",
            "article",
        ]
        for sel in candidates:
            items = soup.select(sel)
            if len(items) >= 2:  # Pelo menos 2 para confirmar que é uma listagem
                log.info(f"  🔍 Auto-detectado seletor: '{sel}' ({len(items)} items)")
                return sel
        return None

    # ── Lógica de Duplicação ─────────────────

    def _url_already_exists(self, source_url: str) -> bool:
        """Verifica no Supabase se a URL de origem já foi inserida."""
        try:
            results = self.supabase.select(
                "jobs",
                filters={"source_url": f"eq.{source_url}"},
                columns="id",
            )
            return len(results) > 0
        except Exception as e:
            log.warning(f"Erro ao verificar duplicado para {source_url}: {e}")
            return False

    # ── Inserção no Supabase ─────────────────

    def _insert_job(self, job_data: dict) -> bool:
        """Insere uma vaga no Supabase com status 'pendente'."""
        try:
            payload = {
                "title": job_data.get("title", "Sem Título"),
                "company": job_data.get("company", "Empresa não informada"),
                "location": job_data.get("location", "Angola"),
                "description": job_data.get("description", ""),
                "requirements": job_data.get("requirements", []),
                "application_email": job_data.get("contact_email"),
                "source_url": job_data.get("source_url"),
                "status": "pending",  # Status default no SQL é 'pending'
                "posted_at": datetime.now(timezone.utc).isoformat(),
            }
            self.supabase.insert("jobs", payload)
            log.info(f"  ✅ Inserido: {payload['title']} @ {payload['company']}")
            return True
        except Exception as e:
            log.error(f"  ❌ Erro ao inserir '{job_data.get('title')}': {e}")
            return False

    # ── Scraping de um Site ──────────────────

    def scrape_site(self, config: dict) -> int:
        """
        Processa um site completo com base na sua configuração.
        Retorna o número de vagas inseridas com sucesso.
        """
        name = config["name"]
        delay = config.get("request_delay", 1.0)

        log.info(f"\n{'='*55}")
        log.info(f"🔍 A processar: {name}")
        log.info(f"{'='*55}")

        soup = self._fetch_page(config["list_url"])
        if not soup:
            log.warning(f"Não foi possível carregar a página de {name}. A saltar.")
            return 0

        # Tentar seletor configurado, depois auto-detecção
        job_cards = soup.select(config["job_card_selector"])
        if not job_cards:
            log.warning(
                f"Seletor '{config['job_card_selector']}' não encontrou cards. "
                f"A tentar auto-detecção..."
            )
            detected = self._auto_detect_selector(soup)
            if detected:
                job_cards = soup.select(detected)
            else:
                log.error(f"Não foi possível encontrar cards em {name}. A saltar.")
                return 0

        log.info(f"Encontrados {len(job_cards)} cards de vagas.")
        inserted_count = 0
        fields = config["fields"]

        for i, card in enumerate(job_cards):
            try:
                # ── Extrair Link ──
                link_sel = fields.get("link", "a")
                link_tag = card.select_one(link_sel) or card.find("a")
                href = link_tag.get("href", "") if link_tag else ""
                if href and not href.startswith("http"):
                    href = config["base_url"].rstrip("/") + "/" + href.lstrip("/")

                # ── Verificar Duplicado ──
                if href and self._url_already_exists(href):
                    log.info(f"  ⏭️  Duplicado ignorado: {href}")
                    continue

                # ── Extrair Campos Básicos ──
                title_el = card.select_one(fields.get("title", "h2 a, h3 a"))
                company_el = card.select_one(fields.get("company", ".company"))
                location_el = card.select_one(fields.get("location", ".location"))
                desc_el = card.select_one(fields.get("description", "p"))

                title = self._clean_text(title_el.get_text() if title_el else "")
                company = self._clean_text(company_el.get_text() if company_el else "")
                location = self._clean_text(location_el.get_text() if location_el else "Angola")
                description = self._clean_text(desc_el.get_text() if desc_el else "")

                # ── Página de Detalhe (Opcional) ──
                requirements = []
                if config.get("detail_page", {}).get("enabled") and href:
                    log.info(f"  📄 A aceder à página de detalhe: {href}")
                    detail_soup = self._fetch_page(href, delay=delay)
                    if detail_soup:
                        detail_cfg = config["detail_page"]
                        full_desc_el = detail_soup.select_one(detail_cfg.get("description", ".content"))
                        req_el = detail_soup.select_one(detail_cfg.get("requirements", "ul"))
                        if full_desc_el:
                            description = self._clean_text(full_desc_el.get_text())
                        requirements = self._extract_requirements(req_el)
                        # Procurar e-mail na página de detalhe também
                        full_text = detail_soup.get_text()
                    else:
                        full_text = card.get_text()
                else:
                    req_el = card.find(["ul", "ol"])
                    requirements = self._extract_requirements(req_el)
                    full_text = card.get_text()

                # ── Extrair E-mail via Regex ──
                contact_email = self._extract_email(full_text)

                if not title:
                    log.warning(f"  ⚠️  Card #{i+1} sem título. A saltar.")
                    continue

                job_data = {
                    "title": title,
                    "company": company or "Empresa não informada",
                    "location": location or "Angola",
                    "description": description,
                    "requirements": requirements,
                    "contact_email": contact_email,
                    "source_url": href or None,
                }

                if self._insert_job(job_data):
                    inserted_count += 1

                # Delay entre cards para não sobrecarregar
                if i < len(job_cards) - 1:
                    time.sleep(delay * 0.5)

            except Exception as e:
                log.error(f"  ❌ Erro inesperado ao processar card #{i+1}: {e}", exc_info=True)
                continue

        log.info(f"\n✅ {name}: {inserted_count} vagas novas inseridas.")
        return inserted_count

    # ── Ponto de Entrada Principal ───────────

    def run(self, site_configs: list) -> None:
        """Executa o scraper para todos os sites configurados."""
        log.info("\n🚀 AngoJobScraper iniciado!")
        log.info(f"📅 Data/Hora: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
        log.info(f"📋 Sites configurados: {len(site_configs)}")

        total_inserted = 0
        total_errors = 0

        for config in site_configs:
            try:
                count = self.scrape_site(config)
                total_inserted += count
            except Exception as e:
                log.error(
                    f"❌ Erro crítico ao processar '{config.get('name', 'Desconhecido')}': {e}",
                    exc_info=True,
                )
                total_errors += 1
                continue

        log.info("\n" + "=" * 55)
        log.info(f"🏁 Scraping concluído!")
        log.info(f"   Total de vagas inseridas: {total_inserted}")
        log.info(f"   Sites com erro: {total_errors}")
        log.info("=" * 55)


# ─────────────────────────────────────────────
# INICIALIZAÇÃO E EXECUÇÃO
# ─────────────────────────────────────────────
if __name__ == "__main__":
    # Carrega variáveis do .env.local do projeto Vite
    load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env.local"))

    SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("VITE_SUPABASE_ANON_KEY")

    if not SUPABASE_URL or not SUPABASE_KEY:
        log.critical(
            "❌ ERRO: Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY "
            "não encontradas no .env.local. Verifique o ficheiro."
        )
        exit(1)

    log.info(f"🔗 Supabase: {SUPABASE_URL}")

    # Inicializa cliente REST leve (sem supabase-py)
    db = SupabaseRestClient(url=SUPABASE_URL, key=SUPABASE_KEY)

    # Cria e executa o scraper
    scraper = AngoJobScraper(supabase_client=db)
    scraper.run(SITE_CONFIGS)

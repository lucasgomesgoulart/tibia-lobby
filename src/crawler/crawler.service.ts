import { Injectable, Logger } from '@nestjs/common';
import * as playwright from 'playwright';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private BASE_URL = 'https://rubinot.com.br/?subtopic=characters&name=';

  async getCharacterLevel(characterName: string): Promise<string | null> {
    const browser = await playwright.chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--disable-dev-shm-usage'
      ]
    });

    // Contexto com configurações anti-detecção
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: 'pt-BR',
      timezoneId: 'America/Sao_Paulo',
      extraHTTPHeaders: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Referer': 'https://rubinot.com.br/',
        'DNT': '1'
      }
    });

    const page = await context.newPage();
    
    try {
      const url = `${this.BASE_URL}${encodeURIComponent(characterName)}`;
      this.logger.debug(`Acessando URL: ${url}`);

      // Simula comportamento humano
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 45000
      });

      // Verificação adicional de bloqueio
      if ((await page.content()).includes('403 Forbidden')) {
        throw new Error('Bloqueio por firewall (WAF/Cloudflare)');
      }

      // Seletor específico para a estrutura HTML
      const levelSelector = '//tr[contains(., "Level:")]/td[last()]';
      await page.waitForSelector(`xpath=${levelSelector}`, { 
        timeout: 15000,
        state: 'attached'
      });

      const level = await page.$eval(
        'xpath=//tr[contains(., "Level:")]/td[last()]', 
        el => el.textContent.trim()
      );

      return level || null;

    } catch (error) {
      // Debug avançado
      const screenshotPath = `error-${Date.now()}.png`;
      await page.screenshot({ path: screenshotPath });
      this.logger.error(`Erro capturado: ${error.message}`, {
        stack: error.stack,
        screenshot: screenshotPath
      });

      if (error.message.includes('Bloqueio')) {
        throw new Error('Sistema anti-bot detectado. Tente manualmente');
      }
      
      return null;
    } finally {
      await browser.close();
    }
  }
}
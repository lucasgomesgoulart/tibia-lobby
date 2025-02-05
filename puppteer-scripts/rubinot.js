const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

    // Navega para o site
    await page.goto('https://www.rubinot.com.br', { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    });

    // Aguarda até que o checkbox esteja visível na página
    await page.waitForFunction(() => {
      return document.querySelector('#EQIhq6 input[type="checkbox"]') !== null;
    }, { timeout: 60000 }); // Aumenta o tempo limite para 60 segundos

    // Garante que o checkbox está na tela e pode ser clicado
    const checkbox = await page.$('#EQIhq6 input[type="checkbox"]');
    
    if (checkbox) {
      await checkbox.click();
      console.log('✅ Checkbox clicado com sucesso!');
    } else {
      throw new Error('❌ Checkbox não encontrado!');
    }

    // Aguarda para visualização
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Fecha o navegador (remova o comentário se quiser fechar no final)
    await browser.close();
  } catch (error) {
    console.error('Erro:', error);
  }
})();

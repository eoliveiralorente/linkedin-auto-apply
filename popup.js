document.getElementById('startSearch').addEventListener('click', async () => {
  try {
    const keywordsInput = document.getElementById('keywords').value;
    const keywords = encodeURIComponent(keywordsInput);
    
    // Captura os níveis marcados
    const selectedExp = [];
    if (document.getElementById('exp-junior').checked) selectedExp.push('2');
    if (document.getElementById('exp-senior').checked) selectedExp.push('4');
    if (document.getElementById('exp-especialista').checked) selectedExp.push('5');

    // f_AL=true -> Candidatura Simplificada (Easy Apply)
    // f_WT=2%2C3 -> Remoto (2) e Híbrido (3)
    let searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${keywords}&f_AL=true&f_WT=2%2C3`;

    // Adiciona o filtro de experiência f_E se algum estiver marcado
    if (selectedExp.length > 0) {
      const expParam = selectedExp.join('%2C');
      searchUrl += `&f_E=${expParam}`;
    }

    console.log("Abrindo URL de busca:", searchUrl);

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (tab) {
      await chrome.tabs.update(tab.id, { url: searchUrl });
    } else {
      await chrome.tabs.create({ url: searchUrl });
    }
  } catch (error) {
    console.error("Erro ao executar a busca:", error);
  }
});

document.getElementById('applyCurrent').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: "START_APPLY" });
    }
  } catch (error) {
    console.error("Erro ao enviar mensagem para a página:", error);
  }
});
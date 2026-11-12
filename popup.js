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

const cvFileInput = document.getElementById('cvFile');
const cvStatus = document.getElementById('cvStatus');
const maxCvSize = 7 * 1024 * 1024;

chrome.storage.local.get("userCV").then(data => {
  if (data.userCV) {
    cvStatus.textContent = `Salvo: ${data.userCV.name}`;
  }
}).catch(error => {
  console.error("Erro ao carregar o currículo salvo:", error);
  cvStatus.textContent = "Não foi possível carregar o currículo salvo.";
});

cvFileInput.addEventListener('change', async () => {
  const file = cvFileInput.files[0];
  if (!file) return;

  if (!file.name.toLocaleLowerCase().endsWith('.pdf')) {
    cvStatus.textContent = "Selecione um arquivo PDF.";
    cvFileInput.value = '';
    return;
  }

  if (file.size > maxCvSize) {
    cvStatus.textContent = "O PDF deve ter até 7 MB.";
    cvFileInput.value = '';
    return;
  }

  try {
    const base64 = await fileToDataUrl(file);
    await chrome.storage.local.set({
      userCV: { name: file.name, type: file.type || 'application/pdf', base64 }
    });
    cvStatus.textContent = `Salvo: ${file.name}`;
  } catch (error) {
    console.error("Erro ao salvar o currículo:", error);
    cvStatus.textContent = "Não foi possível salvar o currículo.";
  }
});

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error("Não foi possível ler o arquivo."));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("Falha ao ler o PDF."));
    reader.readAsDataURL(file);
  });
}
// Listener para receber comandos do popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLY") {
    processarCandidatura();
  }
});

async function processarCandidatura() {
  console.log("Iniciando processo de candidatura...");

  // 1. Localizar e clicar no botão "Candidatura Simplificada"
  const applyButton = document.querySelector('.jobs-apply-button');
  if (!applyButton) {
    alert("Botão 'Candidatura Simplificada' não encontrado nesta vaga.");
    return;
  }
  
  applyButton.click();
  await sleep(1500);

  // 2. Loop para percorrer o modal de candidatura
  let loopCount = 0;
  const maxSteps = 10;

  while (loopCount < maxSteps) {
    loopCount++;

    // Tenta anexar o PDF do CV caso o campo de upload esteja visível nesta etapa
    await tratarUploadCurriculo();

    const nextButton = document.querySelector('button[aria-label*="Avançar"], button[aria-label*="Prosseguir"], button[aria-label*="Revisar"]');
    const submitButton = document.querySelector('button[aria-label*="Enviar candidatura"], button[aria-label*="Submit application"]');

    if (submitButton) {
      console.log("Chegou na etapa final! Clique manual recomendado para envio.");
      break;
    }

    if (nextButton) {
      console.log(`Avançando etapa ${loopCount}...`);
      nextButton.click();
      await sleep(1500);
    } else {
      console.log("Nenhum botão de avanço encontrado ou formulário travado.");
      break;
    }
  }
}

async function tratarUploadCurriculo() {
  const fileInput = document.querySelector('input[type="file"]');
  
  if (fileInput && fileInput.files.length === 0) {
    // Busca o CV armazenado na extensão (salvo via storage local)
    const data = await chrome.storage.local.get("userCV");
    if (!data.userCV) {
      console.warn("Nenhum currículo em PDF foi configurado na extensão.");
      return;
    }

    // Converte a string Base64 de volta para um objeto File do navegador
    const file = await base64ToFile(data.userCV.base64, data.userCV.name, data.userCV.type);

    // Usa a API DataTransfer para simular a seleção do arquivo
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Dispara eventos para o LinkedIn reconhecer a inclusão do ficheiro
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));

    console.log("PDF do CV anexado com sucesso!");
    await sleep(1500);
  }
}

async function base64ToFile(base64Data, fileName, mimeType) {
  const res = await fetch(base64Data);
  const blob = await res.blob();
  return new File([blob], fileName, { type: mimeType });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
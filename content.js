// Listener para receber comandos do popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "START_APPLY") {
    processarCandidatura();
  }
});

async function processarCandidatura() {
  console.log("Iniciando processo de candidatura...");

  const applyButton = encontrarBotaoCandidatura();
  if (!applyButton) {
    alert("Botão 'Candidatura Simplificada' não encontrado nesta vaga.");
    return;
  }

  applyButton.click();
  await sleep(1500);

  let loopCount = 0;
  const maxSteps = 10;

  while (loopCount < maxSteps) {
    loopCount++;

    await tratarUploadCurriculo();

    const applicationModal = document.querySelector('[role="dialog"], .artdeco-modal');
    const buttons = Array.from((applicationModal || document).querySelectorAll('button, [role="button"]'))
      .filter(button => button.getClientRects().length > 0 && !button.disabled);
    const getButtonLabel = button =>
      `${button.getAttribute('aria-label') || ''} ${button.innerText || button.textContent || ''}`
        .replace(/\s+/g, ' ')
        .trim()
        .toLocaleLowerCase();
    const submitButton = buttons.find(button =>
      /enviar candidatura|submit application/.test(getButtonLabel(button))
    );

    if (submitButton) {
      console.log("Chegou na etapa final! Clique manual recomendado para envio.");
      break;
    }

    const nextButton = buttons.find(button =>
      /avançar|prosseguir|revisar|continuar|next|continue|review/.test(getButtonLabel(button))
    );

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

function encontrarBotaoCandidatura() {
  const candidates = Array.from(document.querySelectorAll(
    '.jobs-apply-button, button, [role="button"]'
  ));
  return candidates.find(button => {
    if (!button.getClientRects().length || button.disabled) return false;
    const label = `${button.getAttribute('aria-label') || ''} ${button.innerText || button.textContent || ''}`
      .replace(/\s+/g, ' ')
      .trim()
      .toLocaleLowerCase();
    return /candidatura simplificada|easy apply/.test(label);
  });
}

async function tratarUploadCurriculo() {
  const fileInput = document.querySelector('input[type="file"]');

  if (fileInput && fileInput.files.length === 0) {
    const data = await chrome.storage.local.get("userCV");
    if (!data.userCV) {
      console.warn("Nenhum currículo foi configurado na extensão.");
      return;
    }

    const file = await base64ToFile(data.userCV.base64, data.userCV.name, data.userCV.type);
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    fileInput.dispatchEvent(new Event('input', { bubbles: true }));

    console.log("Currículo anexado.");
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
# 🚀 LinkedIn Auto Apply (Chrome Extension)

Extensão de navegador (Manifest V3) desenvolvida para agilizar a busca e o processo de candidatura simplificada (*Easy Apply*) no LinkedIn, focada em oportunidades **Remotas** e **Híbridas**.

---

## 🎯 Objetivo

Reduzir o trabalho manual e repetitivo durante a busca por recolocação ou novas oportunidades na área de tecnologia, permitindo filtrar vagas de forma precisa e automatizar o avanço das etapas padrão de candidatura diretamente na sessão autenticada do usuário.

---

## ✨ Funcionalidades

* **Busca Filtrada Nativa:** Constrói URLs de busca com os parâmetros internos do LinkedIn para filtrar exclusivamente:
  * Vagas com **Candidatura Simplificada** (`f_AL=true`).
  * Modalidades **Remoto** e **Híbrido** (`f_WT=2,3`).
  * Níveis de experiência selecionáveis: **Júnior**, **Sênior** e **Especialista** (`f_E`).
* **Automação Assistida de Formulários:** Clica automaticamente no botão de candidatura e avança pelas etapas padrão (*Avançar*, *Prosseguir*, *Revisar*) até a tela de confirmação final ou até encontrar perguntas personalizadas que exijam intervenção humana.
* **Anexo de Currículo (PDF):** Salva localmente o PDF escolhido no popup e tenta anexá-lo via API `DataTransfer` quando o formulário solicitar upload.

Para configurar o currículo, escolha um PDF de até 7 MB no popup da extensão. O arquivo fica armazenado localmente no navegador e é anexado quando a etapa da candidatura solicitar upload. Revise as respostas e confirme o envio manualmente na etapa final.

---

## 🛠️ Estrutura do Projeto

```text
linkedin-auto-apply/
├── manifest.json   # Configurações e permissões da extensão (Manifest V3)
├── popup.html      # Interface visual da extensão (filtros e botões de ação)
├── popup.js        # Lógica de montagem da URL de busca e comunicação com a aba
├── content.js      # Script injetado no LinkedIn para manipulação do DOM e modais
└── README.md       # Documentação do projeto
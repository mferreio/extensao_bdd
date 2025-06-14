import { showFeedback } from './utils.js';
import { getConfig } from './config.js';

// Injeção dinâmica de todos os estilos do sistema (inclui variáveis, responsividade, dark mode, animações, etc.)
(function injectGherkinStyles() {
    if (document.getElementById('gherkin-global-style')) return;
    const style = document.createElement('style');
    style.id = 'gherkin-global-style';
    style.innerHTML = `
:root {
    --color-bg: #f8fafc;
    --color-bg-alt: #f4f7fb;
    --color-primary: #0070f3;
    --color-primary-dark: #005bb5;
    --color-accent: #0D47A1;
    --color-danger: #e74c3c;
    --color-success: #28a745;
    --color-warning: #ffc107;
    --color-border: #e0e6ed;
    --color-modal-overlay: rgba(0,0,0,0.32);
    --color-modal-bg: #fff;
    --color-modal-bg-dark: #232837;
    --color-shadow: rgba(0,0,0,0.13);
    --color-shadow-strong: rgba(0,0,0,0.18);
    --color-text: #1a2330;
    --color-text-light: #fff;
    --color-muted: #555;
    --color-footer: #aaa;
    --btn-radius: 9px;
    --btn-height: 42px;
    --btn-min-width: 110px;
    --btn-font-size: 1.07rem;
    --btn-shadow: 0 2px 8px rgba(0,112,243,0.08);
    --input-radius: 8px;
    --input-height: 38px;
    --input-font-size: 1rem;
}

.gherkin-modal-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--color-modal-overlay);
    z-index: 2147483647;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeInModalBg 0.22s;
}
.gherkin-modal-content {
    background: var(--color-modal-bg);
    color: var(--color-text);
    border-radius: 14px;
    box-shadow: 0 4px 32px var(--color-shadow-strong);
    padding: 28px 32px 22px 32px;
    min-width: 320px;
    max-width: 96vw;
    max-height: 80vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
    animation: slideIn 0.33s;
    font-size: 1.04rem;
}
@media (max-width: 600px) {
    .gherkin-modal-content {
        min-width: 0;
        width: 98vw;
        padding: 18px 4vw 18px 4vw;
    }
}
.gherkin-modal-content label {
    font-weight: 600;
    color: var(--color-accent);
    margin-bottom: 2px;
    font-size: 1.04rem;
    letter-spacing: 0.01em;
}
.gherkin-modal-content input[type="text"],
.gherkin-modal-content input[type="number"],
.gherkin-modal-content textarea,
.gherkin-modal-content select {
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    transition: border 0.2s, background 0.2s;
    border-radius: var(--input-radius);
    border: 1.5px solid var(--color-border);
    font-size: var(--input-font-size);
    margin-bottom: 4px;
    background: var(--color-bg-alt);
    color: var(--color-text);
    padding: 0 12px;
    height: var(--input-height);
    outline: none;
}
.gherkin-modal-content input[type="text"]:focus,
.gherkin-modal-content input[type="number"]:focus,
.gherkin-modal-content textarea:focus,
.gherkin-modal-content select:focus {
    border: 1.5px solid var(--color-primary);
    background: #f1f8ff;
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
}
.gherkin-modal-content button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 22px;
    min-width: var(--btn-min-width);
    height: var(--btn-height);
    background-color: var(--color-primary);
    color: var(--color-text-light);
    border: none;
    border-radius: var(--btn-radius);
    cursor: pointer;
    font-size: var(--btn-font-size);
    font-weight: 600;
    box-shadow: var(--btn-shadow);
    margin: 0 4px 6px 0;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.13s;
    outline: none;
}
.gherkin-modal-content button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.gherkin-modal-content button:hover {
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    transform: scale(1.035);
}
.gherkin-modal-content button:disabled {
    background-color: #cccccc;
    color: #eee;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.gherkin-modal-content .gherkin-btn-danger {
    background: var(--color-danger);
    color: #fff;
}
.gherkin-modal-content .gherkin-btn-danger:hover {
    background: #c0392b;
}
.gherkin-modal-content .gherkin-btn-success {
    background: var(--color-success);
    color: #fff;
}
.gherkin-modal-content .gherkin-btn-success:hover {
    background: #218838;
}
.gherkin-modal-content .gherkin-btn-warning {
    background: var(--color-warning);
    color: #222;
}
.gherkin-modal-content .gherkin-btn-warning:hover {
    background: #e0a800;
}
.gherkin-modal-content .gherkin-feedback {
    margin: 6px 0;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    background: #eafaf1;
    color: #218838;
    border: 1.5px solid #28a745;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    transition: background 0.2s, color 0.2s;
}
.gherkin-modal-content .gherkin-feedback.error {
    background: #fff6f6;
    color: #e74c3c;
    border-color: #e74c3c;
}
.gherkin-modal-content .gherkin-feedback.info {
    background: #f7faff;
    color: #0070f3;
    border-color: #0070f3;
}
.gherkin-modal-content .gherkin-feedback .gherkin-feedback-icon {
    font-size: 1.3em;
    display: inline-block;
    vertical-align: middle;
}
.gherkin-modal-content .gherkin-tip {
    background: #f7faff;
    border-left: 4px solid #0070f3;
    padding: 8px 14px;
    border-radius: 6px;
    color: #0070f3;
    font-size: 0.98rem;
    margin-bottom: 6px;
    margin-top: 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}
.gherkin-modal-content .gherkin-tip .gherkin-tip-icon {
    font-size: 1.2em;
    margin-right: 4px;
    color: #0070f3;
}
.gherkin-modal-content .gherkin-summary {
    background: #f4f7fb;
    border-radius: 7px;
    padding: 8px 12px;
    font-size: 0.98rem;
    color: #222;
    margin-bottom: 8px;
}
.gherkin-modal-content .gherkin-divider {
    border: none;
    border-top: 1px solid #e3e3e3;
    margin: 12px 0 8px 0;
}
@keyframes fadeInModalBg {
    from { opacity: 0; }
    to { opacity: 1; }
}
    --color-shadow: rgba(0,0,0,0.10);
    --color-log-bg: #f1f8ff;
    --color-log-bg-alt: #e3f2fd;
    --color-modal-bg: #fff;
    --color-modal-overlay: rgba(0,0,0,0.25);
    --color-text: #1a2330;
    --color-text-light: #fff;
    --color-muted: #555;
    --color-footer: #aaa;
    --btn-radius: 9px;
    --btn-height: 42px;
    --btn-min-width: 110px;
    --btn-font-size: 1.07rem;
    --btn-shadow: 0 2px 8px rgba(0,112,243,0.08);
    --input-radius: 8px;
    --input-height: 38px;
    --input-font-size: 1rem;
}
.dark-theme {
    --color-bg: #181c24;
    --color-bg-alt: #232837;
    --color-primary: #2196f3;
    --color-primary-dark: #1565c0;
    --color-accent: #90caf9;
    --color-danger: #ef5350;
    --color-success: #66bb6a;
    --color-warning: #ffd600;
    --color-border: #333a4d;
    --color-shadow: rgba(0,0,0,0.45);
    --color-log-bg: #232837;
    --color-log-bg-alt: #1a1d29;
    --color-modal-bg: #232837;
    --color-modal-overlay: rgba(0,0,0,0.55);
    --color-text: #e3f2fd;
    --color-text-light: #fff;
    --color-muted: #b0bec5;
    --color-footer: #607d8b;
}
body, h1 {
    font-family: 'Roboto', Arial, sans-serif;
}
@keyframes slideIn {
    from { transform: translateY(-20px); opacity: 0;}
    to { transform: translateY(0); opacity: 1;}
}
@keyframes fadeInOut {
    0% { opacity: 0;}
    10% { opacity: 1;}
    90% { opacity: 1;}
    100% { opacity: 0;}
}
@keyframes gherkin-spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
}
.gherkin-panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    min-height: 44px;
    padding-bottom: 0;
}
.gherkin-panel-header h3 {
    margin: 0;
    font-size: 0.85rem !important;
    color: var(--color-primary);
    text-align: center;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.08);
}
.button-container-top {
    display: flex;
    gap: 6px;
    align-items: center;
}
.button-container-top button {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    color: var(--color-accent);
    transition: color 0.2s;
    border-radius: var(--btn-radius);
    min-width: 36px;
    min-height: 36px;
    outline: none;
}
.button-container-top button:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.button-container-top button:hover {
    color: var(--color-primary-dark);
}
.gherkin-content {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 2px;
}
.gherkin-content label {
    font-weight: 600;
    color: var(--color-accent);
    margin-bottom: 2px;
    font-size: 1.04rem;
    letter-spacing: 0.01em;
}
.gherkin-content input[type="text"],
.gherkin-content input[type="number"],
.gherkin-content textarea,
.gherkin-content select {
    box-shadow: 0 1px 4px rgba(0,0,0,0.07);
    transition: border 0.2s, background 0.2s;
    border-radius: var(--input-radius);
    border: 1.5px solid var(--color-border);
    font-size: var(--input-font-size);
    margin-bottom: 4px;
    background: var(--color-bg-alt);
    color: var(--color-text);
    padding: 0 12px;
    height: var(--input-height);
    outline: none;
}
.gherkin-content input[type="text"]:focus,
.gherkin-content input[type="number"]:focus,
.gherkin-content textarea:focus,
.gherkin-content select:focus {
    border: 1.5px solid var(--color-primary);
    background: #f1f8ff;
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
}
.gherkin-content button,
.gherkin-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 22px;
    min-width: var(--btn-min-width);
    height: var(--btn-height);
    background-color: var(--color-primary);
    color: var(--color-text-light;
    border: none;
    border-radius: var(--btn-radius);
    cursor: pointer;
    font-size: var(--btn-font-size);
    font-weight: 600;
    box-shadow: var(--btn-shadow);
    margin: 0 4px 6px 0;
    transition: background 0.18s, color 0.18s, box-shadow 0.18s, transform 0.13s;
    outline: none;
}
.gherkin-content button:focus,
.gherkin-btn:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
.gherkin-content button:hover,
.gherkin-btn:hover {
    background-color: var(--color-primary-dark);
    color: var(--color-text-light);
    transform: scale(1.035);
}
.gherkin-content button:disabled,
.gherkin-btn:disabled {
    background-color: #cccccc;
    color: #eee;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}
.gherkin-btn-main {
    background: var(--color-primary);
    color: var(--color-text-light);
    box-shadow: var(--btn-shadow);
}
.gherkin-btn-main:hover, .gherkin-btn-main:focus {
    background: var(--color-primary-dark);
}
.gherkin-btn-danger {
    background: var(--color-danger);
    color: #fff;
}
.gherkin-btn-danger:hover, .gherkin-btn-danger:focus {
    background: #c0392b;
}
.gherkin-btn-success {
    background: var(--color-success);
    color: #fff;
}
.gherkin-btn-success:hover, .gherkin-btn-success:focus {
    background: #218838;
}
.gherkin-btn-warning {
    background: var(--color-warning);
    color: #222;
}
.gherkin-btn-warning:hover, .gherkin-btn-warning:focus {
    background: #e0a800;
}
.gherkin-content hr, .gherkin-divider {
    border: none;
    border-top: 1px solid #e3e3e3;
    margin: 12px 0 8px 0;
}
.gherkin-content input,
.gherkin-content select,
.gherkin-content textarea,
.gherkin-content button {
    margin-bottom: 8px !important;
}
.gherkin-content .gherkin-actions-row {
    display: flex;
    gap: 10px;
    margin: 8px 0 0 0;
    flex-wrap: wrap;
}
.gherkin-content .gherkin-checkbox-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 8px;
}
.gherkin-content .gherkin-checkbox-list label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 400;
    font-size: 1rem;
    color: #222;
    cursor: pointer;
}
.gherkin-content .gherkin-checkbox-list input[type="checkbox"] {
    accent-color: var(--color-primary);
    width: 18px;
    height: 18px;
}
.gherkin-content .gherkin-feedback {
    margin: 6px 0;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    background: #eafaf1;
    color: #218838;
    border: 1.5px solid #28a745;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    transition: background 0.2s, color 0.2s;
}
.gherkin-content .gherkin-feedback.error {
    background: #fff6f6;
    color: #e74c3c;
    border-color: #e74c3c;
}
.gherkin-content .gherkin-feedback.info {
    background: #f7faff;
    color: #0070f3;
    border-color: #0070f3;
}
.gherkin-content .gherkin-feedback .gherkin-feedback-icon {
    font-size: 1.3em;
    display: inline-block;
    vertical-align: middle;
}
.gherkin-content .gherkin-tip {
    background: #f7faff;
    border-left: 4px solid #0070f3;
    padding: 8px 14px;
    border-radius: 6px;
    color: #0070f3;
    font-size: 0.98rem;
    margin-bottom: 6px;
    margin-top: 0;
    display: flex;
    align-items: flex-start;
    gap: 8px;
}
.gherkin-content .gherkin-tip .gherkin-tip-icon {
    font-size: 1.2em;
    margin-right: 4px;
    color: #0070f3;
}
.gherkin-content .gherkin-summary {
    background: #f9fbfd;
    border: 1.5px solid #e0e6ed;
    border-radius: 8px;
    padding: 10px 14px;
    margin-bottom: 8px;
    font-size: 0.98rem;
    color: #222;
    max-height: 140px;
    overflow-y: auto;
}
.gherkin-content .gherkin-summary-title {
    font-weight: 600;
    color: #0070f3;
    margin-bottom: 4px;
    font-size: 1.05rem;
}
.gherkin-content .gherkin-summary-list {
    list-style: disc inside;
    margin: 0;
    padding: 0 0 0 10px;
}
.gherkin-content .gherkin-summary-list li {
    margin-bottom: 2px;
    font-size: 0.97rem;
}
.gherkin-content .gherkin-footer {
    text-align: right;
    font-size: 0.92rem;
    color: #888;
    margin-top: 8px;
    margin-bottom: 2px;
}
.feedback, .gherkin-panel-content .gherkin-feedback {
    position: fixed;
    left: 50%;
    bottom: 32px;
    transform: translateX(-50%);
    z-index: 2147483647;
    background: #0D47A1;
    color: #fff;
    border-radius: 8px;
    padding: 14px 28px 14px 18px;
    font-size: 16px;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.13);
    animation: fadeInOut 3s ease;
    display: flex;
    align-items: center;
    gap: 12px;
}
.feedback .gherkin-feedback-close {
    margin-left: 18px;
    background: none;
    border: none;
    color: #fff;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.2s;
}
.feedback .gherkin-feedback-close:hover {
    opacity: 1;
}
.gherkin-spinner {
    border: 4px solid #e3e3e3;
    border-top: 4px solid #007bff;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    animation: gherkin-spin 1s linear infinite;
    margin: 0 auto;
    display: block;
}
#gherkin-panel, .gherkin-panel {
    position: fixed;
    top: 10px;
    left: 10px;
    width: 480px;
    max-width: 540px;
    min-width: 320px;
    height: 92vh;
    max-height: 100vh;
    background-color: var(--color-bg);
    border: 1.5px solid var(--color-border);
    border-radius: 16px;
    box-shadow: 0 8px 24px var(--color-shadow);
    padding: 18px 14px 24px 14px;
    z-index: 10000;
    font-family: 'Roboto', Arial, sans-serif;
    transition: opacity 0.3s, transform 0.3s, background 0.3s;
    transform: translateY(0);
    animation: slideIn 0.5s;
    color: var(--color-text);
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}
@media (max-width: 600px) {
    #gherkin-panel, .gherkin-panel {
        left: 0 !important;
        top: 0 !important;
        width: 100vw !important;
        min-width: 0 !important;
        max-width: 100vw !important;
        height: 100vh !important;
        max-height: 100vh !important;
        border-radius: 0 !important;
        padding: 8px 2vw 16px 2vw !important;
    }
    .gherkin-content {
        padding: 0 2vw !important;
    }
    #gherkin-panel #gherkin-log {
        max-height: 30vh !important;
    }
    .gherkin-content button, .gherkin-btn {
        min-width: 90px;
        font-size: 0.98rem;
        height: 38px;
        padding: 0 12px;
    }
    .gherkin-content input[type="text"],
    .gherkin-content input[type="number"],
    .gherkin-content textarea,
    .gherkin-content select {
        font-size: 0.97rem;
        height: 34px;
        padding: 0 8px;
    }
}
#gherkin-footer {
    font-size: 10px;
    color: var(--color-footer);
    text-align: right;
    margin: 0;
    position: absolute;
    bottom: -20px;
    right: 10px;
}
#gherkin-panel-minimized {
    position: fixed;
    left: 18px;
    bottom: 18px;
    width: 54px;
    height: 54px;
    background: #0070f3;
    color: #fff;
    border-radius: 50%;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    cursor: pointer;
    font-size: 2.2em;
    border: none;
    transition: background 0.2s;
}
#gherkin-panel-minimized:focus {
    outline: 2px solid #fff;
}
.dark-theme .feedback, .dark-theme .gherkin-panel-content .gherkin-feedback {
    background: #2196f3;
    color: #fff;
}
.dark-theme #gherkin-panel-minimized {
    background: #2196f3;
    color: #fff;
}
`;
    document.head.appendChild(style);
})();




// Função para exibir modal de upload de arquivos de evidência
function showUploadModal(callback) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Upload de arquivos de evidência');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    // Título
    const title = document.createElement('div');
    title.textContent = 'Upload de arquivos de evidência';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    title.id = 'gherkin-modal-title';
    modal.setAttribute('aria-labelledby', 'gherkin-modal-title');
    modal.appendChild(title);
    // Lista dinâmica de arquivos
    const filesContainer = document.createElement('div');
    filesContainer.style.display = 'flex';
    filesContainer.style.flexDirection = 'column';
    filesContainer.style.gap = '8px';
    filesContainer.style.width = '100%';
    modal.appendChild(filesContainer);
    // Função para adicionar campo
    function addFileInput(value = '') {
        const fileRow = document.createElement('div');
        fileRow.style.display = 'flex';
        fileRow.style.gap = '8px';
        fileRow.style.alignItems = 'center';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Ex: evidencia_texto.txt';
        input.value = value;
        input.style.flex = '1';
        input.autocomplete = 'off';
        input.setAttribute('aria-label', 'Nome do arquivo de evidência');
        input.tabIndex = 0;
        fileRow.appendChild(input);
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remover';
        removeBtn.className = 'gherkin-btn gherkin-btn-danger';
        removeBtn.setAttribute('aria-label', 'Remover arquivo de evidência');
        removeBtn.tabIndex = 0;
        removeBtn.onclick = () => {
            filesContainer.removeChild(fileRow);
        };
        fileRow.appendChild(removeBtn);
        filesContainer.appendChild(fileRow);
    }
    // Adiciona pelo menos um campo
    addFileInput();
    // Botão para adicionar mais arquivos
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.textContent = 'Adicionar outro arquivo';
    addBtn.className = 'gherkin-btn gherkin-btn-success';
    addBtn.setAttribute('aria-label', 'Adicionar outro arquivo de evidência');
    addBtn.tabIndex = 0;
    addBtn.onclick = () => addFileInput();
    modal.appendChild(addBtn);
    // Botões de ação
    const actionsRow = document.createElement('div');
    actionsRow.style.display = 'flex';
    actionsRow.style.gap = '12px';
    actionsRow.style.marginTop = '18px';
    // Botão OK
    const okBtn = document.createElement('button');
    okBtn.type = 'button';
    okBtn.textContent = 'OK';
    okBtn.className = 'gherkin-btn gherkin-btn-main';
    okBtn.setAttribute('aria-label', 'Confirmar upload de arquivos');
    okBtn.tabIndex = 0;
    okBtn.onclick = () => {
        const nomesArquivos = Array.from(filesContainer.querySelectorAll('input[type="text"]'))
            .map(input => input.value.trim())
            .filter(v => v);
        if (nomesArquivos.length === 0) {
            alert('Informe pelo menos um nome de arquivo!');
            return;
        }
        callback(nomesArquivos);
        modalBg.remove();
    };
    actionsRow.appendChild(okBtn);
    // Botão Cancelar
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'gherkin-btn gherkin-btn-danger';
    cancelBtn.setAttribute('aria-label', 'Cancelar upload de arquivos');
    cancelBtn.tabIndex = 0;
    cancelBtn.onclick = () => modalBg.remove();
    actionsRow.appendChild(cancelBtn);
    modal.appendChild(actionsRow);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('input, button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// Função para criar o painel e renderizar o conteúdo inicial
function createPanel() {
    const oldPanel = document.getElementById('gherkin-panel');
    if (oldPanel) oldPanel.remove();
    const panel = document.createElement('div');
    panel.id = 'gherkin-panel';
    panel.className = 'gherkin-panel';
    panel.style.position = 'fixed';
    panel.style.top = '10px';
    panel.style.left = '10px';
    panel.style.width = '480px';
    panel.style.height = '700px';
    panel.style.background = '#ffffff';
    panel.style.border = '1px solid #ccc';
    panel.style.borderRadius = '12px';
    panel.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.2)';
    panel.style.padding = '10px';
    panel.style.zIndex = '10000';
    panel.style.fontFamily = 'Roboto, Arial, sans-serif';
    panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Painel Gherkin Generator');
    panel.tabIndex = -1;
    panel.style.resize = 'none';
    panel.style.overflow = 'visible'; // Permite handle sair da borda
    renderPanelContent(panel);
    // Handle de resize aprimorado
    const resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.right = '-6px';
    resizeHandle.style.bottom = '-6px';
    resizeHandle.style.width = '28px';
    resizeHandle.style.height = '28px';
    resizeHandle.style.cursor = 'nwse-resize';
    resizeHandle.style.background = 'rgba(0,0,0,0.07)';
    resizeHandle.style.borderRadius = '6px';
    resizeHandle.style.display = 'flex';
    resizeHandle.style.alignItems = 'flex-end';
    resizeHandle.style.justifyContent = 'flex-end';
    resizeHandle.style.zIndex = '10001';
    resizeHandle.setAttribute('aria-label', 'Redimensionar painel');
    resizeHandle.tabIndex = 0;
    resizeHandle.innerHTML = '<svg width="22" height="22" aria-hidden="true" focusable="false" style="pointer-events:none"><polyline points="6,20 20,20 20,6" style="fill:none;stroke:#0070f3;stroke-width:2"/></svg>';
    panel.appendChild(resizeHandle);
    // Redimensionamento
    let resizing = false;
    let startX, startY, startWidth, startHeight;
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        resizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(panel).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(panel).height, 10);
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'nwse-resize';
    });
    document.addEventListener('mousemove', (e) => {
        if (!resizing) return;
        let newWidth = startWidth + (e.clientX - startX);
        let newHeight = startHeight + (e.clientY - startY);
        newWidth = Math.max(320, Math.min(newWidth, window.innerWidth - 20));
        newHeight = Math.max(320, Math.min(newHeight, window.innerHeight - 20));
        panel.style.width = newWidth + 'px';
        panel.style.height = newHeight + 'px';
    });
    document.addEventListener('mouseup', () => {
        if (resizing) {
            resizing = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }
    });
    // Acessibilidade: resize via teclado (setas)
    resizeHandle.addEventListener('keydown', (e) => {
        let w = parseInt(panel.style.width, 10);
        let h = parseInt(panel.style.height, 10);
        if (e.key === 'ArrowRight') { panel.style.width = (w + 20) + 'px'; e.preventDefault(); }
        if (e.key === 'ArrowLeft') { panel.style.width = (w - 20) + 'px'; e.preventDefault(); }
        if (e.key === 'ArrowDown') { panel.style.height = (h + 20) + 'px'; e.preventDefault(); }
        if (e.key === 'ArrowUp') { panel.style.height = (h - 20) + 'px'; e.preventDefault(); }
    });
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = panel.querySelectorAll('input, button, select, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        panel.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                panel.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
    document.body.appendChild(panel);
    return panel;
}

// Função única para renderizar o conteúdo do painel conforme o estado
function renderPanelContent(panel) {
    let html = '';
    html += `
        <div class="gherkin-panel-header">
            <h3>GERADOR DE TESTES AUTOMATIZADOS EM PYTHON. v1.0</h3>
            <div class="button-container-top">
                <button id="gherkin-highlight-toggle" title="Selecionar elemento na página" style="background:none; border:none; cursor:pointer; font-size:1.2rem; padding:2px 6px;">
                    <span id="gherkin-highlight-icon" style="display:inline-block; vertical-align:middle;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="#00bfff" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" stroke="#00bfff" stroke-width="2" fill="none"/>
                            <path d="M12 7v5l3 3" stroke="#00bfff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </button>
                <button id="gherkin-reopen" title="Reabrir" style="display: none;">Abrir</button>
                <button id="gherkin-minimize" title="Minimizar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#ffc107" viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button id="gherkin-close" title="Fechar">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="#dc3545" viewBox="0 0 24 24"><path d="M18.3 5.71L12 12l6.3 6.29-1.42 1.42L12 13.41l-6.29 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3z"/></svg>
                </button>
            </div>
        </div>
    `;
    if (window.gherkinPanelState === 'feature') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1;">
                <label for="feature-name">Informe o nome da Feature:</label>
                <input id="feature-name" type="text" placeholder="Ex: Login" />
                <button id="start-feature" class="gherkin-btn gherkin-btn-main">Iniciar Feature</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'cenario') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1;">
                <label for="cenario-name">Informe o nome do Cenário:</label>
                <input id="cenario-name" type="text" placeholder="Ex: Login com sucesso" />
                <button id="start-cenario" class="gherkin-btn gherkin-btn-main">Iniciar Cenário</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'gravando') {
        html += `
            <div class="gherkin-content gherkin-content-flex" style="flex:1; min-height:0; display:flex; flex-direction:column; gap:0;">
                <div class="gherkin-status-bar" style="display:flex; align-items:center; gap:12px; font-size:0.98rem; background:#f7faff; border-radius:6px; padding:6px 10px; margin-bottom:6px; min-height:36px;">
                    <span id="gherkin-status" style="color:#555; font-weight:500;">${window.isPaused ? 'Status: Pausado' : 'Status: Gravando'}</span>
                    <span style="color:#0D47A1; font-weight:600;">${window.currentFeature ? 'Feature: ' + window.currentFeature.name : ''}</span>
                    <span style="color:#0070f3; font-weight:600;">${window.currentCenario ? 'Cenário: ' + window.currentCenario.name : ''}</span>
                    <span id="gherkin-timer" style="margin-left:auto; color:#555;">${window.elapsedSeconds !== undefined ? 'Tempo: ' + (window.gherkinTimerText || '00:00') : ''}</span>
                </div>
                <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                    <label for="gherkin-action-select" style="margin:0; font-size:0.98rem;">Ação:</label>
                    <select id="gherkin-action-select" style="flex:1; min-width:120px; max-width:220px;">
                        <optgroup label="Ações">
                            <option value="clica">Clicar</option>
                            <option value="altera">Alterar</option>
                            <option value="preenche">Preencher</option>
                            <option value="seleciona">Selecionar</option>
                            <option value="radio">Botão de rádio</option>
                            <option value="caixa">Caixa de seleção</option>
                            <option value="navega">Navegar</option>
                            <option value="login">Login</option>
                            <option value="upload">Upload de arquivo</option>
                            <option value="valida_url">Validar URL da página</option>
                        </optgroup>
                        <optgroup label="Validações">
                            <option value="valida_existe">Validar que existe</option>
                            <option value="valida_nao_existe">Validar que não existe</option>
                            <option value="valida_contem">Validar que contém</option>
                            <option value="valida_nao_contem">Validar que não contém</option>
                            <option value="valida_deve_ser">Validar que deve ser</option>
                            <option value="valida_nao_deve_ser">Validar que não deve ser</option>
                        </optgroup>
                        <optgroup label="Esperas">
                            <option value="espera_segundos">Esperar segundos</option>
                            <option value="espera_elemento">Esperar elemento aparecer</option>
                            <option value="espera_nao_existe">Esperar elemento desaparecer</option>
                            <option value="espera_existe">Esperar que o elemento exista</option>
                            <option value="espera_habilitado">Esperar que o elemento esteja habilitado</option>
                            <option value="espera_desabilitado">Esperar que o elemento esteja desabilitado</option>
                        </optgroup>
                    </select>
                    <div id="gherkin-action-params" style="flex:2;"></div>
                </div>
                <div id="gherkin-log" style="flex:1 1 0; min-height:0; margin-bottom:8px; border:1px solid #ccc; border-radius:8px; background-color:#f9f9f9; display:flex; flex-direction:column;"></div>
                <div class="gherkin-actions-bar" style="display:flex; flex-wrap:wrap; gap:8px; margin-top:auto; justify-content:center; align-items:center; width:100%; padding-top:4px;">
                    <button id="end-cenario" class="gherkin-btn gherkin-btn-danger" style="min-width:90px; height:34px; font-size:0.98rem;">Encerrar Cenário</button>
                    <button id="end-feature" class="gherkin-btn" style="background:#6c757d; color:#fff; min-width:90px; height:34px; font-size:0.98rem;" disabled>Encerrar Feature</button>
                    <button id="gherkin-pause" class="gherkin-btn gherkin-btn-warning" style="min-width:90px; height:34px; font-size:0.98rem;">Pausar</button>
                    <button id="gherkin-clear" class="gherkin-btn gherkin-btn-danger" style="min-width:90px; height:34px; font-size:0.98rem;">Limpar</button>
                    <button id="gherkin-export" class="gherkin-btn gherkin-btn-main" style="min-width:90px; height:34px; font-size:0.98rem;">Exportar</button>
                </div>
            </div>
        `;
    } else if (window.gherkinPanelState === 'exportar') {
        html += `<div class="gherkin-content" style="padding: 10px; flex:1;">
            <h4 style="color: #0D47A1; font-size: 1.13rem; font-weight: 700; margin-bottom: 8px;">Selecione as features para exportar:</h4>
            <form id="export-form" style="max-height: 250px; overflow-y: auto; margin-bottom: 10px;">`;
        window.gherkinFeatures.forEach((feature, idx) => {
            html += `<div style='margin-bottom: 6px;'><input type='checkbox' id='feature-export-${idx}' name='feature-export' value='${idx}'><label for='feature-export-${idx}' style='margin-left: 8px;'>${feature.name}</label></div>`;
        });
        html += `</form>
            <div style="display: flex; gap: 10px; margin-top: 2px;">
                <button id="export-selected" class="gherkin-btn gherkin-btn-main">Exportar Selecionadas</button>
                <button id="new-feature" class="gherkin-btn gherkin-btn-success">Nova Feature</button>
            </div>
        </div>`;
    }
    html += `<p id="gherkin-footer">By: Matheus Ferreira de Oliveira</p>`;
    panel.innerHTML = html;
}
// Modal para login
function showLoginModal() {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Marcar ação como Login');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '10003';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    const title = document.createElement('div');
    title.textContent = 'Marcar ação como Login';
    title.style.fontSize = '17px';
    title.style.color = '#0D47A1';
    title.style.textAlign = 'center';
    title.id = 'gherkin-login-title';
    modal.setAttribute('aria-labelledby', 'gherkin-login-title');
    modal.appendChild(title);
    const userLabel = document.createElement('label');
    userLabel.textContent = 'Usuário/Email:';
    userLabel.style.fontWeight = 'bold';
    userLabel.style.marginBottom = '4px';
    userLabel.setAttribute('for', 'gherkin-login-user');
    modal.appendChild(userLabel);
    const userInput = document.createElement('input');
    userInput.type = 'text';
    userInput.id = 'gherkin-login-user';
    userInput.style.width = '100%';
    userInput.style.padding = '7px';
    userInput.style.borderRadius = '5px';
    userInput.style.border = '1px solid #ccc';
    userInput.style.fontSize = '14px';
    userInput.setAttribute('aria-label', 'Usuário ou Email');
    userInput.tabIndex = 0;
    modal.appendChild(userInput);
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Senha:';
    passLabel.style.fontWeight = 'bold';
    passLabel.style.marginBottom = '4px';
    passLabel.setAttribute('for', 'gherkin-login-pass');
    modal.appendChild(passLabel);
    const passInput = document.createElement('input');
    passInput.type = 'password';
    passInput.id = 'gherkin-login-pass';
    passInput.style.width = '100%';
    passInput.style.padding = '7px';
    passInput.style.borderRadius = '5px';
    passInput.style.border = '1px solid #ccc';
    passInput.style.fontSize = '14px';
    passInput.setAttribute('aria-label', 'Senha');
    passInput.tabIndex = 0;
    modal.appendChild(passInput);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    btns.style.marginTop = '12px';
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Salvar Login';
    saveBtn.setAttribute('aria-label', 'Salvar Login');
    saveBtn.tabIndex = 0;
    saveBtn.style.background = '#007bff';
    saveBtn.style.color = '#fff';
    saveBtn.style.border = 'none';
    saveBtn.style.borderRadius = '6px';
    saveBtn.style.padding = '8px 22px';
    saveBtn.style.fontSize = '15px';
    saveBtn.style.fontWeight = 'bold';
    saveBtn.style.cursor = 'pointer';
    saveBtn.onclick = () => {
        const usuario = userInput.value.trim();
        const senha = passInput.value;
        if (!usuario || !senha) {
            showFeedback('Preencha usuário e senha!', 'error');
            return;
        }
        window.interactions.push({
            step: 'Given',
            acao: 'login',
            acaoTexto: 'Login',
            nomeElemento: usuario,
            valorPreenchido: senha,
            timestamp: Date.now()
        });
        saveInteractionsToStorage();
        renderLogWithActions();
        modalBg.remove();
        showFeedback('Ação de login registrada!', 'success');
    };
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.setAttribute('aria-label', 'Cancelar login');
    cancelBtn.tabIndex = 0;
    cancelBtn.style.background = '#dc3545';
    cancelBtn.style.color = '#fff';
    cancelBtn.style.border = 'none';
    cancelBtn.style.borderRadius = '6px';
    cancelBtn.style.padding = '8px 22px';
    cancelBtn.style.fontSize = '15px';
    cancelBtn.style.fontWeight = 'bold';
    cancelBtn.style.cursor = 'pointer';
    cancelBtn.onclick = () => modalBg.remove();
    btns.appendChild(saveBtn);
    btns.appendChild(cancelBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('input, button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// Função utilitária para exibir modal de confirmação
function showModal(message, onYes, onNo) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Confirmação');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '10001';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '17px';
    msg.style.color = '#0D47A1';
    msg.style.textAlign = 'center';
    msg.id = 'gherkin-modal-confirm-title';
    modal.setAttribute('aria-labelledby', 'gherkin-modal-confirm-title');
    modal.appendChild(msg);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Sim';
    yesBtn.setAttribute('aria-label', 'Confirmar');
    yesBtn.tabIndex = 0;
    yesBtn.style.background = '#007bff';
    yesBtn.style.color = '#fff';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '6px';
    yesBtn.style.padding = '8px 22px';
    yesBtn.style.fontSize = '15px';
    yesBtn.style.fontWeight = 'bold';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
        modalBg.remove();
        if (onYes) onYes();
    };
    const noBtn = document.createElement('button');
    noBtn.textContent = 'Não';
    noBtn.setAttribute('aria-label', 'Cancelar');
    noBtn.tabIndex = 0;
    noBtn.style.background = '#dc3545';
    noBtn.style.color = '#fff';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '6px';
    noBtn.style.padding = '8px 22px';
    noBtn.style.fontSize = '15px';
    noBtn.style.fontWeight = 'bold';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => {
        modalBg.remove();
        if (onNo) onNo();
    };
    btns.appendChild(yesBtn);
    btns.appendChild(noBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// Exibe detalhes de uma interação em um modal, incluindo contexto Shadow DOM/Iframe
function showLogDetailsModal(interaction) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Detalhes da Interação');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '2147483647';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    modal.style.minWidth = '340px';
    modal.style.maxWidth = '96vw';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.position = 'relative';
    const title = document.createElement('div');
    title.textContent = 'Detalhes da Interação';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.style.color = '#0D47A1';
    title.style.marginBottom = '10px';
    title.id = 'gherkin-modal-details-title';
    modal.setAttribute('aria-labelledby', 'gherkin-modal-details-title');
    modal.appendChild(title);
    // Tabela de detalhes
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.fontSize = '1rem';
    table.style.marginBottom = '10px';
    table.innerHTML = `
        <tr><td style='font-weight:bold;'>Ação:</td><td>${(window.ACTION_META && window.ACTION_META[interaction.acao]?.label) || interaction.acao || ''}</td></tr>
        <tr><td style='font-weight:bold;'>Elemento:</td><td>${interaction.nomeElemento || ''}</td></tr>
        <tr><td style='font-weight:bold;'>Valor:</td><td>${interaction.valorPreenchido || interaction.nomeArquivo || ''}</td></tr>
        <tr><td style='font-weight:bold;'>CSS Selector:</td><td><code>${typeof interaction.cssSelector === 'object' ? interaction.cssSelector?.css : interaction.cssSelector || ''}</code></td></tr>
        <tr><td style='font-weight:bold;'>XPath:</td><td><code>${typeof interaction.xpath === 'object' ? interaction.xpath?.xpath : interaction.xpath || ''}</code></td></tr>
    `;
    modal.appendChild(table);

    // Indicação de contexto Shadow DOM/Iframe
    if (interaction.containerType === 'iframe' || interaction.containerType === 'shadow') {
        const ctxDiv = document.createElement('div');
        ctxDiv.style.background = interaction.containerType === 'iframe' ? '#e3f2fd' : '#fffde7';
        ctxDiv.style.color = interaction.containerType === 'iframe' ? '#1565c0' : '#bfa100';
        ctxDiv.style.padding = '10px 14px';
        ctxDiv.style.borderRadius = '7px';
        ctxDiv.style.marginBottom = '10px';
        ctxDiv.style.fontWeight = 'bold';
        ctxDiv.style.display = 'flex';
        ctxDiv.style.alignItems = 'center';
        ctxDiv.style.gap = '10px';
        ctxDiv.innerHTML = `
            <span style="font-size:1.3em;">${interaction.containerType === 'iframe' ? '🖼️' : '🌑'}</span>
            <span>
                ${interaction.containerType === 'iframe' ? 'Elemento dentro de <b>iframe</b>' : 'Elemento dentro de <b>Shadow DOM</b>'}
                ${interaction.containerElementName ? `<br><span style='font-weight:normal;'>Container: <code>${interaction.containerElementName}</code></span>` : ''}
                ${interaction.containerXpath ? `<br><span style='font-weight:normal;'>XPath do container: <code>${typeof interaction.containerXpath === 'object' ? interaction.containerXpath?.xpath : interaction.containerXpath}</code></span>` : ''}
            </span>
        `;
        modal.appendChild(ctxDiv);
    }

    // Timestamp
    if (interaction.timestamp) {
        const ts = document.createElement('div');
        const date = new Date(interaction.timestamp);
        ts.textContent = 'Registrado em: ' + date.toLocaleString();
        ts.style.fontSize = '0.97em';
        ts.style.color = '#888';
        ts.style.marginBottom = '8px';
        modal.appendChild(ts);
    }

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.className = 'gherkin-btn gherkin-btn-danger';
    closeBtn.setAttribute('aria-label', 'Fechar detalhes da interação');
    closeBtn.tabIndex = 0;
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// Pilhas globais para Undo/Redo
if (!window.gherkinUndoStack) window.gherkinUndoStack = [];
if (!window.gherkinRedoStack) window.gherkinRedoStack = [];

// Funções Undo/Redo
function undoInteraction() {
    if (window.interactions && window.interactions.length > 0) {
        const last = window.interactions.pop();
        window.gherkinUndoStack.push(last);
        window.gherkinRedoStack.push(last);
        if (typeof saveInteractionsToStorage === 'function') saveInteractionsToStorage();
        renderLogWithActions();
    }
}
function redoInteraction() {
    if (window.gherkinRedoStack && window.gherkinRedoStack.length > 0) {
        const redo = window.gherkinRedoStack.pop();
        window.interactions.push(redo);
        if (typeof saveInteractionsToStorage === 'function') saveInteractionsToStorage();
        renderLogWithActions();
    }
}

// Adiciona botões Undo/Redo ao painel de log
function addUndoRedoButtons() {
    const log = document.getElementById('gherkin-log');
    if (!log) return;
    let btnRow = document.getElementById('gherkin-undo-redo-row');
    if (!btnRow) {
        btnRow = document.createElement('div');
        btnRow.id = 'gherkin-undo-redo-row';
        btnRow.style.display = 'flex';
        btnRow.style.gap = '8px';
        btnRow.style.margin = '6px 0 8px 0';
        log.prepend(btnRow);
    } else {
        btnRow.innerHTML = '';
    }
    // Botão Undo
    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Desfazer';
    undoBtn.className = 'gherkin-btn gherkin-btn-warning';
    undoBtn.disabled = !(window.interactions && window.interactions.length > 0);
    undoBtn.onclick = () => {
        undoInteraction();
    };
    btnRow.appendChild(undoBtn);
    // Botão Redo
    const redoBtn = document.createElement('button');
    redoBtn.textContent = 'Refazer';
    redoBtn.className = 'gherkin-btn gherkin-btn-success';
    redoBtn.disabled = !(window.gherkinRedoStack && window.gherkinRedoStack.length > 0);
    redoBtn.onclick = () => {
        redoInteraction();
    };
    btnRow.appendChild(redoBtn);
}

// Modifica renderLogWithActions para incluir os botões Undo/Redo
const originalRenderLogWithActions = renderLogWithActions;
renderLogWithActions = function() {
    originalRenderLogWithActions.apply(this, arguments);
    addUndoRedoButtons();
}

// Adaptação dinâmica dos parâmetros de ação
function updateActionParams(panel) {
    // Seletores dos elementos
    const actionSelect = panel.querySelector('#gherkin-action-select');
    const paramsDiv = panel.querySelector('#gherkin-action-params');
    if (!actionSelect || !paramsDiv) return;

    // Dicas contextuais para cada ação
    const dicas = {
        'clica': 'Clique no elemento que deseja registrar o clique.',
        'altera': 'Clique no elemento que deseja alterar.',
        'preenche': 'Clique em um campo de texto e preencha. O valor será registrado automaticamente.',
        'seleciona': 'Clique no campo de seleção desejado.',
        'radio': 'Clique no botão de rádio desejado.',
        'caixa': 'Clique na caixa de seleção desejada.',
        'navega': 'Navegue para a página desejada.',
        'login': 'Preencha os campos de usuário/email e senha na página. Clique no botão abaixo para marcar como login.';
        'upload': 'Clique em um campo de upload na página ou informe o nome do arquivo de exemplo.',
        'valida_existe': 'Clique no elemento que deseja validar que existe.',
        'valida_nao_existe': 'Clique no elemento que deseja validar que não existe.',
        'valida_contem': 'Clique no elemento que deseja validar o conteúdo.',
        'valida_nao_contem': 'Clique no elemento que deseja validar que não contém determinado conteúdo.',
        'valida_deve_ser': 'Clique no elemento que deseja validar o valor.',
        'valida_nao_deve_ser': 'Clique no elemento que deseja validar que não deve ser determinado valor.',
        'espera_segundos': 'Informe o tempo de espera em segundos.',
        'espera_elemento': 'Clique no elemento que deseja aguardar aparecer.',
        'espera_nao_existe': 'Clique no elemento que deseja aguardar desaparecer.',
        'espera_existe': 'Clique no elemento que deseja aguardar que exista.',
        'espera_habilitado': 'Clique no elemento que deseja aguardar que esteja habilitado.',
        'espera_desabilitado': 'Clique no elemento que deseja aguardar que esteja desabilitado.'
    };

    paramsDiv.innerHTML = '';

    const dica = dicas[actionSelect.value] || '';
    if (dica) {
        const dicaDiv = document.createElement('div');
        dicaDiv.textContent = dica;
        dicaDiv.style.background = '#e3f2fd';
        dicaDiv.style.color = '#1565c0';
        dicaDiv.style.padding = '7px 10px';
        dicaDiv.style.borderRadius = '5px';
        dicaDiv.style.fontSize = '13px';
        dicaDiv.style.marginBottom = '8px';
        paramsDiv.appendChild(dicaDiv);
    }

    if (actionSelect.value === 'espera_segundos') {
        // Campo para segundos
        const label = document.createElement('label');
        label.textContent = 'Tempo de espera (segundos):';
        label.style.fontWeight = 'bold';
        label.style.marginBottom = '4px';
        label.setAttribute('for', 'gherkin-wait-seconds');
        paramsDiv.appendChild(label);
        const input = document.createElement('input');
        input.type = 'number';
        input.id = 'gherkin-wait-seconds';
        input.min = '1';
        input.value = '1';
        input.style.width = '100%';
        input.style.padding = '7px';
        input.style.borderRadius = '5px';
        input.style.border = '1px solid #ccc';
        input.style.fontSize = '14px';
        input.style.marginBottom = '8px';
        paramsDiv.appendChild(input);
    } else if (actionSelect.value === 'preenche') {
        // Feedback visual para o usuário saber que deve preencher um campo na página
        const info = document.createElement('div');
        info.textContent = 'Clique em um campo de texto na página e preencha. O valor será registrado automaticamente.';
        info.style.background = '#fffde7';
        info.style.color = '#bfa100';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    } else if (actionSelect.value === 'login') {
        // Orientação para login
        const info = document.createElement('div');
        info.textContent = 'Preencha os campos de usuário/email e senha na página. Clique no botão abaixo para marcar como login.';
        info.style.background = '#e3f2fd';
        info.style.color = '#1565c0';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
        const btn = document.createElement('button');
        btn.textContent = 'Marcar ação como login';
        btn.style.background = '#007bff';
        btn.style.color = '#fff';
        btn.style.border = 'none';
        btn.style.borderRadius = '6px';
        btn.style.padding = '8px 22px';
        btn.style.fontSize = '15px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.onclick = () => {
            showLoginModal();
        };
        paramsDiv.appendChild(btn);
    } else if (actionSelect.value.startsWith('valida_')) {
        // Orientação para validação
        const info = document.createElement('div');
        info.textContent = 'Clique no elemento que deseja validar na página.';
        info.style.background = '#e8f5e9';
        info.style.color = '#388e3c';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    } else if (actionSelect.value.startsWith('espera_') && actionSelect.value !== 'espera_segundos') {
        // Orientação para espera inteligente
        const info = document.createElement('div');
        if (actionSelect.value === 'espera_elemento') {
            info.textContent = 'Clique no elemento que deseja aguardar aparecer na página.';
        } else if (actionSelect.value === 'espera_nao_existe') {
            info.textContent = 'Clique no elemento que deseja aguardar desaparecer da página.';
        } else {
            info.textContent = 'Clique no elemento que deseja aguardar na página.';
        }
        info.style.background = '#fff3e0';
        info.style.color = '#e65100';
        info.style.padding = '7px 10px';
        info.style.borderRadius = '5px';
        info.style.fontSize = '13px';
        info.style.marginBottom = '8px';
        paramsDiv.appendChild(info);
    }
}

// Função para tornar o painel movível para qualquer lugar do navegador
function makePanelDraggable(panel) {
    let isDragging = false;
    let offsetX, offsetY;

    // Permite arrastar apenas pelo cabeçalho do painel
    let header = panel.querySelector('.gherkin-panel-header');
    if (!header) {
        // fallback para o seletor antigo, caso não tenha sido atualizado
        header = panel.querySelector('div[style*="display: flex"][style*="justify-content: space-between"]') || panel;
    }

    function onMouseDown(event) {
        // Só inicia o drag se for no header e não em botões
        if (event.target.closest('.button-container-top')) return;
        if (event.button !== 0) return; // Apenas botão esquerdo
        isDragging = true;
        offsetX = event.clientX - panel.getBoundingClientRect().left;
        offsetY = event.clientY - panel.getBoundingClientRect().top;
        panel.style.cursor = 'move';
        document.body.style.userSelect = 'none';
    }

    function onMouseMove(event) {
        if (!isDragging) return;
        panel.style.left = `${event.clientX - offsetX}px`;
        panel.style.top = `${event.clientY - offsetY}px`;
        panel.style.right = 'auto';
        panel.style.bottom = 'auto';
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            panel.style.cursor = 'default';
            document.body.style.userSelect = '';
        }
    }

    // Remove listeners antigos para evitar múltiplos binds
    header.removeEventListener('mousedown', onMouseDown);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);

    header.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

// Função utilitária para exibir modal de confirmação
function showModal(message, onYes, onNo) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Confirmação');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '10001';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '17px';
    msg.style.color = '#0D47A1';
    msg.style.textAlign = 'center';
    msg.id = 'gherkin-modal-confirm-title';
    modal.setAttribute('aria-labelledby', 'gherkin-modal-confirm-title');
    modal.appendChild(msg);
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '18px';
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Sim';
    yesBtn.setAttribute('aria-label', 'Confirmar');
    yesBtn.tabIndex = 0;
    yesBtn.style.background = '#007bff';
    yesBtn.style.color = '#fff';
    yesBtn.style.border = 'none';
    yesBtn.style.borderRadius = '6px';
    yesBtn.style.padding = '8px 22px';
    yesBtn.style.fontSize = '15px';
    yesBtn.style.fontWeight = 'bold';
    yesBtn.style.cursor = 'pointer';
    yesBtn.onclick = () => {
        modalBg.remove();
        if (onYes) onYes();
    };
    const noBtn = document.createElement('button');
    noBtn.textContent = 'Não';
    noBtn.setAttribute('aria-label', 'Cancelar');
    noBtn.tabIndex = 0;
    noBtn.style.background = '#dc3545';
    noBtn.style.color = '#fff';
    noBtn.style.border = 'none';
    noBtn.style.borderRadius = '6px';
    noBtn.style.padding = '8px 22px';
    noBtn.style.fontSize = '15px';
    noBtn.style.fontWeight = 'bold';
    noBtn.style.cursor = 'pointer';
    noBtn.onclick = () => {
        modalBg.remove();
        if (onNo) onNo();
    };
    btns.appendChild(yesBtn);
    btns.appendChild(noBtn);
    modal.appendChild(btns);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// Exibe detalhes de uma interação em um modal, incluindo contexto Shadow DOM/Iframe
function showLogDetailsModal(interaction) {
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-modal';
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.setAttribute('aria-label', 'Detalhes da Interação');
    modalBg.tabIndex = -1;
    modalBg.style.zIndex = '2147483647';
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    modal.style.minWidth = '340px';
    modal.style.maxWidth = '96vw';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.position = 'relative';
    const title = document.createElement('div');
    title.textContent = 'Detalhes da Interação';
    title.style.fontSize = '18px';
    title.style.fontWeight = 'bold';
    title.style.color = '#0D47A1';
    title.style.marginBottom = '10px';
    title.id = 'gherkin-modal-details-title';
    modal.setAttribute('aria-labelledby', 'gherkin-modal-details-title');
    modal.appendChild(title);
    // Tabela de detalhes
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.fontSize = '1rem';
    table.style.marginBottom = '10px';
    table.innerHTML = `
        <tr><td style='font-weight:bold;'>Ação:</td><td>${(window.ACTION_META && window.ACTION_META[interaction.acao]?.label) || interaction.acao || ''}</td></tr>
        <tr><td style='font-weight:bold;'>Elemento:</td><td>${interaction.nomeElemento || ''}</td></tr>
        <tr><td style='font-weight:bold;'>Valor:</td><td>${interaction.valorPreenchido || interaction.nomeArquivo || ''}</td></tr>
        <tr><td style='font-weight:bold;'>CSS Selector:</td><td><code>${typeof interaction.cssSelector === 'object' ? interaction.cssSelector?.css : interaction.cssSelector || ''}</code></td></tr>
        <tr><td style='font-weight:bold;'>XPath:</td><td><code>${typeof interaction.xpath === 'object' ? interaction.xpath?.xpath : interaction.xpath || ''}</code></td></tr>
    `;
    modal.appendChild(table);

    // Indicação de contexto Shadow DOM/Iframe
    if (interaction.containerType === 'iframe' || interaction.containerType === 'shadow') {
        const ctxDiv = document.createElement('div');
        ctxDiv.style.background = interaction.containerType === 'iframe' ? '#e3f2fd' : '#fffde7';
        ctxDiv.style.color = interaction.containerType === 'iframe' ? '#1565c0' : '#bfa100';
        ctxDiv.style.padding = '10px 14px';
        ctxDiv.style.borderRadius = '7px';
        ctxDiv.style.marginBottom = '10px';
        ctxDiv.style.fontWeight = 'bold';
        ctxDiv.style.display = 'flex';
        ctxDiv.style.alignItems = 'center';
        ctxDiv.style.gap = '10px';
        ctxDiv.innerHTML = `
            <span style="font-size:1.3em;">${interaction.containerType === 'iframe' ? '🖼️' : '🌑'}</span>
            <span>
                ${interaction.containerType === 'iframe' ? 'Elemento dentro de <b>iframe</b>' : 'Elemento dentro de <b>Shadow DOM</b>'}
                ${interaction.containerElementName ? `<br><span style='font-weight:normal;'>Container: <code>${interaction.containerElementName}</code></span>` : ''}
                ${interaction.containerXpath ? `<br><span style='font-weight:normal;'>XPath do container: <code>${typeof interaction.containerXpath === 'object' ? interaction.containerXpath?.xpath : interaction.containerXpath}</code></span>` : ''}
            </span>
        `;
        modal.appendChild(ctxDiv);
    }

    // Timestamp
    if (interaction.timestamp) {
        const ts = document.createElement('div');
        const date = new Date(interaction.timestamp);
        ts.textContent = 'Registrado em: ' + date.toLocaleString();
        ts.style.fontSize = '0.97em';
        ts.style.color = '#888';
        ts.style.marginBottom = '8px';
        modal.appendChild(ts);
    }

    // Botão fechar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Fechar';
    closeBtn.className = 'gherkin-btn gherkin-btn-danger';
    closeBtn.setAttribute('aria-label', 'Fechar detalhes da interação');
    closeBtn.tabIndex = 0;
    closeBtn.style.marginTop = '10px';
    closeBtn.onclick = () => modalBg.remove();
    modal.appendChild(closeBtn);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
    // Foco inicial e navegação por teclado
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
        modalBg.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const focusable = Array.from(focusables);
                let idx = focusable.indexOf(document.activeElement);
                if (e.shiftKey) {
                    idx = idx <= 0 ? focusable.length - 1 : idx - 1;
                } else {
                    idx = idx === focusable.length - 1 ? 0 : idx + 1;
                }
                focusable[idx].focus();
                e.preventDefault();
            } else if (e.key === 'Escape') {
                modalBg.remove();
            } else if ((e.key === 'Enter' || e.key === ' ') && document.activeElement.tagName === 'BUTTON') {
                document.activeElement.click();
            }
        });
    }, 50);
}

// --- Painel Flutuante Minimizado/Maximizado ---
if (!window.toggleMinimizePanel) {
    window.toggleMinimizePanel = function(panel) {
        const minimizedId = 'gherkin-panel-minimized';
        if (panel.style.display !== 'none') {
            panel.style.display = 'none';
            let minimized = document.getElementById(minimizedId);
            if (!minimized) {
                minimized = document.createElement('button');
                minimized.id = minimizedId;
                minimized.title = 'Abrir painel Gherkin';
                minimized.innerHTML = '<svg width="32" height="32" fill="#0070f3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="#0070f3" stroke-width="2" fill="#fff"/><path d="M8 12h8M12 8v8" stroke="#0070f3" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                minimized.style.position = 'fixed';
                minimized.style.left = '18px';
                minimized.style.bottom = '18px';
                minimized.style.width = '54px';
                minimized.style.height = '54px';
                minimized.style.background = '#0070f3';
                minimized.style.color = '#fff';
                minimized.style.borderRadius = '50%';
                minimized.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
                minimized.style.display = 'flex';
                minimized.style.alignItems = 'center';
                minimized.style.justifyContent = 'center';
                minimized.style.zIndex = '2147483647';
                minimized.style.cursor = 'pointer';
                minimized.style.fontSize = '2.2em';
                minimized.style.border = 'none';
                minimized.onclick = () => {
                    panel.style.display = '';
                    minimized.remove();
                };
                document.body.appendChild(minimized);
            }
        } else {
            panel.style.display = '';
            const minimized = document.getElementById(minimizedId);
            if (minimized) minimized.remove();
        }
    };
}

// --- Ajuste no createPanel para garantir painel flutuante ---
const originalCreatePanel = createPanel;
createPanel = function() {
    const panel = originalCreatePanel();
    // Adiciona eventos de minimizar/maximizar
    setTimeout(() => {
        const minimizeBtn = panel.querySelector('#gherkin-minimize');
        if (minimizeBtn) minimizeBtn.onclick = () => window.toggleMinimizePanel(panel);
        const reopenBtn = panel.querySelector('#gherkin-reopen');
        if (reopenBtn) reopenBtn.onclick = () => window.toggleMinimizePanel(panel);
    }, 100);
    return panel;
};

// --- Ajuste no renderPanelContent para garantir botões de controle ---
const originalRenderPanelContent = renderPanelContent;
renderPanelContent = function(panel) {
    originalRenderPanelContent(panel);
    // Garante que os botões de controle estejam presentes
    setTimeout(() => {
        const startBtn = document.getElementById('gherkin-start');
        const stopBtn = document.getElementById('gherkin-stop');
        if (startBtn) {
            startBtn.onclick = () => {
                window.isRecording = true;
                window.isPaused = false;
                window.gherkinPanelState = 'gravando';
                renderPanelContent(panel);
            };
        }
        if (stopBtn) {
            stopBtn.onclick = () => {
                window.isRecording = false;
                window.isPaused = false;
                window.gherkinPanelState = 'feature';
                renderPanelContent(panel);
            };
        }
    }, 100);
};
export {
    renderPanelContent,
    createPanel,
    showLoginModal,
    showUploadModal,
    updateActionParams,
    makePanelDraggable,
    showModal,
    renderLogWithActions,
    showEditModal,
    showXPathModal,
    initializePanelEvents // exporta a função para uso externo
};
// ====== Destaque visual de elemento ao passar o mouse (tipo DevTools) ======
let gherkinHighlightCurrent = null;

function injectGherkinHighlightStyle() {
    if (!document.getElementById('gherkin-highlight-style')) {
        const style = document.createElement('style');
        style.id = 'gherkin-highlight-style';
        style.innerHTML = `
        .gherkin-highlight-hover {
            outline: 2px solid #00bfff !important;
            background: rgba(0,191,255,0.08) !important;
            cursor: pointer !important;
            z-index: 999999 !important;
        }`;
        document.head.appendChild(style);
    }
}

function enableGherkinHighlightMode() {
    injectGherkinHighlightStyle();
    function onMouseOver(e) {
        if (gherkinHighlightCurrent) {
            gherkinHighlightCurrent.classList.remove('gherkin-highlight-hover');
        }
        gherkinHighlightCurrent = e.target;
        gherkinHighlightCurrent.classList.add('gherkin-highlight-hover');
    }
    function onMouseOut(e) {
        if (gherkinHighlightCurrent) {
            gherkinHighlightCurrent.classList.remove('gherkin-highlight-hover');
            gherkinHighlightCurrent = null;
        }
    }
    document.addEventListener('mouseover', onMouseOver, true);
    document.addEventListener('mouseout', onMouseOut, true);
    window.__gherkinHighlightOn = { onMouseOver, onMouseOut };
}

function disableGherkinHighlightMode() {
    if (window.__gherkinHighlightOn) {
        document.removeEventListener('mouseover', window.__gherkinHighlightOn.onMouseOver, true);
        document.removeEventListener('mouseout', window.__gherkinHighlightOn.onMouseOut, true);
        if (gherkinHighlightCurrent) {
            gherkinHighlightCurrent.classList.remove('gherkin-highlight-hover');
            gherkinHighlightCurrent = null;
        }
        window.__gherkinHighlightOn = null;
    }
}

// Exponha as funções no escopo global para fácil integração com o painel
window.enableGherkinHighlightMode = enableGherkinHighlightMode;
window.disableGherkinHighlightMode = disableGherkinHighlightMode;
// Importa funções utilitárias e de UI
import { slugify, downloadFile, showFeedback, debounce, getCSSSelector, isExtensionContextValid } from './utils.js';
import {
    updateActionParams,
    makePanelDraggable,
    renderLogWithActions,
    createPanel,
    renderPanelContent,
    initializePanelEvents,
    showEditModal,
    showXPathModal,
} from './ui.js';
import { getConfig } from './config.js';

// Variáveis globais para controle de múltiplas features/cenários e estado do painel
if (!window.gherkinFeatures) window.gherkinFeatures = [];
if (!window.currentFeature) window.currentFeature = null;
if (!window.currentCenario) window.currentCenario = null;
if (!window.gherkinPanelState) window.gherkinPanelState = 'feature';
if (typeof window.isRecording === 'undefined') window.isRecording = false;
if (typeof window.isPaused === 'undefined') window.isPaused = false;
if (typeof window.timerInterval === 'undefined') window.timerInterval = null;
if (typeof window.elapsedSeconds === 'undefined') window.elapsedSeconds = 0;
if (!window.interactions) window.interactions = [];

// Remova funções duplicadas já presentes em ui.js:
// - stopTimer
// - startTimer
// - togglePause
// - toggleTheme
// - applySavedTheme
// - getRobustXPath
// - saveInteractionsToStorage

// Inicialização do painel e variáveis globais
if (!window.panel) {
    window.panel = createPanel();
    renderPanelContent(window.panel);

    // --- INJEÇÃO DE CSS MODERNO E RESPONSIVO ---
    const style = document.createElement('style');
    style.id = 'gherkin-panel-modern-style';
    style.innerHTML = `
    #gherkin-panel, .gherkin-panel {
        font-family: 'Segoe UI', Arial, sans-serif !important;
        background: #fff;
        color: #222;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.10);
        max-width: 480px;
        min-width: 320px;
        width: 96vw;
        min-height: 320px;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        z-index: 2147483647;
    }
    .gherkin-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #f7faff;
        border-bottom: 1px solid #e0e6ed;
        padding: 18px 20px 12px 20px;
        font-size: 1.25rem;
        font-weight: bold;
        color: #0070f3;
        letter-spacing: 0.01em;
        user-select: none;
    }
    .gherkin-panel-header .gherkin-panel-title {
        font-size: 1.18rem;
        font-weight: 700;
        letter-spacing: 0.01em;
    }
    .gherkin-panel-header .gherkin-panel-actions {
        display: flex;
        gap: 8px;
    }
    .gherkin-panel-header button, .gherkin-panel-header .gherkin-close, .gherkin-panel-header .gherkin-minimize {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.2rem;
        padding: 2px 6px;
        color: #e74c3c;
        transition: color 0.2s;
    }
    .gherkin-panel-header .gherkin-minimize { color: #f1c40f; }
    .gherkin-panel-header .gherkin-close:hover { color: #c0392b; }
    .gherkin-panel-header .gherkin-minimize:hover { color: #b7950b; }

    .gherkin-panel-content {
        flex: 1 1 auto;
        padding: 24px 24px 12px 24px;
        display: flex;
        flex-direction: column;
        gap: 18px;
        background: #fff;
        overflow-y: auto;
    }
    .gherkin-panel-content h2, .gherkin-panel-content h3 {
        margin: 0 0 8px 0;
        font-weight: 600;
        color: #0070f3;
    }
    .gherkin-panel-content label {
        font-weight: 500;
        margin-bottom: 4px;
        display: block;
        color: #222;
    }
    .gherkin-panel-content input[type="text"], .gherkin-panel-content input[type="number"], .gherkin-panel-content textarea, .gherkin-panel-content select {
        width: 100%;
        padding: 10px 12px;
        border: 1.5px solid #e0e6ed;
        border-radius: 6px;
        font-size: 1rem;
        margin-bottom: 10px;
        background: #f9fbfd;
        transition: border-color 0.2s;
    }
    .gherkin-panel-content input:focus, .gherkin-panel-content textarea:focus, .gherkin-panel-content select:focus {
        outline: none;
        border-color: #0070f3;
        background: #fff;
    }
    .gherkin-panel-content input[aria-invalid="true"], .gherkin-panel-content textarea[aria-invalid="true"] {
        border-color: #e74c3c;
        background: #fff6f6;
    }
    .gherkin-panel-content .gherkin-actions-row {
        display: flex;
        gap: 12px;
        margin: 12px 0 0 0;
        flex-wrap: wrap;
    }
    .gherkin-panel-content button, .gherkin-panel-content .gherkin-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 18px;
        border: none;
        border-radius: 6px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s, color 0.2s, box-shadow 0.2s;
        box-shadow: 0 2px 8px rgba(0,112,243,0.04);
        margin-bottom: 0;
        outline: none;
    }
    .gherkin-panel-content .gherkin-btn-primary {
        background: #0070f3;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-primary:hover, .gherkin-panel-content .gherkin-btn-primary:focus {
        background: #005bb5;
    }
    .gherkin-panel-content .gherkin-btn-success {
        background: #28a745;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-success:hover, .gherkin-panel-content .gherkin-btn-success:focus {
        background: #218838;
    }
    .gherkin-panel-content .gherkin-btn-danger {
        background: #e74c3c;
        color: #fff;
    }
    .gherkin-panel-content .gherkin-btn-danger:hover, .gherkin-panel-content .gherkin-btn-danger:focus {
        background: #c0392b;
    }
    .gherkin-panel-content .gherkin-btn-warning {
        background: #ffc107;
        color: #222;
    }
    .gherkin-panel-content .gherkin-btn-warning:hover, .gherkin-panel-content .gherkin-btn-warning:focus {
        background: #e0a800;
    }
    .gherkin-panel-content .gherkin-btn[disabled], .gherkin-panel-content button[disabled] {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .gherkin-panel-content .gherkin-checkbox-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: 12px;
    }
    .gherkin-panel-content .gherkin-checkbox-list label {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 400;
        font-size: 1rem;
        color: #222;
        cursor: pointer;
    }
    .gherkin-panel-content .gherkin-checkbox-list input[type="checkbox"] {
        accent-color: #0070f3;
        width: 18px;
        height: 18px;
    }
    .gherkin-panel-content .gherkin-feedback {
        margin: 8px 0;
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
    .gherkin-panel-content .gherkin-feedback.error {
        background: #fff6f6;
        color: #e74c3c;
        border-color: #e74c3c;
    }
    .gherkin-panel-content .gherkin-feedback.info {
        background: #f7faff;
        color: #0070f3;
        border-color: #0070f3;
    }
    .gherkin-panel-content .gherkin-feedback .gherkin-feedback-icon {
        font-size: 1.3em;
        display: inline-block;
        vertical-align: middle;
    }
    .gherkin-panel-content .gherkin-tip {
        background: #f7faff;
        border-left: 4px solid #0070f3;
        padding: 10px 16px;
        border-radius: 6px;
        color: #0070f3;
        font-size: 0.98rem;
        margin-bottom: 8px;
        margin-top: 0;
        display: flex;
        align-items: flex-start;
        gap: 8px;
    }
    .gherkin-panel-content .gherkin-tip .gherkin-tip-icon {
        font-size: 1.2em;
        margin-right: 4px;
        color: #0070f3;
    }
    .gherkin-panel-content .gherkin-summary {
        background: #f9fbfd;
        border: 1.5px solid #e0e6ed;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 10px;
        font-size: 0.98rem;
        color: #222;
        max-height: 180px;
        overflow-y: auto;
    }
    .gherkin-panel-content .gherkin-summary-title {
        font-weight: 600;
        color: #0070f3;
        margin-bottom: 6px;
        font-size: 1.05rem;
    }
    .gherkin-panel-content .gherkin-summary-list {
        list-style: disc inside;
        margin: 0;
        padding: 0 0 0 10px;
    }
    .gherkin-panel-content .gherkin-summary-list li {
        margin-bottom: 2px;
        font-size: 0.97rem;
    }
    .gherkin-panel-content .gherkin-footer {
        text-align: right;
        font-size: 0.92rem;
        color: #888;
        margin-top: 10px;
        margin-bottom: 2px;
    }
    /* Dropdown de ações (três pontos) */
    .gherkin-action-dropdown {
        position: absolute !important;
        min-width: 170px;
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 8px 32px rgba(0,112,243,0.13), 0 1.5px 6px rgba(0,0,0,0.07);
        border: 1.5px solid #e0e6ed;
        z-index: 2147483646 !important;
        padding: 8px 0;
        display: none;
        flex-direction: column;
        animation: fadeInDropdown 0.18s;
        /* Novo: ajuste para garantir que o dropdown nunca fique fora da janela */
        right: auto !important;
        left: 0 !important;
        top: 36px !important;
        max-width: 90vw;
        max-height: 320px;
        overflow-y: auto;
    }
    .gherkin-action-dropdown.open {
        display: flex !important;
    }
    .gherkin-action-dropdown button,
    .gherkin-action-dropdown .gherkin-action-item {
        background: none;
        border: none;
        width: 100%;
        text-align: left;
        padding: 10px 18px;
        font-size: 1rem;
        color: #222;
        cursor: pointer;
        transition: background 0.18s, color 0.18s;
        border-radius: 0;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .gherkin-action-dropdown button:hover,
    .gherkin-action-dropdown .gherkin-action-item:hover {
        background: #f7faff;
        color: #0070f3;
    }
    .gherkin-action-dropdown .gherkin-action-separator {
        height: 1px;
        background: #e0e6ed;
        margin: 4px 0;
        border: none;
    }
    @keyframes fadeInDropdown {
        from { opacity: 0; transform: translateY(-8px);}
        to { opacity: 1; transform: translateY(0);}
    }

    /* Painel de logs aprimorado */
    .gherkin-log-panel {
        background: #f9fbfd;
        border-radius: 10px;
        border: 1.5px solid #e0e6ed;
        padding: 12px 0 6px 0;
        margin-bottom: 10px;
        max-height: 260px;
        overflow-y: auto;
        box-shadow: 0 2px 8px rgba(0,112,243,0.04);
        font-size: 0.98rem;
        scrollbar-width: thin;
        scrollbar-color: #0070f3 #f9fbfd;
    }
    .gherkin-log-panel::-webkit-scrollbar {
        width: 8px;
        background: #f9fbfd;
    }
    .gherkin-log-panel::-webkit-scrollbar-thumb {
        background: #e0e6ed;
        border-radius: 6px;
    }
    .gherkin-log-list {
        list-style: none;
        margin: 0;
        padding: 0;
    }
    .gherkin-log-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 10px 18px 10px 16px;
        border-bottom: 1px solid #e0e6ed;
        background: transparent;
        transition: background 0.15s;
        position: relative;
    }
    .gherkin-log-item:last-child {
        border-bottom: none;
    }
    .gherkin-log-item:hover {
        background: #f7faff;
    }
    .gherkin-log-icon {
        font-size: 1.25em;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: #eaf6ff;
        color: #0070f3;
        flex-shrink: 0;
    }
    .gherkin-log-item[data-action="preenche"] .gherkin-log-icon { background: #f6f9e8; color: #28a745; }
    .gherkin-log-item[data-action="upload"] .gherkin-log-icon { background: #fff6e6; color: #f39c12; }
    .gherkin-log-item[data-action="login"] .gherkin-log-icon { background: #f6e8f9; color: #8e44ad; }
    .gherkin-log-item[data-action="clica"] .gherkin-log-icon { background: #eafaf1; color: #218838; }
    .gherkin-log-item[data-action="espera"] .gherkin-log-icon { background: #fff6f6; color: #e74c3c; }
    .gherkin-log-item[data-action="espera_elemento"] .gherkin-log-icon { background: #f7faff; color: #0070f3; }
    .gherkin-log-item[data-action="acessa_url"] .gherkin-log-icon { background: #eaf6ff; color: #0070f3; }
    .gherkin-log-item[data-action="seleciona"] .gherkin-log-icon { background: #f6f9e8; color: #218838; }
    .gherkin-log-item[data-action="espera_nao_existe"] .gherkin-log-icon { background: #fff6f6; color: #e74c3c; }
    .gherkin-log-content {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    .gherkin-log-title {
        font-weight: 600;
        color: #222;
        font-size: 1.01em;
        margin-bottom: 2px;
    }
    .gherkin-log-desc {
        color: #555;
        font-size: 0.97em;
        margin-bottom: 0;
    }
    .gherkin-log-meta {
        color: #888;
        font-size: 0.93em;
        margin-top: 2px;
    }
    /* Ajuste para dropdown não sair da tela */
    .gherkin-action-dropdown {
        max-height: 320px;
        overflow-y: auto;
    }
    @media (max-width: 600px) {
        .gherkin-action-dropdown {
            left: 0 !important;
            right: auto !important;
            max-width: 96vw;
        }
        .gherkin-log-panel {
            max-height: 40vw;
        }
    }
    `;
    document.head.appendChild(style);
}
if (typeof window.lastInputTarget === 'undefined') window.lastInputTarget = null;
if (typeof window.inputDebounceTimeout === 'undefined') window.inputDebounceTimeout = null;
if (typeof window.lastInputValue === 'undefined') window.lastInputValue = '';

// Inicializa eventos do painel
setTimeout(() => {
    initializePanelEvents(window.panel);
    // Adiciona arrasto apenas na barra superior
    const header = window.panel.querySelector('.gherkin-panel-header');
    if (header) {
        makePanelDraggable(window.panel, header);
    }
    // Removido: lógica de dica de upload duplicada
    // Garante que updateActionParams seja chamado ao trocar ação
    const actionSelect = document.getElementById('gherkin-action-select');
    if (actionSelect && typeof updateActionParams === 'function') {
        actionSelect.addEventListener('change', () => updateActionParams(window.panel));
        updateActionParams(window.panel);
    }
}, 100);

// Função utilitária para validar se um elemento pode ser preenchido (agora cobre PrimeNG, inputmode, role, classes customizadas)
function isFillableElement(el) {
    if (!el) return false;
    // Caso especial: PrimeNG p-inputnumber (componente customizado)
    if (
        el.tagName === 'P-INPUTNUMBER' ||
        (el.classList && (
            el.classList.contains('p-inputnumber') ||
            el.classList.contains('p-inputnumber-input') ||
            el.classList.contains('p-inputwrapper')
        ))
    ) {
        return true;
    }
    if (el.tagName === 'INPUT') {
        // Tipos tradicionais
        const type = (el.type || '').toLowerCase();
        if ([
            'text', 'email', 'password', 'search', 'tel', 'url', 'number', 'date', 'datetime-local', 'month', 'time', 'week'
        ].includes(type)) return true;
        // PrimeNG/Custom: inputmode="decimal" ou "numeric"
        if (el.getAttribute('inputmode') && ['decimal', 'numeric'].includes(el.getAttribute('inputmode'))) return true;
        // PrimeNG/Custom: role="spinbutton"
        if (el.getAttribute('role') === 'spinbutton') return true;
        // PrimeNG/Custom: classe p-inputtext ou p-inputnumber-input
        const classList = (el.className || '').split(/\s+/);
        if (classList.includes('p-inputtext') || classList.includes('p-inputnumber-input')) return true;
    }
    if (el.tagName === 'TEXTAREA') return true;
    if (el.isContentEditable) return true;
    return false;
}

// Captura clique único
document.addEventListener('click', (event) => {
    if (!window.isRecording || window.isPaused) return;
    try {
        if (!isExtensionContextValid()) return;
        if (
            !event.target ||
            event.target.closest('#gherkin-panel') ||
            event.target.closest('#gherkin-modal') ||
            event.target.closest('.gherkin-content')
        ) return;

        // Se for input file, abre modal para upload de exemplo
        if (event.target.tagName === 'INPUT' && event.target.type === 'file') {
            const cssSelector = getCSSSelector(event.target);
            const xpath = getRobustXPath(event.target);
            let nomeElemento = (event.target.getAttribute('aria-label') || event.target.getAttribute('name') || event.target.id || event.target.className || event.target.tagName).toString().trim();
            if (!nomeElemento) nomeElemento = event.target.tagName;
            if (typeof window.showUploadModal === 'function') {
                window.showUploadModal(nomeElemento, cssSelector, xpath, (nomesArquivos) => {
                    if (!nomesArquivos || !Array.isArray(nomesArquivos) || nomesArquivos.length === 0) return;
                    getConfig((config) => {
                        // Gera stepText com todos os arquivos
                        const arquivosStr = nomesArquivos.join(', ');
                        const template = config.templateUpload || 'When faz upload dos arquivos "{arquivos}" no campo {elemento}';
                        const stepText = template
                            .replace('{arquivos}', arquivosStr)
                            .replace('{elemento}', nomeElemento);
                        window.interactions.push({
                            step: 'When',
                            acao: 'upload',
                            acaoTexto: 'Upload de arquivo',
                            nomeElemento,
                            cssSelector,
                            xpath,
                            nomesArquivos,
                            stepText,
                            timestamp: Date.now()
                        });
                        renderLogWithActions();
                    });
                });
            } else {
                showFeedback('Função de upload não disponível!', 'error');
            }
            return;
        }
        // Se for input comum/textarea/contentEditable, não registra aqui (será tratado no input)
        if ((event.target.tagName === 'INPUT' && event.target.type !== 'file') || event.target.tagName === 'TEXTAREA' || event.target.isContentEditable) return;

        // Detecta campos de login
        const isLoginField = (el) => {
            const type = el.getAttribute('type') || '';
            const name = (el.getAttribute('name') || '').toLowerCase();
            const id = (el.id || '').toLowerCase();
            return (
                type === 'password' ||
                name.includes('senha') || name.includes('password') ||
                id.includes('senha') || id.includes('password')
            );
        };
        // Se o elemento clicado for um botão de login ou submit próximo de campos de login
        let isLoginAction = false;
        if (event.target.tagName === 'BUTTON' || event.target.type === 'submit') {
            // Procura campos de input próximos
            const form = event.target.closest('form');
            if (form) {
                const inputs = form.querySelectorAll('input');
                let hasUser = false, hasPass = false;
                inputs.forEach(input => {
                    const type = input.getAttribute('type') || '';
                    const name = (input.getAttribute('name') || '').toLowerCase();
                    if (type === 'password' || name.includes('senha') || name.includes('password')) hasPass = true;
                    if (type === 'text' || type === 'email' || name.includes('user') || name.includes('email')) hasUser = true;
                });
                if (hasUser && hasPass) isLoginAction = true;
            }
        }

        // Busca recursiva por campo editável ao clicar para ação "Preencher"
        function findFillableDescendant(el) {
            if (!el) return null;
            if (isFillableElement(el)) return el;
            // Busca por input, textarea, contenteditable ou PrimeNG
            const fillable = el.querySelector && el.querySelector('input:not([type=file]), textarea, [contenteditable="true"], .p-inputnumber-input, .p-inputtext');
            if (fillable) return fillable;
            // Busca por p-inputnumber customizado
            const pInputNumber = el.querySelector && el.querySelector('p-inputnumber');
            if (pInputNumber) {
                const input = pInputNumber.querySelector('input.p-inputnumber-input, input.p-inputtext');
                if (input) return input;
            }
            return null;
        }

        let targetForValue = event.target;
        const actionSelect = document.getElementById('gherkin-action-select');
        let acao = actionSelect ? actionSelect.options[actionSelect.selectedIndex].text : 'Clicar';
        let acaoValue = actionSelect ? actionSelect.value : 'clica';

        // --- NOVO: Valida URL da página ---
        if (acaoValue === 'valida_url') {
            const urlAtual = window.location.href;
            getConfig((config) => {
                const template = config && config.templateValidaUrl ? config.templateValidaUrl : 'Then valida que a URL da página é "{url}"';
                const stepText = template.replace('{url}', urlAtual);
                window.interactions.push({
                    step: 'Then',
                    acao: 'valida_url',
                    acaoTexto: 'Validar URL',
                    urlEsperada: urlAtual,
                    stepText,
                    timestamp: Date.now()
                });
                renderLogWithActions();
            });
            return;
        }

        if (acaoValue === 'preenche') {
            const found = findFillableDescendant(event.target);
            if (found) targetForValue = found;
        }

        const cssSelector = getCSSSelector(targetForValue);
        const xpath = getRobustXPath(targetForValue);

        // Para nomeElemento, priorize aria-label, name, id, class, tag, mas nunca o valor preenchido
        let nomeElemento = (
            targetForValue.getAttribute('aria-label') ||
            targetForValue.getAttribute('name') ||
            targetForValue.id ||
            targetForValue.className ||
            targetForValue.tagName
        );
        if (typeof nomeElemento === 'string') nomeElemento = nomeElemento.trim();
        if (!nomeElemento) nomeElemento = targetForValue.tagName;
        // Novo: tenta coletar o texto visível do elemento, se existir
        let textoElemento = '';
        if (typeof targetForValue.innerText === 'string' && targetForValue.innerText.trim()) {
            textoElemento = targetForValue.innerText.trim();
        } else if (typeof targetForValue.textContent === 'string' && targetForValue.textContent.trim()) {
            textoElemento = targetForValue.textContent.trim();
        }
        // Se encontrou texto visível, adiciona ao nomeElemento (mas sem duplicar)
        if (textoElemento && (!nomeElemento || !nomeElemento.includes(textoElemento))) {
            if (nomeElemento) {
                nomeElemento += ` | ${textoElemento}`;
            } else {
                nomeElemento = textoElemento;
            }
        }

        // Para valorPreenchido, sempre tente pegar value, innerText ou textContent do campo editável
        let valorPreenchido = '';
        if (typeof targetForValue.value !== 'undefined') {
            valorPreenchido = targetForValue.value;
        } else if (typeof targetForValue.innerText !== 'undefined') {
            valorPreenchido = targetForValue.innerText;
        } else if (typeof targetForValue.textContent !== 'undefined') {
            valorPreenchido = targetForValue.textContent;
        }


        // Parâmetros extras para ações específicas
        let interactionParams = {};
        if (acaoValue === 'espera_segundos') {
            const waitInput = document.getElementById('gherkin-wait-seconds');
            let tempoEspera = 1;
            if (waitInput && waitInput.value) {
                tempoEspera = parseInt(waitInput.value, 10);
                if (isNaN(tempoEspera) || tempoEspera < 1) tempoEspera = 1;
            }
            interactionParams.tempoEspera = tempoEspera;
        }
        // Espera inteligente: se o usuário escolher "espera_elemento", registra o seletor
        if (acaoValue === 'espera_elemento') {
            interactionParams.esperaSeletor = cssSelector;
        }

        // Marcação de login
        if (acaoValue === 'login' || isLoginAction) {
            // Não salva credenciais, apenas registra o step
            let userField = '';
            let passField = '';
            const form = event.target.closest('form');
            if (form) {
                const inputs = form.querySelectorAll('input');
                inputs.forEach(input => {
                    const type = input.getAttribute('type') || '';
                    const name = (input.getAttribute('name') || '').toLowerCase();
                    if (!userField && (type === 'text' || type === 'email' || name.includes('user') || name.includes('email'))) userField = getCSSSelector(input);
                    if (!passField && (type === 'password' || name.includes('senha') || name.includes('password'))) passField = getCSSSelector(input);
                });
            }
            getConfig((config) => {
                const template = config.templateLogin || 'Given que o usuário faz login com usuário "<usuario>" e senha "<senha>"';
                const stepText = template;
                window.interactions.push({
                    step: 'Given',
                    acao: 'login',
                    acaoTexto: 'Login',
                    nomeElemento: 'login',
                    userField,
                    passField,
                    cssSelector,
                    xpath,
                    stepText,
                    timestamp: Date.now()
                });
                renderLogWithActions();
            });
            return;
        }

        // Evita duplicidade: só bloqueia se todos os dados relevantes forem idênticos
        const last = window.interactions[window.interactions.length - 1];
        let isDuplicate = false;
        if (acaoValue === 'preenche') {
            isDuplicate = last && last.acao === acaoValue && last.cssSelector === cssSelector && last.nomeElemento === nomeElemento && last.valorPreenchido === valorPreenchido && last.xpath === xpath;
        } else {
            isDuplicate = last && last.acao === acaoValue && last.cssSelector === cssSelector && last.nomeElemento === nomeElemento;
            if (acaoValue === 'espera_segundos' && last && last.tempoEspera !== undefined) {
                isDuplicate = isDuplicate && last.tempoEspera === interactionParams.tempoEspera;
            }
            if (acaoValue === 'espera_elemento' && last && last.esperaSeletor) {
                isDuplicate = isDuplicate && last.esperaSeletor === interactionParams.esperaSeletor;
            }
        }
        if (isDuplicate) return;
        // Passo BDD conforme regra: Given (primeiro), When (meio), Then (último)
        let step = 'When';
        let total = window.interactions.length;
        // O próximo passo será o último?
        // Se não há nenhum passo, é Given
        if (total === 0) {
            step = 'Given';
        } else {
            // O passo atual será o último? (considera que o push ainda não foi feito)
            // Se já existe pelo menos 1 passo, e este será o último (após push), então é Then
            // Só é Then se o usuário clicar em "Encerrar Cenário" ou similar, então ajusta depois
            // Aqui, por padrão, todos os passos exceto o primeiro são When
            step = 'When';
        }
        window.givenAcessaUrlAdded = false;
        // Adiciona a interação normalmente
        let interactionObj;
        if (acaoValue === 'preenche') {
            interactionObj = {
                step,
                acao: acaoValue,
                acaoTexto: acao,
                nomeElemento,
                cssSelector,
                xpath,
                valorPreenchido,
                timestamp: Date.now(),
                ...interactionParams
            };
        } else {
            interactionObj = { step, acao: acaoValue, acaoTexto: acao, nomeElemento, cssSelector, xpath, timestamp: Date.now(), ...interactionParams };
        }
        window.interactions.push(interactionObj);

        // Após adicionar, ajustar os steps conforme regra:
        // 1º = Given, último = Then, intermediários = When
        if (window.interactions.length > 0) {
            window.interactions[0].step = 'Given';
            if (window.interactions.length > 2) {
                for (let i = 1; i < window.interactions.length - 1; i++) {
                    window.interactions[i].step = 'When';
                }
            }
            if (window.interactions.length > 1) {
                window.interactions[window.interactions.length - 1].step = 'Then';
            }
        }
        renderLogWithActions();
    } catch (error) { console.error('Erro ao registrar clique:', error); }
});

// Garante que saveInteractionsToStorage está disponível no escopo global
if (typeof window.saveInteractionsToStorage !== 'function') {
    // Tenta importar da ui.js se não estiver disponível
    if (typeof saveInteractionsToStorage === 'function') {
        window.saveInteractionsToStorage = saveInteractionsToStorage;
    } else {
        // Fallback: função dummy para evitar erro
        window.saveInteractionsToStorage = function() {};
    }
}

function handleInputEvent(event) {
    // Protege contra variáveis não definidas


    try {
        if (!window.isRecording || window.isPaused) return;
        if (!isExtensionContextValid()) return;
        // Ignora eventos de input de campos que não são de passo/teste (ex: nome da feature)
        if (
            !event.target ||
            event.target.closest('#gherkin-panel') ||
            event.target.closest('#gherkin-modal') ||
            event.target.closest('.gherkin-content') ||
            event.target.id === 'gherkin-feature-name' ||
            (event.target.classList && event.target.classList.contains('gherkin-feature-name')) ||
            (event.target.closest && event.target.closest('.gherkin-feature-name'))
        ) return;



        const actionSelect = document.getElementById('gherkin-action-select');
        let acaoValue = 'preenche';
        if (actionSelect && actionSelect.selectedIndex >= 0) {
            acaoValue = actionSelect.value;
        }

        // Só registra ação "preenche" no blur ou change, não no input
        if (acaoValue === 'preenche') {
            // Handler único para blur, change e keydown(Tab)
            if (!window.__gherkinPreencheBlurChangeHandler) {
                window.__gherkinPreencheBlurChangeHandler = function(ev) {
                    if (!window.isRecording || window.isPaused) return;
                    if (!isExtensionContextValid()) return;
                    // Determina o elemento alvo para registro
                    let target = ev.target;
                    let isPInputNumber = false;
                    // Se for p-inputnumber, busca o input interno
                    if (target.tagName === 'P-INPUTNUMBER' || (target.classList && target.classList.contains('p-inputnumber'))) {
                        isPInputNumber = true;
                        const input = target.querySelector('input.p-inputnumber-input, input.p-inputtext');
                        if (input) target = input;
                    }
                    // Se for keydown, só registra se for Tab
                    if (ev.type === 'keydown' && ev.key !== 'Tab') return;
                    const cssSelector = getCSSSelector(target);
                    const xpath = typeof getRobustXPath === 'function' ? getRobustXPath(target) : '';
                    // Busca nome amigável do elemento (prioridade: label visível > aria-label > placeholder > name > id > texto visível > tag)
                    let nomeElemento = '';
                    // 1. Label associada via for
                    if (target.id) {
                        const label = document.querySelector('label[for="' + target.id + '"]');
                        if (label && label.textContent) {
                            nomeElemento = label.textContent.trim();
                        }
                    }
                    // 2. Label pai
                    if (!nomeElemento && target.closest) {
                        const labelParent = target.closest('label');
                        if (labelParent && labelParent.textContent) {
                            nomeElemento = labelParent.textContent.trim();
                        }
                    }
                    // 3. aria-label
                    if (!nomeElemento && target.getAttribute('aria-label')) {
                        nomeElemento = target.getAttribute('aria-label').trim();
                    }
                    // 4. placeholder
                    if (!nomeElemento && target.getAttribute('placeholder')) {
                        nomeElemento = target.getAttribute('placeholder').trim();
                    }
                    // 5. name
                    if (!nomeElemento && target.getAttribute('name')) {
                        nomeElemento = target.getAttribute('name').trim();
                    }
                    // 6. id (só se não for técnico, ex: não só números ou nomes genéricos)
                    if (!nomeElemento && target.id && !/^([0-9_\-]+|input|field|campo)$/i.test(target.id)) {
                        nomeElemento = target.id.trim();
                    }
                    // 7. Texto visível do campo (evita duplicidade)
                    if (!nomeElemento && typeof target.innerText === 'string' && target.innerText.trim().length > 2 && target.innerText.trim().length < 60) {
                        nomeElemento = target.innerText.trim();
                    }
                    // 8. Tag amigável
                    if (!nomeElemento && target.tagName) {
                    nomeElemento = target.tagName.toLowerCase();
                }
                nomeElemento = (nomeElemento || '').toString().trim();

                // --- LÓGICA DE UNICIDADE ROBUSTA PARA CAMPOS EM TABELA ---
                let parentSelector = '';
                let parent = target.closest && (target.closest('tr') || target.closest('tbody') || target.closest('table'));
                if (parent) {
                    parentSelector = getCSSSelector(parent);
                    // Índice da linha (sempre que possível)
                    let rowIdx = null;
                    if (parent.tagName === 'TR') {
                        const allRows = Array.from(parent.parentElement ? parent.parentElement.children : []);
                        rowIdx = allRows.indexOf(parent) + 1;
                    }
                    // Cabeçalho da coluna
                    let colHeader = '';
                    if (target.closest) {
                        const td = target.closest('td,th');
                        if (td && td.cellIndex !== undefined && td.cellIndex >= 0) {
                            let table = td.closest('table');
                            if (table) {
                                let headerRow = null;
                                if (table.tHead && table.tHead.rows.length > 0) {
                                    headerRow = table.tHead.rows[0];
                                } else {
                                    headerRow = table.querySelector('tr');
                                }
                                if (headerRow) {
                                    const ths = headerRow.querySelectorAll('th');
                                    if (ths && ths.length > td.cellIndex) {
                                        colHeader = ths[td.cellIndex].textContent.trim();
                                    }
                                }
                            }
                        }
                    }
                    // Padroniza nome: sempre inclui coluna e linha
                    let nomeComposto = '';
                    if (colHeader) {
                        nomeComposto = `INPUT_${slugify(colHeader).toUpperCase()}`;
                    } else {
                        nomeComposto = `INPUT_${slugify(nomeElemento).toUpperCase()}`;
                    }
                    if (rowIdx) {
                        nomeComposto += `_LINHA_${rowIdx}`;
                    }
                    // Se já existe outro campo com mesmo nome no mesmo parentSelector, adiciona sufixo incremental
                    let similarCount = 0;
                    if (window.interactions && Array.isArray(window.interactions)) {
                        similarCount = window.interactions.filter(i => i.parentSelector === parentSelector && i.nomeElemento === nomeComposto).length;
                    }
                    if (similarCount > 0) {
                        nomeComposto += `_${similarCount+1}`;
                    }
                    nomeElemento = nomeComposto;
                }
                    let value = '';
                    if (typeof target.value !== 'undefined') {
                        value = target.value;
                    } else if (typeof target.innerText !== 'undefined') {
                        value = target.innerText;
                    } else if (typeof target.textContent !== 'undefined') {
                        value = target.textContent;
                    }
                    // Define o step de acordo com a posição
                    let step = 'Then';
                    let offset = 0;
                    if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') offset = 1;
                    if (window.interactions.length === 0) step = 'Given';
                    else if (window.interactions.length === 1 && offset === 0) step = 'When';
                    else if (window.interactions.length === 1 && offset === 1) step = 'When';
                    else if (window.interactions.length === 2 && offset === 1) step = 'Then';
                    // Evita duplicidade
                    const last = window.interactions[window.interactions.length - 1];
                    if (
                        last &&
                        last.acao === 'preenche' &&
                        last.cssSelector === cssSelector &&
                        last.nomeElemento === nomeElemento &&
                        last.valorPreenchido === value
                    ) {
                        return;
                    }
                    // parentSelector já definido acima
                    window.interactions.push({
                        step,
                        acao: 'preenche',
                        acaoTexto: 'Preencher',
                        nomeElemento,
                        cssSelector,
                        xpath,
                        valorPreenchido: value,
                        parentSelector,
                        timestamp: Date.now()
                    });
                    renderLogWithActions();
                    if (typeof window.saveInteractionsToStorage === 'function') window.saveInteractionsToStorage();
                };
            }
            // Handler para keydown(Tab) - garante registro mesmo sem blur
            if (!window.__gherkinPreencheKeydownHandler) {
                window.__gherkinPreencheKeydownHandler = function(ev) {
                    if (ev.key === 'Tab') {
                        // Aguarda o valor ser atualizado após o Tab
                        setTimeout(() => {
                            // Chama a lógica de registro diretamente, sem depender do blur
                            if (!window.isRecording || window.isPaused) return;
                            if (!isExtensionContextValid()) return;
                            let target = ev.target;
                            if (target.tagName === 'P-INPUTNUMBER' || (target.classList && target.classList.contains('p-inputnumber'))) {
                                const input = target.querySelector('input.p-inputnumber-input, input.p-inputtext');
                                if (input) target = input;
                            }
                            const cssSelector = getCSSSelector(target);
                            const xpath = typeof getRobustXPath === 'function' ? getRobustXPath(target) : '';
                            let nomeElemento = '';
                            if (target.id) {
                                const label = document.querySelector('label[for="' + target.id + '"]');
                                if (label && label.textContent) {
                                    nomeElemento = label.textContent.trim();
                                }
                            }
                            if (!nomeElemento && target.closest) {
                                const labelParent = target.closest('label');
                                if (labelParent && labelParent.textContent) {
                                    nomeElemento = labelParent.textContent.trim();
                                }
                            }
                            if (!nomeElemento && target.getAttribute('aria-label')) {
                                nomeElemento = target.getAttribute('aria-label').trim();
                            }
                            if (!nomeElemento && target.getAttribute('placeholder')) {
                                nomeElemento = target.getAttribute('placeholder').trim();
                            }
                            if (!nomeElemento && target.getAttribute('name')) {
                                nomeElemento = target.getAttribute('name').trim();
                            }
                            if (!nomeElemento && target.id && !/^([0-9_\-]+|input|field|campo)$/i.test(target.id)) {
                                nomeElemento = target.id.trim();
                            }
                            if (!nomeElemento && typeof target.innerText === 'string' && target.innerText.trim().length > 2 && target.innerText.trim().length < 60) {
                                nomeElemento = target.innerText.trim();
                            }
                            if (!nomeElemento && target.tagName) {
                                nomeElemento = target.tagName.toLowerCase();
                            }
                            nomeElemento = (nomeElemento || '').toString().trim();
                            let value = '';
                            if (typeof target.value !== 'undefined') {
                                value = target.value;
                            } else if (typeof target.innerText !== 'undefined') {
                                value = target.innerText;
                            } else if (typeof target.textContent !== 'undefined') {
                                value = target.textContent;
                            }
                            let step = 'Then';
                            let offset = 0;
                            if (window.interactions.length > 0 && window.interactions[0].acao === 'acessa_url') offset = 1;
                            if (window.interactions.length === 0) step = 'Given';
                            else if (window.interactions.length === 1 && offset === 0) step = 'When';
                            else if (window.interactions.length === 1 && offset === 1) step = 'When';
                            else if (window.interactions.length === 2 && offset === 1) step = 'Then';
                            const last = window.interactions[window.interactions.length - 1];
                            if (
                                last &&
                                last.acao === 'preenche' &&
                                last.cssSelector === cssSelector &&
                                last.nomeElemento === nomeElemento &&
                                last.valorPreenchido === value
                            ) {
                                return;
                            }
                            let parentSelector = '';
                            let parent = target.closest && (target.closest('tr') || target.closest('tbody') || target.closest('table'));
                            if (parent) {
                                parentSelector = getCSSSelector(parent);
                            }
                            window.interactions.push({
                                step,
                                acao: 'preenche',
                                acaoTexto: 'Preencher',
                                nomeElemento,
                                cssSelector,
                                xpath,
                                valorPreenchido: value,
                                parentSelector,
                                timestamp: Date.now()
                            });
                            renderLogWithActions();
                            if (typeof window.saveInteractionsToStorage === 'function') window.saveInteractionsToStorage();
                        }, 0);
                    }
                };
            }
            // Remove listeners antigos para evitar múltiplos binds
            event.target.removeEventListener('blur', window.__gherkinPreencheBlurChangeHandler, true);
            event.target.removeEventListener('change', window.__gherkinPreencheBlurChangeHandler, true);
            event.target.removeEventListener('keydown', window.__gherkinPreencheKeydownHandler, true);
            // Se for um p-inputnumber, também remove do componente pai
            if (event.target.closest && event.target.closest('p-inputnumber')) {
                const pInputNumber = event.target.closest('p-inputnumber');
                pInputNumber.removeEventListener('blur', window.__gherkinPreencheBlurChangeHandler, true);
                pInputNumber.removeEventListener('change', window.__gherkinPreencheBlurChangeHandler, true);
                pInputNumber.removeEventListener('keydown', window.__gherkinPreencheKeydownHandler, true);
            }
            // Adiciona listeners para blur, change e keydown(Tab)
            event.target.addEventListener('blur', window.__gherkinPreencheBlurChangeHandler, true);
            event.target.addEventListener('change', window.__gherkinPreencheBlurChangeHandler, true);
            event.target.addEventListener('keydown', window.__gherkinPreencheKeydownHandler, true);
            // Se for p-inputnumber, adiciona também no componente pai
            if (event.target.closest && event.target.closest('p-inputnumber')) {
                const pInputNumber = event.target.closest('p-inputnumber');
                pInputNumber.addEventListener('blur', window.__gherkinPreencheBlurChangeHandler, true);
                pInputNumber.addEventListener('change', window.__gherkinPreencheBlurChangeHandler, true);
                pInputNumber.addEventListener('keydown', window.__gherkinPreencheKeydownHandler, true);
            }
            return;
        }

        // Para outras ações (não preenche), não faz nada aqui
    } catch (err) {
        console.error('Erro no handleInputEvent:', err);
    }
}
document.removeEventListener('input', handleInputEvent, true); // Evita múltiplos binds
document.addEventListener('input', handleInputEvent, true);

// Atualiza o log ao renderizar o painel em modo gravação
if (typeof renderPanelContent !== 'undefined') {
    const originalRenderPanelContent = renderPanelContent;
    renderPanelContent = function(panel) {
        originalRenderPanelContent(panel);
        if (window.gherkinPanelState === 'gravando') {
            setTimeout(renderLogWithActions, 10);
        }
        // Garante que o arrasto seja aplicado após renderização
        const header = panel.querySelector('.gherkin-panel-header');
        if (header) {
            makePanelDraggable(panel, header);
        }
    };
}

// Função para exportar README.md para cada feature/cenário
function exportReadmeForFeatures(selectedIdxs) {
    getConfig((config) => {
        if (!window.gherkinFeatures || !Array.isArray(window.gherkinFeatures)) {
            showFeedback('Nenhuma feature para exportar!', 'error');
            return;
        }
        const featuresToExport = window.gherkinFeatures.filter((_, idx) => selectedIdxs.includes(idx));
        if (featuresToExport.length === 0) {
            showFeedback('Selecione ao menos uma feature!', 'error');
            return;
        }
        featuresToExport.forEach((feature, fIdx) => {
            let readme = `# Feature: ${feature.name}\n\n`;
            readme += `## Descrição do fluxo\n`;
            readme += `Esta feature cobre o(s) seguinte(s) cenário(s):\n\n`;
            (feature.cenarios || []).forEach((cenario, cIdx) => {
                readme += `### Cenário: ${cenario.name}\n`;
                readme += `**Fluxo resumido:**\n`;
                (cenario.interactions || []).forEach((interaction, iIdx) => {
                    let step = interaction.step || '';
                    let acao = interaction.acaoTexto || interaction.acao || '';
                    let elemento = interaction.nomeElemento || '';
                    let valor = interaction.valorPreenchido ? ` (valor: "${interaction.valorPreenchido}")` : '';
                    let extra = '';
                    if (interaction.acao === 'upload' && interaction.nomeArquivo) {
                        extra = ` (arquivo: ${interaction.nomeArquivo})`;
                    }
                    readme += `- ${step} ${acao} em "${elemento}"${valor}${extra}\n`;
                });
                readme += '\n';
            });

            readme += `## Pré-requisitos\n`;
            readme += `- Navegador Google Chrome com extensão Selenium WebDriver instalada (ou ambiente Python/Selenium configurado)\n`;
            readme += `- Acesso ao ambiente de testes\n\n`;

            readme += `## Exemplo de execução (Python + Selenium)\n`;
            readme += '```python\n';
            readme += '# Exemplo básico de inicialização do Selenium\n';
            readme += 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\n';
            readme += 'driver = webdriver.Chrome()\n';
            readme += 'driver.get("URL_DO_SISTEMA")\n';
            readme += '# ...seguir os passos do cenário conforme descrito acima...\n';
            readme += '```\n\n';

            readme += `## Observações\n`;
            readme += `- Adapte os seletores e valores conforme necessário para o seu ambiente.\n`;
            readme += `- Prints das telas podem ser adicionados manualmente após a execução dos testes.\n`;

            // Gera arquivo README para cada feature
            const filename = `README_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
            downloadFile(filename, readme);
        });
        showFeedback('README.md exportado(s) com sucesso!');
    });
}

// Função para exportar features selecionadas e README.md juntos
function exportSelectedFeatures(selectedIdxs) {
    showSpinner('Exportando arquivos...');
    getConfig((config) => {
        // Gera o texto da feature/cenário usando os mesmos templates do log
        let exportText = '';
        if (!window.gherkinFeatures || !Array.isArray(window.gherkinFeatures)) {
            showFeedback('Nenhuma feature para exportar!', 'error');
            return;
        }
        const featuresToExport = window.gherkinFeatures.filter((_, idx) => selectedIdxs.includes(idx));
        if (featuresToExport.length === 0) {
            showFeedback('Selecione ao menos uma feature!', 'error');
            return;
        }


        // Exporta um arquivo .feature por feature
        featuresToExport.forEach((feature) => {
            // Função slugify local para garantir consistência
            function slugify(str, upperCamel) {
                let s = (str || '').normalize('NFD').replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '_').replace(/^_+|_+$/g, '');
                if (upperCamel) {
                    s = s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
                } else {
                    s = s.toLowerCase();
                }
                return s;
            }
            const featureSlug = slugify(feature.name, false);
            let featureText = `Feature: ${feature.name}\n`;
            (feature.cenarios || []).forEach((cenario, cIdx) => {
                featureText += `  Scenario: ${cenario.name}\n`;
                const interactions = cenario.interactions || [];
                let i = 0;
                while (i < interactions.length) {
                    const interaction = interactions[i];
                    let step = interaction.step || 'When';
                    // Agrupamento de "preenche" consecutivos do mesmo contexto
                    if (interaction.acao === 'preenche') {
                        const group = [];
                        const parentSelector = interaction.parentSelector || '';
                        let j = i;
                        while (
                            j < interactions.length &&
                            interactions[j].acao === 'preenche' &&
                            (interactions[j].parentSelector || '') === parentSelector
                        ) {
                            group.push(interactions[j]);
                            j++;
                        }
                        // Só agrupa se houver mais de um no mesmo contexto
                        if (group.length > 1) {
                            let stepLabel = step.charAt(0).toUpperCase() + step.slice(1).toLowerCase();
                            featureText += `    ${stepLabel} preencho os campos da tabela:\n`;
                            featureText += `      | Campo | Valor |\n`;
                            group.forEach(item => {
                                featureText += `      | ${item.nomeElemento} | ${item.valorPreenchido} |\n`;
                            });
                            i = j;
                            continue;
                        } else {
                            // Caso só tenha um, exporta normalmente
                            let valor = (interaction.valorPreenchido !== undefined && interaction.valorPreenchido !== null && interaction.valorPreenchido !== '') ? interaction.valorPreenchido : '<valor>';
                            let frase = `o usuário preenche o campo ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''} com "${valor}"`;
                            let stepLabel = step.charAt(0).toUpperCase() + step.slice(1).toLowerCase();
                            featureText += `    ${stepLabel} ${frase}\n`;
                            i++;
                            continue;
                        }
                    }
                    // --- Exporta valida_url ---
                    if (interaction.acao === 'valida_url') {
                        let frase = `valida que a URL da página é "${interaction.urlEsperada}"`;
                        let stepLabel = step.charAt(0).toUpperCase() + step.slice(1).toLowerCase();
                        featureText += `    ${stepLabel} ${frase}\n`;
                        i++;
                        continue;
                    }
                    // Exporta normalmente para outras ações
                    let frase = '';
                    if (step === 'Given' && interaction.acao === 'acessa_url' && interaction.nomeElemento && interaction.nomeElemento.startsWith('http')) {
                        frase = `que o usuário acessa a página \"${interaction.nomeElemento}\"`;
                    } else if (interaction.stepText) {
                        frase = interaction.stepText;
                    } else if (interaction.acao === 'clica') {
                        frase = `o usuário clica no elemento ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''}`;
                    } else if (interaction.acao === 'upload') {
                        let arquivo = (interaction.nomeArquivo !== undefined && interaction.nomeArquivo !== null && interaction.nomeArquivo !== '') ? interaction.nomeArquivo : '<arquivo>';
                        frase = `o usuário faz upload do arquivo "${arquivo}" no campo ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''}`;
                    } else if (interaction.acao === 'espera_elemento') {
                        frase = `o usuário espera o elemento ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''} aparecer`;
                    } else if (interaction.acao === 'espera_segundos') {
                        frase = `o usuário espera ${interaction.tempoEspera || '<segundos>'} segundos`;
                    } else if (interaction.acao && interaction.acao.toLowerCase().includes('valida')) {
                        frase = `o usuário valida que existe o elemento ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''}`;
                    } else {
                        frase = `${interaction.acaoTexto || interaction.acao || 'ação'} no elemento ${interaction.nomeElemento ? '"' + interaction.nomeElemento + '"' : ''}`;
                    }
                    let stepLabel = step.charAt(0).toUpperCase() + step.slice(1).toLowerCase();
                    featureText += `    ${stepLabel} ${frase}\n`;
                    i++;
                }
                featureText += '\n';
            });
            const featureFilename = `${featureSlug}.feature`;
            downloadFile(featureFilename, featureText);
        });

        // Exporta README.md, pages.py, steps.py, environment.py, requirements.txt para cada feature selecionada
        featuresToExport.forEach((feature) => {
            // --- README.md aprimorado ---
            let readme = `# Feature: ${feature.name}\n
## Descrição do fluxo
Esta feature cobre o(s) seguinte(s) cenário(s):\n
`;
            (feature.cenarios || []).forEach((cenario) => {
                readme += `### Cenário: ${cenario.name}\n`;
                readme += `**Fluxo resumido:**\n`;
                (cenario.interactions || []).forEach((interaction) => {
                    let step = interaction.step || '';
                    let acao = interaction.acaoTexto || interaction.acao || '';
                    let elemento = interaction.nomeElemento || '';
                    let valor = interaction.valorPreenchido ? ` (valor: "${interaction.valorPreenchido}")` : '';
                    let extra = '';
                    if (interaction.acao === 'upload' && interaction.nomeArquivo) {
                        extra = ` (arquivo: ${interaction.nomeArquivo})`;
                    }
                    readme += `- ${step} ${acao} em "${elemento}"${valor}${extra}\n`;
                });
                readme += '\n';
            });

            // Instruções de uso aprimoradas
            readme += `## Como executar os testes\n`;
            readme += `1. Instale as dependências:\n`;
            readme += '   ```bash\n   pip install -r requirements.txt\n   ```\n';
            readme += `2. Execute os testes com o Behave:\n`;
            readme += '   ```bash\n   behave\n   ```\n\n';

            readme += `## Pré-requisitos\n`;
            readme += `- Navegador Google Chrome com extensão Selenium WebDriver instalada (ou ambiente Python/Selenium configurado)\n`;
            readme += `- Acesso ao ambiente de testes\n\n`;

            readme += `## Exemplo de execução (Python + Selenium)\n`;
            readme += '```python\n';
            readme += '# Exemplo básico de inicialização do Selenium\n';
            readme += 'from selenium import webdriver\nfrom selenium.webdriver.common.by import By\n\n';
            readme += 'driver = webdriver.Chrome()\n';
            readme += 'driver.get("URL_DO_SISTEMA")\n';
            readme += '# ...seguir os passos do cenário conforme descrito acima...\n';
            readme += '```\n\n';

            readme += `## Observações\n`;
            readme += `- Adapte os seletores e valores conforme necessário para o seu ambiente.\n`;
            readme += `- Prints das telas podem ser adicionados manualmente após a execução dos testes.\n`;
            readme += `- Consulte os arquivos \`pages.py\`, \`steps.py\` e \`environment.py\` para customizações avançadas.\n`;

            // Gera arquivo README para cada feature
            const filename = `README_${feature.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
            downloadFile(filename, readme);


            // Função para normalizar nomes de locator e textos do .feature (remove acentos, espaços, caracteres especiais, minúsculo)
            function normalizeLocatorKey(str) {
                return (str || '')
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z0-9_]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_+|_+$/g, '')
                    .replace(/^[0-9]+/, '')
                    .toLowerCase();
            }
            function normalizeLocatorPart(str) {
                return (str || '')
                    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                    .replace(/[^a-zA-Z0-9_]/g, '_')
                    .replace(/_+/g, '_')
                    .replace(/^_+|_+$/g, '')
                    .replace(/^[0-9]+/, '')
                    .toUpperCase();
            }

            const locatorSet = new Set();
            const locatorMap = {};
            const featureLocatorNameMap = {};
            const normalizedFeatureKeys = new Map();

            // 1º passo: gerar todos os locators normalmente, padronizando nomes e textos
            (feature.cenarios || []).forEach((cenario) => {
                (cenario.interactions || []).forEach((interaction) => {
                    if (interaction.cssSelector && interaction.nomeElemento) {
                        // Usa a chave completa do .feature (incluindo texto após o pipe, se houver)
                        const nomeFeatureCompleto = interaction.nomeElemento.trim();
                        const nomeFeaturePadronizado = normalizeLocatorKey(nomeFeatureCompleto);
                        // Para o nome do locator, inclui o texto após o pipe se existir
                        let [parte1, parte2] = nomeFeatureCompleto.split('|').map(s => s.trim());
                        let locatorName = normalizeLocatorPart(parte1);
                        if (parte2) {
                            locatorName += '_' + normalizeLocatorPart(parte2);
                        }
                        if (!locatorName) locatorName = 'ELEMENTO_' + Math.random().toString(36).substring(2, 8).toUpperCase();
                        let baseName = locatorName;
                        let count = 1;
                        while (locatorSet.has(locatorName)) {
                            locatorName = baseName + '_' + count;
                            count++;
                        }
                        locatorSet.add(locatorName);
                        locatorMap[locatorName] = interaction.cssSelector;
                        // Mapeia a chave padronizada do .feature para o nome do locator
                        featureLocatorNameMap[nomeFeaturePadronizado] = locatorName;
                        // Guarda o texto original para possível aviso de inconsistência
                        if (!normalizedFeatureKeys.has(nomeFeaturePadronizado)) {
                            normalizedFeatureKeys.set(nomeFeaturePadronizado, new Set());
                        }
                        normalizedFeatureKeys.get(nomeFeaturePadronizado).add(nomeFeatureCompleto);
                    }
                });
            });

            // Aviso de inconsistência: se o mesmo nome padronizado aparece com textos diferentes no .feature
            const inconsistencias = [];
            normalizedFeatureKeys.forEach((originais, key) => {
                if (originais.size > 1) {
                    inconsistencias.push(`# Atenção: O texto do .feature apresenta variações para o mesmo campo padronizado ('${key}'): ${Array.from(originais).join(', ')}`);
                }
            });

            // 2º passo: garantir que todos os valores de featureLocatorNameMap existam em locatorSet (e locatorMap)
            // 2º passo: garantir que todos os valores de featureLocatorNameMap existam em locatorSet (e locatorMap)
            const missingLocators = [];
            Object.entries(featureLocatorNameMap).forEach(([featureKey, locatorName]) => {
                if (!locatorSet.has(locatorName)) {
                    // Se não existe, cria um locator "falso" (evita erro de atributo ausente)
                    locatorSet.add(locatorName);
                    locatorMap[locatorName] = 'MISSING_LOCATOR';
                    missingLocators.push(`${featureKey} → ${locatorName}`);
                }
            });
            // Garante que todos os campos do .feature estejam no LOCATOR_MAP
            Object.keys(normalizedFeatureKeys).forEach(featureKey => {
                const locatorName = featureLocatorNameMap[featureKey];
                if (!locatorMap[locatorName]) {
                    locatorMap[locatorName] = 'MISSING_LOCATOR';
                    missingLocators.push(`${featureKey} → ${locatorName}`);
                }
            });
            // Adiciona aviso explícito se houver locators faltantes
            let missingLocatorsWarning = '';
            if (missingLocators.length > 0) {
                missingLocatorsWarning = `# Atenção: Os seguintes campos do .feature não possuem locator definido e foram adicionados como 'MISSING_LOCATOR':\n#   ${missingLocators.join(', ')}\n`;
                if (typeof console !== 'undefined') {
                    console.warn(missingLocatorsWarning);
                }
            }

            // --- Detecta ambiguidades de locator (mesmo seletor para nomes diferentes) ---
            const selectorToNames = {};
            Object.entries(locatorMap).forEach(([locatorName, cssSelector]) => {
                if (!selectorToNames[cssSelector]) selectorToNames[cssSelector] = [];
                selectorToNames[cssSelector].push(locatorName);
            });
            const ambiguousLocators = Object.entries(selectorToNames)
                .filter(([cssSelector, names]) => names.length > 1)
                .map(([cssSelector, names]) => {
                    return `# Atenção: O seletor '${cssSelector}' está sendo usado para múltiplos campos: ${names.join(', ')}`;
                });

            // --- Detecta locators genéricos (ex: apenas 'div', 'span', etc) ---
            const genericTags = ['div', 'span', 'button', 'input', 'a', 'p', 'section', 'article', 'header', 'footer', 'main', 'form'];
            const genericLocators = Object.entries(locatorMap)
                .filter(([locatorName, cssSelector]) => {
                    // Considera genérico se o seletor for apenas a tag, sem classes, ids ou atributos
                    return genericTags.includes(cssSelector.trim().toLowerCase());
                })
                .map(([locatorName, cssSelector]) => {
                    return `# Atenção: O locator '${locatorName}' está usando um seletor genérico ('${cssSelector}'). Torne-o mais específico usando uma classe ou atributo exclusivo.`;
                });

            // --- pages.py com docstrings, comentários e tratamento de exceções ---
            const featureSlug = slugify(feature.name, false);
            const pagesPy = `# ${featureSlug}_pages.py gerado automaticamente para a feature "${feature.name}"
 # -*- coding: utf-8 -*-
"""
Page Object Model (POM) para a feature "${feature.name}".
Contém classes de locators e métodos de interação para uso nos steps do Behave.
Inclui tratamento de exceções para maior robustez.
Timeouts parametrizáveis e configuráveis globalmente.
"""

# IMPORTS AGRUPADOS E COMPLETOS
import os
from selenium.webdriver.common.by import By
from selenium.common.exceptions import NoSuchElementException, TimeoutException, ElementNotInteractableException, StaleElementReferenceException
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
import time

class Locators${slugify(feature.name, true)}:
    """
    Locators para os elementos da feature "${feature.name}".
    """
${locatorSet.size === 0
    ? `    # Nenhum locator identificado`
    : Array.from(locatorSet).map(key => `    ${key} = (By.CSS_SELECTOR, '${locatorMap[key]}')`).join('\n')
}


${ambiguousLocators.length > 0 ? ambiguousLocators.join('\n') + '\n' : ''}
${genericLocators.length > 0 ? genericLocators.join('\n') + '\n' : ''}


class Page${slugify(feature.name, true)}:
    """
    Classe de Page Object para interações genéricas da feature "${feature.name}".
    """

    def __init__(self, driver, default_timeout=10):
        """
        Inicializa o Page Object com o driver do Selenium e timeout padrão.
        O timeout padrão pode ser sobrescrito por variável de ambiente SELENIUM_TIMEOUT.
        Também torna todos os locators disponíveis como atributos da instância.
        """
        self.driver = driver
        self.default_timeout = int(os.getenv("SELENIUM_TIMEOUT", default_timeout))
        # Torna todos os locators disponíveis como atributos da instância
        for attr in dir(Locators${slugify(feature.name, true)}):
            if attr.isupper():
                setattr(self, attr, getattr(Locators${slugify(feature.name, true)}, attr))

    def acessar_url(self, url):
        """
        Acessa a URL informada.
        """
        try:
            self.driver.get(url)
            print(f"[INFO] Acessou a URL '{url}' com sucesso.")
        except Exception as e:
            print(f"[ERRO] Falha ao acessar URL '{url}': {e}")
            raise

    def clicar(self, locator, tentativas=3, espera=1):
        """
        Clica no elemento identificado pelo locator, com retry automático em caso de StaleElementReferenceException e espera explícita para estar clicável.
        tentativas: número de tentativas antes de falhar.
        espera: tempo (segundos) entre as tentativas.
        """
        tentativa = 0
        ultimo_erro = None
        while tentativa < tentativas:
            try:
                WebDriverWait(self.driver, self.default_timeout).until(EC.element_to_be_clickable(locator))
                self.driver.find_element(*locator).click()
                print(f"[INFO] Clique realizado com sucesso no elemento {locator}.")
                return
            except StaleElementReferenceException as e:
                print(f"[WARN] StaleElementReferenceException ao clicar no elemento {locator}: {e}. Tentando novamente ({tentativa+1}/{tentativas})...")
                time.sleep(espera)
                tentativa += 1
                ultimo_erro = e
            except (NoSuchElementException, ElementNotInteractableException) as e:
                print(f"[ERRO] Falha ao clicar no elemento {locator}: {e}")
                raise
            except Exception as e:
                print(f"[ERRO] Erro inesperado ao clicar no elemento {locator}: {e}")
                raise
        raise Exception(f"Não foi possível clicar no elemento {locator} após {tentativas} tentativas devido a StaleElementReferenceException. Último erro: {ultimo_erro}")

    def preencher(self, locator, valor, tentativas=3, espera=1):
        """
        Preenche o campo identificado pelo locator com o valor informado, com retry automático em caso de StaleElementReferenceException e espera explícita para estar visível.
        """
        tentativa = 0
        ultimo_erro = None
        while tentativa < tentativas:
            try:
                WebDriverWait(self.driver, self.default_timeout).until(EC.visibility_of_element_located(locator))
                el = self.driver.find_element(*locator)
                el.clear()
                el.send_keys(valor)
                print(f"[INFO] Preenchimento do campo {locator} com valor '{valor}' realizado com sucesso.")
                return
            except StaleElementReferenceException as e:
                print(f"[WARN] StaleElementReferenceException ao preencher o campo {locator}: {e}. Tentando novamente ({tentativa+1}/{tentativas})...")
                time.sleep(espera)
                tentativa += 1
                ultimo_erro = e
            except NoSuchElementException as e:
                print(f"[ERRO] Elemento {locator} não encontrado: {e}")
                raise
            except ElementNotInteractableException as e:
                print(f"[ERRO] Elemento {locator} não interagível: {e}")
                raise
            except Exception as e:
                print(f"[ERRO] Erro inesperado ao preencher {locator}: {e}")
                raise
        raise Exception(f"Não foi possível preencher o campo {locator} após {tentativas} tentativas devido a StaleElementReferenceException. Último erro: {ultimo_erro}")

    def selecionar(self, locator, valor, tentativas=3, espera=1):
        """
        Seleciona o valor informado em um campo select identificado pelo locator, com retry automático em caso de StaleElementReferenceException e espera explícita para estar presente.
        """
        tentativa = 0
        ultimo_erro = None
        while tentativa < tentativas:
            try:
                WebDriverWait(self.driver, self.default_timeout).until(EC.presence_of_element_located(locator))
                select = Select(self.driver.find_element(*locator))
                select.select_by_visible_text(valor)
                print(f"[INFO] Seleção do valor '{valor}' realizada com sucesso em {locator}.")
                return
            except StaleElementReferenceException as e:
                print(f"[WARN] StaleElementReferenceException ao selecionar valor '{valor}' em {locator}: {e}. Tentando novamente ({tentativa+1}/{tentativas})...")
                time.sleep(espera)
                tentativa += 1
                ultimo_erro = e
            except (NoSuchElementException, ElementNotInteractableException) as e:
                print(f"[ERRO] Falha ao selecionar valor '{valor}' em {locator}: {e}")
                raise
            except Exception as e:
                print(f"[ERRO] Erro inesperado ao selecionar valor '{valor}' em {locator}: {e}")
                raise
        raise Exception(f"Não foi possível selecionar o valor '{valor}' em {locator} após {tentativas} tentativas devido a StaleElementReferenceException. Último erro: {ultimo_erro}")

    def upload_arquivo(self, locator, caminho_arquivo, tentativas=3, espera=1):
        """
        Realiza upload de arquivo no campo identificado pelo locator, com retry automático em caso de StaleElementReferenceException e espera explícita para estar visível.
        """
        tentativa = 0
        ultimo_erro = None
        while tentativa < tentativas:
            try:
                WebDriverWait(self.driver, self.default_timeout).until(EC.visibility_of_element_located(locator))
                self.driver.find_element(*locator).send_keys(caminho_arquivo)
                print(f"[INFO] Upload do arquivo '{caminho_arquivo}' realizado com sucesso em {locator}.")
                return
            except StaleElementReferenceException as e:
                print(f"[WARN] StaleElementReferenceException ao fazer upload do arquivo '{caminho_arquivo}' em {locator}: {e}. Tentando novamente ({tentativa+1}/{tentativas})...")
                time.sleep(espera)
                tentativa += 1
                ultimo_erro = e
            except (NoSuchElementException, ElementNotInteractableException) as e:
                print(f"[ERRO] Falha ao fazer upload do arquivo '{caminho_arquivo}' em {locator}: {e}")
                raise
            except Exception as e:
                print(f"[ERRO] Erro inesperado ao fazer upload do arquivo '{caminho_arquivo}' em {locator}: {e}")
                raise
        raise Exception(f"Não foi possível fazer upload do arquivo '{caminho_arquivo}' em {locator} após {tentativas} tentativas devido a StaleElementReferenceException. Último erro: {ultimo_erro}")

    def esperar_elemento(self, locator, timeout=None):
        """
        Aguarda até que o elemento esteja presente na tela.
        O timeout pode ser informado no método ou será usado o padrão da classe.
        """
        timeout = int(timeout) if timeout is not None else self.default_timeout
        try:
            WebDriverWait(self.driver, timeout).until(EC.presence_of_element_located(locator))
            print(f"[INFO] Elemento {locator} apareceu na tela (timeout={timeout}s).")
        except TimeoutException as e:
            print(f"[ERRO] Timeout ao esperar elemento {locator}: {e}")
            raise

    def esperar_elemento_desaparecer(self, locator, timeout=None):
        """
        Aguarda até que o elemento desapareça da tela.
        O timeout pode ser informado no método ou será usado o padrão da classe.
        """
        timeout = int(timeout) if timeout is not None else self.default_timeout
        try:
            WebDriverWait(self.driver, timeout).until(EC.invisibility_of_element_located(locator))
            print(f"[INFO] Elemento {locator} desapareceu da tela (timeout={timeout}s).")
        except TimeoutException as e:
            print(f"[ERRO] Timeout ao esperar elemento {locator} desaparecer: {e}")
            raise

`;
            downloadFile(`${featureSlug}_pages.py`, pagesPy);


            // --- steps.py com tratamento de exceções e logs aprimorados ---

            // --- Gerar dicionário de mapeamento de locators ---
            // O dicionário mapeia o nome do elemento (como aparece no .feature) para o nome da constante do locator
            const locatorMapEntries = Object.entries(featureLocatorNameMap)
                .filter(([nomeFeature, locatorName]) => locatorSet.has(locatorName))
                .map(([nomeFeature, locatorName]) => `    ${JSON.stringify(nomeFeature)}: "${locatorName}"`)
                .join(',\n');

            const stepsPy = `# ${featureSlug}_steps.py gerado automaticamente para a feature "${feature.name}"
# -*- coding: utf-8 -*-
"""
Steps do Behave para a feature "${feature.name}".
Contém as definições dos passos (steps) utilizados nos testes automatizados.
Inclui tratamento de exceções e logs aprimorados.
"""

from behave import given, when, then
import logging

# Mapeamento do texto do .feature para o nome do locator
LOCATOR_MAP = {
${locatorMapEntries}
}

# Configuração do logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.FileHandler('gherkin_tests.log')
handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
if not logger.handlers:
    logger.addHandler(handler)

@given('que o usuário acessa a página "{url}"')
def step_acessa_url(context, url):
    """
    Passo dado para acessar uma URL.
    """
    try:
        context.page.acessar_url(url)
        logger.info(f"Acessou a URL: {url}")
    except Exception as e:
        logger.error(f"Erro ao acessar a URL {url}: {e}")
        raise

@when('o usuário clica no elemento {elemento}')
def step_clica_elemento(context, elemento):
    """
    Passo quando para clicar em um elemento.
    """
    try:
        locator_name = LOCATOR_MAP.get(elemento)
        locator = getattr(context.page, locator_name, None)
        if locator is None:
            raise Exception(f"Locator para o elemento '{elemento}' não encontrado.")
        # Se o elemento tem texto após o pipe, valida o texto após o clique
        texto_esperado = elemento.split('|')[1].strip() if '|' in elemento else None
        context.page.clicar(locator)
        if texto_esperado:
            el = context.driver.find_element(*locator)
            if texto_esperado not in el.text:
                raise AssertionError(f"Texto '{texto_esperado}' não encontrado no elemento {elemento} após o clique.")
        logger.info(f"Clicou no elemento: {elemento}")
    except Exception as e:
        logger.error(f"Erro ao clicar no elemento {elemento}: {e}")
        raise

@when('o usuário preenche o campo {campo} com "{valor}"')
def step_preenche_campo(context, campo, valor):
    """
    Passo quando para preencher um campo com um valor.
    """
    try:
        locator_name = LOCATOR_MAP.get(campo.lower().split('|')[0].strip())
        locator = getattr(context.page, locator_name, None)
        if locator is None:
            raise Exception(f"Locator para o campo '{campo}' não encontrado.")
        # Se o campo tem texto após o pipe, valida o texto após preencher
        texto_esperado = campo.split('|')[1].strip() if '|' in campo else None
        context.page.preencher(locator, valor)
        if texto_esperado:
            el = context.driver.find_element(*locator)
            if texto_esperado not in el.text:
                raise AssertionError(f"Texto '{texto_esperado}' não encontrado no campo {campo} após preencher.")
        logger.info(f"Preencheu o campo {campo} com o valor: {valor}")
    except Exception as e:
        logger.error(f"Erro ao preencher o campo {campo} com o valor {valor}: {e}")
        raise

@when('valida que a URL da página é "{url}"')
@then('valida que a URL da página é "{url}"')
def step_valida_url(context, url):
    """
    Passo então para validar a URL da página.
    """
    try:
        url_atual = context.driver.current_url
        if url_atual != url:
            raise AssertionError(f"URL esperada: {url}, mas a URL atual é: {url_atual}")
        logger.info(f"URL da página validada com sucesso: {url_atual}")
    except Exception as e:
        logger.error(f"Erro ao validar a URL da página: {e}")
        raise

# Outros passos (steps) podem ser adicionados aqui conforme necessário


from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from behave import when

# Step para validar existência de elemento com texto
@then('o usuário valida que existe o elemento "{elemento}"')
def step_valida_existencia_elemento(context, elemento):
    locator_name = LOCATOR_MAP.get(elemento)
    locator = getattr(context.page, locator_name, None)
    if locator is None:
        raise Exception(f"Locator para o elemento '{elemento}' não encontrado.")
    texto_esperado = elemento.split('|')[1].strip() if '|' in elemento else None
    WebDriverWait(context.driver, context.default_timeout).until(
        EC.presence_of_element_located(locator)
    )
    el = context.driver.find_element(*locator)
    if texto_esperado and texto_esperado not in el.text:
        raise AssertionError(f"Texto '{texto_esperado}' não encontrado no elemento {elemento}.")
    logger.info(f"Elemento '{elemento}' validado com sucesso.")

@when('preencho os campos da tabela:')
def step_preencho_tabela(context):
    for row in context.table:
        campo = row['Campo']
        valor = row['Valor']
        locator_name = LOCATOR_MAP.get(campo.lower().split('|')[0].strip())
        locator = getattr(context.page, locator_name, None)
        if locator is None:
            raise Exception(f"Locator para o campo '{campo}' não encontrado.")
        context.page.preencher(locator, valor)
        logger.info(f"Preencheu o campo {campo} com o valor: {valor}")
`;
            downloadFile(`${featureSlug}_steps.py`, stepsPy);


            // --- environment.py com configurações básicas ---

            const environmentPy = `# ${featureSlug}_environment.py gerado automaticamente para a feature "${feature.name}"
# -*- coding: utf-8 -*-
"""
Configurações do Behave para a feature "${feature.name}".
Inclui inicialização do WebDriver e do Page Object Model (POM).
"""

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import os
import sys

# Importa o Page Object gerado para esta feature
from ${featureSlug}_pages import Page${slugify(feature.name, true)}

def before_all(context):
    """
    Executado uma vez antes de todos os cenários.
    Inicializa o WebDriver e o Page Object.
    """
    chrome_options = Options()
    chrome_options.add_argument('--start-maximized')
    # Permite customizar o caminho do chromedriver via variável de ambiente
    chromedriver_path = os.getenv('CHROMEDRIVER_PATH')
    if chromedriver_path:
        service = Service(chromedriver_path)
        context.driver = webdriver.Chrome(service=service, options=chrome_options)
    else:
        context.driver = webdriver.Chrome(options=chrome_options)
    context.driver.implicitly_wait(5)
    context.default_timeout = int(os.getenv('SELENIUM_TIMEOUT', 10))  # Timeout padrão de 10 segundos, parametrizável por variável de ambiente
    # Inicializa o Page Object Model
    context.page = Page${slugify(feature.name, true)}(context.driver)
    print("[INFO] WebDriver e Page Object inicializados com sucesso.")

def after_all(context):
    """
    Executado uma vez após todos os cenários.
    Encerra o WebDriver.
    """
    # TODO: Ajustar o mapeamento dos locators se necessário.
    if hasattr(context, 'driver'):
        context.driver.quit()
        print("[INFO] WebDriver finalizado.")
    print("[INFO] Testes finalizados.")

# Outros hooks e configurações podem ser adicionados aqui conforme necessário
`;
            downloadFile(`${featureSlug}_environment.py`, environmentPy);


            // --- requirements.txt com dependências básicas ---
            const requirementsTxt = `# requirements.txt gerado automaticamente para a feature "${feature.name}"
# -*- coding: utf-8 -*-
"""
Dependências necessárias para executar os testes da feature "${feature.name}".
Instale as dependências com: pip install -r requirements.txt
"""

selenium
behave
`;
            downloadFile(`${featureSlug}_requirements.txt`, requirementsTxt);
        });
        // Remove spinner e dá feedback ao usuário
        hideSpinner();
        showFeedback('Exportação concluída!');
    });
}

// Função para exportar tudo (features, README.md, pages.py, steps.py, environment.py, requirements.txt)
function exportAll() {
    const allFeatureIndices = window.gherkinFeatures.map((_, idx) => idx);
    exportSelectedFeatures(allFeatureIndices);
}

// Expor funções para o contexto global, se necessário
window.gherkin = {
    exportReadmeForFeatures,
    exportSelectedFeatures,
    exportAll
};

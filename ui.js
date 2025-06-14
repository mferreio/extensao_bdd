import { showFeedback, validateInput, escapeHTML } from './utils.js';
import { getConfig } from './config.js';
import uiTheme from './uiConfig.js';
import './ui.css';
import Button from './components/Button.js';
import Input from './components/Input.js';
import Feedback from './components/Feedback.js';
import Modal from './components/Modal.js';
import Checkbox from './components/Checkbox.js';

// Garante toggleMinimizePanel sempre disponível no escopo global
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
            minimized.style.background = uiTheme.colors.primary;
            minimized.style.color = uiTheme.colors.textLight;
            minimized.style.borderRadius = uiTheme.borderRadius.btn;
            minimized.style.boxShadow = '0 4px 16px rgba(0,0,0,0.18)';
            minimized.style.display = 'flex';
            minimized.style.alignItems = 'center';
            minimized.style.justifyContent = 'center';
            minimized.style.zIndex = '2147483647';
            minimized.style.cursor = 'pointer';
            minimized.style.fontSize = uiTheme.font.btnSize;
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
}

// Remover a função/fim de injeção dinâmica de estilos duplicados
// (agora os estilos estão em ui.css)

// Função para exibir modal de upload de arquivos de evidência
async function showUploadModal(callback) {
    const [{ default: Modal }, { default: Button }, { default: Input }] = await Promise.all([
        import('./components/Modal.js'),
        import('./components/Button.js'),
        import('./components/Input.js')
    ]);
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const filesContainer = document.createElement('div');
    filesContainer.className = 'gherkin-content';
    // Função para adicionar campo
    function addFileInput(value = '') {
        const fileRow = document.createElement('div');
        fileRow.className = 'gherkin-content';
        const input = Input({ placeholder: 'Ex: evidencia_texto.txt', value, 'aria-label': 'Nome do arquivo de evidência', tabIndex: 0 });
        fileRow.appendChild(input);
        const removeBtn = Button({ className: 'gherkin-btn-danger', children: 'Remover', onClick: () => fileRow.remove() });
        fileRow.appendChild(removeBtn);
        filesContainer.appendChild(fileRow);
    }
    // Adiciona pelo menos um campo
    addFileInput();
    // Botão para adicionar mais arquivos
    const addBtn = Button({ className: 'gherkin-btn-success', children: 'Adicionar outro arquivo', 'aria-label': 'Adicionar outro arquivo de evidência', tabIndex: 0, onClick: () => addFileInput() });
    const okBtn = Button({ className: 'gherkin-btn-main', children: 'OK', 'aria-label': 'Confirmar upload de arquivos', tabIndex: 0, onClick: () => {
        const files = Array.from(filesContainer.querySelectorAll('input')).map(i => i.value.trim()).filter(Boolean);
        if (files.length && callback) callback(files);
        modalBg.remove();
    }});
    const cancelBtn = Button({ className: 'gherkin-btn-danger', children: 'Cancelar', 'aria-label': 'Cancelar upload de arquivos', tabIndex: 0, onClick: () => modalBg.remove() });
    const modalBg = Modal({
        title: 'Upload de arquivos de evidência',
        content: filesContainer,
        actions: [addBtn, okBtn, cancelBtn]
    });
    document.body.appendChild(modalBg);
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('input, button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
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
    panel.style.background = uiTheme.colors.bg;
    panel.style.border = `1px solid ${uiTheme.colors.border}`;
    panel.style.borderRadius = uiTheme.borderRadius.modal;
    panel.style.boxShadow = uiTheme.colors.shadowStrong ? `0 8px 16px ${uiTheme.colors.shadowStrong}` : '0 8px 16px rgba(0,0,0,0.2)';
    panel.style.padding = '10px';
    panel.style.zIndex = uiTheme.zIndex.panel;
    panel.style.fontFamily = uiTheme.font.family;
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
    resizeHandle.innerHTML = '<svg width="22" height="22" aria-hidden="true" focusable="false" style="pointer-events:none"><polyline points="6,20 20,20 20,6" style="fill:none;stroke:#0070f3;stroke-width="2"/></svg>';
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
                <span id="feature-name-tip" class="gherkin-tip" style="display:block;">Exemplo: Login, Cadastro, Busca...</span>
                <input id="feature-name" type="text" placeholder="Ex: Login" aria-describedby="feature-name-tip" />
                <button id="start-feature" class="gherkin-btn gherkin-btn-main">Iniciar Feature</button>
            </div>
        `;
    } else if (window.gherkinPanelState === 'cenario') {
        html += `
            <div class="gherkin-content" style="align-items: center; justify-content: center; flex: 1;">
                <label for="cenario-name">Informe o nome do Cenário:</label>
                <span id="cenario-name-tip" class="gherkin-tip" style="display:block;">Exemplo: Login com sucesso, Cadastro inválido...</span>
                <input id="cenario-name" type="text" placeholder="Ex: Login com sucesso" aria-describedby="cenario-name-tip" />
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
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    const title = document.createElement('div');
    title.textContent = 'Marcar ação como Login';
    title.className = 'gherkin-modal-title';
    title.id = 'gherkin-login-title';
    modal.setAttribute('aria-labelledby', 'gherkin-login-title');
    modal.appendChild(title);
    const userLabel = document.createElement('label');
    userLabel.textContent = 'Usuário/Email:';
    userLabel.style.fontWeight = 'bold';
    userLabel.style.marginBottom = '4px';
    userLabel.setAttribute('for', 'gherkin-login-user');
    modal.appendChild(userLabel);
    const userInput = Input({ type: 'text', id: 'gherkin-login-user', className: 'gherkin-input', 'aria-label': 'Usuário ou Email', tabIndex: 0 });
    modal.appendChild(userInput);
    const passLabel = document.createElement('label');
    passLabel.textContent = 'Senha:';
    passLabel.style.fontWeight = 'bold';
    passLabel.style.marginBottom = '4px';
    passLabel.setAttribute('for', 'gherkin-login-pass');
    modal.appendChild(passLabel);
    const passInput = Input({ type: 'password', id: 'gherkin-login-pass', className: 'gherkin-input', 'aria-label': 'Senha', tabIndex: 0 });
    modal.appendChild(passInput);
    const btns = document.createElement('div');
    btns.className = 'gherkin-modal-buttons';
    const saveBtn = Button({ children: 'Salvar Login', 'aria-label': 'Salvar Login', tabIndex: 0, className: 'gherkin-btn gherkin-btn-main', onClick: () => {
        const usuario = userInput.value.trim();
        const senha = passInput.value;
        const userValidation = validateInput(usuario, { required: true, minLength: 3 });
        const passValidation = validateInput(senha, { required: true, minLength: 3 });
        if (!userValidation.valid) {
            showFeedback(userValidation.error, 'error');
            return;
        }
        if (!passValidation.valid) {
            showFeedback(passValidation.error, 'error');
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
    }});
    const cancelBtn = Button({ children: 'Cancelar', 'aria-label': 'Cancelar login', tabIndex: 0, className: 'gherkin-btn gherkin-btn-danger', onClick: () => modalBg.remove() });
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
async function showModal(message, onYes, onNo) {
    const [{ default: Modal }, { default: Button }] = await Promise.all([
        import('./components/Modal.js'),
        import('./components/Button.js')
    ]);
    const oldModal = document.getElementById('gherkin-modal');
    if (oldModal) oldModal.remove();
    const modalBg = Modal({
        title: 'Confirmação',
        content: message,
        actions: [
            Button({ children: 'Sim', className: 'gherkin-btn gherkin-btn-main', onClick: () => { modalBg.remove(); if (onYes) onYes(); } }),
            Button({ children: 'Não', className: 'gherkin-btn gherkin-btn-danger', onClick: () => { modalBg.remove(); if (onNo) onNo(); } })
        ]
    });
    document.body.appendChild(modalBg);
    setTimeout(() => {
        const focusables = modalBg.querySelectorAll('button, [tabindex="0"]');
        if (focusables.length) focusables[0].focus();
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
        <tr><td style='font-weight:bold;'>Ação:</td><td>${escapeHTML((window.ACTION_META && window.ACTION_META[interaction.acao]?.label) || interaction.acao || '')}</td></tr>
        <tr><td style='font-weight:bold;'>Elemento:</td><td>${escapeHTML(interaction.nomeElemento || '')}</td></tr>
        <tr><td style='font-weight:bold;'>Valor:</td><td>${escapeHTML(interaction.valorPreenchido || interaction.nomeArquivo || '')}</td></tr>
        <tr><td style='font-weight:bold;'>CSS Selector:</td><td><code>${escapeHTML(typeof interaction.cssSelector === 'object' ? interaction.cssSelector?.css : interaction.cssSelector || '')}</code></td></tr>
        <tr><td style='font-weight:bold;'>XPath:</td><td><code>${escapeHTML(typeof interaction.xpath === 'object' ? interaction.xpath?.xpath : interaction.xpath || '')}</code></td></tr>
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
                ${interaction.containerElementName ? `<br><span style='font-weight:normal;'>Container: <code>${escapeHTML(interaction.containerElementName)}</code></span>` : ''}
                ${interaction.containerXpath ? `<br><span style='font-weight:normal;'>XPath do container: <code>${escapeHTML(typeof interaction.containerXpath === 'object' ? interaction.containerXpath?.xpath : interaction.containerXpath)}</code></span>` : ''}
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
    const closeBtn = Button({ children: 'Fechar', className: 'gherkin-btn gherkin-btn-danger', 'aria-label': 'Fechar detalhes da interação', tabIndex: 0, style: 'margin-top:10px', onClick: () => modalBg.remove() });
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
                minimized.style.background = uiTheme.colors.primary;
                minimized.style.color = uiTheme.colors.textLight;
                minimized.style.borderRadius = uiTheme.borderRadius.btn;
                minimized.style.fontSize = uiTheme.font.btnSize;
                minimized.style.border = 'none';
                minimized.style.cursor = 'pointer';
                minimized.style.transition = 'background 0.2s';
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
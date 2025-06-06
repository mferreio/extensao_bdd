// Funções utilitárias
function slugify(text) {
    return text.toString().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function downloadFile(filename, content) {
    let blob;
    if (content instanceof Blob) {
        blob = content;
    } else {
        blob = new Blob([content], { type: 'text/plain' });
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.replace(/\//g, '_'); // Substitui barras para evitar problemas no nome do arquivo
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
}

function showFeedback(message, type = 'success') {
    // Remove feedback antigo se existir
    const old = document.querySelector('.feedback');
    if (old) old.remove();
    const feedback = document.createElement('div');
    feedback.className = 'feedback';
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'assertive');
    feedback.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    feedback.style.color = '#fff';
    feedback.innerHTML = `<span>${message}</span>
        <button class="gherkin-feedback-close" aria-label="Fechar feedback" tabindex="0">&times;</button>`;
    document.body.appendChild(feedback);
    // Fechar manualmente
    feedback.querySelector('.gherkin-feedback-close').onclick = () => feedback.remove();
    // Fechar com ESC
    function escListener(e) {
        if (e.key === 'Escape') {
            feedback.remove();
            document.removeEventListener('keydown', escListener);
        }
    }
    document.addEventListener('keydown', escListener);
    // Fechar automático após 4s
    setTimeout(() => {
        if (feedback.parentNode) feedback.remove();
        document.removeEventListener('keydown', escListener);
    }, 4000);
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function getCSSSelector(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // 1. Prioridade máxima: atributos robustos e únicos
    const attrPriority = [
        'data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'id', 'name', 'type', 'placeholder'
    ];
    for (const attr of attrPriority) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val && document.querySelectorAll(`${element.tagName.toLowerCase()}[${attr}="${CSS.escape(val)}"]`).length === 1) {
            return `${element.tagName.toLowerCase()}[${attr}="${val}"]`;
        }
        if (val && document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`).length === 1) {
            return `[${attr}="${val}"]`;
        }
    }
    // 2. Se tem id único e não é dinâmico
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(element.id)) {
        return `${element.tagName.toLowerCase()}#${element.id}`;
    }
    // 3. Se tem classe única e não genérica
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (/^(p-|ng-|mat-|ant-|Mui|css-)/.test(cls)) continue; // ignora classes de framework
            if (document.querySelectorAll(`.${CSS.escape(cls)}`).length === 1) {
                return `${element.tagName.toLowerCase()}.${cls}`;
            }
        }
    }

    // 4. Busca contexto de componente pai relevante (PrimeNG/Angular/React)
    const COMPONENT_TAGS = [
        'p-calendar', 'p-inputnumber', 'p-fileupload', 'p-dropdown', 'p-inputmask', 'p-checkbox', 'p-radiobutton', 'p-inputswitch', 'p-autocomplete', 'p-multiselect', 'p-editor', 'p-slider', 'p-colorpicker', 'p-rating', 'p-cascadeselect', 'p-chips', 'p-password', 'p-inputtext', 'p-listbox', 'p-selectbutton', 'p-togglebutton', 'p-treeselect', 'p-inputgroup', 'mat-form-field', 'mat-select', 'mat-checkbox', 'mat-radio-button', 'mat-slide-toggle', 'mat-slider', 'mat-input', 'mat-autocomplete', 'button', 'input', 'select', 'textarea'
    ];
    let parent = element.parentElement;
    let parentSelector = '';
    let depth = 0;
    while (parent && depth < 4) {
        const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (COMPONENT_TAGS.includes(tag)) {
            // Procura atributo robusto no componente pai
            for (const attr of attrPriority) {
                const val = parent.getAttribute && parent.getAttribute(attr);
                if (val && document.querySelectorAll(`${tag}[${attr}="${CSS.escape(val)}"]`).length === 1) {
                    parentSelector = `${tag}[${attr}="${val}"]`;
                    break;
                }
            }
            if (!parentSelector) {
                parentSelector = tag;
            }
            break;
        }
        parent = parent.parentElement;
        depth++;
    }
    if (parentSelector) {
        // Se o elemento também tem atributo robusto, compõe
        for (const attr of attrPriority) {
            const val = element.getAttribute && element.getAttribute(attr);
            if (val && document.querySelectorAll(`${parentSelector} ${element.tagName.toLowerCase()}[${attr}="${CSS.escape(val)}"]`).length === 1) {
                return `${parentSelector} ${element.tagName.toLowerCase()}[${attr}="${val}"]`;
            }
        }
        // Caso contrário, retorna seletor composto
        return `${parentSelector} ${element.tagName.toLowerCase()}`;
    }

    // 5. Fallback: monta caminho hierárquico curto (até 2 níveis de parent com id estável)
    let path = element.tagName.toLowerCase();
    parent = element.parentElement;
    depth = 0;
    while (parent && depth < 2) {
        if (parent.id && document.querySelectorAll(`#${CSS.escape(parent.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(parent.id)) {
            path = `${parent.tagName.toLowerCase()}#${parent.id} > ${path}`;
            break;
        }
        parent = parent.parentElement;
        depth++;
    }
    // Se o seletor final for apenas uma tag ou muito genérico, emite aviso e retorna null
    const genericTags = ['div', 'span', 'button', 'input', 'label', 'a', 'ul', 'li', 'tr', 'td', 'th', 'table', 'form', 'section', 'article', 'header', 'footer'];
    // Verifica se é apenas uma tag ou um seletor muito curto
    if (genericTags.includes(path) || /^([a-z]+)(\s*[> ]\s*[a-z]+)?$/i.test(path)) {
        const msg = `Atenção: seletor CSS genérico detectado ('${path}'). Adicione um atributo único (ex: data-testid) ao elemento para garantir robustez nos testes.`;
        if (typeof showFeedback === 'function') {
            showFeedback(msg, 'error');
        }
        if (typeof console !== 'undefined') {
            console.warn(msg);
        }
        return null;
    }
    return path;
}

function getRobustXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // 1. id único e estável
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(element.id)) {
        return `//*[@id="${element.id}"]`;
    }
    // 2. Atributos robustos e únicos
    const attrs = [
        'data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'name', 'type', 'placeholder', 'title', 'role'
    ];
    for (const attr of attrs) {
        const val = element.getAttribute && element.getAttribute(attr);
        // Para XPath, use apenas document.evaluate para unicidade!
        if (val) {
            const xpath = `//${element.tagName.toLowerCase()}[@${attr}='${val}']`;
            try {
                if (document.evaluate(`count(${xpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
                    return xpath;
                }
            } catch (e) { /* ignora erro de XPath inválido */ }
        }
    }
    // 3. Composição com componente pai robusto
    const COMPONENT_TAGS = [
        'p-calendar', 'p-inputnumber', 'p-fileupload', 'p-dropdown', 'p-inputmask', 'p-checkbox', 'p-radiobutton', 'p-inputswitch', 'p-autocomplete', 'p-multiselect', 'p-editor', 'p-slider', 'p-colorpicker', 'p-rating', 'p-cascadeselect', 'p-chips', 'p-password', 'p-inputtext', 'p-listbox', 'p-selectbutton', 'p-togglebutton', 'p-treeselect', 'p-inputgroup', 'mat-form-field', 'mat-select', 'mat-checkbox', 'mat-radio-button', 'mat-slide-toggle', 'mat-slider', 'mat-input', 'mat-autocomplete', 'button', 'input', 'select', 'textarea'
    ];
    let parent = element.parentElement;
    let parentXPath = '';
    let depth = 0;
    while (parent && depth < 4) {
        const tag = parent.tagName ? parent.tagName.toLowerCase() : '';
        if (COMPONENT_TAGS.includes(tag)) {
            for (const attr of attrs) {
                const val = parent.getAttribute && parent.getAttribute(attr);
                if (val) {
                    const parentXpath = `//${tag}[@${attr}='${val}']`;
                    try {
                        if (document.evaluate(`count(${parentXpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
                            parentXPath = parentXpath;
                            break;
                        }
                    } catch (e) { /* ignora erro de XPath inválido */ }
                }
            }
            if (!parentXPath) {
                parentXPath = `//${tag}`;
            }
            break;
        }
        parent = parent.parentElement;
        depth++;
    }
    if (parentXPath) {
        for (const attr of attrs) {
            const val = element.getAttribute && element.getAttribute(attr);
            if (val) {
                const fullXpath = `${parentXPath}//${element.tagName.toLowerCase()}[@${attr}='${val}']`;
                try {
                    if (document.evaluate(`count(${fullXpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
                        return fullXpath;
                    }
                } catch (e) { /* ignora erro de XPath inválido */ }
            }
        }
        return `${parentXPath}//${element.tagName.toLowerCase()}`;
    }

    // 4. Classe única e não genérica
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (/^(p-|ng-|mat-|ant-|Mui|css-)/.test(cls)) continue;
            if (document.evaluate(`count(//${element.tagName.toLowerCase()}[contains(concat(' ',normalize-space(@class),' '),' ${cls} ')])`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
                return `//${element.tagName.toLowerCase()}[contains(concat(' ',normalize-space(@class),' '),' ${cls} ')]`;
            }
        }
    }

    // 5. Caminho relativo curto (até 2 níveis de parent com id estável)
    let path = element.tagName.toLowerCase();
    parent = element.parentElement;
    depth = 0;
    while (parent && depth < 2) {
        if (parent.id && document.querySelectorAll(`#${CSS.escape(parent.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(parent.id)) {
            path = `${parent.tagName.toLowerCase()}[@id="${parent.id}"]/${path}`;
            break;
        }
        parent = parent.parentElement;
        depth++;
    }
    return `//${path}`;
}

function isExtensionContextValid() {
// Torna a função disponível globalmente
window.getRobustXPath = getRobustXPath;
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

// Spinner global seguro
function showSpinner(message = 'Processando...') {
    // Evita múltiplos spinners
    if (document.getElementById('gherkin-spinner-modal')) return;
    const modalBg = document.createElement('div');
    modalBg.id = 'gherkin-spinner-modal';
    modalBg.style.position = 'fixed';
    modalBg.style.top = '0';
    modalBg.style.left = '0';
    modalBg.style.width = '100vw';
    modalBg.style.height = '100vh';
    modalBg.style.background = 'rgba(0,0,0,0.18)';
    modalBg.style.display = 'flex';
    modalBg.style.alignItems = 'center';
    modalBg.style.justifyContent = 'center';
    modalBg.style.zIndex = '2147483647';
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '28px 32px 22px 32px';
    modal.style.borderRadius = '12px';
    modal.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.gap = '18px';
    modal.style.minWidth = '220px';
    // Spinner
    const spinner = document.createElement('div');
    spinner.className = 'gherkin-spinner';
    spinner.style.marginBottom = '12px';
    modal.appendChild(spinner);
    // Mensagem
    const msg = document.createElement('div');
    msg.textContent = message;
    msg.style.fontSize = '16px';
    msg.style.color = '#0D47A1';
    msg.style.textAlign = 'center';
    modal.appendChild(msg);
    modalBg.appendChild(modal);
    document.body.appendChild(modalBg);
}

function hideSpinner() {
    const modal = document.getElementById('gherkin-spinner-modal');
    if (modal) modal.remove();
}

// Garante que as funções estejam disponíveis globalmente
window.showSpinner = showSpinner;
window.hideSpinner = hideSpinner;

export { slugify, downloadFile, showFeedback, debounce, getCSSSelector, getRobustXPath, isExtensionContextValid };

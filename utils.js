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

    // Prioridade: id único > data-testid > data-qa > name > formcontrolname > aria-label > data-pc-name > type > placeholder > classe única
    const attrPriority = [
        'id', 'data-testid', 'data-qa', 'name', 'formcontrolname', 'aria-label', 'data-pc-name', 'type', 'placeholder'
    ];
    for (const attr of attrPriority) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`).length === 1) {
            return `${element.tagName.toLowerCase()}[${attr}="${val}"]`;
        }
    }
    // Se tem id único
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `${element.tagName.toLowerCase()}#${element.id}`;
    }
    // Se tem classe única
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (document.querySelectorAll(`.${CSS.escape(cls)}`).length === 1) {
                return `${element.tagName.toLowerCase()}.${cls}`;
            }
        }
    }
    // Fallback: monta caminho hierárquico curto
    let path = element.tagName.toLowerCase();
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 2) {
        if (parent.id && document.querySelectorAll(`#${CSS.escape(parent.id)}`).length === 1) {
            path = `${parent.tagName.toLowerCase()}#${parent.id} > ${path}`;
            break;
        }
        parent = parent.parentElement;
        depth++;
    }
    return path;
}

function getRobustXPath(element) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return null;

    // id único
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return `//*[@id="${element.id}"]`;
    }
    // name único
    if (element.name && document.querySelectorAll(`[name="${CSS.escape(element.name)}"]`).length === 1) {
        return `//*[@name="${element.name}"]`;
    }
    // Atributos customizados únicos
    const attrs = [
        'data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'placeholder', 'type', 'title', 'role', 'name'
    ];
    for (const attr of attrs) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val && document.querySelectorAll(`[${attr}="${CSS.escape(val)}"]`).length === 1) {
            return `//${element.tagName.toLowerCase()}[@${attr}="${val}"]`;
        }
    }
    // Classe única
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (document.querySelectorAll(`.${CSS.escape(cls)}`).length === 1) {
                return `//${element.tagName.toLowerCase()}[contains(concat(' ',normalize-space(@class),' '),' ${cls} ')]`;
            }
        }
    }
    // Caminho relativo curto (até 2 níveis de parent)
    let path = element.tagName.toLowerCase();
    let parent = element.parentElement;
    let depth = 0;
    while (parent && depth < 2) {
        if (parent.id && document.querySelectorAll(`#${CSS.escape(parent.id)}`).length === 1) {
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

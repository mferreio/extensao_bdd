import uiTheme from './uiConfig.js';
import Button from './components/Button.js';
import Input from './components/Input.js';
import Feedback from './components/Feedback.js';
import Modal from './components/Modal.js';
import Checkbox from './components/Checkbox.js';

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
    Feedback.show({
        message,
        type,
        duration: 4000
    });
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}


function getCSSSelector(element) {
    // Estratégia multi-nível inspirada no XPathGenerator
    const inlineTags = ['span', 'strong', 'i', 'b', 'svg', 'img', 'em', 'label'];
    const parentPriority = ['button', 'a', 'label', 'input', 'select', 'textarea', 'li', 'tr', 'td', 'th'];
    if (element && inlineTags.includes(element.tagName.toLowerCase())) {
        let parentRelevant = element.parentElement;
        while (parentRelevant) {
            if (parentPriority.includes(parentRelevant.tagName.toLowerCase())) {
                element = parentRelevant;
                break;
            }
            parentRelevant = parentRelevant.parentElement;
        }
    }
    if (!element || !element.tagName) return { css: '', tipo: 'invalido', ocorrencias: 0, indice: null, aviso: 'Elemento inválido.' };
    // 1) Tenta ID único
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
        return { css: `#${CSS.escape(element.id)}`, tipo: 'robusto', ocorrencias: 1, indice: 1 };
    }
    // 2) Tenta atributos robustos e únicos
    const attrPriority = ['data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'label', 'id', 'name', 'type', 'placeholder', 'href'];
    for (const attr of attrPriority) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val) {
            let selector = `${element.tagName.toLowerCase()}[${attr}="${val}"]`;
            let matches = document.querySelectorAll(selector);
            if (matches.length === 1) {
                return { css: selector, tipo: 'robusto', ocorrencias: 1, indice: 1 };
            } else if (matches.length > 1) {
                return { css: selector, tipo: 'nao_unico', ocorrencias: matches.length, indice: Array.from(matches).indexOf(element) + 1, aviso: `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.` };
            }
        }
    }
    // 3) Tenta por classes únicas
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            const selector = `${element.tagName.toLowerCase()}.${CSS.escape(cls)}`;
            const matches = document.querySelectorAll(selector);
            if (matches.length === 1) {
                return { css: selector, tipo: 'classe_unica', ocorrencias: 1, indice: 1 };
            } else if (matches.length > 1) {
                return { css: selector, tipo: 'nao_unico', ocorrencias: matches.length, indice: Array.from(matches).indexOf(element) + 1, aviso: `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.` };
            }
        }
    }
    // 4) Tenta contexto do pai com atributo único
    let parentContext = element.parentElement;
    for (let d = 0; parentContext && d < 3; d++) {
        for (const attr of attrPriority) {
            const val = parentContext.getAttribute && parentContext.getAttribute(attr);
            if (val && document.querySelectorAll(`${parentContext.tagName.toLowerCase()}[${attr}="${val}"]`).length === 1) {
                const selector = `${parentContext.tagName.toLowerCase()}[${attr}="${val}"] ${element.tagName.toLowerCase()}`;
                const matches = document.querySelectorAll(selector);
                if (matches.length === 1) {
                    return { css: selector, tipo: 'contexto_pai', ocorrencias: 1, indice: 1 };
                }
            }
        }
        parentContext = parentContext.parentElement;
    }
    // 5) Fallback hierárquico até 3 níveis
    let chain = element.tagName.toLowerCase();
    let p = element.parentElement;
    let d = 0;
    while (p && d < 3) {
        chain = `${p.tagName.toLowerCase()} > ${chain}`;
        p = p.parentElement;
        d++;
    }
    const matches = document.querySelectorAll(chain);
    if (matches.length === 1) {
        return { css: chain, tipo: 'hierarquico', ocorrencias: 1, indice: 1 };
    } else if (matches.length > 1) {
        return { css: chain, tipo: 'nao_unico', ocorrencias: matches.length, indice: Array.from(matches).indexOf(element) + 1, aviso: `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.` };
    }
    // 6) Fallback genérico
    return { css: element.tagName.toLowerCase(), tipo: 'generico', ocorrencias: 0, indice: null, aviso: 'Seletor genérico. Considere adicionar um atributo único ao elemento.' };
}

function getRobustXPath(element) {
    // Estratégia multi-nível inspirada no XPathGenerator do gherkinrecorder
    const inlineTags = ['span', 'strong', 'i', 'b', 'svg', 'img', 'em', 'label'];
    const parentPriority = ['button', 'a', 'label', 'input', 'select', 'textarea', 'li', 'tr', 'td', 'th'];
    if (element && inlineTags.includes(element.tagName.toLowerCase())) {
        let parentRelevant = element.parentElement;
        while (parentRelevant) {
            if (parentPriority.includes(parentRelevant.tagName.toLowerCase())) {
                element = parentRelevant;
                break;
            }
            parentRelevant = parentRelevant.parentElement;
        }
    }
    if (!element || !element.tagName) return { xpath: '', tipo: 'invalido', ocorrencias: 0, indice: null, aviso: 'Elemento inválido.' };
    // 1) Tenta XPath por texto visível único
    const text = element.textContent && element.textContent.trim();
    if (text) {
        const escaped = text.replace(/'/g, "\'");
        const possibleXPaths = [
            `//${element.tagName.toLowerCase()}[text()='${escaped}']`,
            `//${element.tagName.toLowerCase()}[normalize-space(.)='${escaped}']`,
            `//${element.tagName.toLowerCase()}[contains(.,'${escaped}')]`
        ];
        for (const xp of possibleXPaths) {
            try {
                const count = document.evaluate(`count(${xp})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                if (count === 1) {
                    return { xpath: xp, tipo: 'texto_unico', ocorrencias: 1, indice: 1 };
                } else if (count > 1) {
                    const matches = document.evaluate(xp, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    for (let i = 0; i < matches.snapshotLength; i++) {
                        if (matches.snapshotItem(i) === element) {
                            const indexedXp = `(${xp})[${i + 1}]`;
                            const unique = document.evaluate(`count(${indexedXp})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1;
                            if (unique) {
                                return { xpath: indexedXp, tipo: 'texto_indexado', ocorrencias: count, indice: i + 1 };
                            }
                        }
                    }
                }
            } catch {}
        }
    }
    // 2) Tenta atributos robustos e únicos
    const attrs = ['data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'label', 'id', 'name', 'type', 'placeholder', 'title', 'role'];
    for (const attr of attrs) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val) {
            const xp = `//${element.tagName.toLowerCase()}[@${attr}='${val}']`;
            try {
                const count = document.evaluate(`count(${xp})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                if (count === 1) {
                    return { xpath: xp, tipo: 'robusto', ocorrencias: 1, indice: 1 };
                } else if (count > 1) {
                    const matches = document.querySelectorAll(`${element.tagName.toLowerCase()}[${attr}='${val}']`);
                    return { xpath: xp, tipo: 'nao_unico', ocorrencias: count, indice: Array.from(matches).indexOf(element) + 1, aviso: `XPath não é único. Existem ${count} elementos. Escolha a ocorrência desejada.` };
                }
            } catch {}
        }
    }
    // 3) Tenta XPath indexado por ordem entre irmãos
    const tn = element.tagName.toLowerCase();
    const doc = element.ownerDocument || document;
    const allSameTag = Array.from(doc.getElementsByTagName(tn));
    const index = allSameTag.indexOf(element);
    if (index !== -1) {
        const xpIndex = `//${tn}[${index + 1}]`;
        try {
            const unique = document.evaluate(`count(${xpIndex})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1;
            if (unique) {
                return { xpath: xpIndex, tipo: 'indexado', ocorrencias: 1, indice: index + 1 };
            }
        } catch {}
    }
    // 4) Fallback absoluto (como Chrome)
    function getAbsoluteXPathBySiblings(el) {
        if (!el || !el.tagName) return '';
        const doc = el.ownerDocument || document;
        if (el === doc.documentElement) return '/html[1]';
        if (el === doc.body) return '/html[1]/body[1]';
        const parent = el.parentNode;
        if (!parent || !(parent instanceof Element)) return `/${el.tagName.toLowerCase()}[1]`;
        const tagName = el.tagName.toLowerCase();
        let idx = 1;
        for (const sibling of parent.children) {
            if (sibling === el) {
                return getAbsoluteXPathBySiblings(parent) + `/${tagName}[${idx}]`;
            }
            if (sibling.tagName && sibling.tagName.toLowerCase() === tagName) idx++;
        }
        return `/${tagName}[1]`;
    }
    const absXpath = `/${getAbsoluteXPathBySiblings(element)}`;
    return { xpath: absXpath, tipo: 'absoluto', ocorrencias: 1, indice: 1, aviso: 'XPath absoluto. Considere adicionar um atributo único ao elemento.' };
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
    msg.style.color = uiTheme.colors.primary;
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

/**
 * Função utilitária para obter ambos seletores estruturados para um elemento
 * @param {Element} element
 * @returns {{css: string|null, xpath: string|null, tipo: string|null, aviso: string|null}}
 */
function getSelectors(element) {
    const cssResult = getCSSSelector(element);
    const xpathResult = getRobustXPath(element);
    // Prioriza aviso de robustez se houver
    let aviso = cssResult.aviso || xpathResult.aviso || null;
    // Prioriza tipo robusto se algum for robusto
    let tipo = cssResult.tipo === 'robusto' || xpathResult.tipo === 'robusto' ? 'robusto' : (cssResult.tipo || xpathResult.tipo);
    return {
        css: cssResult.css,
        xpath: xpathResult.xpath,
        tipo,
        aviso,
        ocorrencias_css: cssResult.ocorrencias,
        indice_css: cssResult.indice,
        ocorrencias_xpath: xpathResult.ocorrencias,
        indice_xpath: xpathResult.indice
    };
}

// Utilitários para limpeza e formatação inspirados no gherkinrecorder
function limparTexto(texto) {
    return texto ? texto.replace(/[^a-zA-Z0-9\s]/g, '') : '';
}
function toPascalCase(texto) {
    return texto
        .toLowerCase()
        .split(/\s+/)
        .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
        .join('');
}
function escapeXPathText(text) {
    if (text.indexOf('"') === -1) {
        return '"' + text + '"';
    } else if (text.indexOf("'") === -1) {
        return "'" + text + "'";
    } else {
        const parts = text.split('"');
        return 'concat("' + parts.join('",\'"\',"') + '")';
    }
}
function gerarIdUnico() {
    return 'id-' + Math.random().toString(36).substr(2, 16);
}
class SemanticNameResolver {
    static obterNomeSemantico(elemento) {
        let nomeSemantico = '';
        switch (elemento.tagName.toLowerCase()) {
            case 'button':
                nomeSemantico =
                    elemento.value ||
                    elemento.innerText ||
                    elemento.title ||
                    elemento.name ||
                    elemento.id ||
                    elemento.className ||
                    '';
                break;
            case 'input':
                if (!elemento.type || ['text', 'email', 'password'].includes(elemento.type)) {
                    const label = document.querySelector(`label[for="${elemento.id}"]`);
                    nomeSemantico = label ? label.innerText : '';
                    nomeSemantico =
                        nomeSemantico ||
                        elemento.placeholder ||
                        elemento.title ||
                        elemento.name ||
                        elemento.id ||
                        elemento.className ||
                        '';
                } else if (['button', 'submit'].includes(elemento.type)) {
                    nomeSemantico =
                        elemento.value ||
                        elemento.innerText ||
                        elemento.title ||
                        elemento.name ||
                        elemento.id ||
                        elemento.className ||
                        '';
                } else if (['radio', 'checkbox'].includes(elemento.type)) {
                    nomeSemantico =
                        elemento.innerText ||
                        elemento.value ||
                        elemento.title ||
                        elemento.name ||
                        elemento.id ||
                        elemento.className ||
                        '';
                } else {
                    nomeSemantico =
                        elemento.value ||
                        elemento.innerText ||
                        elemento.title ||
                        elemento.name ||
                        elemento.id ||
                        elemento.className ||
                        '';
                }
                break;
            case 'span':
            case 'p':
            case 'h1':
            case 'h2':
            case 'h3':
            case 'h4':
            case 'h5':
            case 'h6':
            case 'q':
                nomeSemantico =
                    elemento.innerText ||
                    elemento.title ||
                    elemento.name ||
                    elemento.id ||
                    elemento.className ||
                    '';
                break;
            case 'img':
                nomeSemantico =
                    elemento.title ||
                    elemento.alt ||
                    elemento.name ||
                    elemento.id ||
                    elemento.className ||
                    '';
                break;
            case 'select':
                nomeSemantico =
                    elemento.options && elemento.options[0] ? elemento.options[0].innerText : '';
                nomeSemantico =
                    nomeSemantico ||
                    elemento.title ||
                    elemento.name ||
                    elemento.id ||
                    elemento.className ||
                    '';
                break;
            default:
                nomeSemantico =
                    elemento.name ||
                    elemento.placeholder ||
                    elemento.innerText ||
                    elemento.title ||
                    elemento.id ||
                    elemento.className ||
                    elemento.value ||
                    '';
                break;
        }
        nomeSemantico = limparTexto(nomeSemantico);
        nomeSemantico = toPascalCase(nomeSemantico);
        nomeSemantico = nomeSemantico.slice(0, 15);
        if (!nomeSemantico) {
            let pai = elemento.parentElement;
            while (pai && pai !== document.body) {
                let nomePai =
                    pai.name ||
                    pai.placeholder ||
                    pai.innerText ||
                    pai.title ||
                    pai.id ||
                    pai.className ||
                    pai.tagName;
                nomePai = limparTexto(nomePai);
                if (nomePai) {
                    nomeSemantico = toPascalCase(nomePai + (elemento.tagName || ''));
                    break;
                }
                pai = pai.parentElement;
            }
        }
        if (!nomeSemantico) {
            nomeSemantico = elemento.tagName.toLowerCase();
        }
        return nomeSemantico;
    }
}

class XPathGenerator {
    static gerarXpath(element) {
        if (!element || !element.tagName) return '';
        return this.getXPath(element, document);
    }
    static getXPath(element, root) {
        if (!element || !element.tagName) return '';
        // 1) Tenta texto visível
        const text = element.textContent && element.textContent.trim();
        if (text) {
            const escaped = text.replace(/'/g, "\'");
            const possibleXPaths = [
                `//${element.tagName}[text()='${escaped}']`,
                `//${element.tagName}[normalize-space(.)='${escaped}']`,
                `//${element.tagName}[contains(.,'${escaped}')]`
            ];
            for (const xp of possibleXPaths) {
                if (XPathGenerator.isUnique(xp, root)) {
                    return xp;
                } else {
                    const matches = XPathGenerator.evaluateXPath(xp, root);
                    if (matches.length > 1) {
                        for (let i = 0; i < matches.length; i++) {
                            if (matches[i] === element) {
                                const indexedXp = `(${xp})[${i + 1}]`;
                                if (XPathGenerator.isUnique(indexedXp, root)) {
                                    return indexedXp;
                                }
                            }
                        }
                    }
                }
            }
        }
        // 2) Tenta atributos relevantes
        const attrs = ['title', 'aria-label', 'name', 'id', 'placeholder'];
        if (element.tagName.toLowerCase() === 'input' && element.getAttribute('type') === 'button') {
            attrs.push('value');
        }
        for (const attr of attrs) {
            if (element.hasAttribute(attr)) {
                const val = element.getAttribute(attr);
                const tn = element.tagName.toLowerCase();
                const xp = `//${tn}[@${attr}="${val}"]`;
                if (XPathGenerator.isUnique(xp, root)) return xp;
            }
        }
        // 3) Tenta //tagName[N]
        const tn = element.tagName.toLowerCase();
        const doc = element.ownerDocument || document;
        const allSameTag = Array.from(doc.getElementsByTagName(tn));
        const index = allSameTag.indexOf(element);
        if (index !== -1) {
            const xpIndex = `//${tn}[${index + 1}]`;
            if (XPathGenerator.isUnique(xpIndex, root)) {
                return xpIndex;
            }
        }
        // 4) Fallback absoluto (como Chrome)
        return `/${XPathGenerator.getAbsoluteXPathBySiblings(element)}`;
    }
    static evaluateXPath(xpath, root = document) {
        const xPathResult = document.evaluate(
            xpath,
            root,
            null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
            null
        );
        const nodes = [];
        for (let i = 0; i < xPathResult.snapshotLength; i++) {
            nodes.push(xPathResult.snapshotItem(i));
        }
        return nodes;
    }
    static getAbsoluteXPathBySiblings(element) {
        if (!element || !element.tagName) return '';
        const doc = element.ownerDocument || document;
        if (element === doc.documentElement) return '/html[1]';
        if (element === doc.body) return '/html[1]/body[1]';
        const parent = element.parentNode;
        if (!parent || !(parent instanceof Element)) return `/${element.tagName.toLowerCase()}[1]`;
        const tagName = element.tagName.toLowerCase();
        let index = 1;
        for (const sibling of parent.children) {
            if (sibling === element) {
                return (
                    XPathGenerator.getAbsoluteXPathBySiblings(parent) + `/${tagName}[${index}]`
                );
            }
            if (sibling.tagName && sibling.tagName.toLowerCase() === tagName) {
                index++;
            }
        }
        return `/${tagName}[1]`;
    }
    static isUnique(xpath, root) {
        try {
            return (
                root.evaluate(`count(${xpath})`, root, null, XPathResult.NUMBER_TYPE, null)
                    .numberValue === 1
            );
        } catch {
            return false;
        }
    }
    static gerarCssSelector(elemento) {
        if (!elemento) return null;
        if (elemento.id) {
            return `#${CSS.escape(elemento.id)}`;
        }
        let selector = elemento.tagName.toLowerCase();
        if (elemento.className) {
            const classes = Array.from(elemento.classList).map(cls => `.${CSS.escape(cls)}`);
            selector += classes.join('');
        }
        let parent = elemento;
        const path = [];
        while (parent && parent.nodeType === Node.ELEMENT_NODE) {
            let siblings = parent.parentNode ? Array.from(parent.parentNode.children) : [];
            siblings = siblings.filter(sibling => sibling.tagName === parent.tagName);
            if (siblings.length > 1) {
                const index = siblings.indexOf(parent);
                path.unshift(`${parent.tagName.toLowerCase()}:nth-of-type(${index + 1})`);
            } else {
                path.unshift(parent.tagName.toLowerCase());
            }
            if (path.length > 3) {
                break;
            }
            parent = parent.parentElement;
        }
        return path.join(' > ');
    }
}

/**
 * Escapa caracteres especiais para evitar XSS ao inserir dados do usuário no DOM via innerHTML.
 * Use sempre que for inserir texto dinâmico vindo do usuário!
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Função utilitária para validação de dados de entrada
export function validateInput(value, { required = false, minLength = 0, maxLength = 1000, pattern = null } = {}) {
    if (required && (!value || value.trim() === '')) {
        return { valid: false, error: 'Campo obrigatório.' };
    }
    if (minLength && value.length < minLength) {
        return { valid: false, error: `Mínimo de ${minLength} caracteres.` };
    }
    if (maxLength && value.length > maxLength) {
        return { valid: false, error: `Máximo de ${maxLength} caracteres.` };
    }
    if (pattern && !pattern.test(value)) {
        return { valid: false, error: 'Formato inválido.' };
    }
    return { valid: true };
}

// Exemplo de função utilitária assíncrona
export async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error('Erro ao buscar dados');
    return response.json();
}

export {
  slugify,
  downloadFile,
  showFeedback,
  debounce,
  getCSSSelector,
  getRobustXPath,
  isExtensionContextValid,
  getSelectors,
  limparTexto,
  toPascalCase,
  escapeXPathText,
  gerarIdUnico,
  SemanticNameResolver,
  XPathGenerator
};

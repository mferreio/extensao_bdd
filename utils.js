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
    // Estrutura de retorno
    let result = {
        css: null,
        tipo: null,
        aviso: null,
        ocorrencias: 0,
        indice: null // índice sugerido (1-based)
    };
    const attrPriority = [
        'data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'id', 'name', 'type', 'placeholder', 'href'
    ];
    const genericTags = ['div', 'span', 'button', 'input', 'label', 'a', 'ul', 'li', 'tr', 'td', 'th', 'table', 'form', 'section', 'article', 'header', 'footer'];

    // 1. Prioridade máxima: atributos robustos e únicos
    for (const attr of attrPriority) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val) {
            let selector = `${element.tagName.toLowerCase()}[${attr}="${val}"]`;
            let matches = document.querySelectorAll(selector);
            if (matches.length === 1) {
                result.css = selector;
                result.tipo = 'robusto';
                result.ocorrencias = 1;
                result.indice = 1;
                return result;
            } else if (matches.length > 1) {
                result.css = selector;
                result.tipo = 'nao_unico';
                result.ocorrencias = matches.length;
                result.indice = Array.from(matches).indexOf(element) + 1;
                result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
            selector = `[${attr}="${val}"]`;
            matches = document.querySelectorAll(selector);
            if (matches.length === 1) {
                result.css = selector;
                result.tipo = 'robusto';
                result.ocorrencias = 1;
                result.indice = 1;
                return result;
            } else if (matches.length > 1) {
                result.css = selector;
                result.tipo = 'nao_unico';
                result.ocorrencias = matches.length;
                result.indice = Array.from(matches).indexOf(element) + 1;
                result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
        }
    }
    // 2. Se tem id único e não é dinâmico
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(element.id)) {
        result.css = `${element.tagName.toLowerCase()}#${element.id}`;
        result.tipo = 'robusto';
        result.ocorrencias = 1;
        result.indice = 1;
        return result;
    }
    // 3. Se tem classe única e não genérica
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (/^(p-|ng-|mat-|ant-|Mui|css-)/.test(cls)) continue;
            const selector = `.${CSS.escape(cls)}`;
            const matches = document.querySelectorAll(selector);
            if (matches.length === 1) {
                result.css = `${element.tagName.toLowerCase()}.${cls}`;
                result.tipo = 'classe_unica';
                result.ocorrencias = 1;
                result.indice = 1;
                return result;
            } else if (matches.length > 1) {
                result.css = `${element.tagName.toLowerCase()}.${cls}`;
                result.tipo = 'nao_unico';
                result.ocorrencias = matches.length;
                result.indice = Array.from(matches).indexOf(element) + 1;
                result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                return result;
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
        for (const attr of attrPriority) {
            const val = element.getAttribute && element.getAttribute(attr);
            if (val) {
                const selector = `${parentSelector} ${element.tagName.toLowerCase()}[${attr}="${val}"]`;
                const matches = document.querySelectorAll(selector);
                if (matches.length === 1) {
                    result.css = selector;
                    result.tipo = 'componente_pai';
                    result.ocorrencias = 1;
                    result.indice = 1;
                    return result;
                } else if (matches.length > 1) {
                    result.css = selector;
                    result.tipo = 'nao_unico';
                    result.ocorrencias = matches.length;
                    result.indice = Array.from(matches).indexOf(element) + 1;
                    result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                    return result;
                }
            }
        }
        const selector = `${parentSelector} ${element.tagName.toLowerCase()}`;
        const matches = document.querySelectorAll(selector);
        if (matches.length === 1) {
            result.css = selector;
            result.tipo = 'componente_pai';
            result.ocorrencias = 1;
            result.indice = 1;
            return result;
        } else if (matches.length > 1) {
            result.css = selector;
            result.tipo = 'nao_unico';
            result.ocorrencias = matches.length;
            result.indice = Array.from(matches).indexOf(element) + 1;
            result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
            return result;
        }
    }
    // 5. Procura ancestral robusto
    let ancestor = element.parentElement;
    let ancestorSelector = '';
    let ancestorDepth = 0;
    while (ancestor && ancestorDepth < 4) {
        for (const attr of attrPriority) {
            const val = ancestor.getAttribute && ancestor.getAttribute(attr);
            if (val && document.querySelectorAll(`${ancestor.tagName.toLowerCase()}[${attr}="${CSS.escape(val)}"]`).length === 1) {
                ancestorSelector = `${ancestor.tagName.toLowerCase()}[${attr}="${val}"]`;
                break;
            }
        }
        if (ancestorSelector) break;
        ancestor = ancestor.parentElement;
        ancestorDepth++;
    }
    if (ancestorSelector) {
        for (const attr of attrPriority) {
            const val = element.getAttribute && element.getAttribute(attr);
            if (val) {
                const selector = `${ancestorSelector} ${element.tagName.toLowerCase()}[${attr}="${val}"]`;
                const matches = document.querySelectorAll(selector);
                if (matches.length === 1) {
                    result.css = selector;
                    result.tipo = 'ancestral';
                    result.ocorrencias = 1;
                    result.indice = 1;
                    return result;
                } else if (matches.length > 1) {
                    result.css = selector;
                    result.tipo = 'nao_unico';
                    result.ocorrencias = matches.length;
                    result.indice = Array.from(matches).indexOf(element) + 1;
                    result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                    return result;
                }
            }
        }
        const siblings = Array.from(ancestor.querySelectorAll(element.tagName.toLowerCase()));
        if (siblings.length > 1) {
            const idx = siblings.indexOf(element) + 1;
            if (idx > 0) {
                result.css = `${ancestorSelector} ${element.tagName.toLowerCase()}:nth-of-type(${idx})`;
                result.tipo = 'ancestral';
                result.ocorrencias = siblings.length;
                result.indice = idx;
                result.aviso = `Seletor não é único. Existem ${siblings.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
        } else if (siblings.length === 1) {
            result.css = `${ancestorSelector} ${element.tagName.toLowerCase()}`;
            result.tipo = 'ancestral';
            result.ocorrencias = 1;
            result.indice = 1;
            return result;
        }
    }
    // 6. Fallback: tenta compor seletor hierárquico até 3 níveis
    let chain = element.tagName.toLowerCase();
    let p = element.parentElement;
    let d = 0;
    while (p && d < 3) {
        chain = `${p.tagName.toLowerCase()} > ${chain}`;
        p = p.parentElement;
        d++;
    }
    if (!genericTags.includes(chain) && !/^([a-z]+)(\s*[> ]\s*[a-z]+)?$/i.test(chain)) {
        const matches = document.querySelectorAll(chain);
        if (matches.length === 1) {
            result.css = chain;
            result.tipo = 'hierarquico';
            result.ocorrencias = 1;
            result.indice = 1;
            return result;
        } else if (matches.length > 1) {
            result.css = chain;
            result.tipo = 'nao_unico';
            result.ocorrencias = matches.length;
            result.indice = Array.from(matches).indexOf(element) + 1;
            result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
            return result;
        }
    }
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        result.aviso = 'Elemento inválido.';
        return result;
    }
    // 7. Seletor genérico
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
    if (genericTags.includes(path) || /^([a-z]+)(\s*[> ]\s*[a-z]+)?$/i.test(path)) {
        const msg = `Atenção: seletor CSS genérico detectado ('${path}'). Adicione um atributo único (ex: data-testid) ao elemento para garantir robustez nos testes.`;
        result.aviso = msg;
        result.tipo = 'generico';
        result.css = null;
        if (typeof showFeedback === 'function') {
            showFeedback(msg, 'error');
        }
        if (typeof console !== 'undefined') {
            console.warn(msg);
        }
        return result;
    }
    const matches = document.querySelectorAll(path);
    if (matches.length === 1) {
        result.css = path;
        result.tipo = 'generico';
        result.ocorrencias = 1;
        result.indice = 1;
        return result;
    } else if (matches.length > 1) {
        result.css = path;
        result.tipo = 'nao_unico';
        result.ocorrencias = matches.length;
        result.indice = Array.from(matches).indexOf(element) + 1;
        result.aviso = `Seletor não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
        return result;
    }
    result.css = path;
    result.tipo = 'generico';
    result.ocorrencias = 0;
    result.indice = null;
    return result;
}


function getRobustXPath(element) {
    let result = {
        xpath: null,
        tipo: null,
        aviso: null,
        ocorrencias: 0,
        indice: null
    };
    const attrs = [
        'data-testid', 'data-qa', 'formcontrolname', 'aria-label', 'data-pc-name', 'data-pc-section', 'name', 'type', 'placeholder', 'title', 'role'
    ];
    // 1. id único e estável
    if (element.id && document.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1 && !/^(_|auto|ember|react|ng|mat|p-)/i.test(element.id)) {
        result.xpath = `//*[@id="${element.id}"]`;
        result.tipo = 'robusto';
        result.ocorrencias = 1;
        result.indice = 1;
        return result;
    }
    // 2. Atributos robustos e únicos
    for (const attr of attrs) {
        const val = element.getAttribute && element.getAttribute(attr);
        if (val) {
            const xpath = `//${element.tagName.toLowerCase()}[@${attr}='${val}']`;
            try {
                const count = document.evaluate(`count(${xpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                if (count === 1) {
                    result.xpath = xpath;
                    result.tipo = 'robusto';
                    result.ocorrencias = 1;
                    result.indice = 1;
                    return result;
                } else if (count > 1) {
                    // Encontrou múltiplos, retorna info
                    const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase() + `[${attr}='${val}']`));
                    result.xpath = xpath;
                    result.tipo = 'nao_unico';
                    result.ocorrencias = count;
                    result.indice = all.indexOf(element) + 1;
                    result.aviso = `XPath não é único. Existem ${count} elementos. Escolha a ocorrência desejada.`;
                    return result;
                }
            } catch (e) { /* ignora erro de XPath inválido */ }
        }
    }
    // 3. Componente pai robusto
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
                    const count = document.evaluate(`count(${fullXpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                    if (count === 1) {
                        result.xpath = fullXpath;
                        result.tipo = 'componente_pai';
                        result.ocorrencias = 1;
                        result.indice = 1;
                        return result;
                    } else if (count > 1) {
                        const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase() + `[${attr}='${val}']`));
                        result.xpath = fullXpath;
                        result.tipo = 'nao_unico';
                        result.ocorrencias = count;
                        result.indice = all.indexOf(element) + 1;
                        result.aviso = `XPath não é único. Existem ${count} elementos. Escolha a ocorrência desejada.`;
                        return result;
                    }
                } catch (e) { /* ignora erro de XPath inválido */ }
            }
        }
        // Para o caso sem atributo
        const fullXpath = `${parentXPath}//${element.tagName.toLowerCase()}`;
        try {
            const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase()));
            if (all.length === 1) {
                result.xpath = fullXpath;
                result.tipo = 'componente_pai';
                result.ocorrencias = 1;
                result.indice = 1;
                return result;
            } else if (all.length > 1) {
                result.xpath = fullXpath;
                result.tipo = 'nao_unico';
                result.ocorrencias = all.length;
                result.indice = all.indexOf(element) + 1;
                result.aviso = `XPath não é único. Existem ${all.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
        } catch (e) {}
    }
    // 4. Ancestral robusto
    let ancestor = element.parentElement;
    let ancestorXPath = '';
    let ancestorDepth = 0;
    while (ancestor && ancestorDepth < 4) {
        for (const attr of attrs) {
            const val = ancestor.getAttribute && ancestor.getAttribute(attr);
            if (val) {
                const xpath = `//${ancestor.tagName.toLowerCase()}[@${attr}='${val}']`;
                try {
                    if (document.evaluate(`count(${xpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue === 1) {
                        ancestorXPath = xpath;
                        break;
                    }
                } catch (e) { /* ignora erro de XPath inválido */ }
            }
        }
        if (ancestorXPath) break;
        ancestor = ancestor.parentElement;
        ancestorDepth++;
    }
    if (ancestorXPath) {
        for (const attr of attrs) {
            const val = element.getAttribute && element.getAttribute(attr);
            if (val) {
                const fullXpath = `${ancestorXPath}//${element.tagName.toLowerCase()}[@${attr}='${val}']`;
                try {
                    const count = document.evaluate(`count(${fullXpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                    if (count === 1) {
                        result.xpath = fullXpath;
                        result.tipo = 'ancestral';
                        result.ocorrencias = 1;
                        result.indice = 1;
                        return result;
                    } else if (count > 1) {
                        const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase() + `[${attr}='${val}']`));
                        result.xpath = fullXpath;
                        result.tipo = 'nao_unico';
                        result.ocorrencias = count;
                        result.indice = all.indexOf(element) + 1;
                        result.aviso = `XPath não é único. Existem ${count} elementos. Escolha a ocorrência desejada.`;
                        return result;
                    }
                } catch (e) { /* ignora erro de XPath inválido */ }
            }
        }
        const siblings = Array.from(ancestor.querySelectorAll(element.tagName.toLowerCase()));
        if (siblings.length > 1) {
            const idx = siblings.indexOf(element) + 1;
            if (idx > 0) {
                result.xpath = `${ancestorXPath}//${element.tagName.toLowerCase()}[${idx}]`;
                result.tipo = 'ancestral';
                result.ocorrencias = siblings.length;
                result.indice = idx;
                result.aviso = `XPath não é único. Existem ${siblings.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
        } else if (siblings.length === 1) {
            result.xpath = `${ancestorXPath}//${element.tagName.toLowerCase()}`;
            result.tipo = 'ancestral';
            result.ocorrencias = 1;
            result.indice = 1;
            return result;
        }
    }
    // 5. Classe única e não genérica
    if (element.className && typeof element.className === 'string') {
        const classList = element.className.trim().split(/\s+/).filter(Boolean);
        for (const cls of classList) {
            if (/^(p-|ng-|mat-|ant-|Mui|css-)/.test(cls)) continue;
            const xpath = `//${element.tagName.toLowerCase()}[contains(concat(' ',normalize-space(@class),' '),' ${cls} ')]`;
            try {
                const count = document.evaluate(`count(${xpath})`, document, null, XPathResult.NUMBER_TYPE, null).numberValue;
                if (count === 1) {
                    result.xpath = xpath;
                    result.tipo = 'classe_unica';
                    result.ocorrencias = 1;
                    result.indice = 1;
                    return result;
                } else if (count > 1) {
                    const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase() + `.${cls}`));
                    result.xpath = xpath;
                    result.tipo = 'nao_unico';
                    result.ocorrencias = count;
                    result.indice = all.indexOf(element) + 1;
                    result.aviso = `XPath não é único. Existem ${count} elementos. Escolha a ocorrência desejada.`;
                    return result;
                }
            } catch (e) {}
        }
    }
    // 6. Fallback: XPath por texto visível único
    if (element.tagName && element.textContent) {
        const text = element.textContent.trim();
        if (text && text.length > 0) {
            const matches = Array.from(document.querySelectorAll(element.tagName.toLowerCase()))
                .filter(el => el.textContent && el.textContent.trim() === text);
            if (matches.length === 1) {
                result.xpath = `//${element.tagName.toLowerCase()}[normalize-space(text())='${text.replace(/'/g, "\'")}']`;
                result.tipo = 'texto_unico';
                result.ocorrencias = 1;
                result.indice = 1;
                return result;
            } else if (matches.length > 1) {
                result.xpath = `//${element.tagName.toLowerCase()}[normalize-space(text())='${text.replace(/'/g, "\'")}']`;
                result.tipo = 'nao_unico';
                result.ocorrencias = matches.length;
                result.indice = matches.indexOf(element) + 1;
                result.aviso = `XPath não é único. Existem ${matches.length} elementos. Escolha a ocorrência desejada.`;
                return result;
            }
        }
    }
    if (!element || element.nodeType !== Node.ELEMENT_NODE) {
        result.aviso = 'Elemento inválido.';
        return result;
    }
    // 7. Caminho relativo curto (até 2 níveis de parent com id estável)
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
    const xpath = `//${path}`;
    try {
        const all = Array.from(document.querySelectorAll(element.tagName.toLowerCase()));
        if (all.length === 1) {
            result.xpath = xpath;
            result.tipo = 'generico';
            result.ocorrencias = 1;
            result.indice = 1;
            result.aviso = 'XPath genérico. Considere adicionar um atributo único ao elemento.';
            return result;
        } else if (all.length > 1) {
            result.xpath = xpath;
            result.tipo = 'nao_unico';
            result.ocorrencias = all.length;
            result.indice = all.indexOf(element) + 1;
            result.aviso = `XPath não é único. Existem ${all.length} elementos. Escolha a ocorrência desejada.`;
            return result;
        }
    } catch (e) {}
    result.xpath = xpath;
    result.tipo = 'generico';
    result.ocorrencias = 0;
    result.indice = null;
    result.aviso = 'XPath genérico. Considere adicionar um atributo único ao elemento.';
    return result;
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

export { slugify, downloadFile, showFeedback, debounce, getCSSSelector, getRobustXPath, getSelectors, isExtensionContextValid };

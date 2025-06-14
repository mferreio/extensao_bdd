// DomInspector com suporte a contexto de iframe, inspirado no gherkinrecorder
import { SemanticNameResolver } from './utils.js';
import { XPathGenerator } from './utils.js';

class DomInspector {
    /**
     * Inspeciona o elemento clicado e retorna informações, incluindo contexto de iframe se aplicável.
     * @returns {Promise<Object>} Uma Promise que resolve com as informações do elemento.
     */
    static inspectElement() {
        return new Promise((resolve) => {
            function handleClick(event) {
                event.preventDefault();
                event.stopPropagation();
                const target = event.target;
                let containerType = null;
                let containerXpath = null;
                let containerElementName = null;
                try {
                    // Verifica se o elemento pertence a um iframe
                    const frameElement = target.ownerDocument.defaultView.frameElement;
                    if (frameElement) {
                        containerType = 'iframe';
                        containerXpath = XPathGenerator.gerarXpath(frameElement);
                        containerElementName = SemanticNameResolver.obterNomeSemantico(frameElement);
                    }
                } catch (error) {
                    // Pode ocorrer erro em iframes cross-origin
                }
                const elementInfo = {
                    elementName: SemanticNameResolver.obterNomeSemantico(target),
                    xpath: XPathGenerator.gerarXpath(target),
                    tagName: target.tagName.toLowerCase(),
                    containerType,
                    containerXpath,
                    containerElementName,
                    atributos: DomInspector.getAttributes(target)
                };
                document.removeEventListener('click', handleClick, true);
                resolve(elementInfo);
            }
            document.addEventListener('click', handleClick, true);
        });
    }

    static getAttributes(element) {
        const attrs = {};
        if (element && element.attributes) {
            for (let attr of element.attributes) {
                attrs[attr.name] = attr.value;
            }
        }
        return attrs;
    }
}

export default DomInspector;

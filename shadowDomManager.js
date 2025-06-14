// Gerenciamento de Shadow DOM inspirado no gherkinrecorder
// Adiciona listeners e mutation observers para garantir captura de eventos em shadow roots

class ShadowDomManager {
    constructor(eventHandler) {
        this.eventHandler = eventHandler; // Função para tratar eventos capturados
        this.observedShadowRoots = new WeakSet();
        this.init();
    }

    init() {
        // Observa shadow roots já existentes
        this.observeAllShadowRoots(document);

        // Observa o DOM para detectar novos shadow hosts dinamicamente
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) { // Element
                        this.observeAllShadowRoots(node);
                    }
                }
            }
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    observeAllShadowRoots(root) {
        if (root.shadowRoot && !this.observedShadowRoots.has(root.shadowRoot)) {
            this.observeShadowRoot(root.shadowRoot);
        }
        // Busca recursiva por shadow hosts filhos
        const treeWalker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_ELEMENT,
            {
                acceptNode: (node) => node.shadowRoot ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
            }
        );
        let node;
        while ((node = treeWalker.nextNode())) {
            if (!this.observedShadowRoots.has(node.shadowRoot)) {
                this.observeShadowRoot(node.shadowRoot);
            }
        }
    }

    observeShadowRoot(shadowRoot) {
        this.observedShadowRoots.add(shadowRoot);
        // Adiciona listeners de eventos desejados (exemplo: click)
        shadowRoot.addEventListener('click', this.eventHandler, true);

        // Observa adição de novos elementos dentro do shadow root
        const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                for (const node of mutation.addedNodes) {
                    if (node.nodeType === 1) {
                        // Se o novo nó também for um shadow host, observa seu shadow root
                        this.observeAllShadowRoots(node);
                    }
                }
            }
        });
        observer.observe(shadowRoot, { childList: true, subtree: true });
    }
}

// Exemplo de uso:
// const shadowDomManager = new ShadowDomManager((event) => { /* sua lógica de captura */ });

export default ShadowDomManager;

// Gerenciamento centralizado de eventos inspirado no gherkinrecorder
// Centraliza a captura de eventos (click, change, etc.) e armazena o último elemento clicado

class EventManager {
    constructor(actionHandler) {
        this.actionHandler = actionHandler; // Função para tratar ações capturadas
        this.lastClickedElement = null;
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.init();
    }

    init() {
        document.addEventListener('click', this.handleClick, true);
        document.addEventListener('change', this.handleChange, true);
    }

    handleClick(event) {
        this.lastClickedElement = event.target;
        if (typeof this.actionHandler === 'function') {
            this.actionHandler('click', event.target, event);
        }
    }

    handleChange(event) {
        if (typeof this.actionHandler === 'function') {
            this.actionHandler('change', event.target, event);
        }
    }

    getLastClickedElement() {
        return this.lastClickedElement;
    }
}

// Exemplo de uso:
// const eventManager = new EventManager((type, element, event) => { /* sua lógica */ });

export default EventManager;

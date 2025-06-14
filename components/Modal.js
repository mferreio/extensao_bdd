// Componente reutilizável de modal
export default function Modal({ title = '', content = '', actions = [] }) {
    const modalBg = document.createElement('div');
    modalBg.className = 'gherkin-modal-bg';
    modalBg.setAttribute('role', 'dialog');
    modalBg.setAttribute('aria-modal', 'true');
    modalBg.tabIndex = -1;
    const modal = document.createElement('div');
    modal.className = 'gherkin-modal-content';
    modal.setAttribute('role', 'document');
    if (title) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'gherkin-modal-title';
        titleDiv.textContent = title;
        modal.appendChild(titleDiv);
    }
    if (typeof content === 'string') {
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = content;
        modal.appendChild(contentDiv);
    } else if (content instanceof Node) {
        modal.appendChild(content);
    }
    if (Array.isArray(actions) && actions.length > 0) {
        const actionsRow = document.createElement('div');
        actionsRow.className = 'gherkin-actions-row';
        actions.forEach(btn => actionsRow.appendChild(btn));
        modal.appendChild(actionsRow);
    }
    modalBg.appendChild(modal);
    return modalBg;
}

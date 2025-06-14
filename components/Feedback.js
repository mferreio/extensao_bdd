// Componente reutilizável de feedback visual (sucesso, erro, info)
export default function Feedback({ type = 'info', message = '' }) {
    const div = document.createElement('div');
    div.className = `gherkin-feedback${type !== 'info' ? ' ' + type : ''}`;
    div.textContent = message;
    return div;
}

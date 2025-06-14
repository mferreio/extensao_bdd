// Componente reutilizável de input para UI
export default function Input({ type = 'text', className = '', ...props }) {
    const input = document.createElement('input');
    input.type = type;
    input.className = `gherkin-input ${className}`.trim();
    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('aria-') || key === 'tabIndex' || key === 'placeholder' || key === 'id' || key === 'value') {
            input.setAttribute(key, value);
        } else if (key === 'onInput' && typeof value === 'function') {
            input.oninput = value;
        } else {
            input[key] = value;
        }
    });
    return input;
}

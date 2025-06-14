// Componente reutilizável de checkbox
export default function Checkbox({ id = '', checked = false, label = '', ...props }) {
    const wrapper = document.createElement('label');
    wrapper.className = 'gherkin-checkbox';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    if (id) input.id = id;
    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('aria-') || key === 'tabIndex' || key === 'name' || key === 'value') {
            input.setAttribute(key, value);
        } else if (key === 'onChange' && typeof value === 'function') {
            input.onchange = value;
        } else {
            input[key] = value;
        }
    });
    wrapper.appendChild(input);
    if (label) {
        const span = document.createElement('span');
        span.textContent = label;
        wrapper.appendChild(span);
    }
    return wrapper;
}

// Componente reutilizável de botão para UI
export default function Button({ type = 'button', className = '', children = '', ...props }) {
    const btn = document.createElement('button');
    btn.type = type;
    btn.className = `gherkin-btn ${className}`.trim();
    if (typeof children === 'string') {
        btn.textContent = children;
    } else if (children instanceof Node) {
        btn.appendChild(children);
    }
    Object.entries(props).forEach(([key, value]) => {
        if (key.startsWith('aria-') || key === 'tabIndex') {
            btn.setAttribute(key, value);
        } else if (key === 'onClick' && typeof value === 'function') {
            btn.onclick = value;
        } else {
            btn[key] = value;
        }
    });
    return btn;
}

// Configurações centralizadas de UI e tema para toda a extensão
// Altere aqui para customizar cores, fontes, espaçamentos, textos padrão, etc.

const uiTheme = {
  colors: {
    bg: '#f8fafc',
    bgAlt: '#f4f7fb',
    primary: '#0070f3',
    primaryDark: '#005bb5',
    accent: '#0D47A1',
    danger: '#e74c3c',
    success: '#28a745',
    warning: '#ffc107',
    border: '#e0e6ed',
    modalOverlay: 'rgba(0,0,0,0.32)',
    modalBg: '#fff',
    modalBgDark: '#232837',
    shadow: 'rgba(0,0,0,0.13)',
    shadowStrong: 'rgba(0,0,0,0.18)',
    text: '#1a2330',
    textLight: '#fff',
    muted: '#555',
    footer: '#aaa',
    logBg: '#f1f8ff',
    logBgAlt: '#e3f2fd',
  },
  borderRadius: {
    btn: '9px',
    input: '8px',
    modal: '14px',
  },
  font: {
    family: 'Roboto, Arial, sans-serif',
    size: '1.07rem',
    inputSize: '1rem',
    btnSize: '1.07rem',
  },
  btn: {
    minWidth: '110px',
    height: '42px',
    shadow: '0 2px 8px rgba(0,112,243,0.08)',
  },
  input: {
    height: '38px',
  },
  zIndex: {
    modal: 2147483647,
    panel: 10000,
  },
  // Textos padrão
  texts: {
    exportLoading: 'Exportando arquivos... Aguarde.',
    exportSuccess: 'Exportação concluída com sucesso!',
    errorRequired: 'Campo obrigatório. Por favor, preencha corretamente.',
    errorExport: 'Erro ao exportar. Tente novamente.',
    // ...adicione outros textos padrão aqui
  }
};

export default uiTheme;

# Assistente Automatizador

> Extensão para navegador que grava interações em páginas web e exporta cenários para automação de testes (Cucumber, Selenium, etc).

---

## 📑 Sumário
- [Descrição](#descrição)
- [Funcionalidades](#funcionalidades)
- [Instalação](#instalação)
- [Uso](#uso)
- [Exemplo Visual](#exemplo-visual)
- [Contribuição](#contribuição)
- [Segurança e Privacidade](#segurança-e-privacidade)
- [FAQ](#faq)
- [Licença](#licença)

---

## 📝 Descrição
O **Assistente Automatizador** é uma extensão para navegador que permite gravar, visualizar e exportar interações do usuário em páginas web. Ideal para gerar cenários de testes automatizados em formato Gherkin/Cucumber, Selenium, entre outros.

## 🚀 Funcionalidades

### Funcionalidades Principais
- **Gravação de Interações**: Captura cliques, rolagens, preenchimento de campos, teclas pressionadas e mudanças em elementos.
- **Painel Flutuante e Responsivo**: Interface moderna, flutuante, minimizável/maximizável, com navegação por teclado e acessibilidade (ARIA, foco, tabulação lógica).
- **Destaque Visual**: Realce de elementos ao passar o mouse, similar ao DevTools, para facilitar a seleção de elementos.
- **Exportação de Cenários**:
  - Exporta cenários em formatos `TXT`, `JSON` e `FEATURES` (Gherkin)
  - Geração automática de arquivos Python (`pages.py`, `steps.py`, `environment.py`, `requirements.txt`)
  - Exportação de README.md para cada feature/cenário
- **Undo/Redo**: Permite desfazer e refazer interações gravadas.
- **Log Detalhado**: Visualização detalhada de cada interação, incluindo contexto de Shadow DOM/Iframe, com modal acessível.
- **Timer de Execução**: Cronômetro integrado para medir o tempo de gravação dos cenários.
- **Upload de Evidências**: Modal para adicionar nomes de arquivos de evidência aos cenários.
- **Login e Senha**: Modal dedicado para registrar ações de login de forma segura.
- **Validações e Esperas**: Suporte a validações de existência, conteúdo, valores e esperas inteligentes (ex: esperar elemento aparecer/desaparecer).
- **Configurações Avançadas**: Permite customizar templates de steps, nomes padrão e exportação via tela de opções.
- **Compatibilidade com Shadow DOM e Iframes**: Captura e indica corretamente elementos dentro desses contextos.
- **Acessibilidade**: Todos os controles do painel e modais são acessíveis por teclado, com foco visível, ARIA labels e roles apropriados.
- **Feedback Visual e Alertas**: Mensagens de sucesso/erro com fechamento por teclado e leitura por leitores de tela.
- **Proteção de Dados**: Todos os dados são armazenados localmente, sem envio para servidores.

### Funcionalidades Adicionais
- **Painel Movível**: O painel pode ser arrastado para qualquer lugar da tela.
- **Exportação em Massa**: Permite exportar múltiplas features/cenários de uma vez.
- **Botões de Controle**: Play, Pause, Finalizar, Exportar, Limpar, Encerrar Cenário/Feature.
- **Personalização de Tema**: Suporte a tema claro/escuro (dark mode).
- **Atalhos de Teclado**: Navegação por Tab, Shift+Tab, Enter, Espaço e Escape em todos os modais e painel.
- **Mensagens e Tooltips**: Dicas contextuais para cada ação selecionada.
- **Compatível com Chrome e navegadores baseados em Chromium**.

---

## 💻 Instalação
**Pré-requisitos:**
- Google Chrome ou navegador compatível com extensões Chrome

**Passos:**
1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/BddMat.git
   ```
2. Abra o navegador e acesse `chrome://extensions/`
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto

## ▶️ Uso
1. Clique no ícone da extensão para abrir o painel
2. Use os botões **Play**, **Pause** e **Finalizar** para controlar a gravação
3. Passe o mouse sobre elementos para destacá-los visualmente
4. Escolha o formato de exportação e clique em **Exportar** para salvar os cenários

## 🖼️ Exemplo Visual
> Adicione aqui um GIF ou imagem do painel da extensão em uso para facilitar o entendimento dos novos usuários.

## 🤝 Contribuição
1. Faça um fork do repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Envie suas alterações:
   ```bash
   git push origin minha-feature
   ```
4. Abra um Pull Request

**Boas práticas:**
- Sempre descreva claramente sua feature ou correção
- Mantenha o padrão de código e documentação
- Teste suas alterações antes de enviar

---

## 🤝 Guia de Contribuição e Manutenção

### Estrutura do Projeto
- Código-fonte principal: arquivos JS na raiz e pasta `components/`.
- Testes unitários: pasta `__tests__`.
- Estilos: `ui.css` centralizado.
- Utilitários: `utils.js`.

### Comentários e Boas Práticas
- Funções críticas e utilitários possuem comentários explicativos.
- Prefira sempre modularizar e reutilizar componentes.
- Use lazy loading para fluxos não críticos.

### Testes
- Testes unitários em `__tests__/*.test.js` (exemplo: `utils.test.js`).
- Para rodar os testes:
  ```bash
  npm test
  ```
- Recomenda-se adicionar testes para novas funções utilitárias e fluxos principais.

### Lint e Formatação
- Padronização automática com ESLint e Prettier.
- Para checar lint:
  ```bash
  npm run lint
  ```
- Para formatar o código:
  ```bash
  npm run format
  ```

### Sugestões para Pull Requests
- Sempre documente funções públicas e utilitários.
- Adicione testes para novas funcionalidades.
- Garanta que o código passe no lint e nos testes antes de enviar PR.

---

## 🔒 Segurança e Privacidade
O **Assistente Automatizador** foi desenvolvido com foco total em segurança e privacidade dos dados do usuário:

- **Armazenamento Local:** Todos os dados gravados (interações, cenários, informações de teste) são armazenados apenas localmente no navegador do usuário. Nenhuma informação é enviada para servidores externos, nuvem ou terceiros.
- **Sem Coleta de Dados Sensíveis:** A extensão não coleta, transmite ou armazena dados sensíveis do usuário, como senhas, cookies, informações bancárias ou dados pessoais, a menos que o próprio usuário os inclua manualmente nos cenários exportados.
- **Exportação Segura:** Os arquivos exportados (TXT, JSON, FEATURES) são gerados localmente e só serão compartilhados se o próprio usuário assim desejar. Recomenda-se atenção ao compartilhar arquivos exportados, pois podem conter dados inseridos manualmente durante a gravação.
- **Sem Risco de Vazamento em Nuvem:** Como não há integração com servidores ou armazenamento em nuvem, não existe risco de vazamento de dados por parte da extensão. O controle dos dados é totalmente do usuário.
- **Boas Práticas:** Para máxima segurança, evite inserir dados sensíveis nos cenários de teste. Caso precise, trate os arquivos exportados com confidencialidade.

**Resumo:**
> Todos os dados permanecem no ambiente local do usuário. O Assistente Automatizador não realiza upload, backup ou sincronização de informações com a web ou nuvem.

---

## ❓ FAQ

**1. Posso usar em qualquer site?**
Sim! A extensão funciona em qualquer página web acessível pelo navegador.

**2. Meus dados são enviados para algum servidor?**
Não. Todos os dados ficam apenas no seu navegador.

**3. Como exportar para Python/Selenium?**
Basta gravar o cenário normalmente e escolher o formato de exportação desejado. O arquivo Python será gerado automaticamente.

**4. O painel some ou trava em alguns sites, o que fazer?**
Tente recarregar a página ou reativar a extensão. Se o problema persistir, reporte via GitHub.

**5. Como reportar bugs ou sugerir melhorias?**
Abra uma issue ou pull request neste repositório.

---

O **Assistente automatizador** foi desenvolvido com foco em segurança e privacidade dos dados do usuário. Veja abaixo como os dados são tratados:

- **Armazenamento Local:** Todos os dados gravados (interações, cenários, informações de teste) são armazenados apenas localmente no navegador do usuário. Nenhuma informação é enviada para servidores externos, nuvem ou terceiros.

- **Sem Coleta de Dados Sensíveis:** A extensão não coleta, transmite ou armazena dados sensíveis do usuário, como senhas, cookies, informações bancárias ou dados pessoais, a menos que o próprio usuário os inclua manualmente nos cenários exportados.

- **Exportação Segura:** Os arquivos exportados (TXT, JSON, FEATURES) são gerados localmente e só serão compartilhados se o próprio usuário assim desejar. Recomenda-se atenção ao compartilhar arquivos exportados, pois podem conter dados inseridos manualmente durante a gravação.

- **Sem Risco de Vazamento em Nuvem:** Como não há integração com servidores ou armazenamento em nuvem, não existe risco de vazamento de dados por parte da extensão. O controle dos dados é totalmente do usuário.

- **Boas Práticas:** Para máxima segurança, evite inserir dados sensíveis nos cenários de teste. Caso precise, trate os arquivos exportados com confidencialidade.

**Resumo:**
> Todos os dados permanecem no ambiente local do usuário. O Assistente automatizador não realiza upload, backup ou sincronização de informações com a web ou nuvem.

npx webpack --config webpack.config.js --no-cache

## 🚦 Fluxo de Versionamento e Publicação no GitHub

Siga as melhores práticas para manter o repositório organizado e facilitar a colaboração:

### 1. Commit Local
Sempre que fizer alterações relevantes (código, documentação, etc.), salve as mudanças localmente com um commit descritivo:
```bash
git add .
git commit -m "Descreva claramente o que foi alterado"
```

### 2. Sincronize com o Repositório Remoto
Antes de enviar, é recomendado atualizar sua branch local para evitar conflitos:
```bash
git pull origin main
```
(Substitua `main` pelo nome da sua branch, se for diferente.)

### 3. Envie para o GitHub
Após garantir que está tudo certo, envie suas alterações:
```bash
git push origin main
```

### 4. Releases e Versionamento
- Crie uma tag para marcar versões estáveis:
  ```bash
  git tag -a v1.1.0 -m "Descrição da release"
  git push origin v1.1.0
  ```
- No GitHub, vá em "Releases" e crie uma nova release vinculando à tag criada, adicionando um changelog claro.

### 5. Boas Práticas Gerais
- Faça commits pequenos e frequentes, com mensagens claras.
- Use branches para novas features/correções.
- Sempre revise antes de enviar para o `main`.
- Mantenha o README e o changelog atualizados.

## Licença
Este projeto foi produzido por Matheus Ferreira de Oliveira.
V: 1.0


npx webpack --config webpack.config.js
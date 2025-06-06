

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
- Gravação de cliques, rolagens, preenchimento de campos e teclas pressionadas
- Exportação de cenários em formatos `TXT`, `JSON` e `FEATURES` (Gherkin)
- Geração automática de arquivos Python (`pages.py`, `steps.py`, etc.)
- Painel flutuante, responsivo e acessível
- Destaque visual de elementos ao passar o mouse (tipo DevTools)
- Compatível com ferramentas de automação modernas
- Proteção de dados: tudo local, sem envio para servidores

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

## Licença
Este projeto foi produzido por Matheus Ferreira de Oliveira.
V: 1.0





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
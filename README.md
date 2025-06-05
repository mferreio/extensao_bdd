
# Assistente automatizador

## Descrição
O **Assistente automatizador** é uma extensão para o navegador que permite gravar interações do usuário em páginas web e exportá-las em formatos compatíveis com ferramentas de automação como Cucumber e Selenium.

## Funcionalidades
- Gravação de cliques, rolagens e teclas pressionadas.
- Exportação de cenários em formatos `TXT`, `JSON` e `FEATURES`.
- Painel flutuante responsivo e acessível.
- Compatível com ferramentas de automação.

## Instalação
1. Clone este repositório:
   ```bash
   git clone https://github.com/seu-usuario/BddMat.git
   ```
2. Abra o navegador e acesse `chrome://extensions/`.
3. Ative o **Modo do desenvolvedor**.
4. Clique em **Carregar sem compactação** e selecione a pasta do projeto.

## Uso
1. Clique no ícone da extensão para abrir o painel.
2. Use os botões **Play**, **Pause** e **Finalizar** para controlar a gravação.
3. Escolha o formato de exportação e clique em **Exportar** para salvar os cenários.

## Contribuição
1. Faça um fork do repositório.
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b minha-feature
   ```
3. Envie suas alterações:
   ```bash
   git push origin minha-feature
   ```
4. Abra um Pull Request.



## Segurança e Privacidade

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



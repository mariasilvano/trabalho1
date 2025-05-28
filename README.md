## Trabalho Prático 1 – Sistema de Comunicação Segura entre Usuários

## 👥 Integrantes do Grupo

> **Maria Gabriela Silvano** – RA: **2272636**  
> **Miguel da Silva Peloso** – RA: **2419173**  
> **Rafael Couto Lira** – RA: **2409976**  
> **Vitor Bertoncello** – RA: **2419220**

Foi desenvolvido uma aplicação prática que simula a troca segura de mensagens entre dois usuários (Alice e Bob), utilizando:
 - Hash para verificação de integridade.
 - Criptografia simétrica para proteger o conteúdo da mensagem.
 - Criptografia assimétrica para troca segura da chave simétrica.
 - Assinatura digital para autenticar o remetente.
 - Certificado digital simulado para validar a chave pública do remetente.

___

## Como testar

### Dependências 
Será necessário um Banco de Dados Postgres
  - Via Podman:
  ```bash
  podman run --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=trabalho1 -p 5432:5432 -v /var/lib/data -d postgres
  ```
  - Via Docker:
  ```bash
  docker run --name postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=senha -e POSTGRES_DB=trabalho1 -d -p 5432:5432 postgres
  ```
  - Instalado localmente:
  
  Altere o arquivo config/db.js para suas credenciais

Dependências NPM
  ```bash
  npm install package.json
  ```

Um aplicativo Autenticador de sua preferencia.

### Rodando o sistema

Para rodar o aplicativo execute:
  ```bash
  npm app.js
  ```


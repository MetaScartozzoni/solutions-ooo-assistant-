# 🏥 Painel Operacional – Clínica Dr. Marcio Scartozzoni

Este projeto permite a gestão integrada de pacientes entre setores, com controle de acesso por e-mail, painel web responsivo e registros automatizados.

---

## 📁 Estrutura dos Arquivos

- `code.js` – Lógica do lado do servidor principal (Apps Script)
- `PainelPrincipal.html` – Interface HTML WebApp
- `appscript.json` – Manifesto e escopos
- `.clasp.json` – Configuração de projeto local para o Google Apps Script CLI (Command Line Apps Script Projeto)
- `generate_clasp_json.py` – Script para gerar o arquivo `.clasp.json` (usado para configurar o Google Apps Script CLI - Command Line Apps Script)
- `painel-agendamento/` – Arquivos do painel de agendamentos
- `painel-cirurgias/` – Arquivos do painel de cirurgias
- `painel-orcamentos/` – Arquivos do painel de orçamentos
- `painel-solicitacoes/` – Arquivos do painel de solicitações

---

## 🚀 Passo a Passo para Instalar e Publicar

### 1. Criar ou Vincular Projeto

1. Acesse Google Apps Script (https://script.google.com) e crie um novo projeto ou vincule ao existente.
2. Na raiz do projeto local, execute `clasp login` e `clasp create --type standalone --title "Painel Clínico" --rootDir .` ou ajuste em `.clasp.json`.

### 2. Sincronizar Código

1. `clasp pull` para baixar o projeto remoto.
2. `clasp push` para enviar suas alterações locais.

### 3. Implantar como WebApp

1. No editor do Apps Script, vá em **Implantar > Gerenciar Implantações**.
2. Crie uma nova versão e selecione:
   - **Executar como:** Usuário que implanta
   - **Quem tem acesso:** Qualquer pessoa ou seu domínio
3. Clique em **Implantar** e copie o link para uso.

---

## 🔐 Permissões e Escopos

- Verifique o `scriptId` e os escopos em `appscript.json` antes de publicar.
- Ajuste conforme necessário para acesso a Planilhas, Drive e envio de e-mails.

---

```
## 📊 Funcionalidades Principais

- Gestão de agendamentos, cirurgias, orçamentos e solicitações.
- Filtros dinâmicos, busca e exportação de dados.
- Registro de movimentação e controle de acesso por setor.

---

## 🛠️ Manutenção

Este projeto requer manutenção periódica para garantir que os painéis e scripts estejam atualizados e funcionando corretamente.

- Cada painel possui interface e lógica do servidor separadas em suas pastas.
- Use variáveis de ambiente e constantes no início dos scripts para configurar IDs e nomes de abas.

---

## ✉️ Suporte

Responsável técnico: Dr. Robô – integração personalizada para Clínica Dr. Marcio Scartozzoni.

---

✅ Projeto pronto para produção. Use com segurança.
```

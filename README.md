# Cirurgias Pós-Operatório - Clínica Dr. Marcio Scartozzoni

Este projeto é um aplicativo web React/Next.js que fornece um guia interativo para recuperação pós-cirúrgica, incluindo:

- Filtros por tipo de cirurgia
- FAQ e vídeos educativos
- Formulário de dúvidas com integração à planilha do Google Sheets

---

## 🚀 Tecnologias

- **Next.js** – Framework para React
- **TailwindCSS** – Estilização rápida e responsiva
- **Lucide-react** – Ícones modernos
- **Vercel** – Deploy automático e contínuo

---

## 📦 Instalação Local

```bash
git clone https://github.com/seuusuario/cirurgias-app.git
cd cirurgias-app
npm install
npm run dev
```

Abra `http://localhost:3000` para visualizar.

---

## 📝 Estrutura

- `components/FormularioEnvioDuvida.js`: Formulário conectado à API
- `pages/CirurgiasPlasticasApp.js`: Página principal do app
- `api/formulario.js`: Endpoint para integração com planilha (você deve implementar)

---

## 🌐 Deploy com Vercel

1. Suba para um repositório no GitHub
2. Vá até [vercel.com](https://vercel.com)
3. Clique em **New Project**
4. Selecione o repositório `cirurgias-app`
5. Vercel detectará automaticamente o Next.js e deployará automaticamente

---

## 🔐 Observação

- Para integração com Google Sheets você precisará:
  - Criar uma conta de serviço no Google Cloud
  - Compartilhar a planilha com o email da conta de serviço
  - Incluir o `credentials.json` no backend ou usar variável de ambiente

---

## 📥 Integração com Jotform (Webhooks)

Você pode automatizar o recebimento de agendamentos ou solicitações de cirurgia usando formulários do Jotform e webhooks.

### 1. Crie um formulário no Jotform

- Acesse [Jotform](https://www.jotform.com/), crie um formulário para agendamento ou solicitação de cirurgia.
- Adicione campos como Nome, Telefone, Data, Tipo de Cirurgia, etc.

### 2. Configure o Webhook do Jotform

- No editor do Jotform, vá em **Settings > Integrations > Webhooks**.
- Adicione a URL do seu endpoint, por exemplo:
  - Para Next.js: `https://seusite.com/api/jotform-webhook`
  - Para Apps Script: `https://script.google.com/macros/s/SEU_DEPLOY_ID/exec`

### 3. Exemplo de endpoint para receber o webhook

#### Next.js (pages/api/jotform-webhook.js)

```js
export default async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;
    // TODO: Parse campos do Jotform conforme necessário
    // Exemplo: Salvar no Google Sheets, banco de dados, etc.
    res.status(200).json({ ok: true });
  } else {
    res.status(405).end();
  }
}
```

#### Google Apps Script (doPost)

```js
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  // TODO: Parse campos do Jotform e salvar na planilha
  // Exemplo:
  // var sheet = SpreadsheetApp.openById('SHEET_ID').getSheetByName('Agendamento');
  // sheet.appendRow([data.nome, data.telefone, data.data, ...]);
  return ContentService.createTextOutput("OK");
}
```

### 4. (Opcional) Notificações por Email/WhatsApp

- Após salvar o registro, envie um e-mail ou mensagem WhatsApp usando:
  - [Apps Script MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)
  - [Twilio API](https://www.twilio.com/docs/whatsapp/send-messages) para WhatsApp

---

## 🤝 Contribuição

Sinta-se livre para contribuir! Sugestões e melhorias são bem-vindas.

---

## 📧 Contato

Clínica Dr. Marcio Scartozzoni  
📍 Rua Estados Unidos, 403 – São Paulo/SP  
📞 (11) 98948-4191  
✉️ contato@mscartozzoni.com.br

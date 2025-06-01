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

## 🤝 Contribuição

Sinta-se livre para contribuir! Sugestões e melhorias são bem-vindas.

---

## 📧 Contato

Clínica Dr. Marcio Scartozzoni  
📍 Rua Estados Unidos, 403 – São Paulo/SP  
📞 (11) 98948-4191  
✉️ contato@mscartozzoni.com.br
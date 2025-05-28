// ========== MÓDULO 01 – Inicialização da Planilha ==========
function inicializarSistema() {
  const abas = [
    "Pré-Consulta",
    "Consulta",
    "Orçamento",
    "Gestão de Orçamento",
    "Pré-Cirurgia",
    "Cirurgia",
    "Recusado",
  ];

  const headers = [
    "STATUS",
    "NOME",
    "TELEFONE",
    "CPF",
    "DATA NASC",
    "E-MAIL",
    "ETAPA ATUAL",
    "OBS",
    "DATA ENVIO",
    "RESPONSÁVEL",
    "ORIGEM",
    "DATA ATUALIZAÇÃO",
  ];

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  abas.forEach((nomeAba) => {
    let aba = ss.getSheetByName(nomeAba);
    if (!aba) {
      aba = ss.insertSheet(nomeAba);
    } else {
      aba.clear();
    }

    aba.clearFormats();
    aba.getRange(1, 1, 1, headers.length).setValues([headers]);
    aba.setFrozenRows(1);
    aba.setColumnWidths(1, headers.length, 140);

    const totalLinhas = aba.getMaxRows() - 1;
    const dataCols = [5, 9, 12]; // DATA NASC, ENVIO, ATUALIZAÇÃO
    dataCols.forEach((col) => {
      aba.getRange(2, col, totalLinhas).setNumberFormat("dd/MM/yyyy HH:mm");
    });

    aba.getRange(2, 3, totalLinhas).setNumberFormat("_(00) 00000\\-0000");

    const ruleEmail = SpreadsheetApp.newDataValidation()
      .requireTextIsEmail()
      .setAllowInvalid(false)
      .build();
    aba.getRange(2, 6, totalLinhas).setDataValidation(ruleEmail);
  });

  ScriptApp.newTrigger("formatarNomeAutomaticamente")
    .forSpreadsheet(ss)
    .onEdit()
    .create();
}

function formatarNomeAutomaticamente(e) {
  const colNome = 2;
  if (
    !e ||
    !e.range ||
    e.range.getColumn() !== colNome ||
    e.range.getRow() === 1
  )
    return;
  const valor = e.range.getValue();
  if (typeof valor !== "string") return;
  const formatado = valor
    .toLowerCase()
    .split(" ")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  e.range.setValue(formatado);
}

// ===================== CODE.GS COMPLETO (ATUALIZADO) =====================

const mapaPermissoes = {
  Comercial: {
    etapas: ["Pré-Consulta", "Consulta"],
    acoes: ["marcarComoAceito", "enviarParaConsulta"],
  },
  Consulta: {
    etapas: ["Consulta"],
    acoes: ["enviarParaOrcamento"],
  },
  Orcamento: {
    etapas: ["Orçamento"],
    acoes: ["enviarParaGestao"],
  },
  Financeiro: {
    etapas: ["Gestão de Orçamento"],
    acoes: ["enviarParaCirurgia"],
  },
  Cirurgia: {
    etapas: ["Pré-Cirurgia", "Cirurgia"],
    acoes: ["marcarComoAceito", "marcarComoRecusado"],
  },
};

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("▶️ Ações do Sistema")
    .addItem("Enviar para Consulta", "enviarParaConsulta")
    .addItem("Enviar para Orçamento", "enviarParaOrcamento")
    .addItem("Enviar para Gestão de Orçamento", "enviarParaGestao")
    .addItem("Enviar para Cirurgia", "enviarParaCirurgia")
    .addItem("Marcar como Aceito", "marcarComoAceito")
    .addItem("Marcar como Recusado", "marcarComoRecusado")
    .addToUi();
}

function getPermissoesUsuario() {
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const mapaEmails = {
    "comercial@clinica.com": "Comercial",
    "consulta@clinica.com": "Consulta",
    "orcamento@clinica.com": "Orcamento",
    "financeiro@clinica.com": "Financeiro",
    "cirurgia@clinica.com": "Cirurgia",
  };
  const setor = mapaEmails[email] || null;
  if (!setor)
    return {
      autorizado: false,
      mensagem: "E-mail não autorizado para este painel.",
    };
  const permissoes = mapaPermissoes[setor];
  return { autorizado: true, setor, ...permissoes };
}

function getTotaisPorEtapa() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const email = Session.getActiveUser().getEmail().toLowerCase();
  const mapaEmails = {
    "comercial@clinica.com": "Comercial",
    "consulta@clinica.com": "Consulta",
    "orcamento@clinica.com": "Orcamento",
    "financeiro@clinica.com": "Financeiro",
    "cirurgia@clinica.com": "Cirurgia",
  };
  const setor = mapaEmails[email] || null;
  if (!setor || !mapaPermissoes[setor]) return [];
  const etapas = mapaPermissoes[setor].etapas;
  const resultados = [];
  etapas.forEach((etapa) => {
    const aba = ss.getSheetByName(etapa);
    const total = aba ? aba.getLastRow() - 1 : 0;
    resultados.push({ etapa, total });
  });
  return resultados;
}

function getPacientesPorEtapa(etapa) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName(etapa);
  if (!aba) return [];
  const dados = aba.getDataRange().getValues();
  return dados.slice(1).map((row, i) => ({
    nome: row[1],
    cpf: row[3],
    etapa: row[6],
    status: row[0],
    telefone: row[2],
    email: row[5],
    origem: row[10],
    linha: i + 2,
  }));
}

function getPacienteDetalhado(etapa, linha) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName(etapa);
  if (!aba) return null;
  const row = aba.getRange(linha, 1, 1, 12).getValues()[0];
  return {
    status: row[0],
    nome: row[1],
    telefone: row[2],
    cpf: row[3],
    dataNasc: row[4],
    email: row[5],
    etapa: row[6],
    obs: row[7],
    dataEnvio: row[8],
    responsavel: row[9],
    origem: row[10],
    dataAtualizacao: row[11],
  };
}

function executarAcaoPainel(acao, etapaOrigem, linhaOrigem) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaOrigem = ss.getSheetByName(etapaOrigem);
  if (!abaOrigem) throw new Error("Aba de origem não encontrada.");
  const dados = abaOrigem.getRange(linhaOrigem, 1, 1, 12).getValues()[0];
  const agora = Utilities.formatDate(
    new Date(),
    ss.getSpreadsheetTimeZone(),
    "dd/MM/yyyy HH:mm"
  );
  const mapaDestino = {
    enviarParaConsulta: { destino: "Consulta", status: "Encaminhado" },
    enviarParaOrcamento: { destino: "Orçamento", status: "Encaminhado" },
    enviarParaGestao: { destino: "Gestão de Orçamento", status: "Encaminhado" },
    enviarParaCirurgia: { destino: "Cirurgia", status: "Encaminhado" },
    marcarComoAceito: { destino: "Pré-Consulta", status: "Aceito" },
    marcarComoRecusado: { destino: "Recusado", status: "Recusado" },
  };
  const acaoInfo = mapaDestino[acao];
  if (!acaoInfo) throw new Error("Ação inválida.");
  const abaDestino = ss.getSheetByName(acaoInfo.destino);
  if (!abaDestino) throw new Error("Aba de destino não existe.");
  dados[0] = acaoInfo.status;
  dados[6] = acaoInfo.destino;
  dados[11] = agora;
  if (!dados[8]) dados[8] = agora;
  abaDestino.appendRow(dados);
  abaOrigem.deleteRow(linhaOrigem);
  registrarLog({
    acao: acaoFormatado(acao),
    nome: dados[1],
    cpf: dados[3],
    origem: etapaOrigem,
    destino: acaoInfo.destino,
  });
}

function registrarLog({ acao, nome, cpf, origem, destino }) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let aba = ss.getSheetByName("Histórico");
  if (!aba) {
    aba = ss.insertSheet("Histórico");
    aba
      .getRange(1, 1, 1, 8)
      .setValues([
        ["DATA", "AÇÃO", "USUÁRIO", "NOME", "CPF", "DE", "PARA", "OBS"],
      ]);
    aba.setFrozenRows(1);
    aba.hideSheet();
  }
  const usuario = Session.getActiveUser().getEmail();
  const agora = Utilities.formatDate(
    new Date(),
    ss.getSpreadsheetTimeZone(),
    "dd/MM/yyyy HH:mm"
  );
  aba.appendRow([agora, acao, usuario, nome, cpf, origem, destino, ""]);
}

function acaoFormatado(nome) {
  const mapa = {
    marcarComoAceito: "✔️ ACEITO",
    marcarComoRecusado: "❌ RECUSADO",
    enviarParaConsulta: "➡️ Enviar para Consulta",
    enviarParaOrcamento: "➡️ Enviar para Orçamento",
    enviarParaGestao: "➡️ Enviar para Gestão",
    enviarParaCirurgia: "➡️ Enviar para Cirurgia",
  };
  return mapa[nome] || nome;
}

function doGet(e) {
  return HtmlService.createHtmlOutputFromFile("PainelPrincipal")
    .setSandboxMode(HtmlService.SandboxMode.IFRAME)
    .addMetaTag("viewport", "width=device-width, initial-scale=1")
    .setTitle("Painel Operacional")
    .setFaviconUrl(
      "https://ssl.gstatic.com/docs/doclist/images/infinite_arrow_favicon_5.ico"
    );
}
// ===================== AGENDAMENTO.GS (EXEMPLO) =====================
// const SHE

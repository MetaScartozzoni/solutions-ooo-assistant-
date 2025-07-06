// painel-agendamento/agendamento.gs
// Backend para Painel de Agendamento de Consultas/Cirurgias
//
// Para definir o SHEET_ID via PropertiesService, execute no Apps Script:
//   PropertiesService.getScriptProperties().setProperty('SHEET_ID', 'SEU_ID_AQUI');
// Substitua 'SEU_ID_AQUI' pelo ID real da sua planilha.

function getSheetId() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("SHEET_ID não definido nas propriedades do script.");
  return id;
}

const SHEET_NAME_AGENDAMENTO = "Agendamento";

function listarAgendamentos(status) {
  const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
    SHEET_NAME_AGENDAMENTO
  );
  if (!sheet) throw new Error('A aba "Agendamento" não foi encontrada.');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => h.toString().trim());
  let agendamentos = data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((key, i) => (obj[key] = row[i]));
    return obj;
  });
  if (status && status !== "Todos") {
    agendamentos = agendamentos.filter((a) => a.Status === status);
  }
  return agendamentos;
}

function criarAgendamento(dados) {
  const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
    SHEET_NAME_AGENDAMENTO
  );
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((h) => h.toString().trim());
  const novaLinha = headers.map((key) => dados[key] || "");
  sheet.appendRow(novaLinha);
  return "Agendamento criado com sucesso!";
}

function atualizarAgendamento(id, dadosAtualizados) {
  const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
    SHEET_NAME_AGENDAMENTO
  );
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => h.toString().trim());
  const idIndex = headers.indexOf("ID");
  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      headers.forEach((key, col) => {
        if (dadosAtualizados[key] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(dadosAtualizados[key]);
        }
      });
      return "Agendamento atualizado com sucesso!";
    }
  }
  throw new Error("Agendamento com ID informado não encontrado.");
}

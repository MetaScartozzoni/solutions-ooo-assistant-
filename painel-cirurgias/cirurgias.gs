// Backend para Painel de Gestão de Cirurgias
//
// Para definir o SHEET_ID via PropertiesService, execute o seguinte no editor do Apps Script:
//
//   PropertiesService.getScriptProperties().setProperty('SHEET_ID', 'SEU_ID_AQUI');
//
// Substitua 'SEU_ID_AQUI' pelo ID real da sua planilha.

function getSheetId() {
  const id = PropertiesService.getScriptProperties().getProperty("SHEET_ID");
  if (!id) throw new Error("SHEET_ID não definido nas propriedades do script.");
  return id;
}

const SHEET_NAME_CIRURGIAS = "Cirurgias";

function getCirurgias() {
  const sheet =
    SpreadsheetApp.openById(getSheetId()).getSheetByName(SHEET_NAME_CIRURGIAS);
  if (!sheet) throw new Error('A aba "Cirurgias" não foi encontrada.');

  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => h.toString().trim());
  return data.slice(1).map((row) => {
    const obj = {};
    headers.forEach((key, i) => (obj[key] = row[i]));
    return obj;
  });
}

function addCirurgia(data) {
  const sheet =
    SpreadsheetApp.openById(getSheetId()).getSheetByName(SHEET_NAME_CIRURGIAS);
  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0]
    .map((h) => h.toString().trim());

  const newRow = headers.map((key) => data[key] || "");
  sheet.appendRow(newRow);
  return "Cirurgia adicionada com sucesso!";
}

function updateCirurgia(id, updatedData) {
  const sheet =
    SpreadsheetApp.openById(getSheetId()).getSheetByName(SHEET_NAME_CIRURGIAS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map((h) => h.toString().trim());
  const idIndex = headers.indexOf("ID_Paciente");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      headers.forEach((key, col) => {
        if (updatedData[key] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(updatedData[key]);
        }
      });
      return "Cirurgia atualizada com sucesso!";
    }
  }
  throw new Error("Cirurgia com ID informado não encontrada.");
}

function deleteCirurgia(id) {
  const sheet =
    SpreadsheetApp.openById(getSheetId()).getSheetByName(SHEET_NAME_CIRURGIAS);
  const data = sheet.getDataRange().getValues();
  const idIndex = data[0].indexOf("ID_Paciente");

  for (let i = 1; i < data.length; i++) {
    if (data[i][idIndex] == id) {
      sheet.deleteRow(i + 1);
      return "Cirurgia excluída com sucesso!";
    }
  }
  throw new Error("ID não encontrado.");
}

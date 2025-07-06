// solicitacoes.gs (Revisado e Seguro)

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

const SHEET_NAME_ATENDIMENTO = "Solicitacoes";

function getRequests() {
  try {
    const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
      SHEET_NAME_ATENDIMENTO
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());
    return data.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
  } catch (err) {
    Logger.log("Erro em getRequests: " + err.message);
    throw new Error("Erro ao carregar solicitações");
  }
}

function addRequest(data) {
  try {
    const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
      SHEET_NAME_ATENDIMENTO
    );
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map((h) => h.toString().trim());

    if (!data.Cliente || data.Cliente.trim().length < 2)
      throw new Error("Cliente inválido");

    const lastRow = sheet.getLastRow();
    const ids =
      lastRow > 1
        ? sheet
            .getRange(2, headers.indexOf("ID") + 1, lastRow - 1)
            .getValues()
            .flat()
        : [];
    const newId = ids.length
      ? Math.max(...ids.map((x) => parseInt(x) || 0)) + 1
      : 1;
    data.ID = newId;
    data.Data = new Date().toLocaleDateString("pt-BR");
    data.Status = data.Status || "Pendente";
    data["Última Atualização"] = new Date().toLocaleString("pt-BR");

    const row = headers.map((h) => data[h] || "");
    sheet.appendRow(row);
    return "Solicitação registrada com sucesso";
  } catch (err) {
    Logger.log("Erro em addRequest: " + err.message);
    throw new Error("Erro ao registrar solicitação");
  }
}

function updateRequestStatus(id, novoStatus, responsavel) {
  try {
    const sheet = SpreadsheetApp.openById(getSheetId()).getSheetByName(
      SHEET_NAME_ATENDIMENTO
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());

    const idIdx = headers.indexOf("ID");
    const statusIdx = headers.indexOf("Status");
    const respIdx = headers.indexOf("Responsável");
    const ultimaIdx = headers.indexOf("Última Atualização");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIdx] == id) {
        if (statusIdx >= 0)
          sheet.getRange(i + 1, statusIdx + 1).setValue(novoStatus);
        if (respIdx >= 0)
          sheet.getRange(i + 1, respIdx + 1).setValue(responsavel);
        if (ultimaIdx >= 0)
          sheet
            .getRange(i + 1, ultimaIdx + 1)
            .setValue(new Date().toLocaleString("pt-BR"));
        return "Status atualizado com sucesso";
      }
    }
    throw new Error("ID não encontrado");
  } catch (err) {
    Logger.log("Erro em updateRequestStatus: " + err.message);
    throw new Error("Erro ao atualizar status");
  }
}

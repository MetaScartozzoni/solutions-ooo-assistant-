// agendamento.gs (Revisado e Seguro)

const SHEET_ID = "1q4hNK1zGsA9EvrAt7nYtMrIl51Ot5NHSlYQBUHollz8";
const SHEET_NAME_AGENDAMENTO = "Agendamentos";

function getAppointments() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_AGENDAMENTO
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());
    return data.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
  } catch (err) {
    Logger.log("Erro em getAppointments: " + err.message);
    throw new Error("Erro ao carregar agendamentos");
  }
}

function addAppointment(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_AGENDAMENTO
    );
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map((h) => h.toString().trim());

    if (!data.Cliente || data.Cliente.trim().length < 2)
      throw new Error("Nome do cliente é obrigatório");

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
    data.Status = data.Status || "Pendente";

    const newRow = headers.map((h) => data[h] || "");
    sheet.appendRow(newRow);
    return "Agendamento salvo com sucesso";
  } catch (err) {
    Logger.log("Erro em addAppointment: " + err.message);
    throw new Error("Erro ao salvar agendamento: " + err.message);
  }
}

function updateAppointment(id, updated) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_AGENDAMENTO
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());
    const idIndex = headers.indexOf("ID");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        const linha = i + 1;
        headers.forEach((h, j) => {
          if (updated[h] !== undefined) {
            sheet.getRange(linha, j + 1).setValue(updated[h]);
          }
        });
        return "Agendamento atualizado";
      }
    }
    throw new Error("ID não encontrado");
  } catch (err) {
    Logger.log("Erro em updateAppointment: " + err.message);
    throw new Error("Erro ao atualizar agendamento");
  }
}

function deleteAppointment(id) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_AGENDAMENTO
    );
    const data = sheet.getDataRange().getValues();
    const idIndex = data[0].indexOf("ID");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        sheet.deleteRow(i + 1);
        return "Agendamento removido";
      }
    }
    throw new Error("ID não encontrado");
  } catch (err) {
    Logger.log("Erro em deleteAppointment: " + err.message);
    throw new Error("Erro ao excluir agendamento");
  }
}

function sendEmailNotification(recipient, subject, body) {
  try {
    if (!recipient || !subject || !body)
      throw new Error("Parâmetros inválidos");
    MailApp.sendEmail(recipient, subject, body);
    return "E-mail enviado com sucesso";
  } catch (err) {
    Logger.log("Erro em sendEmailNotification: " + err.message);
    throw new Error("Erro ao enviar e-mail");
  }
}

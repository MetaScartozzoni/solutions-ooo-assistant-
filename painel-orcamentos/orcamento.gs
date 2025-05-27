// orcamento.gs (REVISADO E SEGURO)

const SHEET_ID = "1q4hNK1zGsA9EvrAt7nYtMrIl51Ot5NHSlYQBUHollz8";
const SHEET_NAME_ORCAMENTOS = "Orcamentos";

function getBudgets() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_ORCAMENTOS
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());
    return data.slice(1).map((row) => {
      const obj = {};
      headers.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
  } catch (err) {
    Logger.log("Erro em getBudgets: " + err.message);
    throw new Error("Falha ao carregar orçamentos");
  }
}

function addBudget(data) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_ORCAMENTOS
    );
    const headers = sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0]
      .map((h) => h.toString().trim());

    if (!data.Cliente || data.Cliente.trim().length < 2)
      throw new Error("Nome do paciente é obrigatório");

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
    data["Data Criação"] = new Date().toLocaleDateString("pt-BR");
    data.Status = data.Status || "Em Aberto";

    const calc = calculateBudgetTotals(data);
    Object.assign(data, calc);

    const newRow = headers.map((h) => data[h] || "");
    sheet.appendRow(newRow);
    return "Orçamento salvo com sucesso";
  } catch (err) {
    Logger.log("Erro em addBudget: " + err.message);
    throw new Error("Erro ao salvar orçamento: " + err.message);
  }
}

function updateBudget(id, updated) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_ORCAMENTOS
    );
    const data = sheet.getDataRange().getValues();
    const headers = data[0].map((h) => h.toString().trim());
    const idIndex = headers.indexOf("ID");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        const linha = i + 1;
        const atual = headers.reduce(
          (obj, h, j) => ((obj[h] = data[i][j]), obj),
          {}
        );
        const merge = {
          ...atual,
          ...updated,
          ...calculateBudgetTotals({ ...atual, ...updated }),
        };
        headers.forEach((h, j) =>
          sheet.getRange(linha, j + 1).setValue(merge[h] || "")
        );
        return "Orçamento atualizado";
      }
    }
    throw new Error("Orçamento com ID não encontrado");
  } catch (err) {
    Logger.log("Erro em updateBudget: " + err.message);
    throw new Error("Erro ao atualizar orçamento");
  }
}

function deleteBudget(id) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(
      SHEET_NAME_ORCAMENTOS
    );
    const data = sheet.getDataRange().getValues();
    const idIndex = data[0].indexOf("ID");

    for (let i = 1; i < data.length; i++) {
      if (data[i][idIndex] == id) {
        sheet.deleteRow(i + 1);
        return "Orçamento removido";
      }
    }
    throw new Error("ID não encontrado para exclusão");
  } catch (err) {
    Logger.log("Erro em deleteBudget: " + err.message);
    throw new Error("Erro ao excluir orçamento");
  }
}

function calculateBudgetTotals(d) {
  const q1 = parseFloat(d["Qtde 1"]) || 0;
  const v1 = parseFloat(d["Preço Unit 1"]) || 0;
  const q2 = parseFloat(d["Qtde 2"]) || 0;
  const v2 = parseFloat(d["Preço Unit 2"]) || 0;
  const taxa = parseFloat(d["Taxa (%)"]) || 0;
  const desconto = parseFloat(d["Desconto (%)"]) || 0;

  const total1 = q1 * v1;
  const total2 = q2 * v2;
  const subtotal = total1 + total2;
  const final =
    subtotal + subtotal * (taxa / 100) - subtotal * (desconto / 100);

  return {
    "Total Item 1": total1.toFixed(2),
    "Total Item 2": total2.toFixed(2),
    "Total Final": final.toFixed(2),
  };
}

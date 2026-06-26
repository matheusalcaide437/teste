// ============================================================
// SISTEMA DE ORÇAMENTO MENSAL — CONTROLE FINANCEIRO PESSOAL
// ============================================================
// Como usar:
//   1. Abra a planilha no Google Sheets
//   2. Vá em Extensões > Apps Script
//   3. Cole este código substituindo o conteúdo existente
//   4. Salve (Ctrl+S) e execute "configurarSistema"
//   5. Autorize as permissões quando solicitado
//
// Para o iPhone Shortcut, após o deploy do Web App:
//   - A URL permanece a mesma após re-deploy
//   - O token permanece o mesmo
// ============================================================

// ============================================================
// CONFIGURAÇÃO DA API (iPhone Shortcut)
// ============================================================
var CONFIG = {
  token: "TROQUE_POR_UM_TOKEN_SECRETO",
  timezone: "America/Sao_Paulo",
  sheetLancamentos: "Lançamentos",
  sheetResumo: "Resumo",
  sheetConfig: "Config",
  // Deve espelhar exatamente os nomes em CONFIG_ORCAMENTO.categorias
  categorias: [
    "Saúde",
    "Alimentação",
    "Casa",
    "Transporte",
    "Antônio",
    "Lazer",
    "Dízimos e Ofertas",
    "Assinaturas",
    "Educação"
  ],
  formasPagamento: ["Pix", "Débito", "Crédito", "Dinheiro"]
};

// ============================================================
// CONFIGURAÇÃO DO ORÇAMENTO MENSAL
// ============================================================
const CONFIG_ORCAMENTO = {
  receita: {
    salario:  { label: "Salário",            valor: 11000 },
    comissao: { label: "Comissão de Vendas", valor: 3500  },
  },
  categorias: [
    {
      nome: "Saúde",
      orcamento: 1600,
      subcategorias: [
        { nome: "Clube / Natação",    valor: 600 },
        { nome: "Academia",           valor: 200 },
        { nome: "Assessoria Triátlo", valor: 500 },
        { nome: "Suplementos",        valor: 300 },
      ]
    },
    {
      nome: "Alimentação",
      orcamento: 3200,
      subcategorias: [
        { nome: "Mercado",                valor: 2000 },
        { nome: "Hortifruti / Reposição", valor: 1200 },
      ]
    },
    {
      nome: "Casa",
      orcamento: 2200,
      subcategorias: [
        { nome: "Condomínio", valor: 1400 },
        { nome: "Luz",        valor: 400  },
        { nome: "Gás",        valor: 100  },
        { nome: "Internet",   valor: 300  },
      ]
    },
    {
      nome: "Transporte",
      orcamento: 200,
      subcategorias: [
        { nome: "Abastecimento / Estacionamento", valor: 200 },
      ]
    },
    {
      nome: "Antônio",
      orcamento: 2200,
      subcategorias: [
        { nome: "Pediatra",                     valor: 350  },
        { nome: "Fisioterapia",                 valor: 350  },
        { nome: "Leite",                        valor: 250  },
        { nome: "Vacinas",                      valor: 1000 },
        { nome: "Reposição (fraldas/remédios)", valor: 200  },
      ]
    },
    {
      nome: "Lazer",
      orcamento: 1500,
      subcategorias: [
        { nome: "Campeonatos",        valor: 800 },
        { nome: "Presentes / Esposa", valor: 700 },
      ]
    },
    {
      nome: "Dízimos e Ofertas",
      orcamento: 2000,
      subcategorias: [
        { nome: "Dízimos e Ofertas", valor: 2000 },
      ]
    },
    {
      nome: "Assinaturas",
      orcamento: 1000,
      subcategorias: [
        { nome: "Claude", valor: 600 },
        { nome: "Google", valor: 200 },
        { nome: "Miro",   valor: 100 },
        { nome: "Canva",  valor: 25  },
        { nome: "Outras", valor: 75  },
      ]
    },
    {
      nome: "Educação",
      orcamento: 1600,
      subcategorias: [
        { nome: "G4 Educação",      valor: 1325 },
        { nome: "Manual dos Donos", valor: 200  },
        { nome: "Outras",           valor: 75   },
      ]
    },
  ]
};

// ============================================================
// WEB APP — API para o iPhone Shortcut
// ============================================================

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);

    if (payload.token !== CONFIG.token) {
      return jsonResponse({ status: "error", message: "Token inválido." });
    }

    var erros = validar(payload);
    if (erros.length > 0) {
      return jsonResponse({ status: "error", message: erros.join(", ") });
    }

    var rowNum = gravarLancamento(payload);
    return jsonResponse({ status: "ok", linha: rowNum });

  } catch (err) {
    return jsonResponse({ status: "error", message: err.message });
  }
}

function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.sheetLancamentos);
  var totalLinhas = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
  return jsonResponse({ status: "ok", totalLancamentos: totalLinhas });
}

// ============================================================
// GRAVAÇÃO
// ============================================================

function gravarLancamento(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CONFIG.sheetLancamentos);

  var agora = new Date();
  var data = Utilities.formatDate(agora, CONFIG.timezone, "dd/MM/yyyy");
  var hora = Utilities.formatDate(agora, CONFIG.timezone, "HH:mm");

  var novaLinha = [
    data,
    hora,
    payload.tipo,
    payload.categoria,
    payload.descricao || "",
    Number(String(payload.valor).replace(",", ".")),
    payload.forma_pagamento
  ];

  sheet.appendRow(novaLinha);
  return sheet.getLastRow();
}

// ============================================================
// VALIDAÇÃO
// ============================================================

function validar(payload) {
  var erros = [];
  if (!payload.tipo || !["Receita", "Despesa"].includes(payload.tipo)) {
    erros.push("'tipo' deve ser 'Receita' ou 'Despesa'");
  }
  if (!payload.categoria || !CONFIG.categorias.includes(payload.categoria)) {
    erros.push("'categoria' inválida. Opções: " + CONFIG.categorias.join(", "));
  }
  var valorNorm = String(payload.valor).replace(",", ".");
  if (!payload.valor || isNaN(Number(valorNorm)) || Number(valorNorm) <= 0) {
    erros.push("'valor' deve ser um número positivo");
  }
  if (!payload.forma_pagamento || !CONFIG.formasPagamento.includes(payload.forma_pagamento)) {
    erros.push("'forma_pagamento' inválida. Opções: " + CONFIG.formasPagamento.join(", "));
  }
  return erros;
}

// ============================================================
// RESPOSTA JSON
// ============================================================

function jsonResponse(obj) {
  var output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// ============================================================
// CONFIGURAÇÃO COMPLETA — executa tudo de uma vez
// ============================================================

function configurarSistema() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupSheet(ss);        // Lançamentos + Config + Resumo
  criarAbaOrcamento(ss); // Aba detalhada de orçamento por categoria
  criarPainelVisual(ss); // Painel lateral na aba Lançamentos (colunas I–M)
  criarMenu();

  SpreadsheetApp.getUi().alert(
    '✅ Sistema configurado!\n\n' +
    '• Aba "Lançamentos" pronta para receber dados do Shortcut\n' +
    '• Aba "Orçamento" com detalhamento por categoria\n' +
    '• Painel visual na aba principal (colunas I–M)\n' +
    '• Menu "💰 Orçamento" disponível na barra superior'
  );
}

// ============================================================
// SETUP DAS ABAS LANÇAMENTOS, CONFIG E RESUMO
// ============================================================

function setupSheet(ss) {
  ss = ss || SpreadsheetApp.getActiveSpreadsheet();

  // Aba Lançamentos
  var lancamentos = ss.getSheetByName(CONFIG.sheetLancamentos) ||
                    ss.insertSheet(CONFIG.sheetLancamentos);
  lancamentos.clearContents();
  var headers = [["Data", "Hora", "Tipo", "Categoria", "Descrição", "Valor (R$)", "Forma de Pagamento"]];
  var headerRange = lancamentos.getRange(1, 1, 1, headers[0].length);
  headerRange.setValues(headers);
  headerRange.setFontWeight("bold").setBackground("#4A90D9").setFontColor("#FFFFFF");
  lancamentos.setFrozenRows(1);

  // Aba Config — batch único
  var config = ss.getSheetByName(CONFIG.sheetConfig) ||
               ss.insertSheet(CONFIG.sheetConfig);
  config.clearContents();
  var maxRows = Math.max(CONFIG.categorias.length, CONFIG.formasPagamento.length);
  var configData = [["Categorias", "Formas de Pagamento"]];
  for (var i = 0; i < maxRows; i++) {
    configData.push([CONFIG.categorias[i] || "", CONFIG.formasPagamento[i] || ""]);
  }
  config.getRange(1, 1, configData.length, 2).setValues(configData);
  config.getRange(1, 1, 1, 2).setFontWeight("bold");

  // Aba Resumo
  var resumo = ss.getSheetByName(CONFIG.sheetResumo) ||
               ss.insertSheet(CONFIG.sheetResumo);
  resumo.clearContents();
  setupResumo(resumo);
}

function setupResumo(sheet) {
  var categorias = CONFIG.categorias;

  var labels = [
    ["📊 RESUMO DO MÊS", ""],
    ["", ""],
    ["Receitas", ""],
    ["Despesas", ""],
    ["Saldo", ""],
    ["", ""],
    ["📂 GASTOS POR CATEGORIA (mês atual)", ""]
  ];
  categorias.forEach(function(cat) { labels.push([cat, ""]); });
  sheet.getRange(1, 1, labels.length, 2).setValues(labels);

  // Fórmulas do resumo em lote
  sheet.getRange(3, 2, 3, 1).setFormulas([
    ['=SUMPRODUCT((MONTH(Lançamentos!A2:A2000)=MONTH(TODAY()))*(YEAR(Lançamentos!A2:A2000)=YEAR(TODAY()))*(Lançamentos!C2:C2000="Receita")*(Lançamentos!F2:F2000))'],
    ['=SUMPRODUCT((MONTH(Lançamentos!A2:A2000)=MONTH(TODAY()))*(YEAR(Lançamentos!A2:A2000)=YEAR(TODAY()))*(Lançamentos!C2:C2000="Despesa")*(Lançamentos!F2:F2000))'],
    ['=B3-B4']
  ]);

  // Fórmulas por categoria em lote
  var catFormulas = categorias.map(function(cat) {
    return ['=SUMPRODUCT((MONTH(Lançamentos!A2:A2000)=MONTH(TODAY()))*(YEAR(Lançamentos!A2:A2000)=YEAR(TODAY()))*(Lançamentos!C2:C2000="Despesa")*(Lançamentos!D2:D2000="' + cat + '")*(Lançamentos!F2:F2000))'];
  });
  sheet.getRange(8, 2, categorias.length, 1).setFormulas(catFormulas);

  sheet.getRange(1, 1).setFontSize(14).setFontWeight("bold");
  sheet.getRange(7, 1).setFontWeight("bold");
  sheet.getRange(3, 2, 3 + categorias.length, 1).setNumberFormat("R$ #,##0.00");
}

// ============================================================
// CRIA A ABA DE ORÇAMENTO DETALHADO
// ============================================================

function criarAbaOrcamento(ss) {
  let aba = ss.getSheetByName("Orçamento");
  if (aba) ss.deleteSheet(aba);
  aba = ss.insertSheet("Orçamento");

  const COR = {
    fundoTitulo:  "#1a1a2e", textoTitulo: "#ffffff",
    fundoSecao:   "#16213e", textoSecao:  "#e0e0e0",
    fundoReceita: "#0f3460", corReceita:  "#4ade80",
    fundoSub:     "#ffffff", cinzaTexto:  "#6c757d",
    corGasto:     "#e94560", corSaldo:    "#4ade80", corSaldoNeg: "#ff6b6b",
    fundoRodape:  "#f1f3f5",
  };

  aba.setColumnWidth(1, 30);
  aba.setColumnWidth(2, 260);
  aba.setColumnWidth(3, 130);
  aba.setColumnWidth(4, 130);
  aba.setColumnWidth(5, 130);
  aba.setColumnWidth(6, 30);

  let linha = 1;

  // Espaço superior
  aba.setRowHeight(linha, 15); linha++;

  // Título
  aba.setRowHeight(linha, 50);
  aba.getRange(linha, 2, 1, 4).merge()
    .setValue("💰 ORÇAMENTO MENSAL")
    .setFontSize(20).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha++;

  // Subtítulo mês
  aba.setRowHeight(linha, 28);
  const mesAtual = Utilities.formatDate(new Date(), "America/Sao_Paulo", "MMMM 'de' yyyy");
  aba.getRange(linha, 2, 1, 4).merge()
    .setValue(mesAtual.charAt(0).toUpperCase() + mesAtual.slice(1))
    .setFontSize(12).setFontStyle("italic")
    .setFontColor("#aaaaaa").setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha++; linha++;

  // Header receita
  aba.setRowHeight(linha, 36);
  aba.getRange(linha, 2, 1, 4).merge()
    .setValue("📈  RECEITA PREVISTA")
    .setFontSize(12).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoReceita)
    .setVerticalAlignment("middle");
  linha++;

  aba.setRowHeight(linha, 28);
  [["", 2], ["Fonte", 3], ["Valor Previsto", 4]].forEach(([v, c]) => {
    aba.getRange(linha, c).setValue(v)
      .setFontSize(10).setFontWeight("bold")
      .setFontColor(COR.textoSecao).setBackground(COR.fundoSecao)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
  });
  linha++;

  // Linhas de receita em batch
  const recLabels = [], recValores = [];
  let totalReceita = 0;
  Object.values(CONFIG_ORCAMENTO.receita).forEach(rec => {
    recLabels.push([rec.label]);
    recValores.push([rec.valor]);
    totalReceita += rec.valor;
  });
  const nRec = recLabels.length;
  for (let r = 0; r < nRec; r++) aba.setRowHeight(linha + r, 28);
  aba.getRange(linha, 2, nRec, 1).setValues(recLabels)
    .setFontSize(10).setBackground(COR.fundoSub).setVerticalAlignment("middle");
  aba.getRange(linha, 3, nRec, 1).setValues(recValores)
    .setNumberFormat("R$ #.##0,00").setFontSize(10).setFontWeight("bold")
    .setFontColor(COR.corReceita).setBackground(COR.fundoSub)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha += nRec;

  // Total receita
  aba.setRowHeight(linha, 32);
  aba.getRange(linha, 2).setValue("TOTAL RECEITA")
    .setFontSize(11).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoReceita).setVerticalAlignment("middle");
  aba.getRange(linha, 3).setValue(totalReceita)
    .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold")
    .setFontColor(COR.corReceita).setBackground(COR.fundoReceita)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  const linhaReceita = linha;
  linha++; linha++;

  // Header despesas
  aba.setRowHeight(linha, 36);
  aba.getRange(linha, 2, 1, 4).merge()
    .setValue("📊  ORÇAMENTO POR CATEGORIA")
    .setFontSize(12).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoTitulo)
    .setVerticalAlignment("middle");
  linha++;

  aba.setRowHeight(linha, 30);
  ["Categoria / Subcategoria", "Orçado (R$)", "Gasto Real (R$)", "Saldo (R$)"].forEach((h, i) => {
    aba.getRange(linha, i + 2).setValue(h)
      .setFontSize(10).setFontWeight("bold")
      .setFontColor(COR.textoTitulo).setBackground(COR.fundoSecao)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
  });
  linha++;

  const linhasPorCategoria = {};
  let totalOrcadoGeral = 0;
  const nomeAbaLanc = CONFIG.sheetLancamentos;

  CONFIG_ORCAMENTO.categorias.forEach(cat => {
    aba.setRowHeight(linha, 34);
    aba.getRange(linha, 2).setValue("▸  " + cat.nome.toUpperCase())
      .setFontSize(11).setFontWeight("bold")
      .setFontColor(COR.textoTitulo).setBackground(COR.fundoSecao).setVerticalAlignment("middle");
    aba.getRange(linha, 3).setValue(cat.orcamento)
      .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold")
      .setFontColor(COR.textoTitulo).setBackground(COR.fundoSecao)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");

    const fGasto = `=IFERROR(SUMPRODUCT(('${nomeAbaLanc}'!C:C="Despesa")*('${nomeAbaLanc}'!D:D="${cat.nome}")*(MONTH('${nomeAbaLanc}'!A:A)=MONTH(TODAY()))*(YEAR('${nomeAbaLanc}'!A:A)=YEAR(TODAY()))*('${nomeAbaLanc}'!F:F)),0)`;
    aba.getRange(linha, 4).setFormula(fGasto)
      .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold")
      .setFontColor(COR.corGasto).setBackground(COR.fundoSecao)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
    aba.getRange(linha, 5).setFormula(`=C${linha}-D${linha}`)
      .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold")
      .setFontColor(COR.corSaldo).setBackground(COR.fundoSecao)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");

    linhasPorCategoria[cat.nome] = linha;
    totalOrcadoGeral += cat.orcamento;
    linha++;

    // Subcategorias em batch
    const subLabels = cat.subcategorias.map(s => ["      • " + s.nome]);
    const subVals   = cat.subcategorias.map(s => [s.valor]);
    const nSub = subLabels.length;
    for (let r = 0; r < nSub; r++) aba.setRowHeight(linha + r, 26);
    aba.getRange(linha, 2, nSub, 1).setValues(subLabels)
      .setFontSize(10).setFontColor(COR.cinzaTexto).setBackground(COR.fundoSub).setVerticalAlignment("middle");
    aba.getRange(linha, 3, nSub, 1).setValues(subVals)
      .setNumberFormat("R$ #.##0,00").setFontSize(10).setFontColor(COR.cinzaTexto)
      .setBackground(COR.fundoSub).setHorizontalAlignment("center").setVerticalAlignment("middle");
    aba.getRange(linha, 4, nSub, 1).setBackground(COR.fundoSub);
    aba.getRange(linha, 5, nSub, 1).setBackground(COR.fundoSub);
    linha += nSub;

    // Separador
    aba.setRowHeight(linha, 6);
    aba.getRange(linha, 2, 1, 4).setBackground("#e9ecef");
    linha++;
  });

  // Totais gerais
  linha++;
  aba.setRowHeight(linha, 40);
  aba.getRange(linha, 2).setValue("TOTAL DESPESAS ORÇADAS")
    .setFontSize(13).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoTitulo).setVerticalAlignment("middle");
  aba.getRange(linha, 3).setValue(totalOrcadoGeral)
    .setNumberFormat("R$ #.##0,00").setFontSize(13).setFontWeight("bold")
    .setFontColor(COR.corGasto).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  const gastosRef = Object.values(linhasPorCategoria).map(l => `D${l}`).join("+");
  aba.getRange(linha, 4).setFormula(`=${gastosRef}`)
    .setNumberFormat("R$ #.##0,00").setFontSize(13).setFontWeight("bold")
    .setFontColor(COR.corGasto).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  aba.getRange(linha, 5).setFormula(`=C${linha}-D${linha}`)
    .setNumberFormat("R$ #.##0,00").setFontSize(13).setFontWeight("bold")
    .setFontColor(COR.corSaldo).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  const linhaTotalDespesas = linha;
  linha++;

  // Saldo livre
  aba.setRowHeight(linha, 8); linha++;
  aba.setRowHeight(linha, 44);
  aba.getRange(linha, 2).setValue("💵  SALDO LIVRE PREVISTO")
    .setFontSize(14).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground("#0d6e4f").setVerticalAlignment("middle");
  aba.getRange(linha, 3).setFormula(`=C${linhaReceita}-C${linhaTotalDespesas}`)
    .setNumberFormat("R$ #.##0,00").setFontSize(14).setFontWeight("bold")
    .setFontColor(COR.corReceita).setBackground("#0d6e4f")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  aba.getRange(linha, 4).setValue("Receita - Total Orçado")
    .setFontSize(10).setFontStyle("italic")
    .setFontColor(COR.textoSecao).setBackground("#0d6e4f")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha++;

  // Rodapé
  aba.setRowHeight(linha, 8); linha++;
  aba.setRowHeight(linha, 28);
  aba.getRange(linha, 2, 1, 4).merge()
    .setValue("⚡ Os valores de 'Gasto Real' atualizam automaticamente conforme os lançamentos.")
    .setFontSize(9).setFontStyle("italic")
    .setFontColor(COR.cinzaTexto).setBackground(COR.fundoRodape)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");

  // Formatação condicional: saldo negativo
  const rangesSaldo = Object.values(linhasPorCategoria)
    .map(l => aba.getRange(l, 5))
    .concat([aba.getRange(linhaTotalDespesas, 5)]);
  aba.setConditionalFormatRules(
    rangesSaldo.map(r =>
      SpreadsheetApp.newConditionalFormatRule()
        .whenNumberLessThan(0)
        .setFontColor(COR.corSaldoNeg).setBackground("#3d0000")
        .setRanges([r]).build()
    )
  );

  console.log("✅ Aba Orçamento criada.");
}

// ============================================================
// CRIA O PAINEL LATERAL NA ABA LANÇAMENTOS (colunas I–M)
// ============================================================

function criarPainelVisual(ss) {
  const abaMain = ss.getSheetByName(CONFIG.sheetLancamentos) || ss.getSheets()[0];
  const nomeAbaOrc = "Orçamento";
  const COL = 9; // coluna I

  const COR = {
    fundoTitulo: "#1a1a2e", textoTitulo: "#ffffff",
    fundoSec:    "#16213e", textoSec:    "#e0e0e0",
    barVerde:    "#4ade80",
    fundo:       "#0f0f23", texto:       "#e0e0e0",
    cinza:       "#6c757d",
  };

  abaMain.setColumnWidth(COL,     20);
  abaMain.setColumnWidth(COL + 1, 180);
  abaMain.setColumnWidth(COL + 2, 100);
  abaMain.setColumnWidth(COL + 3, 100);
  abaMain.setColumnWidth(COL + 4, 100);
  abaMain.setColumnWidth(COL + 5, 20);

  let linha = 1;

  abaMain.setRowHeight(linha, 12); linha++;

  // Título painel
  abaMain.setRowHeight(linha, 44);
  abaMain.getRange(linha, COL + 1, 1, 4).merge()
    .setValue("💰 ORÇAMENTO DO MÊS")
    .setFontSize(14).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha++;

  abaMain.setRowHeight(linha, 24);
  abaMain.getRange(linha, COL + 1, 1, 4).merge()
    .setFormula('=TEXT(TODAY(),"MMMM\' de \'YYYY")')
    .setFontSize(9).setFontStyle("italic")
    .setFontColor(COR.cinza).setBackground(COR.fundoTitulo)
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  linha++; linha++;

  // Cabeçalhos do painel
  abaMain.setRowHeight(linha, 28);
  ["Categoria", "Gasto (R$)", "Limite (R$)", "% Usado"].forEach((h, i) => {
    abaMain.getRange(linha, COL + 1 + i).setValue(h)
      .setFontSize(9).setFontWeight("bold")
      .setFontColor(COR.textoSec).setBackground(COR.fundoSec)
      .setHorizontalAlignment("center").setVerticalAlignment("middle");
  });
  linha++;

  const primeiraLinhaCategoria = linha;

  CONFIG_ORCAMENTO.categorias.forEach(cat => {
    abaMain.setRowHeight(linha, 32);
    abaMain.getRange(linha, COL + 1).setValue(cat.nome)
      .setFontSize(10).setFontWeight("bold")
      .setFontColor(COR.texto).setBackground(COR.fundo).setVerticalAlignment("middle");

    const fGasto = `=IFERROR(INDIRECT("${nomeAbaOrc}!D"&MATCH("▸  ${cat.nome.toUpperCase()}",${nomeAbaOrc}!B:B,0)),0)`;
    abaMain.getRange(linha, COL + 2).setFormula(fGasto)
      .setNumberFormat("R$ #.##0,00").setFontSize(10).setFontColor("#ef4444")
      .setBackground(COR.fundo).setHorizontalAlignment("center").setVerticalAlignment("middle");

    const fOrc = `=IFERROR(INDIRECT("${nomeAbaOrc}!C"&MATCH("▸  ${cat.nome.toUpperCase()}",${nomeAbaOrc}!B:B,0)),0)`;
    abaMain.getRange(linha, COL + 3).setFormula(fOrc)
      .setNumberFormat("R$ #.##0,00").setFontSize(10).setFontColor(COR.cinza)
      .setBackground(COR.fundo).setHorizontalAlignment("center").setVerticalAlignment("middle");

    const colK = columnLetter(COL + 2);
    const colL = columnLetter(COL + 3);
    abaMain.getRange(linha, COL + 4)
      .setFormula(`=IFERROR(${colK}${linha}/${colL}${linha},0)`)
      .setNumberFormat("0%").setFontSize(10).setFontWeight("bold")
      .setBackground(COR.fundo).setHorizontalAlignment("center").setVerticalAlignment("middle");

    linha++;
  });

  // Separador
  abaMain.setRowHeight(linha, 8);
  abaMain.getRange(linha, COL + 1, 1, 4).setBackground("#2d2d2d");
  linha++;

  // Totais do painel
  abaMain.setRowHeight(linha, 36);
  const colK = columnLetter(COL + 2);
  const colL = columnLetter(COL + 3);
  const ultimaLinhaCategoria = linha - 2;

  abaMain.getRange(linha, COL + 1).setValue("TOTAL DESPESAS")
    .setFontSize(11).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground(COR.fundoTitulo).setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 2)
    .setFormula(`=SUM(${colK}${primeiraLinhaCategoria}:${colK}${ultimaLinhaCategoria})`)
    .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold").setFontColor("#ef4444")
    .setBackground(COR.fundoTitulo).setHorizontalAlignment("center").setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 3)
    .setFormula(`=SUM(${colL}${primeiraLinhaCategoria}:${colL}${ultimaLinhaCategoria})`)
    .setNumberFormat("R$ #.##0,00").setFontSize(11).setFontWeight("bold").setFontColor(COR.cinza)
    .setBackground(COR.fundoTitulo).setHorizontalAlignment("center").setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 4)
    .setFormula(`=IFERROR(${colK}${linha}/${colL}${linha},0)`)
    .setNumberFormat("0%").setFontSize(11).setFontWeight("bold")
    .setBackground(COR.fundoTitulo).setHorizontalAlignment("center").setVerticalAlignment("middle");
  const linhaTotais = linha;
  linha++;

  // Saldo livre no painel
  abaMain.setRowHeight(linha, 8); linha++;
  abaMain.setRowHeight(linha, 40);
  const fReceita = `=IFERROR(INDIRECT("${nomeAbaOrc}!C"&MATCH("TOTAL RECEITA",${nomeAbaOrc}!B:B,0)),0)`;
  abaMain.getRange(linha, COL + 1).setValue("💵  SALDO LIVRE")
    .setFontSize(12).setFontWeight("bold")
    .setFontColor(COR.textoTitulo).setBackground("#0d6e4f").setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 2)
    .setFormula(`=${fReceita}-${colK}${linhaTotais}`)
    .setNumberFormat("R$ #.##0,00").setFontSize(12).setFontWeight("bold")
    .setFontColor(COR.barVerde).setBackground("#0d6e4f")
    .setHorizontalAlignment("center").setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 3).setFormula(fReceita)
    .setNumberFormat("R$ #.##0,00").setFontSize(10).setFontColor(COR.cinza)
    .setBackground("#0d6e4f").setHorizontalAlignment("center").setVerticalAlignment("middle");
  abaMain.getRange(linha, COL + 4).setValue("receita →")
    .setFontSize(9).setFontStyle("italic").setFontColor(COR.cinza)
    .setBackground("#0d6e4f").setHorizontalAlignment("center").setVerticalAlignment("middle");

  // Formatação condicional no %
  aplicarFormatacaoCondicionalPainel(abaMain, COL + 4, primeiraLinhaCategoria, linhaTotais);

  console.log("✅ Painel visual criado.");
}

// ============================================================
// FORMATAÇÃO CONDICIONAL DO % NO PAINEL
// ============================================================

function aplicarFormatacaoCondicionalPainel(aba, col, linhaInicio, linhaFim) {
  const range = aba.getRange(linhaInicio, col, linhaFim - linhaInicio + 1, 1);
  aba.setConditionalFormatRules([
    ...aba.getConditionalFormatRules(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberLessThan(0.8).setFontColor("#4ade80").setBackground("#002d14")
      .setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberBetween(0.8, 0.999).setFontColor("#fbbf24").setBackground("#2d2000")
      .setRanges([range]).build(),
    SpreadsheetApp.newConditionalFormatRule()
      .whenNumberGreaterThanOrEqualTo(1.0).setFontColor("#ff0000").setBackground("#3d0000")
      .setRanges([range]).build(),
  ]);
}

// ============================================================
// UTILITÁRIO: número de coluna → letra (ex: 9 → "I")
// ============================================================

function columnLetter(col) {
  let letra = "";
  while (col > 0) {
    const mod = (col - 1) % 26;
    letra = String.fromCharCode(65 + mod) + letra;
    col = Math.floor((col - 1) / 26);
  }
  return letra;
}

// ============================================================
// MENU PERSONALIZADO
// ============================================================

function onOpen() {
  criarMenu();
}

function criarMenu() {
  SpreadsheetApp.getUi()
    .createMenu("💰 Orçamento")
    .addItem("⚙️ Configurar Sistema Completo", "configurarSistema")
    .addSeparator()
    .addItem("🔄 Atualizar Painel Visual", "atualizarPainel")
    .addItem("📊 Ir para Aba Orçamento", "irParaOrcamento")
    .addSeparator()
    .addItem("📅 Resumo do Mês Atual", "resumoMesAtual")
    .addToUi();
}

// ============================================================
// FUNÇÕES DO MENU
// ============================================================

function atualizarPainel() {
  const abaOrc = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Orçamento");
  if (!abaOrc) {
    SpreadsheetApp.getUi().alert("❌ Aba 'Orçamento' não encontrada.\nExecute: 💰 Orçamento > Configurar Sistema Completo");
    return;
  }
  SpreadsheetApp.flush();
  SpreadsheetApp.getUi().alert("✅ Painel atualizado!\nDados refletem todos os lançamentos do mês atual.");
}

function irParaOrcamento() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const aba = ss.getSheetByName("Orçamento");
  if (aba) ss.setActiveSheet(aba);
  else SpreadsheetApp.getUi().alert("❌ Aba 'Orçamento' não encontrada. Execute a configuração primeiro.");
}

function resumoMesAtual() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const abaMain = ss.getSheetByName(CONFIG.sheetLancamentos) || ss.getSheets()[0];

  if (!ss.getSheetByName("Orçamento")) {
    SpreadsheetApp.getUi().alert("Configure o sistema primeiro.");
    return;
  }

  const hoje = new Date();
  const mes  = hoje.getMonth() + 1;
  const ano  = hoje.getFullYear();
  const dados = abaMain.getDataRange().getValues();

  let totalGasto = 0, totalOrcado = 0;
  const linhas = [`📅 Resumo — ${Utilities.formatDate(hoje, "America/Sao_Paulo", "MMMM/yyyy").toUpperCase()}\n`];

  CONFIG_ORCAMENTO.categorias.forEach(cat => {
    let gasto = 0;
    dados.forEach(row => {
      if (row[2] === "Despesa" && row[3] === cat.nome) {
        const d = new Date(row[0]);
        if (d.getMonth() + 1 === mes && d.getFullYear() === ano) {
          gasto += parseFloat(String(row[5]).replace(",", ".")) || 0;
        }
      }
    });
    const pct   = cat.orcamento > 0 ? (gasto / cat.orcamento * 100).toFixed(0) : 0;
    const emoji = pct >= 100 ? "🔴" : pct >= 80 ? "🟡" : "🟢";
    linhas.push(`${emoji} ${cat.nome}: R$ ${gasto.toFixed(2).replace(".", ",")} / R$ ${cat.orcamento.toFixed(2).replace(".", ",")} (${pct}%)`);
    totalGasto  += gasto;
    totalOrcado += cat.orcamento;
  });

  const pctTotal = totalOrcado > 0 ? (totalGasto / totalOrcado * 100).toFixed(0) : 0;
  linhas.push(`\n💵 Total: R$ ${totalGasto.toFixed(2).replace(".", ",")} / R$ ${totalOrcado.toFixed(2).replace(".", ",")}`);
  linhas.push(`📊 Orçamento usado: ${pctTotal}%`);

  SpreadsheetApp.getUi().alert(linhas.join("\n"));
}

// ============================================================
// TRIGGER DIÁRIO (opcional) — execute UMA VEZ para ativar
// ============================================================

function instalarTriggerDiario() {
  ScriptApp.getProjectTriggers().forEach(t => {
    if (t.getHandlerFunction() === "atualizarPainel") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("atualizarPainel")
    .timeBased().atHour(7).everyDays(1)
    .inTimezone("America/Sao_Paulo").create();
  SpreadsheetApp.getUi().alert("✅ Trigger diário instalado! Painel atualizado todos os dias às 7h.");
}

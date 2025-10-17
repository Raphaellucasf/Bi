import { supabase } from './supabaseClient';

// Para usar Excel.js no frontend, você precisa instalar: npm install exceljs
// import ExcelJS from 'exceljs';

export const generateFaturamentoReport = async (config) => {
  try {
    const { dataInicio, dataFim, incluirResumo, incluirReceitas, incluirGastos, incluirParcelas } = config;
    
    // Buscar escritório do usuário logado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');
    
    const { data: perfis } = await supabase
      .from('perfis')
      .select('escritorio_id')
      .eq('user_id', user.id)
      .limit(1);
    
    const escritorioId = perfis && perfis[0]?.escritorio_id;
    if (!escritorioId) throw new Error('Escritório não encontrado');
    
    console.log('📊 Gerando relatório para escritório:', escritorioId);
    console.log('📅 Período:', dataInicio, 'até', dataFim);
    
    // Buscar dados do período especificado
    const [receitas, gastos, parcelas, faturamentos] = await Promise.all([
      incluirReceitas ? fetchReceitas(dataInicio, dataFim, escritorioId) : [],
      incluirGastos ? fetchGastos(dataInicio, dataFim, escritorioId) : [],
      incluirParcelas ? fetchParcelas(dataInicio, dataFim, escritorioId) : [],
      incluirResumo ? fetchFaturamentos(dataInicio, dataFim, escritorioId) : []
    ]);
    
    console.log('📥 Dados obtidos:', {
      receitas: receitas.length,
      gastos: gastos.length,
      parcelas: parcelas.length,
      faturamentos: faturamentos.length
    });

    // Para uma implementação completa, você precisaria do ExcelJS
    // Aqui está um exemplo de como seria a estrutura:
    
    /*
    const workbook = new ExcelJS.Workbook();
    
    if (incluirResumo) {
      await createResumoSheet(workbook, receitas, gastos, parcelas, faturamentos, dataInicio, dataFim);
    }
    
    if (incluirReceitas) {
      await createReceitasSheet(workbook, receitas);
    }
    
    if (incluirGastos) {
      await createGastosSheet(workbook, gastos);
    }
    
    if (incluirParcelas) {
      await createParcelasSheet(workbook, parcelas);
    }
    
    // Gerar o arquivo
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Download do arquivo
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-faturamento-${dataInicio}-${dataFim}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    */

    // Por enquanto, vamos gerar um CSV simples como demonstração
    await generateCSVReport(receitas, gastos, parcelas, dataInicio, dataFim);
    
    return { success: true };
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    throw error;
  }
};

// Função para buscar receitas
const fetchReceitas = async (dataInicio, dataFim, escritorioId) => {
  console.log('🔍 Buscando receitas...');
  const { data, error } = await supabase
    .from('receitas')
    .select('*')
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar receitas:', error);
    throw error;
  }
  console.log('✅ Receitas encontradas:', data?.length || 0);
  return data || [];
};

// Função para buscar gastos
const fetchGastos = async (dataInicio, dataFim, escritorioId) => {
  console.log('🔍 Buscando gastos...');
  const { data, error } = await supabase
    .from('gastos')
    .select('*')
    .eq('escritorio_id', escritorioId)
    .gte('data', dataInicio)
    .lte('data', dataFim)
    .order('data', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar gastos:', error);
    throw error;
  }
  console.log('✅ Gastos encontrados:', data?.length || 0);
  return data || [];
};

// Função para buscar parcelas
const fetchParcelas = async (dataInicio, dataFim, escritorioId) => {
  console.log('🔍 Buscando parcelas...');
  const { data, error } = await supabase
    .from('parcelas')
    .select('*')
    .gte('data_vencimento', dataInicio)
    .lte('data_vencimento', dataFim)
    .order('data_vencimento', { ascending: true });
  
  if (error) {
    console.error('❌ Erro ao buscar parcelas:', error);
    throw error;
  }
  console.log('✅ Parcelas encontradas:', data?.length || 0);
  return data || [];
};

// Função para buscar faturamentos
const fetchFaturamentos = async (dataInicio, dataFim, escritorioId) => {
  console.log('🔍 Buscando faturamentos...');
  const { data, error } = await supabase
    .from('faturamentos')
    .select('*')
    .gte('data_acordo', dataInicio)
    .lte('data_acordo', dataFim)
    .order('data_acordo', { ascending: false });
  
  if (error) {
    console.error('❌ Erro ao buscar faturamentos:', error);
    throw error;
  }
  console.log('✅ Faturamentos encontrados:', data?.length || 0);
  return data || [];
};

// Gerar CSV como alternativa (para demonstração)
const generateCSVReport = async (receitas, gastos, parcelas, dataInicio, dataFim) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Resumo
  csvContent += "RELATÓRIO DE FATURAMENTO\n";
  csvContent += `Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}\n\n`;
  
  // Resumo executivo
  const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalGastos = gastos.reduce((sum, g) => sum + (g.valor || 0), 0);
  const saldoLiquido = totalReceitas - totalGastos;
  
  csvContent += "RESUMO EXECUTIVO\n";
  csvContent += "Descrição,Valor\n";
  csvContent += `Total de Receitas,${totalReceitas.toFixed(2)}\n`;
  csvContent += `Total de Gastos,${totalGastos.toFixed(2)}\n`;
  csvContent += `Saldo Líquido,${saldoLiquido.toFixed(2)}\n\n`;
  
  // Receitas
  if (receitas.length > 0) {
    csvContent += "RECEITAS\n";
    csvContent += "Data,Descrição,Valor\n";
    receitas.forEach(receita => {
      csvContent += `${new Date(receita.data).toLocaleDateString('pt-BR')},${receita.descricao || ''},${receita.valor || 0}\n`;
    });
    csvContent += "\n";
  }
  
  // Gastos
  if (gastos.length > 0) {
    csvContent += "GASTOS\n";
    csvContent += "Data,Descrição,Valor,Categoria\n";
    gastos.forEach(gasto => {
      csvContent += `${new Date(gasto.data).toLocaleDateString('pt-BR')},${gasto.descricao || ''},${gasto.valor || 0},${gasto.categoria || ''}\n`;
    });
    csvContent += "\n";
  }
  
  // Parcelas
  if (parcelas.length > 0) {
    csvContent += "PARCELAS\n";
    csvContent += "Vencimento,Descrição,Valor,Status,Data Pagamento\n";
    parcelas.forEach(parcela => {
      csvContent += `${new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')},${parcela.descricao || ''},${parcela.valor || 0},${parcela.status || ''},${parcela.data_pagamento ? new Date(parcela.data_pagamento).toLocaleDateString('pt-BR') : ''}\n`;
    });
  }
  
  // Download do arquivo CSV
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `relatorio-faturamento-${dataInicio}-${dataFim}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/*
// Exemplo de implementação com ExcelJS (requer instalação do pacote)
const createResumoSheet = async (workbook, receitas, gastos, parcelas, faturamentos, dataInicio, dataFim) => {
  const worksheet = workbook.addWorksheet('Resumo');
  
  // Cabeçalho
  worksheet.addRow(['RELATÓRIO DE FATURAMENTO']);
  worksheet.addRow([`Período: ${new Date(dataInicio).toLocaleDateString('pt-BR')} a ${new Date(dataFim).toLocaleDateString('pt-BR')}`]);
  worksheet.addRow([]);
  
  // Métricas principais
  const totalReceitas = receitas.reduce((sum, r) => sum + (r.valor || 0), 0);
  const totalGastos = gastos.reduce((sum, g) => sum + (g.valor || 0), 0);
  const totalNovoContratos = faturamentos.reduce((sum, f) => sum + (f.valor_total || 0), 0);
  const parcelasPendentes = parcelas.filter(p => p.status === 'Pendente').reduce((sum, p) => sum + (p.valor || 0), 0);
  
  worksheet.addRow(['RESUMO EXECUTIVO']);
  worksheet.addRow(['Descrição', 'Valor']);
  worksheet.addRow(['Total de Receitas', totalReceitas]);
  worksheet.addRow(['Total de Gastos', totalGastos]);
  worksheet.addRow(['Saldo Líquido', totalReceitas - totalGastos]);
  worksheet.addRow(['Novos Contratos', totalNovoContratos]);
  worksheet.addRow(['Parcelas Pendentes', parcelasPendentes]);
  
  // Formatação
  worksheet.getCell('A1').font = { bold: true, size: 16 };
  worksheet.getCell('A5').font = { bold: true, size: 14 };
  worksheet.getRow(6).font = { bold: true };
  
  // Auto-ajustar colunas
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
};

const createReceitasSheet = async (workbook, receitas) => {
  const worksheet = workbook.addWorksheet('Receitas');
  
  // Cabeçalhos
  worksheet.addRow(['Data', 'Descrição', 'Valor', 'Categoria', 'Tipo']);
  
  // Dados
  receitas.forEach(receita => {
    worksheet.addRow([
      new Date(receita.data_receita).toLocaleDateString('pt-BR'),
      receita.descricao || '',
      receita.valor || 0,
      receita.categoria || '',
      receita.tipo || ''
    ]);
  });
  
  // Formatação
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
};

const createGastosSheet = async (workbook, gastos) => {
  const worksheet = workbook.addWorksheet('Gastos');
  
  // Cabeçalhos
  worksheet.addRow(['Data', 'Descrição', 'Valor', 'Categoria']);
  
  // Dados
  gastos.forEach(gasto => {
    worksheet.addRow([
      new Date(gasto.data_gasto).toLocaleDateString('pt-BR'),
      gasto.descricao || '',
      gasto.valor || 0,
      gasto.categoria || ''
    ]);
  });
  
  // Formatação
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
};

const createParcelasSheet = async (workbook, parcelas) => {
  const worksheet = workbook.addWorksheet('Parcelas');
  
  // Cabeçalhos
  worksheet.addRow(['Data Vencimento', 'Descrição', 'Valor', 'Status', 'Data Pagamento']);
  
  // Dados
  parcelas.forEach(parcela => {
    worksheet.addRow([
      new Date(parcela.data_vencimento).toLocaleDateString('pt-BR'),
      parcela.descricao || '',
      parcela.valor || 0,
      parcela.status || '',
      parcela.data_pagamento ? new Date(parcela.data_pagamento).toLocaleDateString('pt-BR') : ''
    ]);
  });
  
  // Formatação
  worksheet.getRow(1).font = { bold: true };
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
};
*/
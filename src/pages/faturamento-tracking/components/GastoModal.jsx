import React, { useState } from 'react';
import { supabase } from '../../../services/supabaseClient';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import MaskedCurrencyInput from '../../../components/ui/MaskedCurrencyInput';
import MaskedDateInput from '../../../components/ui/MaskedDateInput';

const GastoModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    valor: '',
    data_gasto: '',
    categoria: '',
    descricao: ''
  });

  const categorias = [
    { value: 'Aluguel', label: 'Aluguel' },
    { value: 'Energia', label: 'Energia Elétrica' },
    { value: 'Internet', label: 'Internet' },
    { value: 'Telefone', label: 'Telefone' },
    { value: 'Material de Escritório', label: 'Material de Escritório' },
    { value: 'Honorários', label: 'Honorários' },
    { value: 'Custas Processuais', label: 'Custas Processuais' },
    { value: 'Software', label: 'Software/Sistema' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Transporte', label: 'Transporte' },
    { value: 'Alimentação', label: 'Alimentação' },
    { value: 'Outros', label: 'Outros' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.valor || !formData.data_gasto || !formData.categoria) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error('Usuário não autenticado');

      const { data: patronoData } = await supabase
        .from('patronos')
        .select('escritorio_id')
        .eq('id', userData.user.id)
        .single();

      if (!patronoData?.escritorio_id) {
        throw new Error('Escritório não identificado');
      }

      // Converter valor de string para número
      const valorNumerico = parseFloat(formData.valor.replace(/[^\d,]/g, '').replace(',', '.'));

      const { error } = await supabase.from('gastos').insert({
        escritorio_id: patronoData.escritorio_id,
        valor: valorNumerico,
        data_gasto: formData.data_gasto,
        categoria: formData.categoria,
        descricao: formData.descricao || null,
        criado_por: userData.user.id
      });

      if (error) throw error;

      alert('✅ Despesa registrada com sucesso!');
      
      // Reset form
      setFormData({
        valor: '',
        data_gasto: '',
        categoria: '',
        descricao: ''
      });

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao registrar despesa:', error);
      alert('❌ Erro ao registrar despesa: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Icon name="TrendingDown" size={24} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Registrar Nova Despesa</h2>
              <p className="text-sm text-muted-foreground">Adicione uma despesa do escritório</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Valor */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Valor da Despesa <span className="text-red-500">*</span>
              </label>
              <MaskedCurrencyInput
                value={formData.valor}
                onChange={(value) => setFormData({ ...formData, valor: value })}
                placeholder="R$ 0,00"
                className="w-full"
              />
            </div>

            {/* Data do Gasto */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Data da Despesa <span className="text-red-500">*</span>
              </label>
              <MaskedDateInput
                value={formData.data_gasto}
                onChange={(value) => setFormData({ ...formData, data_gasto: value })}
                placeholder="DD/MM/AAAA"
                className="w-full"
              />
            </div>
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Categoria <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              options={categorias}
              placeholder="Selecione uma categoria"
              className="w-full"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes sobre a despesa..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <Icon name="Info" size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">💡 Dica:</p>
              <p>Esta despesa será registrada no fluxo de caixa e afetará os relatórios financeiros do escritório.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700"
              disabled={isLoading}
            >
              <Icon name="X" size={18} className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              <Icon name={isLoading ? "Loader" : "Save"} size={18} className="mr-2" />
              {isLoading ? 'Salvando...' : 'Registrar Despesa'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GastoModal;

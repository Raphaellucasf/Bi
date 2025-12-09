import React, { useState, useEffect } from 'react';
import { X, Mail, MessageCircle } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';

const NotificationModal = ({ isOpen, onClose, audiencia, processo }) => {
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCliente = async () => {
      if (!processo?.clientes?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .eq('id', processo.clientes.id)
          .single();

        if (error) throw error;
        setCliente(data);
      } catch (error) {
        console.error('Erro ao buscar dados do cliente:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && processo) {
      fetchCliente();
    }
  }, [isOpen, processo]);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEmail = () => {
    if (!cliente?.email) {
      alert('Cliente não possui email cadastrado!');
      return;
    }

    const assunto = `Audiência Agendada - ${audiencia.titulo}`;
    const corpo = `Prezado(a) ${cliente.nome_completo},

Informamos que foi agendada uma audiência para o processo ${processo.numero_processo}.

📋 Detalhes da Audiência:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Título: ${audiencia.titulo}
Data e Hora: ${formatDate(audiencia.data_andamento)}
Processo: ${processo.numero_processo}
${audiencia.descricao ? `Observações: ${audiencia.descricao}` : ''}

Por favor, confirme sua presença e entre em contato caso tenha alguma dúvida.

Atenciosamente,
Equipe Meritus`;

    const mailtoLink = `mailto:${cliente.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
    window.open(mailtoLink, '_blank');
    // Não fechar o modal - usuário pode querer enviar por WhatsApp também
  };

  const handleWhatsApp = () => {
    if (!cliente?.telefone) {
      alert('Cliente não possui telefone cadastrado!');
      return;
    }

    // Remove caracteres não numéricos do telefone
    const telefone = cliente.telefone.replace(/\D/g, '');
    
    const mensagem = `Olá, ${cliente.nome_completo}! 👋

Informamos que foi agendada uma *audiência* para o seu processo.

📋 *Detalhes da Audiência:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*Título:* ${audiencia.titulo}
*Data e Hora:* ${formatDate(audiencia.data_andamento)}
*Processo:* ${processo.numero_processo}
${audiencia.descricao ? `*Observações:* ${audiencia.descricao}` : ''}

Por favor, confirme sua presença e entre em contato caso tenha alguma dúvida.

_Mensagem enviada via Meritus - Sistema Jurídico_`;

    const whatsappLink = `https://api.whatsapp.com/send?phone=55${telefone}&text=${encodeURIComponent(mensagem)}`;
    window.open(whatsappLink, '_blank');
    // Não fechar o modal - usuário pode querer enviar por Email também
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Notificar Cliente
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Carregando dados do cliente...</p>
            </div>
          ) : !cliente ? (
            <div className="text-center py-4">
              <p className="text-gray-600">Cliente não encontrado.</p>
            </div>
          ) : (
            <>
              <p className="text-gray-700 mb-4">
                Deseja notificar <strong>{cliente.nome_completo}</strong> sobre a audiência agendada?
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Dados do Cliente:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Nome:</strong> {cliente.nome_completo}</p>
                  {cliente.email && <p><strong>Email:</strong> {cliente.email}</p>}
                  {cliente.telefone && <p><strong>Telefone:</strong> {cliente.telefone}</p>}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Detalhes da Audiência:</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><strong>Título:</strong> {audiencia.titulo}</p>
                  <p><strong>Data:</strong> {formatDate(audiencia.data_andamento)}</p>
                  <p><strong>Processo:</strong> {processo.numero_processo}</p>
                  {audiencia.descricao && <p><strong>Observações:</strong> {audiencia.descricao}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleEmail}
                  disabled={!cliente.email}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    cliente.email
                      ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Mail className="w-5 h-5" />
                  Enviar por Email
                  {!cliente.email && <span className="text-xs">(Email não cadastrado)</span>}
                </button>

                <button
                  onClick={handleWhatsApp}
                  disabled={!cliente.telefone}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all ${
                    cliente.telefone
                      ? 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar por WhatsApp
                  {!cliente.telefone && <span className="text-xs">(Telefone não cadastrado)</span>}
                </button>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg font-medium text-white bg-gray-500 hover:bg-gray-600 transition-colors"
                  >
                    Não Notificar
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4 py-3 rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                  >
                    Pronto
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;

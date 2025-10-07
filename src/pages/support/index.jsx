import React from "react";

const faqs = [
  {
    question: "Como cadastrar um novo cliente?",
    answer: "Acesse a aba de clientes e clique em 'Novo Cliente'. Preencha os dados e salve."
  },
  {
    question: "Como criar um novo processo?",
    answer: "Vá para a aba de processos e clique em 'Novo Processo'. Complete o formulário e salve."
  },
  {
    question: "Como alterar meus dados?",
    answer: "Clique no seu perfil no topo direito e selecione 'Editar Perfil'."
  }
];

const Support = () => {
  return (
    <div className="max-w-xl mx-auto p-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">Ajuda & Suporte</h2>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Instruções de Uso</h3>
        <ul className="list-disc pl-6 text-gray-700">
          <li>Utilize o menu lateral para navegar entre as funcionalidades.</li>
          <li>Preencha os formulários com atenção aos campos obrigatórios.</li>
          <li>Em caso de dúvidas, consulte as perguntas frequentes abaixo.</li>
        </ul>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Perguntas Frequentes</h3>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border rounded p-3 bg-gray-50">
              <strong>{faq.question}</strong>
              <div className="mt-1 text-sm text-gray-700">{faq.answer}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">Contato</h3>
        <p className="mb-1">E-mail: <a href="mailto:suporte@legalflow.com" className="text-blue-600">suporte@legalflow.com</a></p>
        <p>WhatsApp: <a href="https://wa.me/5511999999999" className="text-blue-600">(11) 99999-9999</a></p>
      </div>
    </div>
  );
};

export default Support;

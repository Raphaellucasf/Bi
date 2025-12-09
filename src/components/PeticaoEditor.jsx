import React, { useState, useRef, useEffect } from 'react';
import { Download, Save, Bold, Italic, AlignLeft, AlignCenter, AlignRight, List } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

/**
 * Editor de Petições tipo Word - Rich Text Editor
 * Permite editar petições geradas pela Julia AI
 * Exporta para .docx
 */
const PeticaoEditor = ({ initialContent = '', onSave, onClose }) => {
  const [content, setContent] = useState(initialContent);
  const editorRef = useRef(null);

  useEffect(() => {
    if (initialContent && editorRef.current) {
      // Converter Markdown para HTML básico
      const htmlContent = markdownToHTML(initialContent);
      editorRef.current.innerHTML = htmlContent;
    }
  }, [initialContent]);

  // Converter Markdown básico para HTML
  const markdownToHTML = (markdown) => {
    return markdown
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      .replace(/\n\n/g, '<p></p>')
      .replace(/\n/g, '<br>');
  };

  // Converter HTML para Markdown (para salvar)
  const htmlToMarkdown = (html) => {
    return html
      .replace(/<h1>(.*?)<\/h1>/g, '# $1\n\n')
      .replace(/<h2>(.*?)<\/h2>/g, '## $1\n\n')
      .replace(/<h3>(.*?)<\/h3>/g, '### $1\n\n')
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<li>(.*?)<\/li>/g, '- $1\n')
      .replace(/<ul>(.*?)<\/ul>/g, '$1\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<p><\/p>/g, '\n\n')
      .replace(/<[^>]+>/g, ''); // Remove outras tags HTML
  };

  // Aplicar formatação
  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };

  // Salvar petição
  const handleSave = () => {
    const htmlContent = editorRef.current.innerHTML;
    const markdownContent = htmlToMarkdown(htmlContent);
    
    if (onSave) {
      onSave(markdownContent, htmlContent);
    }
  };

  // Converter HTML para estrutura docx
  const convertHTMLToDocxParagraphs = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const paragraphs = [];
    
    const processNode = (node) => {
      if (!node) return null;

      // Headings (H1, H2, H3)
      if (node.nodeName === 'H1') {
        return new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 120 },
        });
      }
      
      if (node.nodeName === 'H2') {
        return new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_2,
          alignment: AlignmentType.LEFT,
          spacing: { before: 200, after: 100 },
        });
      }
      
      if (node.nodeName === 'H3') {
        return new Paragraph({
          text: node.textContent,
          heading: HeadingLevel.HEADING_3,
          alignment: AlignmentType.LEFT,
          spacing: { before: 160, after: 80 },
        });
      }

      // Parágrafos normais
      if (node.nodeName === 'P' || node.nodeName === 'DIV') {
        const textRuns = [];
        
        // Processar filhos para detectar bold/italic
        const processChildNodes = (childNode) => {
          if (childNode.nodeType === Node.TEXT_NODE) {
            if (childNode.textContent.trim()) {
              textRuns.push(new TextRun(childNode.textContent));
            }
          } else if (childNode.nodeName === 'STRONG' || childNode.nodeName === 'B') {
            textRuns.push(new TextRun({ text: childNode.textContent, bold: true }));
          } else if (childNode.nodeName === 'EM' || childNode.nodeName === 'I') {
            textRuns.push(new TextRun({ text: childNode.textContent, italics: true }));
          } else if (childNode.nodeName === 'BR') {
            textRuns.push(new TextRun({ text: '', break: 1 }));
          } else if (childNode.childNodes.length > 0) {
            childNode.childNodes.forEach(processChildNodes);
          } else {
            textRuns.push(new TextRun(childNode.textContent));
          }
        };

        node.childNodes.forEach(processChildNodes);

        // Detectar alinhamento
        let alignment = AlignmentType.JUSTIFIED;
        const style = window.getComputedStyle(node);
        if (style.textAlign === 'center') alignment = AlignmentType.CENTER;
        else if (style.textAlign === 'right') alignment = AlignmentType.RIGHT;
        else if (style.textAlign === 'left') alignment = AlignmentType.LEFT;

        return new Paragraph({
          children: textRuns.length > 0 ? textRuns : [new TextRun('')],
          alignment,
          spacing: { before: 120, after: 120 },
        });
      }

      // Listas
      if (node.nodeName === 'UL' || node.nodeName === 'OL') {
        const listItems = [];
        node.querySelectorAll('li').forEach((li) => {
          listItems.push(
            new Paragraph({
              text: li.textContent,
              bullet: { level: 0 },
              spacing: { before: 60, after: 60 },
            })
          );
        });
        return listItems;
      }

      // Linha em branco
      if (node.nodeName === 'BR') {
        return new Paragraph({ text: '' });
      }

      return null;
    };

    // Processar todos os nós
    tempDiv.childNodes.forEach((node) => {
      const result = processNode(node);
      if (result) {
        if (Array.isArray(result)) {
          paragraphs.push(...result);
        } else {
          paragraphs.push(result);
        }
      }
    });

    return paragraphs;
  };

  // Exportar para .docx (implementação completa)
  const handleExportDocx = async () => {
    try {
      const htmlContent = editorRef.current.innerHTML;
      
      // Converter HTML para estrutura docx
      const sections = convertHTMLToDocxParagraphs(htmlContent);
      
      // Criar documento
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch = 1440 twips
                right: 1440,
                bottom: 1440,
                left: 1440,
              },
            },
          },
          children: sections.length > 0 ? sections : [
            new Paragraph({ text: 'Documento vazio' })
          ],
        }],
      });

      // Gerar blob e fazer download
      const blob = await Packer.toBlob(doc);
      const fileName = `peticao_${new Date().toISOString().split('T')[0]}_${Date.now()}.docx`;
      saveAs(blob, fileName);
      
      alert('✅ Petição exportada com sucesso para .docx!\n\nArquivo: ' + fileName);
    } catch (error) {
      console.error('Erro ao exportar:', error);
      alert('❌ Erro ao exportar documento: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">📝 Editor de Petições</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-2 p-3 border-b bg-gray-50">
          <button
            onClick={() => applyFormat('bold')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Negrito"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => applyFormat('italic')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Itálico"
          >
            <Italic size={18} />
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-2" />
          
          <button
            onClick={() => applyFormat('justifyLeft')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Alinhar à esquerda"
          >
            <AlignLeft size={18} />
          </button>
          <button
            onClick={() => applyFormat('justifyCenter')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Centralizar"
          >
            <AlignCenter size={18} />
          </button>
          <button
            onClick={() => applyFormat('justifyRight')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Alinhar à direita"
          >
            <AlignRight size={18} />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-2" />

          <button
            onClick={() => applyFormat('insertUnorderedList')}
            className="p-2 hover:bg-gray-200 rounded"
            title="Lista"
          >
            <List size={18} />
          </button>

          <div className="flex-1" />

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <Save size={18} />
            Salvar
          </button>

          <button
            onClick={handleExportDocx}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <Download size={18} />
            Exportar .docx
          </button>
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div
            ref={editorRef}
            contentEditable
            className="min-h-full p-8 bg-white border border-gray-300 rounded shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              fontFamily: 'Times New Roman, serif',
              fontSize: '12pt',
              lineHeight: '1.5',
              color: '#000',
              minHeight: '29.7cm', // A4 height
              maxWidth: '21cm', // A4 width
              margin: '0 auto',
            }}
            suppressContentEditableWarning
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
          💡 <strong>Dica:</strong> Edite o texto livremente. Use a barra de ferramentas para formatação.
          Clique em "Exportar .docx" quando finalizar.
        </div>
      </div>
    </div>
  );
};

export default PeticaoEditor;

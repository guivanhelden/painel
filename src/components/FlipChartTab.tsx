import React, { useState, useRef, useEffect } from 'react';
import { Edit, ChevronLeft, ChevronRight, Save, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Plus, Palette, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

interface PageContent {
  text: string;
  style: {
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    fontSize: string;
    textAlign: 'left' | 'center' | 'right';
    color: string;
  };
}

interface FlipChartTabProps {
  onEditingChange?: (isEditing: boolean) => void;
}

// Paleta de cores disponíveis
const colorOptions = [
  { name: 'Preto', value: '#000000' },
  { name: 'Vermelho', value: '#e53e3e' },
  { name: 'Azul', value: '#3182ce' },
  { name: 'Verde', value: '#38a169' },
  { name: 'Amarelo', value: '#d69e2e' },
  { name: 'Roxo', value: '#805ad5' },
  { name: 'Rosa', value: '#d53f8c' },
  { name: 'Laranja', value: '#dd6b20' }
];

// Lista de emojis disponíveis
const emojiOptions = [
  '😀', '😁', '😂', '🤣', '😃', '😄', '😅', '😆', 
  '😉', '😊', '😋', '😎', '😍', '😘', '🥰', '😗',
  '👍', '👎', '👌', '✌️', '🤞', '👏', '🙏', '🤝',
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💯'
];

export const FlipChartTab = ({ onEditingChange }: FlipChartTabProps) => {
  const defaultStyle = {
    fontWeight: 'normal' as const,
    fontStyle: 'normal' as const,
    fontSize: '24px',
    textAlign: 'left' as const,
    color: '#000000'
  };

  const [pages, setPages] = useState<PageContent[]>([{ text: '', style: { ...defaultStyle } }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Notificar o App quando o modo de edição mudar
  useEffect(() => {
    if (onEditingChange) {
      onEditingChange(isEditing);
    }
  }, [isEditing, onEditingChange]);

  // Carregar páginas do banco de dados quando o componente montar
  React.useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const { data, error } = await supabase
        .from('flip_chart_pages')
        .select('*')
        .order('page_number', { ascending: true });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const formattedPages = data.map(item => {
          try {
            // Tentar converter o conteúdo de JSON para objeto
            const parsedContent = JSON.parse(item.content);
            return {
              text: parsedContent.text || '',
              style: {
                fontWeight: parsedContent.style?.fontWeight || defaultStyle.fontWeight,
                fontStyle: parsedContent.style?.fontStyle || defaultStyle.fontStyle,
                fontSize: parsedContent.style?.fontSize || defaultStyle.fontSize,
                textAlign: parsedContent.style?.textAlign || defaultStyle.textAlign,
                color: parsedContent.style?.color || defaultStyle.color,
              }
            };
          } catch (e) {
            // Se falhar, usar o conteúdo como texto plano
            return { 
              text: item.content || '', 
              style: { ...defaultStyle }
            };
          }
        });
        setPages(formattedPages);
      } else {
        setPages([{ text: '', style: { ...defaultStyle } }]);
      }
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
    }
  };

  const savePage = async () => {
    try {
      // Limpar tabela e reinserir todas as páginas
      await supabase.from('flip_chart_pages').delete().neq('id', 0);
      
      for (let i = 0; i < pages.length; i++) {
        await supabase.from('flip_chart_pages').insert({
          page_number: i,
          content: JSON.stringify(pages[i])
        });
      }
      
      setIsEditing(false);
      setShowColorPicker(false);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Erro ao salvar página:', error);
    }
  };

  const handlePageChange = (direction: 'next' | 'prev') => {
    if (direction === 'next' && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (direction === 'prev' && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
    // Fechar os seletores ao mudar de página
    setShowColorPicker(false);
    setShowEmojiPicker(false);
  };

  const handleContentChange = (text: string) => {
    const newPages = [...pages];
    newPages[currentPage] = {
      ...newPages[currentPage],
      text
    };
    setPages(newPages);
  };

  const handleStyleChange = (styleProperty: keyof PageContent['style'], value: any) => {
    const newPages = [...pages];
    newPages[currentPage] = {
      ...newPages[currentPage],
      style: {
        ...newPages[currentPage].style,
        [styleProperty]: value
      }
    };
    setPages(newPages);
  };

  const handleColorChange = (color: string) => {
    handleStyleChange('color', color);
    setShowColorPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const text = pages[currentPage].text;
      const newText = text.substring(0, start) + emoji + text.substring(end);
      
      handleContentChange(newText);
      
      // Manter o cursor após o emoji inserido
      setTimeout(() => {
        textarea.selectionStart = start + emoji.length;
        textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const addNewPage = () => {
    setPages([...pages, { text: '', style: { ...defaultStyle } }]);
    setCurrentPage(pages.length);
    setIsEditing(true);
    setShowColorPicker(false);
    setShowEmojiPicker(false);
  };

  const deletePage = () => {
    if (pages.length <= 1) {
      setPages([{ text: '', style: { ...defaultStyle } }]);
      setCurrentPage(0);
      return;
    }
    
    const newPages = pages.filter((_, index) => index !== currentPage);
    setPages(newPages);
    setCurrentPage(Math.min(currentPage, newPages.length - 1));
    setShowColorPicker(false);
    setShowEmojiPicker(false);
  };

  const toggleFontStyle = (property: 'fontWeight' | 'fontStyle') => {
    const currentStyle = pages[currentPage].style[property];
    const newValue = property === 'fontWeight' 
      ? (currentStyle === 'bold' ? 'normal' : 'bold') 
      : (currentStyle === 'italic' ? 'normal' : 'italic');
    
    handleStyleChange(property, newValue);
  };

  const changeFontSize = (increase: boolean) => {
    const currentSize = parseInt(pages[currentPage].style.fontSize);
    const newSize = increase ? currentSize + 2 : Math.max(12, currentSize - 2);
    handleStyleChange('fontSize', `${newSize}px`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <div className="w-full h-full bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden flex flex-col">
        {/* Barra de formatação - apenas visível quando estiver editando */}
        {isEditing && (
          <div className="p-1 lg:p-1.5 flex justify-center items-center bg-gray-800">
            <div className="flex gap-1 flex-wrap justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFontStyle('fontWeight')}
                className={`p-1 rounded-lg ${
                  pages[currentPage].style.fontWeight === 'bold' 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Bold size={16} />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleFontStyle('fontStyle')}
                className={`p-1 rounded-lg ${
                  pages[currentPage].style.fontStyle === 'italic' 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <Italic size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleChange('textAlign', 'left')}
                className={`p-1 rounded-lg ${
                  pages[currentPage].style.textAlign === 'left' 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <AlignLeft size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleChange('textAlign', 'center')}
                className={`p-1 rounded-lg ${
                  pages[currentPage].style.textAlign === 'center' 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <AlignCenter size={16} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleStyleChange('textAlign', 'right')}
                className={`p-1 rounded-lg ${
                  pages[currentPage].style.textAlign === 'right' 
                    ? 'bg-purple-600' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <AlignRight size={16} />
              </motion.button>

              <div className="flex items-center gap-1 bg-gray-700 rounded-lg px-1">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeFontSize(false)}
                  className="p-1 text-white hover:text-gray-300"
                >
                  -
                </motion.button>
                <Type size={14} />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => changeFontSize(true)}
                  className="p-1 text-white hover:text-gray-300"
                >
                  +
                </motion.button>
              </div>

              {/* Botão para abrir o seletor de cores */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowEmojiPicker(false);
                  }}
                  className="flex items-center p-1 rounded-lg bg-gray-700 hover:bg-gray-600"
                  style={{ borderBottom: `2px solid ${pages[currentPage].style.color}` }}
                >
                  <Palette size={16} color={pages[currentPage].style.color} />
                </motion.button>

                {/* Seletor de cores */}
                {showColorPicker && (
                  <div className="absolute z-10 top-full left-0 mt-1 bg-gray-800 p-2 rounded-lg shadow-lg flex flex-wrap gap-1 w-32">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => handleColorChange(color.value)}
                        className="w-6 h-6 rounded-full border border-gray-600 flex items-center justify-center"
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {pages[currentPage].style.color === color.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Botão para abrir o seletor de emojis */}
              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setShowColorPicker(false);
                  }}
                  className="flex items-center p-1 rounded-lg bg-gray-700 hover:bg-gray-600"
                >
                  <Smile size={16} />
                </motion.button>

                {/* Seletor de emojis */}
                {showEmojiPicker && (
                  <div className="absolute z-10 top-full right-0 mt-1 bg-gray-800 p-2 rounded-lg shadow-lg flex flex-wrap gap-1 w-48 max-h-32 overflow-y-auto">
                    {emojiOptions.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleEmojiSelect(emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-700 rounded"
                        title={`Emoji ${emoji}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Conteúdo */}
        <div 
          className="flex-grow bg-white overflow-auto"
          style={{ 
            height: isEditing 
              ? 'calc(100vh - 14rem)' 
              : 'calc(100vh - 8rem)',
            minHeight: isEditing 
              ? '450px' 
              : '480px'
          }}
        >
          {isEditing ? (
            <div className="h-full w-full">
              <textarea
                ref={textareaRef}
                value={pages[currentPage].text}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full h-full p-2 lg:p-4 xl:p-6 text-black focus:outline-none resize-none"
                placeholder="Digite seu conteúdo aqui..."
                autoFocus
                style={{
                  fontWeight: pages[currentPage].style.fontWeight,
                  fontStyle: pages[currentPage].style.fontStyle,
                  fontSize: pages[currentPage].style.fontSize,
                  textAlign: pages[currentPage].style.textAlign,
                  color: pages[currentPage].style.color,
                  backgroundColor: 'white',
                  border: 'none',
                }}
              />
            </div>
          ) : (
            <motion.div 
              className="h-full p-2 lg:p-4 xl:p-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className="w-full h-full overflow-auto whitespace-pre-wrap break-words"
                style={{
                  fontWeight: pages[currentPage].style.fontWeight,
                  fontStyle: pages[currentPage].style.fontStyle,
                  fontSize: pages[currentPage].style.fontSize,
                  textAlign: pages[currentPage].style.textAlign,
                  color: pages[currentPage].style.color,
                }}
              >
                {pages[currentPage].text || 'Página vazia. Clique em "Editar" para adicionar conteúdo.'}
              </div>
            </motion.div>
          )}
        </div>

        {/* Barra de controle inferior */}
        <div className="p-0.5 bg-gray-800 flex justify-between items-center">
          {/* Navegação e controles integrados em uma linha só */}
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-0.5">
              <button 
                onClick={() => handlePageChange('prev')}
                disabled={currentPage === 0}
                className={`p-0.5 rounded-full ${currentPage === 0 ? 'text-gray-500' : 'text-white hover:bg-gray-700'}`}
              >
                <ChevronLeft size={12} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </button>
              
              <span className="text-[8px] lg:text-[10px] text-gray-300">
                {currentPage + 1}/{pages.length}
              </span>
              
              <button 
                onClick={() => handlePageChange('next')}
                disabled={currentPage === pages.length - 1}
                className={`p-0.5 rounded-full ${currentPage === pages.length - 1 ? 'text-gray-500' : 'text-white hover:bg-gray-700'}`}
              >
                <ChevronRight size={12} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </button>
            </div>

            <div className="flex gap-0.5">
              {isEditing ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={savePage}
                  className="flex items-center px-1 py-0.5 bg-green-600 hover:bg-green-700 rounded text-[8px] lg:text-[10px]"
                >
                  <Save size={10} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="flex items-center px-1 py-0.5 bg-purple-600 hover:bg-purple-700 rounded text-[8px] lg:text-[10px]"
                >
                  <Edit size={10} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                </motion.button>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={addNewPage}
                className="flex items-center px-1 py-0.5 bg-blue-600 hover:bg-blue-700 rounded text-[8px] lg:text-[10px]"
              >
                <Plus size={10} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={deletePage}
                className="flex items-center px-1 py-0.5 bg-red-600 hover:bg-red-700 rounded text-[8px] lg:text-[10px]"
              >
                <Trash2 size={10} className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}; 
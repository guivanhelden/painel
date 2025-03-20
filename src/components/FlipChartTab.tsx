import React, { useState, useRef, useEffect } from 'react';
import { Edit, ChevronLeft, ChevronRight, Save, Trash2, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Plus, Palette, Smile, Image, Move, Maximize, Minimize, AlignCenterHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

interface PageContent {
  text: string;
  style: {
    fontWeight: 'normal' | 'bold';
    fontStyle: 'normal' | 'italic';
    fontSize: string;
    textAlign: 'left' | 'center' | 'right';
    color: string;
  };
  images: Array<{
    id: string;
    url: string;
    width: string;
    height: string;
    position: 'left' | 'center' | 'right';
  }>;
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

  const [pages, setPages] = useState<PageContent[]>([{ 
    text: '', 
    style: { ...defaultStyle },
    images: []
  }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
              },
              images: parsedContent.images || []
            };
          } catch (e) {
            // Se falhar, usar o conteúdo como texto plano
            return { 
              text: item.content || '', 
              style: { ...defaultStyle },
              images: []
            };
          }
        });
        setPages(formattedPages);
      } else {
        setPages([{ text: '', style: { ...defaultStyle }, images: [] }]);
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

  // Manipulação de upload de imagens
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setIsUploading(true);
      
      // Para cada arquivo selecionado
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `flipchart-images/${fileName}`;
        
        // Upload para o Supabase Storage
        const { data, error } = await supabase.storage
          .from('flipchart-media')
          .upload(filePath, file);
          
        if (error) throw error;
        
        // Obter URL pública da imagem
        const { data: publicUrlData } = supabase.storage
          .from('flipchart-media')
          .getPublicUrl(filePath);
        
        // Adicionar imagem à página atual
        const newPages = [...pages];
        
        if (!newPages[currentPage].images) {
          newPages[currentPage].images = [];
        }
        
        // Criar um novo objeto de imagem com URL e dimensões padrão
        newPages[currentPage].images.push({
          id: fileName,
          url: publicUrlData.publicUrl,
          width: '50%',
          height: 'auto',
          position: 'center'
        });
        
        setPages(newPages);
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
    } finally {
      setIsUploading(false);
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Atualizar tamanho de imagem
  const handleImageResize = (imageId: string, sizeDelta: number) => {
    const newPages = [...pages];
    const imageIndex = newPages[currentPage].images.findIndex(img => img.id === imageId);
    
    if (imageIndex !== -1) {
      // Obter largura atual e converter para número
      const currentWidth = newPages[currentPage].images[imageIndex].width;
      let widthValue = parseInt(currentWidth);
      
      if (isNaN(widthValue)) {
        widthValue = 50; // Valor padrão se não conseguir converter
      }
      
      // Calcular nova largura com limites mínimos e máximos
      const newWidth = Math.max(10, Math.min(100, widthValue + sizeDelta));
      
      // Atualizar largura da imagem
      newPages[currentPage].images[imageIndex].width = `${newWidth}%`;
      setPages(newPages);
    }
  };

  // Mudar posição da imagem
  const handleImagePosition = (imageId: string, position: 'left' | 'center' | 'right') => {
    const newPages = [...pages];
    const imageIndex = newPages[currentPage].images.findIndex(img => img.id === imageId);
    
    if (imageIndex !== -1) {
      newPages[currentPage].images[imageIndex].position = position;
      setPages(newPages);
    }
  };

  // Remover uma imagem
  const removeImage = async (imageId: string) => {
    if (!confirm('Tem certeza que deseja remover esta imagem?')) return;
    
    try {
      // Remover do Storage
      const { error } = await supabase.storage
        .from('flipchart-media')
        .remove([`flipchart-images/${imageId}`]);
        
      if (error) throw error;
      
      // Remover da página
      const newPages = [...pages];
      newPages[currentPage].images = newPages[currentPage].images.filter(img => img.id !== imageId);
      setPages(newPages);
    } catch (error) {
      console.error('Erro ao remover imagem:', error);
    }
  };

  const addNewPage = () => {
    setPages([...pages, { text: '', style: { ...defaultStyle }, images: [] }]);
    setCurrentPage(pages.length);
    setIsEditing(true);
    setShowColorPicker(false);
    setShowEmojiPicker(false);
  };

  const deletePage = () => {
    if (pages.length <= 1) {
      setPages([{ text: '', style: { ...defaultStyle }, images: [] }]);
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

              {/* Botão para fazer upload de imagens */}
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  style={{ display: 'none' }}
                  multiple
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`flex items-center p-1 rounded-lg ${
                    isUploading 
                      ? 'bg-gray-500 cursor-not-allowed' 
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <Image size={16} />
                </motion.button>
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
            <div className="h-full w-full flex flex-col">
              <textarea
                ref={textareaRef}
                value={pages[currentPage].text}
                onChange={(e) => handleContentChange(e.target.value)}
                className="w-full flex-grow p-2 lg:p-4 xl:p-6 text-black focus:outline-none resize-none"
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
              
              {/* Container de imagens */}
              {pages[currentPage].images && pages[currentPage].images.length > 0 && (
                <div className="p-2 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Imagens (clique para ajustar)</h3>
                  <div className="flex flex-wrap gap-4">
                    {pages[currentPage].images.map((image) => (
                      <div 
                        key={image.id} 
                        className={`relative group ${selectedImage === image.id ? 'ring-2 ring-blue-500' : ''}`}
                        style={{ 
                          width: '180px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setSelectedImage(image.id === selectedImage ? null : image.id)}
                      >
                        <div className="border border-gray-300 rounded overflow-hidden" style={{ maxHeight: '150px' }}>
                          <img 
                            src={image.url} 
                            alt="Imagem do flipchart" 
                            className="w-full h-auto object-contain"
                          />
                        </div>
                        
                        {/* Controles visíveis quando a imagem está selecionada */}
                        {selectedImage === image.id && (
                          <div className="absolute -bottom-10 left-0 right-0 bg-gray-800 rounded p-1 shadow-md flex justify-between">
                            {/* Controles de posição */}
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImagePosition(image.id, 'left');
                                }}
                                title="Alinhar à esquerda"
                                className={`p-1 rounded ${image.position === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                              >
                                <AlignLeft size={12} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImagePosition(image.id, 'center');
                                }}
                                title="Centralizar"
                                className={`p-1 rounded ${image.position === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                              >
                                <AlignCenterHorizontal size={12} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImagePosition(image.id, 'right');
                                }}
                                title="Alinhar à direita" 
                                className={`p-1 rounded ${image.position === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-white hover:bg-gray-500'}`}
                              >
                                <AlignRight size={12} />
                              </button>
                            </div>
                            
                            {/* Controles de tamanho */}
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageResize(image.id, -10);
                                }}
                                title="Diminuir tamanho"
                                className="p-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                              >
                                <Minimize size={12} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageResize(image.id, 10);
                                }}
                                title="Aumentar tamanho"
                                className="p-1 rounded bg-purple-500 text-white hover:bg-purple-600"
                              >
                                <Maximize size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeImage(image.id);
                                }}
                                title="Remover imagem"
                                className="p-1 rounded bg-red-500 text-white hover:bg-red-600"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="mt-1 text-xs text-gray-500 truncate">
                          Tamanho: {image.width} - Posição: {image.position}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                className="w-full overflow-auto whitespace-pre-wrap break-words"
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
              
              {/* Exibir imagens no modo de visualização */}
              {pages[currentPage].images && pages[currentPage].images.length > 0 && (
                <div className="mt-4 flex flex-col gap-6">
                  {pages[currentPage].images.map((image) => (
                    <div 
                      key={image.id} 
                      className="border border-gray-300 rounded overflow-hidden"
                      style={{ 
                        width: image.width,
                        margin: image.position === 'center' ? '0 auto' : 
                               image.position === 'right' ? '0 0 0 auto' : '0 auto 0 0'
                      }}
                    >
                      <img 
                        src={image.url} 
                        alt="Imagem do flipchart" 
                        className="w-full h-auto object-contain"
                        style={{ maxHeight: '500px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
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
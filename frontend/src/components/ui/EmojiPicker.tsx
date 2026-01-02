'use client';

import { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

// Emojis populares organizados por categoría
const EMOJI_CATEGORIES = {
  '😀 Caras': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '😊', '😇', '🥰', '😍', '🤩', '😘', '😎', '🤓', '🧐', '🤔', '😏'],
  '👋 Gestos': ['👋', '🤚', '✋', '🖐️', '👌', '🤌', '✌️', '🤞', '🤟', '🤘', '👍', '👎', '👏', '🙌', '🤝', '💪', '🙏'],
  '❤️ Amor': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟'],
  '🎉 Celebración': ['🎉', '🎊', '🎈', '🎁', '🎂', '🍰', '🥳', '🎆', '🎇', '✨', '🌟', '⭐', '🏆', '🥇', '🎯', '🎪'],
  '🍔 Comida': ['🍔', '🍕', '🍟', '🌭', '🥪', '🌮', '🌯', '🥗', '🍝', '🍜', '🍣', '🍱', '🍛', '🍲', '🥘', '🍗', '🍖', '🥩', '🍳', '🥚'],
  '🍺 Bebidas': ['🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '☕', '🍵', '🧃', '🥤', '🧋'],
  '⚽ Deportes': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🏒', '🥊', '🎿', '🏄', '🚴', '🏃', '🧘'],
  '🏠 Lugares': ['🏠', '🏡', '🏢', '🏖️', '🏕️', '⛺', '🏔️', '🌋', '🗻', '🏝️', '🌊', '🌅', '🌄', '🌃', '🌉', '🎡'],
  '🚗 Viajes': ['🚗', '🚕', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '✈️', '🚀', '🛸', '🚁', '⛵', '🚤', '🛳️', '🚂'],
  '💰 Dinero': ['💰', '💵', '💴', '💶', '💷', '💸', '💳', '🏧', '💹', '📈', '📉', '🧾', '💲'],
  '👨‍👩‍👧‍👦 Familia': ['👨‍👩‍👧', '👨‍👩‍👦', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👩‍👦', '👩‍👧', '👨‍👦', '👨‍👧', '🧑‍🤝‍🧑', '👫', '👬', '👭'],
};

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  className?: string;
}

export function EmojiPicker({ onEmojiSelect, className = '' }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(Object.keys(EMOJI_CATEGORIES)[0]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors text-slate-400 hover:text-slate-200"
        title="Agregar emoji"
      >
        <Smile className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-80 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
          {/* Categorías */}
          <div className="flex overflow-x-auto gap-1 p-2 border-b border-slate-700 scrollbar-hide">
            {Object.keys(EMOJI_CATEGORIES).map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'hover:bg-slate-700/50 text-slate-400'
                }`}
              >
                {category.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Emojis de la categoría seleccionada */}
          <div className="p-2 grid grid-cols-8 gap-1 max-h-48 overflow-y-auto">
            {EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleEmojiClick(emoji)}
                className="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-700/50 rounded-lg transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Tip */}
          <div className="px-3 py-2 border-t border-slate-700 text-xs text-slate-500">
            💡 También podés usar <kbd className="px-1 py-0.5 bg-slate-700 rounded text-slate-400">Win + .</kbd> para más emojis
          </div>
        </div>
      )}
    </div>
  );
}


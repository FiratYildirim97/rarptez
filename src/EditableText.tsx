import React, { useState, useEffect, useRef } from "react";
import { Edit2 } from "lucide-react";

interface EditableTextProps {
  id: string;
  defaultText: string;
  className?: string;
  editMode: boolean;
  as?: keyof JSX.IntrinsicElements;
}

export const EditableText: React.FC<EditableTextProps> = ({ id, defaultText, className = "", editMode, as: Tag = "span" }) => {
  const [text, setText] = useState(defaultText);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem(`rarp_txt_${id}`);
    if (saved) {
      setText(saved);
    }
  }, [id]);

  const handleSave = () => {
    setIsEditing(false);
    localStorage.setItem(`rarp_txt_${id}`, text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing && editMode) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-white/90 border-b-2 border-blue-500 text-blue-800 outline-none px-1 rounded ${className}`}
        style={{ width: `${Math.max(text.length, 5)}ch`, minWidth: '50px' }}
      />
    );
  }

  return (
    <Tag 
      className={`relative group inline-block ${editMode ? "cursor-pointer hover:bg-blue-500/20 transition-colors border border-dashed border-transparent hover:border-blue-400 p-0.5 rounded" : ""} ${className}`}
      onClick={() => editMode && setIsEditing(true)}
      title={editMode ? "Tıklayarak metni düzenle" : undefined}
    >
      {text}
      {editMode && (
        <Edit2 size={12} className="absolute -top-2 -right-3 opacity-0 group-hover:opacity-100 text-blue-500" />
      )}
    </Tag>
  );
};

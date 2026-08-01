import React, { useState } from "react";
import { Settings as SettingsIcon, Plus, Trash2, Save, X, ChevronRight, ChevronDown, MoveVertical } from "lucide-react";
import { FieldDefinition, FieldType } from "./types";
import { DEFAULT_TABS } from "./fieldConfig";

interface SettingsProps {
  fieldDefinitions: FieldDefinition[];
  setFieldDefinitions: (fields: FieldDefinition[]) => void;
}

const Settings: React.FC<SettingsProps> = ({ fieldDefinitions, setFieldDefinitions }) => {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [newField, setNewField] = useState<Partial<FieldDefinition>>({
    label: "",
    type: FieldType.TEXT,
    tab: DEFAULT_TABS[0]
  });
  const [isAdding, setIsAdding] = useState(false);

  const handleUpdateField = (id: string, updates: Partial<FieldDefinition>) => {
    setFieldDefinitions(fieldDefinitions.map(f => f.id === id ? { ...f, ...updates } : f));
    setEditingFieldId(null);
  };

  const handleAddField = () => {
    if (!newField.label) return;
    
    const id = Date.now().toString();
    const name = newField.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    
    const field: FieldDefinition = {
      id,
      name: `custom_${name}_${id.slice(-4)}`,
      label: newField.label,
      type: newField.type as FieldType,
      tab: newField.tab as string,
      isCustom: true
    };

    setFieldDefinitions([...fieldDefinitions, field]);
    setNewField({ label: "", type: FieldType.TEXT, tab: DEFAULT_TABS[0] });
    setIsAdding(false);
  };

  const handleDeleteField = (id: string) => {
    if (confirm("Bu bilgi başlığını silmek istediğinize emin misiniz? Bu veriyi içeren hasta kayıtlarında bu alan görünmeyecektir.")) {
      setFieldDefinitions(fieldDefinitions.filter(f => f.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <SettingsIcon size={24} className="text-blue-400" />
            Sistem Ayarları
          </h2>
          <p className="text-slate-400 text-sm mt-1">Veri giriş bölümlerini ve başlıklarını özelleştirin.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-bold shadow-lg shadow-blue-500/20"
          >
            <Plus size={18} /> Yeni Başlık Ekle
          </button>
        )}
      </div>

      {isAdding && (
        <div className="glass-card p-6 border-blue-500/30">
          <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4">Yeni Bilgi Başlığı</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-text">Görünüme Çıkacak İsim</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Örn: Preop Hemoglobin"
                value={newField.label}
                onChange={e => setNewField({...newField, label: e.target.value})}
              />
            </div>
            <div>
              <label className="label-text">Veri Tipi</label>
              <select 
                className="input-field"
                value={newField.type}
                onChange={e => setNewField({...newField, type: e.target.value as FieldType})}
              >
                <option value={FieldType.TEXT}>Metin</option>
                <option value={FieldType.NUMBER}>Sayı</option>
                <option value={FieldType.DATE}>Tarih</option>
                <option value={FieldType.CHECKBOX}>Onay Kutusu</option>
              </select>
            </div>
            <div>
              <label className="label-text">Bölüm (Tab)</label>
              <select 
                className="input-field"
                value={newField.tab}
                onChange={e => setNewField({...newField, tab: e.target.value})}
              >
                {DEFAULT_TABS.map(tab => (
                  <option key={tab} value={tab}>{tab}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm text-slate-400 hover:text-white">İptal</button>
            <button onClick={handleAddField} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold">Ekle</button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {DEFAULT_TABS.map(tab => {
          const tabFields = fieldDefinitions.filter(f => f.tab === tab);
          if (tabFields.length === 0) return null;

          return (
            <div key={tab} className="glass-card overflow-hidden">
              <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">{tab}</h3>
                <span className="text-[10px] bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{tabFields.length} Başlık</span>
              </div>
              <div className="divide-y divide-white/5">
                {tabFields.map(field => (
                  <div key={field.id} className="p-4 flex items-center justify-between group hover:bg-white/5 transition-colors">
                    {editingFieldId === field.id ? (
                      <div className="flex-1 grid grid-cols-2 gap-4 mr-4">
                        <input 
                          type="text" 
                          className="input-field py-1" 
                          value={field.label}
                          onChange={e => handleUpdateField(field.id, { label: e.target.value })}
                          autoFocus
                        />
                        <select 
                          className="input-field py-1"
                          value={field.tab}
                          onChange={e => handleUpdateField(field.id, { tab: e.target.value })}
                        >
                          {DEFAULT_TABS.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="text-slate-600 group-hover:text-slate-500 transition-colors cursor-move">
                          <MoveVertical size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{field.label}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase">{field.type}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                       <button 
                        onClick={() => editingFieldId === field.id ? setEditingFieldId(null) : setEditingFieldId(field.id)}
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                      >
                         {editingFieldId === field.id ? <X size={18} /> : <SettingsIcon size={18} />}
                      </button>
                      <button 
                        onClick={() => handleDeleteField(field.id)}
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 glass-card bg-orange-500/5 border-orange-500/20">
        <h4 className="text-sm font-bold text-orange-400 mb-2">Önemli Not</h4>
        <p className="text-xs text-slate-400 leading-relaxed">
          Başlıkları sildiğinizde, mevcut kayıtlardaki o veriler silinmez ancak arayüzde görüntülenemezler. 
          Benzer şekilde bir başlığın ismini değiştirdiğinizde, veritabanındaki anahtar (key) değişmediği için 
          eski kayıtlarınız korunacaktır.
        </p>
      </div>
    </div>
  );
};

export default Settings;

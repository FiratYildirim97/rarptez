import React, { useState } from 'react';
import { Patient, getInitialPatient } from './types';
import { Save, User, Stethoscope, Scissors, CheckCircle, Calendar } from 'lucide-react';

interface PatientFormProps {
  initialData?: Patient | null;
  onSave: (patient: Patient) => void;
  onCancel: () => void;
}

export default function PatientForm({ initialData, onSave, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState<Patient>(initialData || getInitialPatient());
  const [activeTab, setActiveTab] = useState<'demographics' | 'preop' | 'perop' | 'postop' | 'followup'>('demographics');
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patient_name || formData.patient_name.trim() === "") {
      alert("Lütfen hasta adını giriniz!");
      return;
    }
    setIsSaving(true);
    try {
      await onSave(formData);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 text-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <User className="text-blue-600" size={26} />
            {formData.id ? "Hasta Kaydını Düzenle" : "Yeni Hasta Kaydı"}
          </h2>
          <p className="text-xs font-semibold text-slate-600 mt-1">
            Varsayılan Teknik: <strong className="text-blue-700 font-extrabold">HOOD</strong> (Online Veritabanına Kaydedilir)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all border border-slate-300"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={18} />
            {isSaving ? "Kaydediliyor..." : "Veritabanına Kaydet"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('demographics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'demographics'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <User size={16} /> 1. Demografik Veriler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'preop'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Stethoscope size={16} /> 2. Preoperatif Veriler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('perop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'perop'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Scissors size={16} /> 3. Peroperatif Veriler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('postop')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'postop'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <CheckCircle size={16} /> 4. Postoperatif Veriler
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('followup')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all ${
            activeTab === 'followup'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
          }`}
        >
          <Calendar size={16} /> 5. Takip (1, 3, 6, 12. Ay)
        </button>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="mt-6">
        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Cerrahi Teknik</label>
              <select
                value={formData.group_name}
                onChange={(e) => handleChange('group_name', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="HOOD" className="bg-white text-slate-900 font-bold">HOOD Tekniği (Varsayılan)</option>
                <option value="STANDART" className="bg-white text-slate-900 font-bold">STANDART Teknik</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Hasta Adı Soyadı *</label>
              <input
                type="text"
                required
                placeholder="Örn: AHMET YILMAZ"
                value={formData.patient_name}
                onChange={(e) => handleChange('patient_name', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Protokol No</label>
              <input
                type="text"
                placeholder="Örn: 2026022050"
                value={formData.protocol || ''}
                onChange={(e) => handleChange('protocol', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Operasyon Tarihi</label>
              <input
                type="date"
                value={formData.op_date_formatted || ''}
                onChange={(e) => handleChange('op_date_formatted', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Cerrah</label>
              <input
                type="text"
                placeholder="FK"
                value={formData.surgeon || 'FK'}
                onChange={(e) => handleChange('surgeon', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Telefon No</label>
              <input
                type="text"
                placeholder="5551234567"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Yaş</label>
              <input
                type="number"
                placeholder="65"
                value={formData.age ?? ''}
                onChange={(e) => handleChange('age', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">BMI (Vücut Kitle İndeksi)</label>
              <input
                type="number"
                step="0.1"
                placeholder="27.5"
                value={formData.bmi ?? ''}
                onChange={(e) => handleChange('bmi', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Ek Hastalık</label>
              <input
                type="text"
                placeholder="Örn: HT, DM, KAH"
                value={formData.comorbidity || ''}
                onChange={(e) => handleChange('comorbidity', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'preop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">PSA (ng/mL)</label>
              <input
                type="number"
                step="0.01"
                placeholder="11.7"
                value={formData.psa_preop ?? ''}
                onChange={(e) => handleChange('psa_preop', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Prostat Volümü (cc)</label>
              <input
                type="number"
                placeholder="40"
                value={formData.prostate_volume ?? ''}
                onChange={(e) => handleChange('prostate_volume', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">PIRADS Skoru</label>
              <select
                value={formData.pirads || ''}
                onChange={(e) => handleChange('pirads', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="" className="bg-white text-slate-900 font-bold">Seçiniz...</option>
                <option value="1" className="bg-white text-slate-900 font-bold">PIRADS 1</option>
                <option value="2" className="bg-white text-slate-900 font-bold">PIRADS 2</option>
                <option value="3" className="bg-white text-slate-900 font-bold">PIRADS 3</option>
                <option value="4" className="bg-white text-slate-900 font-bold">PIRADS 4</option>
                <option value="5" className="bg-white text-slate-900 font-bold">PIRADS 5</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Biyopsi ISUP Grade</label>
              <select
                value={formData.biopsy_isup || ''}
                onChange={(e) => handleChange('biopsy_isup', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="" className="bg-white text-slate-900 font-bold">Seçiniz...</option>
                <option value="1" className="bg-white text-slate-900 font-bold">ISUP 1 (Gleason 3+3)</option>
                <option value="2" className="bg-white text-slate-900 font-bold">ISUP 2 (Gleason 3+4)</option>
                <option value="3" className="bg-white text-slate-900 font-bold">ISUP 3 (Gleason 4+3)</option>
                <option value="4" className="bg-white text-slate-900 font-bold">ISUP 4 (Gleason 4+4)</option>
                <option value="5" className="bg-white text-slate-900 font-bold">ISUP 5 (Gleason 9-10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">D'Amico Risk Grubu</label>
              <select
                value={formData.damico || ''}
                onChange={(e) => handleChange('damico', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="" className="bg-white text-slate-900 font-bold">Seçiniz...</option>
                <option value="1" className="bg-white text-slate-900 font-bold">1 (Düşük Risk)</option>
                <option value="2" className="bg-white text-slate-900 font-bold">2 (Orta Risk)</option>
                <option value="3" className="bg-white text-slate-900 font-bold">3 (Yüksek Risk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Preop IEEF-5</label>
              <input
                type="number"
                placeholder="21"
                value={formData.iief_preop ?? ''}
                onChange={(e) => handleChange('iief_preop', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Preop IPSS</label>
              <input
                type="number"
                placeholder="19"
                value={formData.ipss_preop ?? ''}
                onChange={(e) => handleChange('ipss_preop', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>
          </div>
        )}

        {activeTab === 'perop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Konsol Süresi (dakika)</label>
              <input
                type="number"
                placeholder="135"
                value={formData.console_time ?? ''}
                onChange={(e) => handleChange('console_time', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Kan Kaybı (mL)</label>
              <input
                type="number"
                placeholder="100"
                value={formData.blood_loss ?? ''}
                onChange={(e) => handleChange('blood_loss', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Transfüzyon İhtiyacı</label>
              <select
                value={formData.transfusion ?? 0}
                onChange={(e) => handleChange('transfusion', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value={0} className="bg-white text-slate-900 font-bold">0 (Yok)</option>
                <option value={1} className="bg-white text-slate-900 font-bold">1 (Var)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Lenf Nodu Diseksiyonu</label>
              <select
                value={formData.lnd ?? 0}
                onChange={(e) => handleChange('lnd', Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value={0} className="bg-white text-slate-900 font-bold">0 (Yapılmadı)</option>
                <option value={1} className="bg-white text-slate-900 font-bold">1 (Yapıldı)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'postop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Patoloji</label>
              <input
                type="text"
                placeholder="Örn: pT2c, ISUP 2"
                value={formData.pathology || ''}
                onChange={(e) => handleChange('pathology', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Cerrahi Sınır</label>
              <select
                value={formData.surgical_margin || ''}
                onChange={(e) => handleChange('surgical_margin', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="" className="bg-white text-slate-900 font-bold">Seçiniz...</option>
                <option value="Negatif (-)" className="bg-white text-slate-900 font-bold">Negatif (-)</option>
                <option value="Pozitif (+)" className="bg-white text-slate-900 font-bold">Pozitif (+)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Lenf Nodu Durumu</label>
              <input
                type="text"
                placeholder="Örn: 0/12 (Reaktif)"
                value={formData.lymph_node_postop || ''}
                onChange={(e) => handleChange('lymph_node_postop', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Postop PSA (ng/mL)</label>
              <input
                type="number"
                step="0.001"
                placeholder="0.01"
                value={formData.postop_psa ?? ''}
                onChange={(e) => handleChange('postop_psa', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Adjuvan Tedavi?</label>
              <select
                value={formData.adjuvant_treatment || 'Yok'}
                onChange={(e) => handleChange('adjuvant_treatment', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none text-sm"
              >
                <option value="Yok" className="bg-white text-slate-900 font-bold">Yok</option>
                <option value="RT" className="bg-white text-slate-900 font-bold">RT (Radyoterapi)</option>
                <option value="ADT" className="bg-white text-slate-900 font-bold">ADT (Hormonoterapi)</option>
                <option value="RT + ADT" className="bg-white text-slate-900 font-bold">RT + ADT</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'followup' && (
          <div className="space-y-6">
            {/* 1. Ay */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3">Postop 1. Ay Takibi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IPSS</label>
                  <input
                    type="number"
                    placeholder="IPSS skoru"
                    value={formData.ipss_1m ?? ''}
                    onChange={(e) => handleChange('ipss_1m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IEEF-5</label>
                  <input
                    type="number"
                    placeholder="IEEF skoru"
                    value={formData.iief_1m ?? ''}
                    onChange={(e) => handleChange('iief_1m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">İnkontinans (Kaç Ped?)</label>
                  <input
                    type="text"
                    placeholder="Örn: 0, 1 ped"
                    value={formData.incontinence_1m || ''}
                    onChange={(e) => handleChange('incontinence_1m', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 3. Ay */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3">Postop 3. Ay Takibi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IPSS</label>
                  <input
                    type="number"
                    placeholder="IPSS skoru"
                    value={formData.ipss_3m ?? ''}
                    onChange={(e) => handleChange('ipss_3m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IEEF-5</label>
                  <input
                    type="number"
                    placeholder="IEEF skoru"
                    value={formData.iief_3m ?? ''}
                    onChange={(e) => handleChange('iief_3m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">İnkontinans (Kaç Ped?)</label>
                  <input
                    type="text"
                    placeholder="Örn: 0"
                    value={formData.incontinence_3m || ''}
                    onChange={(e) => handleChange('incontinence_3m', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 6. Ay */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3">Postop 6. Ay Takibi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IPSS</label>
                  <input
                    type="number"
                    placeholder="IPSS skoru"
                    value={formData.ipss_6m ?? ''}
                    onChange={(e) => handleChange('ipss_6m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IEEF-5</label>
                  <input
                    type="number"
                    placeholder="IEEF skoru"
                    value={formData.iief_6m ?? ''}
                    onChange={(e) => handleChange('iief_6m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">İnkontinans (Kaç Ped?)</label>
                  <input
                    type="text"
                    placeholder="Örn: 0"
                    value={formData.incontinence_6m || ''}
                    onChange={(e) => handleChange('incontinence_6m', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 12. Ay */}
            <div className="p-5 bg-slate-50 rounded-2xl border-2 border-slate-200">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 mb-3">Postop 12. Ay Takibi</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IPSS</label>
                  <input
                    type="number"
                    placeholder="IPSS skoru"
                    value={formData.ipss_12m ?? ''}
                    onChange={(e) => handleChange('ipss_12m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">IEEF-5</label>
                  <input
                    type="number"
                    placeholder="IEEF skoru"
                    value={formData.iief_12m ?? ''}
                    onChange={(e) => handleChange('iief_12m', e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-slate-900 mb-1">İnkontinans (Kaç Ped?)</label>
                  <input
                    type="text"
                    placeholder="Örn: 0"
                    value={formData.incontinence_12m || ''}
                    onChange={(e) => handleChange('incontinence_12m', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

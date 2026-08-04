import React, { useState } from 'react';
import { Patient } from './types';
import { getWhatsAppBusinessAppScheme, getWhatsAppWebLink } from './utils';
import { Search, Edit, Trash2, UserPlus, Eye, X, MessageSquare, Smartphone } from 'lucide-react';

interface PatientListProps {
  patients: Patient[];
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

export default function PatientList({ patients, onEdit, onDelete, onAddNew }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupFilter, setGroupFilter] = useState<'ALL' | 'HOOD' | 'STANDART'>('ALL');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const filteredPatients = patients.filter(p => {
    const matchesGroup = groupFilter === 'ALL' || p.group_name === groupFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      !term || 
      (p.patient_name && p.patient_name.toLowerCase().includes(term)) ||
      (p.protocol && String(p.protocol).toLowerCase().includes(term)) ||
      (p.surgeon && p.surgeon.toLowerCase().includes(term)) ||
      (p.phone && String(p.phone).includes(term)) ||
      (p.comorbidity && p.comorbidity.toLowerCase().includes(term));
    return matchesGroup && matchesSearch;
  });

  const hoodCount = patients.filter(p => p.group_name === 'HOOD').length;
  const standartCount = patients.filter(p => p.group_name === 'STANDART').length;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Filters & Actions Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setGroupFilter('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              groupFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Tüm Hastalar ({patients.length})
          </button>
          <button
            onClick={() => setGroupFilter('HOOD')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              groupFilter === 'HOOD'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100 border border-blue-200'
            }`}
          >
            HOOD Tekniği ({hoodCount})
          </button>
          <button
            onClick={() => setGroupFilter('STANDART')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              groupFilter === 'STANDART'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            STANDART Teknik ({standartCount})
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              placeholder="Hasta adı, Protokol, Cerrah..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
            />
          </div>
          <button
            onClick={onAddNew}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-md shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus size={16} /> Yeni Kayıt Ekle
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-black">
                <th className="px-4 py-4">Teknik</th>
                <th className="px-4 py-4">Hasta Adı Soyadı</th>
                <th className="px-4 py-4">Protokol No</th>
                <th className="px-4 py-4">Cerrah</th>
                <th className="px-4 py-4">Telefon / WhatsApp Business</th>
                <th className="px-4 py-4">Operasyon Tarihi</th>
                <th className="px-4 py-4">Yaş / BMI</th>
                <th className="px-4 py-4">Preop PSA</th>
                <th className="px-4 py-4">Konsol Süresi</th>
                <th className="px-4 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-slate-500 font-bold">
                    Kayıtlı hasta bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((p) => {
                  const businessAppScheme = getWhatsAppBusinessAppScheme(p.phone, p.patient_name, p.surgeon);
                  const webLink = getWhatsAppWebLink(p.phone, p.patient_name, p.surgeon);

                  return (
                    <tr key={p.id} className="hover:bg-blue-50/60 transition-colors group border-b border-slate-100">
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-black ${
                          p.group_name === 'HOOD' 
                            ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {p.group_name}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-black text-slate-900">
                        {p.patient_name}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800 font-mono font-extrabold">
                        {p.protocol || '-'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-1 bg-slate-100 rounded text-[11px] font-black text-slate-800 border border-slate-300">
                          {p.surgeon || 'FK'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.phone && businessAppScheme && webLink ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-mono text-slate-800 mr-1">{p.phone}</span>
                            
                            {/* Primary Button: Directly forces WhatsApp Business App on iPhone / Android */}
                            <a
                              href={businessAppScheme}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black inline-flex items-center gap-1 shadow-sm transition-all"
                              title="Doğrudan WhatsApp Business uygulamasını açar"
                            >
                              <Smartphone size={12} /> WhatsApp Business App
                            </a>

                            {/* Secondary Button: For Web / PC */}
                            <a
                              href={webLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-all"
                              title="Bilgisayar / Web tarayıcısı için"
                            >
                              <MessageSquare size={11} /> Web
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">{p.phone || '-'}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {p.op_date_formatted || p.op_date || '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {p.age ? `${p.age} yaş` : '-'} {p.bmi ? `(${p.bmi} BMI)` : ''}
                      </td>
                      <td className="px-4 py-3.5 text-blue-900 font-black">
                        {p.psa_preop ? `${p.psa_preop} ng/mL` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {p.console_time ? `${p.console_time} dk` : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedPatient(p)}
                            className="p-2 text-slate-700 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors bg-slate-100 border border-slate-300"
                            title="Detay Görüntüle"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => onEdit(p)}
                            className="p-2 text-slate-700 hover:text-amber-700 hover:bg-amber-100 rounded-lg transition-colors bg-slate-100 border border-slate-300"
                            title="Düzenle"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (p.id && confirm(`"${p.patient_name}" kaydını silmek istediğinize emin misiniz?`)) {
                                onDelete(p.id);
                              }
                            }}
                            className="p-2 text-slate-700 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition-colors bg-slate-100 border border-slate-300"
                            title="Sil"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Detail Modal (Açılır Pencere) */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border-2 border-slate-300 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-4">
              <div>
                <span className={`inline-block px-3 py-1 rounded text-[11px] font-black mb-1 ${
                  selectedPatient.group_name === 'HOOD' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}>
                  {selectedPatient.group_name} TEKNİĞİ
                </span>
                <h3 className="text-xl font-black text-slate-900">{selectedPatient.patient_name}</h3>
                <p className="text-xs font-bold text-slate-700">Protokol: {selectedPatient.protocol || '-'} | Cerrah: {selectedPatient.surgeon || 'FK'}</p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl border border-slate-300 font-bold"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-900">
              <div className="p-4 bg-slate-100 rounded-xl space-y-2 border border-slate-300">
                <span className="font-black text-blue-900 block uppercase text-[11px]">Demografik Veriler</span>
                <p><span className="text-slate-600">Op. Tarihi:</span> {selectedPatient.op_date_formatted || selectedPatient.op_date || '-'}</p>
                <p><span className="text-slate-600">Yaş / BMI:</span> {selectedPatient.age || '-'} yaş / {selectedPatient.bmi || '-'} BMI</p>
                <p><span className="text-slate-600">Ek Hastalık:</span> {selectedPatient.comorbidity || 'Yok'}</p>
                <div>
                  <span className="text-slate-600 block mb-1">Telefon / WhatsApp Business:</span>
                  {selectedPatient.phone && getWhatsAppBusinessAppScheme(selectedPatient.phone, selectedPatient.patient_name, selectedPatient.surgeon) ? (
                    <div className="flex flex-col gap-2 items-start mt-1">
                      <span className="font-mono text-slate-900 text-sm">{selectedPatient.phone}</span>
                      
                      <div className="flex flex-wrap gap-2 mt-1">
                        <a
                          href={getWhatsAppBusinessAppScheme(selectedPatient.phone, selectedPatient.patient_name, selectedPatient.surgeon)!}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black inline-flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                        >
                          <Smartphone size={16} /> WhatsApp Business App (Telefon)
                        </a>

                        <a
                          href={getWhatsAppWebLink(selectedPatient.phone, selectedPatient.patient_name, selectedPatient.surgeon)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all"
                        >
                          <MessageSquare size={14} /> Web / PC
                        </a>
                      </div>
                    </div>
                  ) : (
                    <span>{selectedPatient.phone || '-'}</span>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl space-y-1.5 border border-slate-300">
                <span className="font-black text-blue-900 block uppercase text-[11px]">Preoperatif</span>
                <p><span className="text-slate-600">Preop PSA:</span> {selectedPatient.psa_preop || '-'} ng/mL</p>
                <p><span className="text-slate-600">Prostat Volümü:</span> {selectedPatient.prostate_volume || '-'} cc</p>
                <p><span className="text-slate-600">PIRADS / ISUP:</span> PIRADS {selectedPatient.pirads || '-'} / ISUP {selectedPatient.biopsy_isup || '-'}</p>
                <p><span className="text-slate-600">D'Amico:</span> {selectedPatient.damico || '-'}</p>
                <p><span className="text-slate-600">IPSS / IEEF:</span> {selectedPatient.ipss_preop || '-'} / {selectedPatient.iief_preop || '-'}</p>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl space-y-1.5 border border-slate-300">
                <span className="font-black text-blue-900 block uppercase text-[11px]">Peroperatif</span>
                <p><span className="text-slate-600">Konsol Süresi:</span> {selectedPatient.console_time || '-'} dk</p>
                <p><span className="text-slate-600">Kan Kaybı:</span> {selectedPatient.blood_loss || '-'} mL</p>
                <p><span className="text-slate-600">Transfüzyon / LND:</span> {selectedPatient.transfusion ? 'Var' : 'Yok'} / {selectedPatient.lnd ? 'Yapıldı' : 'Yapılmadı'}</p>
              </div>

              <div className="p-4 bg-slate-100 rounded-xl space-y-1.5 border border-slate-300">
                <span className="font-black text-blue-900 block uppercase text-[11px]">Postoperatif & Patoloji</span>
                <p><span className="text-slate-600">Patoloji:</span> {selectedPatient.pathology || '-'}</p>
                <p><span className="text-slate-600">Cerrahi Sınır:</span> {selectedPatient.surgical_margin || '-'}</p>
                <p><span className="text-slate-600">Postop PSA:</span> {selectedPatient.postop_psa || '-'} ng/mL</p>
                <p><span className="text-slate-600">Adjuvan Tedavi:</span> {selectedPatient.adjuvant_treatment || 'Yok'}</p>
              </div>
            </div>

            {/* Follow-up timeline */}
            <div className="border-t-2 border-slate-200 pt-4">
              <h4 className="text-xs font-black text-slate-900 uppercase mb-3">Fonksiyonel Takip Özeti</h4>
              <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-900">
                  <span className="font-black text-blue-900 block border-b border-blue-200 pb-1 mb-1">1. Ay</span>
                  <p>IPSS: {selectedPatient.ipss_1m ?? '-'}</p>
                  <p>IEEF: {selectedPatient.iief_1m ?? '-'}</p>
                  <p>Ped: {selectedPatient.incontinence_1m || '-'}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-900">
                  <span className="font-black text-blue-900 block border-b border-blue-200 pb-1 mb-1">3. Ay</span>
                  <p>IPSS: {selectedPatient.ipss_3m ?? '-'}</p>
                  <p>IEEF: {selectedPatient.iief_3m ?? '-'}</p>
                  <p>Ped: {selectedPatient.incontinence_3m || '-'}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-900">
                  <span className="font-black text-blue-900 block border-b border-blue-200 pb-1 mb-1">6. Ay</span>
                  <p>IPSS: {selectedPatient.ipss_6m ?? '-'}</p>
                  <p>IEEF: {selectedPatient.iief_6m ?? '-'}</p>
                  <p>Ped: {selectedPatient.incontinence_6m || '-'}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-slate-900">
                  <span className="font-black text-blue-900 block border-b border-blue-200 pb-1 mb-1">12. Ay</span>
                  <p>IPSS: {selectedPatient.ipss_12m ?? '-'}</p>
                  <p>IEEF: {selectedPatient.iief_12m ?? '-'}</p>
                  <p>Ped: {selectedPatient.incontinence_12m || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

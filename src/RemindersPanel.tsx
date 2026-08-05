import React, { useState } from 'react';
import { Patient } from './types';
import { getWhatsAppLink } from './utils';
import { supabase } from './supabaseClient';
import { Bell, AlertCircle, Clock, Search, Microscope, MessageSquare, PlusCircle, ChevronDown, ChevronUp, X } from 'lucide-react';

interface RemindersPanelProps {
  patients: Patient[];
  onPatientUpdated: () => void;
}

export interface ReminderItem {
  patient: Patient;
  period: '1m' | '3m' | '6m' | '12m';
  periodLabel: string;
  daysPassed: number;
  status: 'DUE' | 'OVERDUE' | 'DONE';
}

type PeriodKey = '1m' | '3m' | '6m' | '12m';

interface ControlForm {
  ipss: string;
  ieef: string;
  iciqsf: string;
}

export default function RemindersPanel({ patients, onPatientUpdated }: RemindersPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | PeriodKey>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [controlModal, setControlModal] = useState<{ reminder: ReminderItem } | null>(null);
  const [controlForm, setControlForm] = useState<ControlForm>({ ipss: '', ieef: '', iciqsf: '' });
  const [saving, setSaving] = useState(false);

  const now = new Date();

  const getReminders = (): ReminderItem[] => {
    const items: ReminderItem[] = [];

    patients.forEach(p => {
      const opDateStr = p.op_date_formatted || p.op_date;
      if (!opDateStr) return;

      const opDate = new Date(opDateStr);
      if (isNaN(opDate.getTime())) return;

      const diffTime = Math.abs(now.getTime() - opDate.getTime());
      const daysPassed = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Postoperatif Kontroller (15-75 gün)
      if (daysPassed >= 15 && daysPassed <= 75) {
        const hasPathology = Boolean(p.pathology && p.pathology.trim() !== '');
        items.push({
          patient: p,
          period: '1m',
          periodLabel: 'Postoperatif Kontroller',
          daysPassed,
          status: hasPathology ? 'DONE' : (daysPassed > 45 ? 'OVERDUE' : 'DUE')
        });
      }

      // 3. Ay Kontrolü (80-140 gün)
      if (daysPassed >= 80 && daysPassed <= 140) {
        items.push({
          patient: p,
          period: '3m',
          periodLabel: '3. Ay Kontrolü',
          daysPassed,
          status: p.ipss_3m !== null && p.ipss_3m !== undefined ? 'DONE' : (daysPassed > 105 ? 'OVERDUE' : 'DUE')
        });
      }

      // 6. Ay Kontrolü (160-230 gün)
      if (daysPassed >= 160 && daysPassed <= 230) {
        items.push({
          patient: p,
          period: '6m',
          periodLabel: '6. Ay Kontrolü',
          daysPassed,
          status: p.ipss_6m !== null && p.ipss_6m !== undefined ? 'DONE' : (daysPassed > 195 ? 'OVERDUE' : 'DUE')
        });
      }

      // 12. Ay Kontrolü (340-420 gün)
      if (daysPassed >= 340 && daysPassed <= 420) {
        items.push({
          patient: p,
          period: '12m',
          periodLabel: '12. Ay Kontrolü',
          daysPassed,
          status: p.ipss_12m !== null && p.ipss_12m !== undefined ? 'DONE' : (daysPassed > 380 ? 'OVERDUE' : 'DUE')
        });
      }
    });

    return items;
  };

  const reminders = getReminders();

  const filteredReminders = reminders.filter(r => {
    if (r.status === 'DONE') return false; // Tamamlananları gösterme
    const matchesPeriod = selectedPeriod === 'ALL' || r.period === selectedPeriod;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      (r.patient.patient_name && r.patient.patient_name.toLowerCase().includes(term)) ||
      (r.patient.protocol && String(r.patient.protocol).includes(term)) ||
      (r.patient.phone && String(r.patient.phone).includes(term));
    return matchesPeriod && matchesSearch;
  });

  const dueCount = reminders.filter(r => r.status === 'DUE').length;
  const overdueCount = reminders.filter(r => r.status === 'OVERDUE').length;

  const openControlModal = (reminder: ReminderItem) => {
    const p = reminder.patient;
    const period = reminder.period;
    if (period === '1m') {
      // 1. ay: patoloji + lenf nodu + cerrahi sınır
      setControlForm({
        ipss: String(p.pathology ?? ''),
        ieef: String(p.lymph_node_postop ?? ''),
        iciqsf: String(p.surgical_margin ?? '')
      });
    } else {
      setControlForm({
        ipss: String(p[`ipss_${period}` as keyof Patient] ?? ''),
        ieef: String(p[`iief_${period}` as keyof Patient] ?? ''),
        iciqsf: String(p[`incontinence_${period}` as keyof Patient] ?? '')
      });
    }
    setControlModal({ reminder });
  };

  const handleSaveControl = async () => {
    if (!controlModal) return;
    const { reminder } = controlModal;
    const p = reminder.patient;
    const period = reminder.period;

    setSaving(true);
    const updates: Partial<Patient> = {};

    if (period === '1m') {
      // 1. ay: patoloji + lenf nodu + cerrahi sınır
      if (controlForm.ipss !== '') updates.pathology = controlForm.ipss as any;
      if (controlForm.ieef !== '') updates.lymph_node_postop = controlForm.ieef as any;
      if (controlForm.iciqsf !== '') updates.surgical_margin = controlForm.iciqsf as any;
    } else {
      if (controlForm.ipss !== '') updates[`ipss_${period}` as keyof Patient] = Number(controlForm.ipss) as any;
      if (controlForm.ieef !== '') updates[`iief_${period}` as keyof Patient] = Number(controlForm.ieef) as any;
      if (controlForm.iciqsf !== '') updates[`incontinence_${period}` as keyof Patient] = controlForm.iciqsf as any;
    }

    const { error } = await supabase
      .from('patients')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', p.id);

    setSaving(false);

    if (error) {
      alert('Kayıt hatası: ' + error.message);
    } else {
      setControlModal(null);
      onPatientUpdated();
    }
  };

  const getPeriodCurrentValues = (p: Patient, period: PeriodKey) => ({
    ipss: p[`ipss_${period}` as keyof Patient],
    ieef: p[`iief_${period}` as keyof Patient],
    iciqsf: p[`incontinence_${period}` as keyof Patient],
  });

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-amber-500 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-amber-100">Kontrol / Patoloji Zamanı Geldi</p>
            <h3 className="text-3xl font-black mt-1">{dueCount} Hasta</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Clock size={26} />
          </div>
        </div>

        <div className="bg-rose-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-100">Günü Geçmiş / Eksik Patoloji</p>
            <h3 className="text-3xl font-black mt-1">{overdueCount} Hasta</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <AlertCircle size={26} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'ALL', label: `Tüm Takip Dönemleri (${reminders.length})`, color: 'bg-slate-900' },
            { key: '1m', label: 'Postoperatif Kontroller', color: 'bg-purple-600', icon: <Microscope size={14} /> },
            { key: '3m', label: '3. Ay Kontrolü', color: 'bg-blue-600' },
            { key: '6m', label: '6. Ay Kontrolü', color: 'bg-blue-600' },
            { key: '12m', label: '12. Ay Kontrolü', color: 'bg-blue-600' },
          ].map(({ key, label, color, icon }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                selectedPeriod === key
                  ? `${color} text-white shadow-md`
                  : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
          <input
            type="text"
            placeholder="Hasta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border-2 border-slate-300 bg-white text-slate-900 font-bold focus:border-blue-600 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-black">
                <th className="px-4 py-4">Durum</th>
                <th className="px-4 py-4">Hasta Adı Soyadı</th>
                <th className="px-4 py-4">Teknik & Cerrah</th>
                <th className="px-4 py-4">Kontrol Türü</th>
                <th className="px-4 py-4">Süre</th>
                <th className="px-4 py-4 text-center">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-bold text-slate-900">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                    Bu döneme ait kontrol takibi bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredReminders.map((r, idx) => {
                  const rowKey = `${r.patient.id}-${r.period}`;
                  const isExpanded = expandedRow === rowKey;
                  const waLink = getWhatsAppLink(r.patient.phone, r.patient.patient_name, r.patient.surgeon);
                  const vals = getPeriodCurrentValues(r.patient, r.period);

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className={`hover:bg-blue-50/60 transition-colors border-b border-slate-100 ${isExpanded ? 'bg-blue-50' : ''}`}>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-black ${
                            r.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-900 border border-rose-300'
                              : r.status === 'DUE'
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          }`}>
                            {r.status === 'OVERDUE' ? 'Günü Geçti' : r.status === 'DUE' ? 'Kontrol Zamanı' : 'Tamamlandı'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-black text-slate-900">
                          {r.patient.patient_name}
                          <span className="block text-[10px] text-slate-500 font-mono font-normal">
                            Protokol: {r.patient.protocol || '-'} | Tel: {r.patient.phone || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
                            r.patient.group_name === 'HOOD' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                          }`}>
                            {r.patient.group_name}
                          </span>
                          <span className="text-slate-700 font-extrabold">{r.patient.surgeon || 'FK'}</span>
                        </td>
                        <td className="px-4 py-3.5 font-black text-purple-900">
                          <span className="flex items-center gap-1.5">
                            {r.period === '1m' && <Microscope size={14} className="text-purple-600" />}
                            {r.periodLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">
                          {r.daysPassed} gün
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            {/* WhatsApp */}
                            {r.patient.phone && waLink && (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black rounded-lg inline-flex items-center gap-1 transition-all"
                              >
                                <MessageSquare size={13} /> WA
                              </a>
                            )}
                            {/* Kontrol Ekle */}
                            <button
                              onClick={() => openControlModal(r)}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-lg inline-flex items-center gap-1 transition-all"
                            >
                              <PlusCircle size={13} /> Kontrol Ekle
                            </button>
                            {/* Detay Aç/Kapat */}
                            <button
                              onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-black rounded-lg inline-flex items-center gap-1 border border-slate-300 transition-all"
                            >
                              {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />} Detaylar
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="bg-blue-50/80">
                          <td colSpan={6} className="px-6 py-5">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                              {/* Preop bilgiler */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Preoperatif</p>
                                <p><span className="text-slate-500">Yaş:</span> <strong>{r.patient.age ?? '-'}</strong></p>
                                <p><span className="text-slate-500">BMI:</span> <strong>{r.patient.bmi ?? '-'}</strong></p>
                                <p><span className="text-slate-500">PSA:</span> <strong>{r.patient.psa_preop ?? '-'}</strong></p>
                                <p><span className="text-slate-500">IPSS:</span> <strong>{r.patient.ipss_preop ?? '-'}</strong></p>
                                <p><span className="text-slate-500">IIEF:</span> <strong>{r.patient.iief_preop ?? '-'}</strong></p>
                              </div>

                              {/* Ameliyat bilgiler */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Ameliyat</p>
                                <p><span className="text-slate-500">Tarih:</span> <strong>{r.patient.op_date || '-'}</strong></p>
                                <p><span className="text-slate-500">Konsol:</span> <strong>{r.patient.console_time ?? '-'} dk</strong></p>
                                <p><span className="text-slate-500">Kan Kaybı:</span> <strong>{r.patient.blood_loss ?? '-'} mL</strong></p>
                                <p><span className="text-slate-500">LND:</span> <strong>{r.patient.lnd ?? '-'}</strong></p>
                              </div>

                              {/* Patoloji */}
                              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                                <p className="text-[10px] font-black text-slate-500 uppercase mb-2">Patoloji & Onkoloji</p>
                                <p><span className="text-slate-500">Patoloji:</span> <strong>{r.patient.pathology || '-'}</strong></p>
                                <p><span className="text-slate-500">Cerrahi Sınır:</span> <strong>{r.patient.surgical_margin || '-'}</strong></p>
                                <p><span className="text-slate-500">Postop PSA:</span> <strong>{r.patient.postop_psa ?? '-'}</strong></p>
                                <p><span className="text-slate-500">Adjuvan:</span> <strong>{r.patient.adjuvant_treatment || '-'}</strong></p>
                              </div>

                              {/* Bu periyoda ait mevcut değerler */}
                              <div className="bg-blue-100 rounded-xl p-4 border border-blue-300 shadow-sm">
                                <p className="text-[10px] font-black text-blue-700 uppercase mb-2">{r.periodLabel} Mevcut Değerler</p>
                                {r.period === '1m' ? (
                                  <>
                                    <p><span className="text-blue-600">Patoloji:</span> <strong>{r.patient.pathology || <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                    <p><span className="text-blue-600">Lenf Nodu:</span> <strong>{r.patient.lymph_node_postop || <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                    <p><span className="text-blue-600">Cerrahi Sınır:</span> <strong>{r.patient.surgical_margin || <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                  </>
                                ) : (
                                  <>
                                    <p><span className="text-blue-600">IPSS:</span> <strong>{vals.ipss ?? <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                    <p><span className="text-blue-600">IIEF:</span> <strong>{vals.ieef ?? <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                    <p><span className="text-blue-600">ICIQ-SF:</span> <strong>{vals.iciqsf || <span className="text-rose-500">Girilmemiş</span>}</strong></p>
                                  </>
                                )}
                                <button
                                  onClick={() => openControlModal(r)}
                                  className="mt-3 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black rounded-lg flex items-center justify-center gap-1 transition-all"
                                >
                                  <PlusCircle size={13} /> Değer Gir / Güncelle
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Control Entry Modal */}
      {controlModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border-2 border-blue-300 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">{controlModal.reminder.periodLabel}</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{controlModal.reminder.patient.patient_name}</p>
              </div>
              <button onClick={() => setControlModal(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {controlModal.reminder.period === '1m' ? (
                // 1. Ay: Patoloji & PSA
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Patoloji</label>
                    <input
                      type="text"
                      placeholder="Örn: pT2a, pT3b ISUP2..."
                      value={controlForm.ipss}
                      onChange={e => setControlForm(f => ({ ...f, ipss: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Lenf Nodu Durumu</label>
                    <input
                      type="text"
                      placeholder="Malign/Toplam (örn: 0/12)"
                      value={controlForm.ieef}
                      onChange={e => setControlForm(f => ({ ...f, ieef: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">Cerrahi Sınır</label>
                    <input
                      type="text"
                      placeholder="Pozitif / Negatif"
                      value={controlForm.iciqsf}
                      onChange={e => setControlForm(f => ({ ...f, iciqsf: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                // 3 - 6 - 12. Ay: Fonksiyonel
                <>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">IPSS Skoru</label>
                    <input
                      type="number"
                      min="0" max="35"
                      placeholder="0 - 35"
                      value={controlForm.ipss}
                      onChange={e => setControlForm(f => ({ ...f, ipss: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">IIEF-5 Skoru</label>
                    <input
                      type="number"
                      min="1" max="25"
                      placeholder="1 - 25"
                      value={controlForm.ieef}
                      onChange={e => setControlForm(f => ({ ...f, ieef: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-extrabold text-slate-700 mb-1">ICIQ-SF</label>
                    <input
                      type="text"
                      placeholder="Örn: 0, 1, 2..."
                      value={controlForm.iciqsf}
                      onChange={e => setControlForm(f => ({ ...f, iciqsf: e.target.value }))}
                      className="w-full px-3 py-2.5 border-2 border-slate-300 rounded-xl text-sm font-bold focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 pt-2 border-t border-slate-200">
              <button
                onClick={() => setControlModal(null)}
                className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-black"
              >
                İptal
              </button>
              <button
                onClick={handleSaveControl}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md disabled:opacity-60"
              >
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

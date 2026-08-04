import React, { useState } from 'react';
import { Patient } from './types';
import { getWhatsAppBusinessAppScheme, getWhatsAppWebLink } from './utils';
import { Bell, Calendar, MessageSquare, AlertCircle, CheckCircle, Clock, Search, Microscope, Smartphone } from 'lucide-react';

interface RemindersPanelProps {
  patients: Patient[];
}

export interface ReminderItem {
  patient: Patient;
  period: '1m' | '3m' | '6m' | '12m';
  periodLabel: string;
  daysPassed: number;
  status: 'DUE' | 'OVERDUE' | 'DONE';
}

export default function RemindersPanel({ patients }: RemindersPanelProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'ALL' | '1m' | '3m' | '6m' | '12m'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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

      // 1. Ay Patoloji Kontrolü (15-75 gün)
      if (daysPassed >= 15 && daysPassed <= 75) {
        const hasPathology = Boolean(p.pathology && p.pathology.trim() !== '');
        items.push({
          patient: p,
          period: '1m',
          periodLabel: '1. Ay Patoloji Kontrolü',
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
  const doneCount = reminders.filter(r => r.status === 'DONE').length;

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        <div className="bg-emerald-600 text-white p-6 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-emerald-100">Tamamlanan Patoloji & Kontroller</p>
            <h3 className="text-3xl font-black mt-1">{doneCount} Hasta</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <CheckCircle size={26} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedPeriod('ALL')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedPeriod === 'ALL'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Tüm Takip Dönemleri ({reminders.length})
          </button>
          <button
            onClick={() => setSelectedPeriod('1m')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              selectedPeriod === '1m' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Microscope size={14} /> 1. Ay Patoloji Kontrolü
          </button>
          <button
            onClick={() => setSelectedPeriod('3m')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedPeriod === '3m' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            3. Ay Kontrolü
          </button>
          <button
            onClick={() => setSelectedPeriod('6m')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedPeriod === '6m' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            6. Ay Kontrolü
          </button>
          <button
            onClick={() => setSelectedPeriod('12m')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all ${
              selectedPeriod === '12m' ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            12. Ay Kontrolü
          </button>
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
                <th className="px-4 py-4">Op. Sonrası Süre</th>
                <th className="px-4 py-4 text-right">WhatsApp Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
              {filteredReminders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-bold">
                    Bu döneme ait kontrol takibi bulunmamaktadır.
                  </td>
                </tr>
              ) : (
                filteredReminders.map((r, idx) => {
                  const businessAppScheme = getWhatsAppBusinessAppScheme(r.patient.phone, r.patient.patient_name, r.patient.surgeon);
                  const webLink = getWhatsAppWebLink(r.patient.phone, r.patient.patient_name, r.patient.surgeon);

                  return (
                    <tr key={idx} className="hover:bg-blue-50/60 transition-colors group border-b border-slate-100">
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-black ${
                          r.status === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : r.status === 'DUE'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {r.status === 'OVERDUE' ? 'Günü Geçti / Eksik' : r.status === 'DUE' ? 'Kontrol Zamanı' : 'Tamamlandı'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-black text-slate-900">
                        {r.patient.patient_name}
                        <span className="block text-[10px] text-slate-500 font-mono font-normal">Protokol: {r.patient.protocol || '-'}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mr-2 ${
                          r.patient.group_name === 'HOOD' ? 'bg-blue-100 text-blue-900' : 'bg-emerald-100 text-emerald-900'
                        }`}>
                          {r.patient.group_name}
                        </span>
                        <span className="text-slate-700 font-extrabold">{r.patient.surgeon || 'FK'}</span>
                      </td>
                      <td className="px-4 py-3.5 font-black text-purple-900 flex items-center gap-1.5 mt-1">
                        {r.period === '1m' && <Microscope size={14} className="text-purple-600" />}
                        {r.periodLabel}
                      </td>
                      <td className="px-4 py-3.5 text-slate-800">
                        {r.daysPassed} gün ({Math.floor(r.daysPassed / 30)} ay)
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {r.patient.phone && businessAppScheme && webLink ? (
                          <div className="flex items-center justify-end gap-2">
                            <a
                              href={businessAppScheme}
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/30 inline-flex items-center gap-1.5 transition-all"
                              title="Doğrudan WhatsApp Business uygulamasını açar"
                            >
                              <Smartphone size={14} /> WhatsApp Business App
                            </a>
                            <a
                              href={webLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 text-xs font-bold rounded-xl transition-all"
                              title="Web / PC için"
                            >
                              Web
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-normal">Telefon yok</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Patient } from './types';
import { computeStatisticalComparisons, exportSPSSDatasetCSV } from './statsUtils';
import { Award, Download, FileSpreadsheet, CheckCircle2, HelpCircle } from 'lucide-react';

interface ThesisStatsProps {
  patients: Patient[];
}

export default function ThesisStats({ patients }: ThesisStatsProps) {
  const stats = computeStatisticalComparisons(patients);
  const hoodPatients = patients.filter(p => p.group_name === 'HOOD');
  const standartPatients = patients.filter(p => p.group_name === 'STANDART');

  return (
    <div className="space-y-6 text-slate-900">
      {/* Action Header Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-white/20 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
            Akademik Tez Modülü
          </span>
          <h2 className="text-xl font-black mt-2">HOOD vs. STANDART İstatistiksel Karşılaştırma & SPSS Analizi</h2>
          <p className="text-xs text-blue-100 mt-1">
            Student's t-test $p$-değerleri ve gruplar arası ortalama ± standart sapma ($Mean \pm SD$) analiz sonuçları.
          </p>
        </div>

        <button
          onClick={() => exportSPSSDatasetCSV(patients)}
          className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all shrink-0 border border-emerald-400/40"
        >
          <Download size={18} /> SPSS Uyumlu Verisetini İndir (.CSV)
        </button>
      </div>

      {/* Statistical Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="text-blue-600" size={20} />
            Akademik İstatistik Özet Tablosu (Tez Metnine Doğrudan Kopyalayabilirsiniz)
          </h3>
          <span className="text-xs font-bold text-slate-600">
            Toplam: HOOD (n={hoodPatients.length}), STANDART (n={standartPatients.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-black">
                <th className="px-4 py-4">Parametre / Değişken</th>
                <th className="px-4 py-4">HOOD Tekniği (n={hoodPatients.length})<br/><span className="text-[10px] text-blue-300 font-normal">Mean ± SD</span></th>
                <th className="px-4 py-4">STANDART Teknik (n={standartPatients.length})<br/><span className="text-[10px] text-emerald-300 font-normal">Mean ± SD</span></th>
                <th className="px-4 py-4">İstatistiksel Anlamlılık ($p$-value)</th>
                <th className="px-4 py-4 text-center">Tez Yorumu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold text-slate-900">
              {stats.map((row, idx) => (
                <tr key={idx} className="hover:bg-blue-50/50 transition-colors border-b border-slate-100">
                  <td className="px-4 py-3.5 font-black text-slate-900">
                    {row.variableName} <span className="text-slate-500 font-medium text-[10px]">({row.unit})</span>
                  </td>
                  <td className="px-4 py-3.5 text-blue-900 font-black">
                    {row.hoodMean} ± {row.hoodSD} <span className="text-[10px] text-slate-500 font-normal">(n={row.hoodCount})</span>
                  </td>
                  <td className="px-4 py-3.5 text-emerald-900 font-black">
                    {row.standartMean} ± {row.standartSD} <span className="text-[10px] text-slate-500 font-normal">(n={row.standartCount})</span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-sm font-black">
                    {row.pValue < 0.001 ? 'p < 0.001' : `p = ${row.pValue}`}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    {row.isSignificant ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md text-[11px] font-black">
                        <CheckCircle2 size={14} /> p &lt; 0.05 Anlamlı Fark Var
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[11px] font-bold">
                        Anlamlı Fark Yok
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

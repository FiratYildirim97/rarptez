import React from 'react';
import { Patient } from './types';
import { Printer, Download, X, ShieldCheck } from 'lucide-react';

interface PatientReportProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientReport({ patient, onClose }: PatientReportProps) {
  const handlePrint = () => {
    window.print();
  };

  const getSurgeonTitle = (surgeon?: string | null) => {
    const s = (surgeon || '').toUpperCase().trim();
    if (s === 'FK' || s.includes('FUAT') || s.includes('KIZILAY')) {
      return "Doç. Dr. Fuat Kızılay";
    }
    if (s === 'MSK' || s.includes('MUSTAFA') || s.includes('KALEMCİ') || s.includes('KALEMCI')) {
      return "Doç. Dr. Mustafa Serdar Kalemci";
    }
    return s || "Doç. Dr. Fuat Kızılay";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      {/* Print Controls (Hidden during actual print) */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-3 print:hidden">
        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xl flex items-center gap-2 transition-all"
        >
          <Printer size={18} /> PDF İndir / Yazdır
        </button>
        <button
          onClick={onClose}
          className="p-2.5 bg-white text-slate-800 hover:bg-slate-100 font-bold rounded-xl border border-slate-300 shadow-md"
        >
          <X size={20} />
        </button>
      </div>

      {/* Printable A4 Container */}
      <div className="bg-white text-slate-900 w-full max-w-4xl p-8 rounded-2xl shadow-2xl my-8 border border-slate-200 print:m-0 print:p-6 print:shadow-none print:w-full print:max-w-none print:border-none">
        
        {/* Academic Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">
              EGE ÜNİVERSİTESİ TIP FAKÜLTESİ ÜROLOJİ ANABİLİMDALI
            </h1>
            <h2 className="text-sm font-bold text-blue-900 tracking-wide mt-0.5">
              ROBOTİK RADİKAL PROSTATEKTOMİ (RARP) HASTA ÖZETİ VE KLİNİK TAKİP FORMU
            </h2>
            <p className="text-xs font-semibold text-slate-600 mt-1">
              Tez Sorumluları: <span className="font-extrabold text-slate-800">{getSurgeonTitle(patient.surgeon)}</span> | Tez Araştırmacısı: <span className="font-extrabold text-slate-800">Dr. Fırat Yıldırım</span>
            </p>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-md text-xs font-black uppercase mb-1 border ${
              patient.group_name === 'HOOD' 
                ? 'bg-blue-100 text-blue-900 border-blue-300' 
                : 'bg-emerald-100 text-emerald-900 border-emerald-300'
            }`}>
              {patient.group_name} TEKNİĞİ
            </span>
            <p className="text-[10px] text-slate-500 font-mono font-bold">Rapor Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
          </div>
        </div>

        {/* Patient Core Header Card */}
        <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 grid grid-cols-4 gap-4 text-xs font-bold mb-6">
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Hasta Adı Soyadı</span>
            <span className="text-slate-900 text-sm font-black">{patient.patient_name}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Protokol No</span>
            <span className="text-slate-900 text-sm font-mono font-black">{patient.protocol || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Telefon</span>
            <span className="text-slate-900 font-mono font-bold">{patient.phone || '-'}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase text-[10px]">Operasyon Tarihi</span>
            <span className="text-slate-900 font-bold">{patient.op_date_formatted || patient.op_date || '-'}</span>
          </div>
        </div>

        {/* 2-Column Clinical Data Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs font-semibold mb-6">
          
          {/* Box 1: Preoperatif Değerler */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2 bg-white">
            <h3 className="font-black text-blue-900 uppercase text-[11px] border-b border-slate-200 pb-1.5 mb-2">
              1. Preoperatif Değerlendirme
            </h3>
            <div className="grid grid-cols-2 gap-y-1.5">
              <div><span className="text-slate-500">Yaş / BMI:</span> {patient.age || '-'} yaş / {patient.bmi || '-'} kg/m²</div>
              <div><span className="text-slate-500">Ek Hastalık:</span> {patient.comorbidity || 'Yok'}</div>
              <div><span className="text-slate-500">Preop PSA:</span> <strong className="text-slate-900">{patient.psa_preop || '-'} ng/mL</strong></div>
              <div><span className="text-slate-500">Prostat Volümü:</span> {patient.prostate_volume || '-'} cc</div>
              <div><span className="text-slate-500">PIRADS Skoru:</span> PIRADS {patient.pirads || '-'}</div>
              <div><span className="text-slate-500">Biyopsi ISUP:</span> ISUP {patient.biopsy_isup || '-'}</div>
              <div><span className="text-slate-500">D'Amico Riski:</span> {patient.damico || '-'}</div>
              <div><span className="text-slate-500">Preop IPSS / IEEF:</span> {patient.ipss_preop ?? '-'} / {patient.iief_preop ?? '-'}</div>
            </div>
          </div>

          {/* Box 2: Peroperatif & Postoperatif */}
          <div className="border border-slate-300 rounded-xl p-4 space-y-2 bg-white">
            <h3 className="font-black text-blue-900 uppercase text-[11px] border-b border-slate-200 pb-1.5 mb-2">
              2. Peroperatif & Postoperatif Bulgular
            </h3>
            <div className="grid grid-cols-2 gap-y-1.5">
              <div><span className="text-slate-500">Sorumlu Cerrah:</span> <strong className="text-slate-900">{patient.surgeon || 'FK'}</strong></div>
              <div><span className="text-slate-500">Konsol Süresi:</span> {patient.console_time || '-'} dk</div>
              <div><span className="text-slate-500">Kan Kaybı:</span> {patient.blood_loss || '-'} mL</div>
              <div><span className="text-slate-500">Transfüzyon:</span> {patient.transfusion ? 'Evet (Var)' : 'Hayır (Yok)'}</div>
              <div><span className="text-slate-500">LND:</span> {patient.lnd ? 'Yapıldı' : 'Yapılmadı'}</div>
              <div><span className="text-slate-500">Patoloji (pT):</span> <strong className="text-slate-900">{patient.pathology || '-'}</strong></div>
              <div><span className="text-slate-500">Cerrahi Sınır:</span> <strong className="text-slate-900">{patient.surgical_margin || '-'}</strong></div>
              <div><span className="text-slate-500">Postop PSA:</span> {patient.postop_psa || '-'} ng/mL</div>
            </div>
          </div>

        </div>

        {/* Section 3: Functional Follow-up Table */}
        <div className="border border-slate-300 rounded-xl p-4 mb-8 bg-white">
          <h3 className="font-black text-blue-900 uppercase text-[11px] border-b border-slate-200 pb-2 mb-3">
            3. Postoperatif Fonksiyonel Takip Skorları (1, 3, 6, 12. Ay)
          </h3>
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase text-[10px] font-black border-b border-slate-300">
                <th className="py-2 text-left px-2">Takip Dönemi</th>
                <th className="py-2">IPSS Skoru (0-35)</th>
                <th className="py-2">IEEF-5 Skoru (1-25)</th>
                <th className="py-2">İnkontinans / Ped Kullanımı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-bold">
              <tr>
                <td className="py-2 text-left px-2 font-black text-slate-900">Preoperatif (Bazal)</td>
                <td className="py-2">{patient.ipss_preop ?? '-'}</td>
                <td className="py-2">{patient.iief_preop ?? '-'}</td>
                <td className="py-2">Tam Kontinans (0 Ped)</td>
              </tr>
              <tr>
                <td className="py-2 text-left px-2 font-black text-slate-900">1. Ay Kontrolü</td>
                <td className="py-2">{patient.ipss_1m ?? '-'}</td>
                <td className="py-2">{patient.iief_1m ?? '-'}</td>
                <td className="py-2">{patient.incontinence_1m || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 text-left px-2 font-black text-slate-900">3. Ay Kontrolü</td>
                <td className="py-2">{patient.ipss_3m ?? '-'}</td>
                <td className="py-2">{patient.iief_3m ?? '-'}</td>
                <td className="py-2">{patient.incontinence_3m || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 text-left px-2 font-black text-slate-900">6. Ay Kontrolü</td>
                <td className="py-2">{patient.ipss_6m ?? '-'}</td>
                <td className="py-2">{patient.iief_6m ?? '-'}</td>
                <td className="py-2">{patient.incontinence_6m || '-'}</td>
              </tr>
              <tr>
                <td className="py-2 text-left px-2 font-black text-slate-900">12. Ay Kontrolü</td>
                <td className="py-2">{patient.ipss_12m ?? '-'}</td>
                <td className="py-2">{patient.iief_12m ?? '-'}</td>
                <td className="py-2">{patient.incontinence_12m || '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Footer */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-center text-xs font-bold">
          <div>
            <p className="text-slate-500 uppercase text-[10px] mb-8">Tez Araştırmacısı / Asistan Hekim</p>
            <p className="font-black text-slate-900 text-sm">Dr. Fırat Yıldırım</p>
            <p className="text-[10px] text-slate-500 font-medium">Ege Üniversitesi Tıp Fakültesi Üroloji AD</p>
          </div>
          <div>
            <p className="text-slate-500 uppercase text-[10px] mb-8">Sorumlu Öğretim Üyesi / Tez Danışmanı</p>
            <p className="font-black text-slate-900 text-sm">{getSurgeonTitle(patient.surgeon)}</p>
            <p className="text-[10px] text-slate-500 font-medium">Ege Üniversitesi Tıp Fakültesi Üroloji AD</p>
          </div>
        </div>

      </div>
    </div>
  );
}

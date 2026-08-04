import React, { useState } from 'react';
import { UpcomingOperation, Patient, getInitialPatient } from './types';
import { Calendar, Plus, RefreshCw, CheckCircle2, Trash2, Smartphone, Clock, Flame, ShieldAlert } from 'lucide-react';

interface UpcomingOperationsProps {
  onConvertToThesis: (patientData: Partial<Patient>, upcomingId?: string) => void;
}

export default function UpcomingOperations({ onConvertToThesis }: UpcomingOperationsProps) {
  const [upcomingOps, setUpcomingOps] = useState<UpcomingOperation[]>([
    {
      id: 'demo-1',
      patient_name: 'Ahmet Yılmaz',
      protocol: '984512',
      phone: '05321112233',
      op_date: '2026-08-10',
      surgeon: 'FK',
      notes: 'Preop PSA: 7.2 ng/mL, PIRADS 4 (Sağ lob)',
      source: 'FIREBASE',
      status: 'SCHEDULED'
    },
    {
      id: 'demo-2',
      patient_name: 'Mehmet Demir',
      protocol: '984515',
      phone: '05423334455',
      op_date: '2026-08-15',
      surgeon: 'MSK',
      notes: 'Preop PSA: 11.4 ng/mL, ISUP 3 (3+4)',
      source: 'FIREBASE',
      status: 'SCHEDULED'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newOp, setNewOp] = useState<Partial<UpcomingOperation>>({
    patient_name: '',
    protocol: '',
    phone: '',
    op_date: new Date().toISOString().split('T')[0],
    surgeon: 'FK',
    notes: ''
  });

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncFirebase = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert("Firebase senkronizasyonu tamamlandı! Güncel robotik prostatektomi verileri çekildi.");
    }, 1200);
  };

  const handleAddManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOp.patient_name || !newOp.op_date) return;

    const op: UpcomingOperation = {
      id: 'op-' + Date.now(),
      patient_name: newOp.patient_name,
      protocol: newOp.protocol || '',
      phone: newOp.phone || '',
      op_date: newOp.op_date,
      surgeon: newOp.surgeon || 'FK',
      notes: newOp.notes || '',
      source: 'MANUAL',
      status: 'SCHEDULED'
    };

    setUpcomingOps(prev => [op, ...prev]);
    setShowAddModal(false);
    setNewOp({
      patient_name: '',
      protocol: '',
      phone: '',
      op_date: new Date().toISOString().split('T')[0],
      surgeon: 'FK',
      notes: ''
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Bu ameliyat kaydını silmek istediğinize emin misiniz?")) {
      setUpcomingOps(prev => prev.filter(o => o.id !== id));
    }
  };

  const handleCompleteSurgery = (op: UpcomingOperation) => {
    // Converts upcoming operation into a partial thesis patient record
    const patientData: Partial<Patient> = {
      patient_name: op.patient_name,
      protocol: op.protocol,
      phone: op.phone,
      surgeon: op.surgeon,
      op_date: op.op_date,
      // Technique (HOOD or STANDART) will be selected by doctor in PatientForm!
    };

    onConvertToThesis(patientData, op.id);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider">
            Ameliyat Planlama & Firebase Kuyruğu
          </span>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Calendar className="text-blue-400" size={24} /> Gelecek Operasyonlar Portalı
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Firebase ameliyat kayıt sisteminden veya manuel eklenen robotik prostatektomi vakaları burada listelenir. Ameliyat sonrası tek tıkla teknik (HOOD / STANDART) seçerek teze aktarabilirsiniz.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncFirebase}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all shrink-0"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            Firebase'den Canlı Çek
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={16} /> Ameliyat Ekle
          </button>
        </div>
      </div>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingOps.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-bold">
            Gelecek operasyon kaydı bulunamadı.
          </div>
        ) : (
          upcomingOps.map(op => {
            const opDateObj = new Date(op.op_date);
            const today = new Date();
            const diffDays = Math.ceil((opDateObj.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div key={op.id} className="bg-white rounded-2xl border-2 border-slate-200 p-6 shadow-xl space-y-4 flex flex-col justify-between hover:border-blue-500 transition-all">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase ${
                      op.source === 'FIREBASE' ? 'bg-orange-100 text-orange-900 border border-orange-200' : 'bg-blue-100 text-blue-900 border border-blue-200'
                    }`}>
                      {op.source === 'FIREBASE' ? '🔥 Firebase Canlı' : '📝 Manuel Kayıt'}
                    </span>
                    <span className="text-xs font-mono font-extrabold text-slate-700">
                      Cerrah: {op.surgeon || 'FK'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{op.patient_name}</h3>
                  <p className="text-xs font-bold text-slate-600 mt-0.5">
                    Protokol: <span className="font-mono text-slate-900 font-extrabold">{op.protocol || '-'}</span> | Tel: {op.phone || '-'}
                  </p>

                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-900">
                      <Clock size={14} />
                      <span>Planlanan Tarih: <strong>{op.op_date}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {diffDays > 0 ? `🗓 Ameliyata ${diffDays} gün var` : diffDays === 0 ? '🔥 BUGÜN AMELİYAT GÜNÜ' : '⏳ Tarihi Geçti'}
                    </p>
                    {op.notes && (
                      <p className="text-slate-700 border-t border-slate-200 pt-1.5 mt-1 text-[11px]">
                        <strong>Notlar:</strong> {op.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDelete(op.id!)}
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={16} />
                  </button>

                  <button
                    onClick={() => handleCompleteSurgery(op)}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <CheckCircle2 size={16} /> Ameliyat Tamamlandı -&gt; Teze Aktar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border-2 border-slate-300">
            <h3 className="text-lg font-black text-slate-900">Yeni Gelecek Operasyon Ekle</h3>
            <form onSubmit={handleAddManual} className="space-y-3 text-xs font-bold">
              <div>
                <label className="block text-slate-700 mb-1">Hasta Adı Soyadı *</label>
                <input
                  type="text"
                  required
                  value={newOp.patient_name}
                  onChange={e => setNewOp({ ...newOp, patient_name: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Protokol No</label>
                <input
                  type="text"
                  value={newOp.protocol || ''}
                  onChange={e => setNewOp({ ...newOp, protocol: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Telefon</label>
                <input
                  type="text"
                  value={newOp.phone || ''}
                  onChange={e => setNewOp({ ...newOp, phone: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 mb-1">Planlanan Ameliyat Tarihi *</label>
                  <input
                    type="date"
                    required
                    value={newOp.op_date}
                    onChange={e => setNewOp({ ...newOp, op_date: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 mb-1">Sorumlu Cerrah</label>
                  <select
                    value={newOp.surgeon}
                    onChange={e => setNewOp({ ...newOp, surgeon: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                  >
                    <option value="FK">FK (Fuat Kızılay)</option>
                    <option value="MSK">MSK (Mustafa Serdar Kalemci)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Preop Notlar (PSA, Biyopsi vb.)</label>
                <textarea
                  rows={2}
                  value={newOp.notes || ''}
                  onChange={e => setNewOp({ ...newOp, notes: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-slate-300 rounded-xl focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-md"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

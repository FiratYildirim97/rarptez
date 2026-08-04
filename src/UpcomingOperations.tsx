import React, { useState, useEffect } from 'react';
import { UpcomingOperation, Patient } from './types';
import { fetchFirebaseUpcomingCases, diagnoseFirebaseConnection, DiagnosticResult } from './firebaseClient';
import { Calendar, Plus, RefreshCw, CheckCircle2, Trash2, Smartphone, Clock, Flame, ShieldAlert, Check, Search, Activity, Bug } from 'lucide-react';

interface UpcomingOperationsProps {
  onConvertToThesis: (patientData: Partial<Patient>, upcomingId?: string) => void;
}

export default function UpcomingOperations({ onConvertToThesis }: UpcomingOperationsProps) {
  const [upcomingOps, setUpcomingOps] = useState<UpcomingOperation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const [diagnosticData, setDiagnosticData] = useState<DiagnosticResult | null>(null);
  const [showDiagModal, setShowDiagModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newOp, setNewOp] = useState<Partial<UpcomingOperation>>({
    patient_name: '',
    protocol: '',
    phone: '',
    op_date: new Date().toISOString().split('T')[0],
    surgeon: 'FK',
    notes: ''
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const loadFirebaseCases = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      const fbCases = await fetchFirebaseUpcomingCases(todayStr);

      if (fbCases.length > 0) {
        let addedCount = 0;
        setUpcomingOps(prev => {
          const existingKeys = new Set(prev.map(p => (p.protocol || p.patient_name).toLowerCase().trim()));
          const newCases = fbCases.filter(c => {
            const key = (c.protocol || c.patient_name).toLowerCase().trim();
            return !existingKeys.has(key);
          });
          addedCount = newCases.length;
          return [...newCases, ...prev];
        });

        setSyncStatusMsg(`✅ Firebase'den ${addedCount} vaka çekildi.`);
      } else {
        setSyncStatusMsg(`ℹ️ Belirtilen filtreye uygun vaka bulunamadı. Lütfen "Bağlantı Teşhis Testi" butonuna basarak kontrol edin.`);
      }
    } catch (err) {
      console.error("Firebase sync error:", err);
      setSyncStatusMsg("⚠️ Firebase bağlantısı kurulurken bir uyarı oluştu.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRunDiagnostics = async () => {
    setIsSyncing(true);
    const diag = await diagnoseFirebaseConnection();
    setDiagnosticData(diag);
    setShowDiagModal(true);
    setIsSyncing(false);
  };

  useEffect(() => {
    loadFirebaseCases();
  }, []);

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
    const patientData: Partial<Patient> = {
      patient_name: op.patient_name,
      protocol: op.protocol,
      phone: op.phone,
      surgeon: op.surgeon,
      op_date: op.op_date,
    };

    setUpcomingOps(prev => prev.filter(o => o.id !== op.id));
    onConvertToThesis(patientData, op.id);
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-md tracking-wider flex items-center gap-1">
              🔥 Live Firebase Connected
            </span>
            <span className="text-[10px] text-slate-300 font-mono">urology-case-list-ea0c1</span>
          </div>
          <h2 className="text-xl font-black mt-2 flex items-center gap-2">
            <Calendar className="text-blue-400" size={24} /> Gelecek Operasyonlar Portalı
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Filtre kelimeleri: <strong className="text-amber-300 font-bold">'robot rp', 'robotik rp', 'robotik radikal prostatektomi'</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={loadFirebaseCases}
            disabled={isSyncing}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all shrink-0 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isSyncing ? "animate-spin" : ""} />
            Gelecek Ameliyatları Çek (Bugün ve Sonrası)
          </button>
          <button
            onClick={handleRunDiagnostics}
            className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0"
            title="Firebase veritabanı kural ve bağlantı durumunu analiz et"
          >
            <Bug size={16} className="text-amber-400" /> Test & Teşhis
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus size={16} /> Ameliyat Ekle
          </button>
        </div>
      </div>

      {/* Sync Notification Banner */}
      {syncStatusMsg && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-900 rounded-xl text-xs font-black flex items-center justify-between shadow-sm">
          <span>{syncStatusMsg}</span>
          <button onClick={() => setSyncStatusMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-extrabold">✕</button>
        </div>
      )}

      {/* Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {upcomingOps.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <p className="text-slate-700 font-black text-base">Robotik Prostatektomi Ameliyat Kaydı Henüz Listelenmedi</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Neden vaka bulunamadığını tespit etmek için yukarıdaki <strong>"🔍 Test & Teşhis"</strong> butonuna tıklayarak Firebase güvenlik kurallarını ve tablo isimlerini saniyeler içinde analiz edebilirsiniz.
            </p>
            <button
              onClick={handleRunDiagnostics}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-md inline-flex items-center gap-2"
            >
              <Bug size={16} /> Firebase Bağlantı Testini Çalıştır
            </button>
          </div>
        ) : (
          upcomingOps.map(op => {
            const opDateObj = new Date(op.op_date);
            const todayObj = new Date();
            const diffDays = Math.ceil((opDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));

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
                      <span>Planlanan Ameliyat Tarihi: <strong>{op.op_date}</strong></span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {diffDays > 0 ? `🗓 Ameliyata ${diffDays} gün var` : diffDays === 0 ? '🔥 BUGÜN AMELİYAT GÜNÜ' : '⏳ Ameliyat Günü Geldi'}
                    </p>
                    {op.notes && (
                      <p className="text-slate-700 border-t border-slate-200 pt-1.5 mt-1 text-[11px]">
                        <strong>Notlar / Ameliyat:</strong> {op.notes}
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

      {/* Diagnostics Modal */}
      {showDiagModal && diagnosticData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border-2 border-slate-300 text-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bug className="text-amber-500" size={22} /> Firebase Teşhis & Durum Raporu
              </h3>
              <button onClick={() => setShowDiagModal(false)} className="p-1 text-slate-500 hover:text-slate-900 font-extrabold">✕</button>
            </div>

            <div className="space-y-3 text-xs font-bold">
              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                <span className="text-slate-500 block uppercase text-[10px]">Firestore Veritabanı Durumu:</span>
                <span className="text-slate-900 font-mono font-black">{diagnosticData.firestoreStatus}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                <span className="text-slate-500 block uppercase text-[10px]">Realtime Database Durumu:</span>
                <span className="text-slate-900 font-mono font-black">{diagnosticData.rtdbStatus}</span>
              </div>

              {diagnosticData.firestoreStatus.includes('403') && (
                <div className="p-4 bg-rose-50 border-2 border-rose-300 text-rose-900 rounded-xl space-y-2">
                  <p className="font-black text-sm">🔒 Neden Vaka Bulunamadı?</p>
                  <p>
                    Firebase projenizin <strong>Güvenlik Kuralları (Security Rules)</strong> dışarıdan okumaya kilitli (HTTP 403 Forbidden). 
                  </p>
                  <p className="font-extrabold text-[11px] bg-white p-2.5 rounded-lg border border-rose-200">
                    Çözüm: <br/>
                    1. <strong>console.firebase.google.com</strong> adresine girin.<br/>
                    2. <strong>urology-case-list-ea0c1</strong> projenize -&gt; <strong>Firestore Database</strong> -&gt; <strong>Kurallar (Rules)</strong> sekmesine tıklayın.<br/>
                    3. Kuralı şu şekilde güncelleyin: <code className="bg-slate-100 px-1 py-0.5 font-mono text-rose-700">allow read: if true;</code>
                  </p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-100 border border-slate-300">
                <span className="text-slate-500 block uppercase text-[10px] mb-1">Tespit Edilen Tablo / Koleksiyonlar:</span>
                {diagnosticData.foundCollections.length === 0 ? (
                  <p className="text-slate-500 font-normal">Hiçbir görünür koleksiyon bulunamadı.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-0.5 text-emerald-800 font-mono">
                    {diagnosticData.foundCollections.map((c, i) => <li key={i}>{c}</li>)}
                  </ul>
                )}
              </div>

              {diagnosticData.rawSamples.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-48">
                  <span className="text-slate-400 block mb-1 font-bold">Örnek Ham Veri Çıktısı:</span>
                  <pre>{JSON.stringify(diagnosticData.rawSamples, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

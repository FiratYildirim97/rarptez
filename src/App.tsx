import React, { useState, useEffect, useRef } from "react";
import Dashboard from "./Dashboard";
import PatientList from "./PatientList";
import PatientForm from "./PatientForm";
import RemindersPanel from "./RemindersPanel";
import ThesisStats from "./ThesisStats";
import { Patient, getInitialPatient } from "./types";
import { exportToExcel } from "./ExportUtils";
import { supabase } from "./supabaseClient";
import * as XLSX from "xlsx";
import { 
  LayoutDashboard, 
  Users, 
  PlusCircle, 
  Download, 
  Upload, 
  Menu, 
  ShieldCheck, 
  RefreshCw, 
  Globe,
  Bell,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [view, setView] = useState<"dashboard" | "list" | "form" | "reminders" | "thesis">("dashboard");
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch patients from Supabase
  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase Fetch Error:", error);
      } else if (data) {
        setPatients(data as Patient[]);
      }
    } catch (err) {
      console.error("Failed to connect to Supabase:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();

    // Realtime subscription
    const channel = supabase
      .channel('public:patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, () => {
        fetchPatients();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSavePatient = async (patient: Patient) => {
    if (patient.id) {
      const { error } = await supabase
        .from('patients')
        .update({
          ...patient,
          updated_at: new Date().toISOString()
        })
        .eq('id', patient.id);

      if (error) {
        alert("Güncelleme hatası: " + error.message);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from('patients')
        .insert([{
          ...patient,
          group_name: patient.group_name || 'HOOD'
        }])
        .select();

      if (error) {
        alert("Kayıt hatası: " + error.message);
        return;
      }
    }

    await fetchPatients();
    setEditingPatient(null);
    setView("list");
  };

  const handleDeletePatient = async (id: string) => {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Silme hatası: " + error.message);
    } else {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const importedPatients: Patient[] = [];

        for (const sheetName of ['HOOD', 'STANDART']) {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;
          const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

          for (let r = 2; r < rows.length; r++) {
            const row = rows[r];
            if (!row || !row[0]) continue;

            importedPatients.push({
              group_name: sheetName as "HOOD" | "STANDART",
              patient_name: String(row[0]).trim(),
              op_date: row[2] ? String(row[2]) : null,
              surgeon: row[3] ? String(row[3]) : 'FK',
              protocol: row[4] ? String(row[4]) : null,
              phone: row[6] ? String(row[6]) : null,
              age: row[8] ? Number(row[8]) : null,
              bmi: row[10] ? Number(row[10]) : null,
              comorbidity: row[12] ? String(row[12]) : 'Yok',
              psa_preop: row[14] ? Number(row[14]) : null,
              prostate_volume: row[16] ? Number(row[16]) : null,
              pirads: row[18] ? String(row[18]) : null,
              biopsy_isup: row[20] ? String(row[20]) : null,
              damico: row[22] ? String(row[22]) : null,
              iief_preop: row[24] ? Number(row[24]) : null,
              ipss_preop: row[26] ? Number(row[26]) : null,
              console_time: row[28] ? Number(row[28]) : null,
              blood_loss: row[30] ? Number(row[30]) : null,
              transfusion: row[32] ? Number(row[32]) : 0,
              lnd: row[34] ? Number(row[34]) : 0
            });
          }
        }

        if (importedPatients.length > 0) {
          if (confirm(`${importedPatients.length} yeni hasta Excel'den okundu. Supabase veritabanına eklensin mi?`)) {
            const { error } = await supabase.from('patients').insert(importedPatients);
            if (error) {
              alert("İçeri aktarma hatası: " + error.message);
            } else {
              alert(`Tebrikler! ${importedPatients.length} hasta kaydı veritabanına eklendi.`);
              fetchPatients();
            }
          }
        } else {
          alert("Excel dosyasından geçerli hasta kaydı okunamadı.");
        }
      } catch (err) {
        alert("Excel okuma hatası. Dosyanızın geçerli bir .xlsx dosyası olduğundan emin olun.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 p-4 gap-4">
      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900 text-white rounded-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        <div className="p-6 flex flex-col h-full">
          <div className="text-center mb-6">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-white block">RARP TEZ TAKİP</h1>
              <span className="text-[11px] text-blue-400 font-bold uppercase tracking-wider mt-1 block flex items-center justify-center gap-1">
                <Globe size={12} /> Supabase Veritabanı
              </span>
            </div>
          </div>

          <nav className="flex-1 space-y-2">
            <button
              onClick={() => { setView("dashboard"); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${
                view === "dashboard" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutDashboard size={18} /> İstatistik & Grafik Paneli
            </button>
            <button
              onClick={() => { setView("reminders"); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${
                view === "reminders" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Bell size={18} /> 🔔 Yaklaşan Kontroller
            </button>
            <button
              onClick={() => { setView("thesis"); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${
                view === "thesis" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileSpreadsheet size={18} /> 📊 Tez İstatistikleri (SPSS)
            </button>
            <button
              onClick={() => { setView("list"); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${
                view === "list" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Users size={18} /> Hasta Listesi ({patients.length})
            </button>
            <button
              onClick={() => { setEditingPatient(null); setView("form"); if (window.innerWidth < 1024) setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs ${
                view === "form" ? "bg-blue-600 text-white shadow-lg shadow-blue-600/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <PlusCircle size={18} /> Yeni Hasta Kaydı (HOOD)
            </button>
          </nav>

          <div className="mt-6 border-t border-slate-800 pt-5">
            <span className="px-2 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider block">Veri Yönetimi</span>
            <div className="space-y-1 mt-2">
              <button 
                onClick={() => exportToExcel(patients)}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-emerald-400 hover:bg-emerald-950/50 rounded-xl transition-colors font-bold"
              >
                <Download size={16} /> Excel (.xlsx) İndir
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-blue-400 hover:bg-blue-950/50 rounded-xl transition-colors font-bold"
              >
                <Upload size={16} /> Excel Yükle (Import)
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".xlsx,.xls" 
                onChange={handleImportExcel} 
              />
            </div>
          </div>

          <div className="mt-auto pt-5 border-t border-slate-800">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow">
                ÜA
              </div>
              <div>
                <span className="text-xs font-bold text-slate-100 block">Üroloji Anabilim Dalı</span>
                <span className="text-[10px] text-slate-400 block font-medium">Dr. Fırat Yıldırım</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[calc(100vh-2rem)] gap-4 overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border border-slate-200/80 rounded-2xl shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-base font-extrabold text-slate-900">
              {view === "dashboard" ? "İstatistik & Karşılaştırmalı Analiz Paneli" :
               view === "reminders" ? "🔔 Yaklaşan Kontrol Hatırlatıcı Paneli" :
               view === "thesis" ? "📊 Tez İstatistiksel Analiz Modülü (SPSS / t-test)" :
               view === "list" ? "Hasta Kayıt Veritabanı (Supabase)" :
               "Yeni Hasta Kayıt Portalı (Varsayılan: HOOD)"}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <button
              onClick={fetchPatients}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all font-semibold"
              title="Yenile"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-600" : ""} />
              <span className="hidden sm:inline">Canlı Yenile</span>
            </button>
            <button 
              onClick={() => { setEditingPatient(null); setView("form"); }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all font-bold"
            >
              + Yeni Hasta
            </button>
          </div>
        </header>

        {/* Content View */}
        <div className="flex-1 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {view === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Dashboard patients={patients} />
              </motion.div>
            )}

            {view === "reminders" && (
              <motion.div
                key="reminders"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <RemindersPanel patients={patients} />
              </motion.div>
            )}

            {view === "thesis" && (
              <motion.div
                key="thesis"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ThesisStats patients={patients} />
              </motion.div>
            )}

            {view === "list" && (
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PatientList 
                  patients={patients} 
                  onEdit={(p) => {
                    setEditingPatient(p);
                    setView("form");
                  }} 
                  onDelete={handleDeletePatient}
                  onAddNew={() => {
                    setEditingPatient(null);
                    setView("form");
                  }}
                />
              </motion.div>
            )}

            {view === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PatientForm 
                  initialData={editingPatient || getInitialPatient()} 
                  onSave={handleSavePatient}
                  onCancel={() => setView("list")}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

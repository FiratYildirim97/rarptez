import React from 'react';
import { Patient } from './types';
import { Activity, Users, Clock, Droplets, HeartPulse, Award } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps {
  patients: Patient[];
}

export default function Dashboard({ patients }: DashboardProps) {
  const hoodPatients = patients.filter(p => p.group_name === 'HOOD');
  const standartPatients = patients.filter(p => p.group_name === 'STANDART');

  const calcAvg = (arr: Patient[], key: keyof Patient) => {
    const valid = arr.map(p => Number(p[key])).filter(n => !isNaN(n) && n !== null && n !== 0);
    if (valid.length === 0) return 0;
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
  };

  // Trend data for IPSS
  const ipssTimeline = {
    labels: ['Preop', '1. Ay', '3. Ay', '6. Ay', '12. Ay'],
    datasets: [
      {
        label: 'HOOD Tekniği IPSS',
        data: [
          Number(calcAvg(hoodPatients, 'ipss_preop')),
          Number(calcAvg(hoodPatients, 'ipss_1m')),
          Number(calcAvg(hoodPatients, 'ipss_3m')),
          Number(calcAvg(hoodPatients, 'ipss_6m')),
          Number(calcAvg(hoodPatients, 'ipss_12m')),
        ],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.3,
        fill: true,
      },
      {
        label: 'STANDART Teknik IPSS',
        data: [
          Number(calcAvg(standartPatients, 'ipss_preop')),
          Number(calcAvg(standartPatients, 'ipss_1m')),
          Number(calcAvg(standartPatients, 'ipss_3m')),
          Number(calcAvg(standartPatients, 'ipss_6m')),
          Number(calcAvg(standartPatients, 'ipss_12m')),
        ],
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.15)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  // Trend data for IEEF-5
  const iiefTimeline = {
    labels: ['Preop', '1. Ay', '3. Ay', '6. Ay', '12. Ay'],
    datasets: [
      {
        label: 'HOOD Tekniği IEEF-5',
        data: [
          Number(calcAvg(hoodPatients, 'iief_preop')),
          Number(calcAvg(hoodPatients, 'iief_1m')),
          Number(calcAvg(hoodPatients, 'iief_3m')),
          Number(calcAvg(hoodPatients, 'iief_6m')),
          Number(calcAvg(hoodPatients, 'iief_12m')),
        ],
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
      },
      {
        label: 'STANDART Teknik IEEF-5',
        data: [
          Number(calcAvg(standartPatients, 'iief_preop')),
          Number(calcAvg(standartPatients, 'iief_1m')),
          Number(calcAvg(standartPatients, 'iief_3m')),
          Number(calcAvg(standartPatients, 'iief_6m')),
          Number(calcAvg(standartPatients, 'iief_12m')),
        ],
        borderColor: '#059669',
        backgroundColor: '#059669',
      },
    ],
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black tracking-wider text-blue-200">Toplam Kayıtlı Hasta</p>
              <h3 className="text-3xl font-black mt-1">{patients.length}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3 text-xs font-black">
            <span className="bg-white/20 px-3 py-1 rounded-lg">HOOD: {hoodPatients.length}</span>
            <span className="bg-white/20 px-3 py-1 rounded-lg">STANDART: {standartPatients.length}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black tracking-wider text-slate-600">Ort. Preop PSA</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {calcAvg(patients, 'psa_preop')} <span className="text-xs font-bold text-slate-600">ng/mL</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200">
              <HeartPulse size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-700 flex justify-between border-t border-slate-200 pt-2">
            <span>HOOD: <strong className="text-blue-700">{calcAvg(hoodPatients, 'psa_preop')}</strong></span>
            <span>STD: <strong className="text-emerald-700">{calcAvg(standartPatients, 'psa_preop')}</strong></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black tracking-wider text-slate-600">Ort. Konsol Süresi</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {calcAvg(patients, 'console_time')} <span className="text-xs font-bold text-slate-600">dk</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
              <Clock size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-700 flex justify-between border-t border-slate-200 pt-2">
            <span>HOOD: <strong className="text-blue-700">{calcAvg(hoodPatients, 'console_time')} dk</strong></span>
            <span>STD: <strong className="text-emerald-700">{calcAvg(standartPatients, 'console_time')} dk</strong></span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-black tracking-wider text-slate-600">Ort. Kan Kaybı</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {calcAvg(patients, 'blood_loss')} <span className="text-xs font-bold text-slate-600">mL</span>
              </h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center border border-rose-200">
              <Droplets size={24} />
            </div>
          </div>
          <div className="mt-4 text-xs font-bold text-slate-700 flex justify-between border-t border-slate-200 pt-2">
            <span>HOOD: <strong className="text-blue-700">{calcAvg(hoodPatients, 'blood_loss')} mL</strong></span>
            <span>STD: <strong className="text-emerald-700">{calcAvg(standartPatients, 'blood_loss')} mL</strong></span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Activity className="text-blue-600" size={18} /> IPSS (Semptom Skoru) Değişim Eğrisi
          </h3>
          <div className="h-64">
            <Line 
              data={ipssTimeline} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold' } } } } 
              }} 
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200">
          <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
            <Award className="text-emerald-600" size={18} /> IEEF-5 (Erektil İşlev) İyileşme Kıyası
          </h3>
          <div className="h-64">
            <Bar 
              data={iiefTimeline} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { font: { weight: 'bold' } } } } 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

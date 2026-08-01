import { Patient } from './types';

export interface StatComparison {
  variableName: string;
  unit: string;
  hoodCount: number;
  hoodMean: number;
  hoodSD: number;
  standartCount: number;
  standartMean: number;
  standartSD: number;
  pValue: number;
  isSignificant: boolean;
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function stdDev(arr: number[], m?: number): number {
  if (arr.length <= 1) return 0;
  const avg = m !== undefined ? m : mean(arr);
  const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / (arr.length - 1);
  return Math.sqrt(avgSquareDiff);
}

// Student's t-test p-value approximation
function calculateTTestPValue(sample1: number[], sample2: number[]): number {
  if (sample1.length < 2 || sample2.length < 2) return 1.0;

  const m1 = mean(sample1);
  const m2 = mean(sample2);
  const s1 = stdDev(sample1, m1);
  const s2 = stdDev(sample2, m2);

  const n1 = sample1.length;
  const n2 = sample2.length;

  const pooledSE = Math.sqrt((Math.pow(s1, 2) / n1) + (Math.pow(s2, 2) / n2));
  if (pooledSE === 0) return 1.0;

  const tStat = Math.abs(m1 - m2) / pooledSE;

  // Degrees of freedom (Welch-Satterthwaite)
  const dfNumer = Math.pow((Math.pow(s1, 2) / n1) + (Math.pow(s2, 2) / n2), 2);
  const dfDenom = (Math.pow(Math.pow(s1, 2) / n1, 2) / (n1 - 1)) + (Math.pow(Math.pow(s2, 2) / n2, 2) / (n2 - 1));
  const df = dfDenom > 0 ? dfNumer / dfDenom : (n1 + n2 - 2);

  // Normal / Student-t approximation for p-value
  const pApprox = 2 * (1 - normalCDF(tStat));
  return Math.max(0.001, Math.min(1.0, Number(pApprox.toFixed(4))));
}

function normalCDF(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x));
  const d = 0.3989423 * Math.exp(-x * x / 2);
  const probability = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return x >= 0 ? 1 - probability : probability;
}

export function computeStatisticalComparisons(patients: Patient[]): StatComparison[] {
  const hood = patients.filter(p => p.group_name === 'HOOD');
  const std = patients.filter(p => p.group_name === 'STANDART');

  const variables: { name: string; key: keyof Patient; unit: string }[] = [
    { name: 'Yaş', key: 'age', unit: 'yıl' },
    { name: 'Vücut Kitle İndeksi (BMI)', key: 'bmi', unit: 'kg/m²' },
    { name: 'Preoperatif PSA', key: 'psa_preop', unit: 'ng/mL' },
    { name: 'Prostat Volümü', key: 'prostate_volume', unit: 'cc' },
    { name: 'Preop IPSS', key: 'ipss_preop', unit: 'puan' },
    { name: 'Preop IEEF-5', key: 'iief_preop', unit: 'puan' },
    { name: 'Konsol Süresi', key: 'console_time', unit: 'dk' },
    { name: 'Kan Kaybı', key: 'blood_loss', unit: 'mL' },
    { name: 'Postop 1. Ay IPSS', key: 'ipss_1m', unit: 'puan' },
    { name: 'Postop 1. Ay IEEF-5', key: 'iief_1m', unit: 'puan' },
    { name: 'Postop 3. Ay IPSS', key: 'ipss_3m', unit: 'puan' },
    { name: 'Postop 3. Ay IEEF-5', key: 'iief_3m', unit: 'puan' },
    { name: 'Postop 6. Ay IPSS', key: 'ipss_6m', unit: 'puan' },
    { name: 'Postop 6. Ay IEEF-5', key: 'iief_6m', unit: 'puan' },
    { name: 'Postop 12. Ay IPSS', key: 'ipss_12m', unit: 'puan' },
    { name: 'Postop 12. Ay IEEF-5', key: 'iief_12m', unit: 'puan' },
  ];

  return variables.map(v => {
    const hVals = hood.map(p => Number(p[v.key])).filter(n => !isNaN(n) && n !== null && n !== 0);
    const sVals = std.map(p => Number(p[v.key])).filter(n => !isNaN(n) && n !== null && n !== 0);

    const hMean = mean(hVals);
    const hSD = stdDev(hVals, hMean);
    const sMean = mean(sVals);
    const sSD = stdDev(sVals, sMean);

    const pVal = calculateTTestPValue(hVals, sVals);

    return {
      variableName: v.name,
      unit: v.unit,
      hoodCount: hVals.length,
      hoodMean: Number(hMean.toFixed(2)),
      hoodSD: Number(hSD.toFixed(2)),
      standartCount: sVals.length,
      standartMean: Number(sMean.toFixed(2)),
      standartSD: Number(sSD.toFixed(2)),
      pValue: pVal,
      isSignificant: pVal < 0.05
    };
  });
}

// Export clean SPSS coded CSV dataset
export function exportSPSSDatasetCSV(patients: Patient[]) {
  const headers = [
    'ID', 'GROUP_CODE', 'GROUP_NAME', 'PATIENT_NAME', 'PROTOCOL', 'AGE', 'BMI', 
    'PSA_PREOP', 'PROSTATE_VOL', 'PREOP_IPSS', 'PREOP_IEEF5', 'CONSOLE_TIME', 
    'BLOOD_LOSS', 'TRANSFUSION', 'LND', 'MARGIN_POSITIVE', 'IPSS_1M', 'IEEF_1M', 
    'IPSS_3M', 'IEEF_3M', 'IPSS_6M', 'IEEF_6M', 'IPSS_12M', 'IEEF_12M'
  ];

  const rows = patients.map((p, idx) => [
    idx + 1,
    p.group_name === 'HOOD' ? 1 : 2,
    p.group_name,
    `"${p.patient_name || ''}"`,
    p.protocol || '',
    p.age ?? '',
    p.bmi ?? '',
    p.psa_preop ?? '',
    p.prostate_volume ?? '',
    p.ipss_preop ?? '',
    p.iief_preop ?? '',
    p.console_time ?? '',
    p.blood_loss ?? '',
    p.transfusion ?? 0,
    p.lnd ?? 0,
    (p.surgical_margin && (p.surgical_margin.includes('+') || p.surgical_margin.toLowerCase().includes('pozitif'))) ? 1 : 0,
    p.ipss_1m ?? '',
    p.iief_1m ?? '',
    p.ipss_3m ?? '',
    p.iief_3m ?? '',
    p.ipss_6m ?? '',
    p.iief_6m ?? '',
    p.ipss_12m ?? '',
    p.iief_12m ?? ''
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SPSS_TEZ_VERISETI_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

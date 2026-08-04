import { createClient } from '@supabase/supabase-js';
import { UpcomingOperation } from './types';

export const SECONDARY_SUPABASE_URL = 'https://nrmjqjmyyzkzcskdldph.supabase.co';
export const SECONDARY_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWpxam15eXpremNza2RsZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzUzMzMsImV4cCI6MjEwMTQ1MTMzM30.LaaPffBhRt5TwRn-Adzf8R5YtAbhI8Wf5ykYsdm0byk';

export const secondarySupabase = createClient(SECONDARY_SUPABASE_URL, SECONDARY_SUPABASE_ANON_KEY);

function toTrLowerCase(str: string): string {
  if (!str) return '';
  return String(str).toLocaleLowerCase('tr-TR');
}

function extractPatientName(d: any): string | null {
  if (!d || typeof d !== 'object') return null;

  const keys = [
    'patient_name', 'patientname', 'hasta_adi', 'hastaAdi', 'hasta', 
    'fullname', 'full_name', 'ad_soyad', 'adSoyad', 'name', 'hastaIsim', 
    'hasta_isim', 'ad', 'soyad', 'patient', 'nameSurname', 'title'
  ];

  for (const k of keys) {
    if (d[k] && typeof d[k] === 'string' && d[k].trim() !== '') {
      return d[k].trim();
    }
  }

  if (d.ad || d.first_name || d.firstName) {
    const first = d.ad || d.first_name || d.firstName || '';
    const last = d.soyad || d.last_name || d.lastName || '';
    const combined = `${first} ${last}`.trim();
    if (combined) return combined;
  }

  return null;
}

function extractProtocol(d: any): string | null {
  if (!d || typeof d !== 'object') return null;
  const keys = ['protocol', 'protokol', 'protocolNo', 'protokolNo', 'dosyaNo', 'dosya_no', 'tc', 'tcNo', 'tc_no', 'id', 'barcode'];
  for (const k of keys) {
    if (d[k] !== undefined && d[k] !== null && String(d[k]).trim() !== '') {
      return String(d[k]).trim();
    }
  }
  return null;
}

function extractPhone(d: any): string | null {
  if (!d || typeof d !== 'object') return null;
  const keys = ['phone', 'telefon', 'tel', 'phoneNumber', 'phone_number', 'gsm', 'mobile'];
  for (const k of keys) {
    if (d[k] && String(d[k]).trim() !== '') {
      return String(d[k]).trim();
    }
  }
  return null;
}

// Ultra-robust date parser: DD.MM.YYYY, DD/MM/YYYY, YYYY-MM-DD
function extractOpDate(d: any): string {
  if (!d || typeof d !== 'object') return new Date().toISOString().split('T')[0];
  
  const keys = ['date', 'op_date', 'opDate', 'tarih', 'ameliyatTarihi', 'ameliyat_tarihi', 'created_at', 'createdAt', 'time', 'surgery_date'];
  for (const k of keys) {
    if (d[k]) {
      const valStr = String(d[k]).trim();
      
      // If DD.MM.YYYY or DD.MM.YY
      if (valStr.includes('.')) {
        const parts = valStr.split('.');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          return `${year}-${month}-${day}`;
        }
      }
      
      // If DD/MM/YYYY or DD/MM/YY
      if (valStr.includes('/')) {
        const parts = valStr.split('/');
        if (parts.length === 3) {
          const day = parts[0].padStart(2, '0');
          const month = parts[1].padStart(2, '0');
          const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
          return `${year}-${month}-${day}`;
        }
      }

      // If YYYY-MM-DD or ISO
      if (valStr.length >= 10 && valStr.includes('-')) {
        return valStr.substring(0, 10);
      }
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractSurgeon(d: any): string {
  if (!d || typeof d !== 'object') return 'FK';
  const keys = ['professor', 'surgeon', 'cerrah', 'doktor', 'doctor', 'op_doctor', 'opDoctor'];
  for (const k of keys) {
    if (d[k] && String(d[k]).trim() !== '') {
      const val = String(d[k]).trim();
      const valLower = toTrLowerCase(val);
      if (valLower.includes('kalemci') || valLower.includes('msk') || valLower.includes('serdar') || valLower.includes('mustafa')) {
        return 'MSK';
      }
      if (valLower.includes('kızılay') || valLower.includes('kizilay') || valLower.includes('fk') || valLower.includes('fuat')) {
        return 'FK';
      }
      return val;
    }
  }
  return 'FK';
}

function extractNotes(d: any): string | null {
  if (!d || typeof d !== 'object') return null;
  const keys = ['operation', 'notes', 'notlar', 'aciklama', 'diagnose', 'tani', 'tanı', 'op_type', 'ameliyat', 'islem', 'surgery_type', 'description', 'title'];
  for (const k of keys) {
    if (d[k] && String(d[k]).trim() !== '') {
      return String(d[k]).trim();
    }
  }
  return null;
}

export async function fetchFromSecondarySupabase(minOpDate?: string | null): Promise<{ cases: UpcomingOperation[], rawError?: string, totalFound?: number, sampleItem?: any, debugInfo?: string }> {
  const cases: UpcomingOperation[] = [];
  
  // Set cutoff date to yesterday (2026-08-04) to prevent timezone edge cases from missing today's surgeries
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const cutoffDate = minOpDate ? minOpDate : yesterdayObj.toISOString().split('T')[0];

  try {
    const { data, error } = await secondarySupabase
      .from('surgeries')
      .select('*')
      .range(0, 10000);

    if (error) {
      console.error("Secondary Supabase surgeries fetch error:", error);
      return { cases: [], rawError: error.message };
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return { cases: [], totalFound: 0, debugInfo: "surgeries tablosu tamamen boş döndü." };
    }

    let matchedCount = 0;
    let skippedOldCount = 0;

    data.forEach((item, idx) => {
      // 1. NO KEYWORD FILTER: Fetch ALL surgeries in the table (no row is dropped due to operation name differences!)
      const opDate = extractOpDate(item);

      // 2. Filter ONLY surgeries where date >= cutoffDate (today & future)
      if (cutoffDate && opDate < cutoffDate) {
        skippedOldCount++;
        return;
      }

      matchedCount++;
      const patientName = extractPatientName(item);

      cases.push({
        id: `sec-sp-surgeries-${item.id || idx}`,
        patient_name: patientName || item.hasta || item.name || `Hasta (${item.protokol || idx})`,
        protocol: extractProtocol(item),
        phone: extractPhone(item),
        op_date: opDate,
        surgeon: extractSurgeon(item),
        notes: extractNotes(item),
        source: 'SECONDARY_SUPABASE',
        status: 'SCHEDULED'
      });
    });

    return { 
      cases, 
      totalFound: data.length, 
      sampleItem: data[0],
      debugInfo: `Veritabanında Okunan: ${data.length}, Gelecek Vakalar: ${matchedCount} (Geçmiş: ${skippedOldCount}).`
    };
  } catch (err: any) {
    return { cases: [], rawError: err.message };
  }
}

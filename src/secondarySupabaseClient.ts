import { createClient } from '@supabase/supabase-js';
import { UpcomingOperation } from './types';

export const SECONDARY_SUPABASE_URL = 'https://nrmjqjmyyxzkcskdldph.supabase.co';
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

function extractOpDate(d: any): string {
  if (!d || typeof d !== 'object') return new Date().toISOString().split('T')[0];
  const keys = ['date', 'op_date', 'opDate', 'tarih', 'ameliyatTarihi', 'ameliyat_tarihi', 'created_at', 'createdAt', 'time', 'surgery_date'];
  for (const k of keys) {
    if (d[k]) {
      const valStr = String(d[k]).trim();
      if (valStr.includes('.')) {
        const parts = valStr.split('.');
        if (parts.length === 3 && parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      if (valStr.includes('/')) {
        const parts = valStr.split('/');
        if (parts.length === 3 && parts[2].length === 4) {
          return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
        }
      }
      if (valStr.length >= 10) {
        return valStr.substring(0, 10);
      }
    }
  }
  return new Date().toISOString().split('T')[0];
}

function extractSurgeon(d: any): string {
  if (!d || typeof d !== 'object') return 'FK';
  const keys = ['surgeon', 'cerrah', 'doktor', 'doctor', 'op_doctor', 'opDoctor'];
  for (const k of keys) {
    if (d[k] && String(d[k]).trim() !== '') {
      return String(d[k]).trim();
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

function isRoboticProstatectomyCase(d: any): boolean {
  if (!d || typeof d !== 'object') return true;

  const operationText = d.operation ? toTrLowerCase(String(d.operation)) : toTrLowerCase(JSON.stringify(d));
  const keywords = ['robot rp', 'robotik rp', 'robotik radikal prostatektomi', 'prostatektomi', 'prostatectomy', 'rarp', 'radikal prostatektomi', 'robot', 'prostat'];
  
  for (const kw of keywords) {
    if (operationText.includes(toTrLowerCase(kw))) return true;
  }

  // Fallback to true if no operation column filtering is present
  return true;
}

export async function fetchFromSecondarySupabase(minOpDate?: string | null): Promise<{ cases: UpcomingOperation[], rawError?: string, totalFound?: number, sampleItem?: any }> {
  const cases: UpcomingOperation[] = [];

  try {
    const { data, error } = await secondarySupabase
      .from('surgeries')
      .select('*');

    if (error) {
      console.error("Secondary Supabase surgeries fetch error:", error);
      return { cases: [], rawError: error.message };
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return { cases: [], totalFound: 0 };
    }

    const sampleItem = data[0];

    data.forEach((item, idx) => {
      // Allow all robotic cases
      if (!isRoboticProstatectomyCase(item)) return;

      const opDate = extractOpDate(item);
      // If cutoff date is provided, filter op_date >= minOpDate
      if (minOpDate && opDate < minOpDate) return;

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

    return { cases, totalFound: data.length, sampleItem };
  } catch (err: any) {
    return { cases: [], rawError: err.message };
  }
}

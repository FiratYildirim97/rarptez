import { createClient } from '@supabase/supabase-js';
import { UpcomingOperation } from './types';

export const SECONDARY_SUPABASE_URL = 'https://nrmjqjmyyzkzcskdldph.supabase.co';
export const SECONDARY_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ybWpxam15eXpremNza2RsZHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NzUzMzMsImV4cCI6MjEwMTQ1MTMzM30.LaaPffBhRt5TwRn-Adzf8R5YtAbhI8Wf5ykYsdm0byk';

export const secondarySupabase = createClient(SECONDARY_SUPABASE_URL, SECONDARY_SUPABASE_ANON_KEY);

function toTrLowerCase(str: string): string {
  if (!str) return '';
  const s = String(str)
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .replace(/Ğ/g, 'ğ')
    .replace(/Ü/g, 'ü')
    .replace(/Ş/g, 'ş')
    .replace(/Ö/g, 'ö')
    .replace(/Ç/g, 'ç');
  return s.toLowerCase();
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

// Strictly extract actual operation date from 'date' column first
function extractOpDate(d: any): string {
  if (!d || typeof d !== 'object') return new Date().toISOString().split('T')[0];
  
  const dateVal = d.date || d.op_date || d.opDate || d.tarih || d.ameliyatTarihi || d.ameliyat_tarihi || d.surgery_date;
  
  if (dateVal) {
    const valStr = String(dateVal).trim();
    
    if (valStr.length >= 10 && valStr.includes('-')) {
      return valStr.substring(0, 10);
    }

    if (valStr.includes('.')) {
      const parts = valStr.split('.');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
      }
    }
    
    if (valStr.includes('/')) {
      const parts = valStr.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
        return `${year}-${month}-${day}`;
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

// STRICT CHECK: ONLY cases containing the word 'robot' anywhere in operation or record
function containsRobotKeyword(item: any): boolean {
  if (!item || typeof item !== 'object') return false;
  const rawOp = item.operation || item.op_type || item.ameliyat || item.title || item.notes || '';
  const fullText = JSON.stringify(item);
  const text1 = toTrLowerCase(String(rawOp));
  const text2 = toTrLowerCase(fullText);

  return text1.includes('robot') || text2.includes('robot');
}

export async function fetchFromSecondarySupabase(minOpDate?: string | null): Promise<{ cases: UpcomingOperation[], rawError?: string, totalFound?: number, sampleItem?: any, debugInfo?: string }> {
  const cases: UpcomingOperation[] = [];
  const cutoffDate = minOpDate || new Date().toISOString().split('T')[0];

  let allData: any[] = [];
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;
  let rawError: string | undefined;

  try {
    // Multi-page loop fetches all pages of 1,000 rows until the ENTIRE table is retrieved!
    while (hasMore && page < 20) {
      const { data, error } = await secondarySupabase
        .from('surgeries')
        .select('*')
        .order('date', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("Secondary Supabase page fetch error:", error);
        rawError = error.message;
        hasMore = false;
      } else if (data && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
      page++;
    }

    if (rawError && allData.length === 0) {
      return { cases: [], rawError };
    }

    if (allData.length === 0) {
      return { cases: [], totalFound: 0, debugInfo: "surgeries tablosu tamamen boş döndü." };
    }

    let matchedCount = 0;
    let skippedOldCount = 0;
    let skippedNotRobotCount = 0;

    allData.forEach((item, idx) => {
      // 1. STRICT: Only cases containing 'robot'
      if (!containsRobotKeyword(item)) {
        skippedNotRobotCount++;
        return;
      }

      // 2. Date >= cutoffDate (today & future)
      const opDate = extractOpDate(item);
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
      totalFound: allData.length, 
      sampleItem: allData[0],
      debugInfo: `Tüm Tablo Tarandı (${allData.length} vaka). Gelecek Robotik Ameliyat Sayısı: ${matchedCount} (${skippedOldCount} geçmiş vaka, ${skippedNotRobotCount} robotik olmayan elendi).`
    };
  } catch (err: any) {
    return { cases: [], rawError: err.message };
  }
}

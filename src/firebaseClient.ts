import { UpcomingOperation } from './types';

export const firebaseConfig = {
  apiKey: "AIzaSyA5EAs64RaRLZKdaRuZaxG_Gjo8g_ie2aY",
  authDomain: "urology-case-list-ea0c1.firebaseapp.com",
  projectId: "urology-case-list-ea0c1",
  storageBucket: "urology-case-list-ea0c1.firebasestorage.app",
  messagingSenderId: "733847900230",
  appId: "1:733847900230:web:6c6aa1d906be8dffbb7a47"
};

export interface DiagnosticResult {
  firestoreStatus: string;
  rtdbStatus: string;
  foundCollections: string[];
  rawSamples: any[];
  errorDetails?: string;
}

function getFieldValue(fieldObj: any): any {
  if (!fieldObj) return null;
  if (fieldObj.stringValue !== undefined) return fieldObj.stringValue;
  if (fieldObj.integerValue !== undefined) return fieldObj.integerValue;
  if (fieldObj.doubleValue !== undefined) return fieldObj.doubleValue;
  if (fieldObj.timestampValue !== undefined) return fieldObj.timestampValue;
  if (fieldObj.mapValue && fieldObj.mapValue.fields) {
    const res: any = {};
    Object.keys(fieldObj.mapValue.fields).forEach(k => {
      res[k] = getFieldValue(fieldObj.mapValue.fields[k]);
    });
    return res;
  }
  if (fieldObj.arrayValue && fieldObj.arrayValue.values) {
    return fieldObj.arrayValue.values.map((v: any) => getFieldValue(v));
  }
  return null;
}

function extractPatientName(d: any): string | null {
  if (!d || typeof d !== 'object') return null;

  const keys = [
    'hastaName', 'hasta_adi', 'hastaAdi', 'hasta', 'patientName', 'patient_name', 
    'fullname', 'full_name', 'ad_soyad', 'adSoyad', 'name', 'hastaIsim', 
    'hasta_isim', 'ad', 'soyad', 'patient', 'nameSurname', 'title', 'patient_fullname'
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
  const keys = ['op_date', 'opDate', 'date', 'tarih', 'ameliyatTarihi', 'ameliyat_tarihi', 'created_at', 'createdAt', 'time'];
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
  const keys = ['notes', 'notlar', 'aciklama', 'diagnose', 'tani', 'tanı', 'op_type', 'ameliyat', 'islem'];
  for (const k of keys) {
    if (d[k] && String(d[k]).trim() !== '') {
      return String(d[k]).trim();
    }
  }
  return null;
}

function isRoboticProstatectomyCase(d: any): boolean {
  if (!d || typeof d !== 'object') return true;
  const searchText = JSON.stringify(d).toLowerCase();
  const keywords = ['robot rp', 'robotik rp', 'robotik radikal prostatektomi', 'prostatektomi', 'prostatectomy', 'rarp', 'radikal prostatektomi', 'robot'];
  for (const kw of keywords) {
    if (searchText.includes(kw)) return true;
  }
  return true;
}

// REST API Diagnostic Inspector
export async function diagnoseFirebaseConnection(): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    firestoreStatus: 'Test Ediliyor...',
    rtdbStatus: 'Test Ediliyor...',
    foundCollections: [],
    rawSamples: []
  };

  const collectionsToTest = [
    'cases', 'ameliyatlar', 'patients', 'operations', 'surgeries', 
    'vaka_listesi', 'vakalar', 'urology_cases', 'vakalistesi', 'randevular', 
    'list', 'events', 'appointments', 'records', 'data', 'users'
  ];

  // 1. Test Firestore REST
  try {
    for (const colName of collectionsToTest) {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${colName}?key=${firebaseConfig.apiKey}`;
      const res = await fetch(url);

      if (res.status === 200) {
        result.firestoreStatus = 'Firestore Bağlantısı Başarılı ✅ (HTTP 200)';
        const data = await res.json();
        if (data.documents && data.documents.length > 0) {
          result.foundCollections.push(`Firestore: ${colName} (${data.documents.length} doküman)`);
          data.documents.slice(0, 3).forEach((d: any) => {
            const fieldsObj: any = {};
            if (d.fields) {
              Object.keys(d.fields).forEach(k => {
                fieldsObj[k] = getFieldValue(d.fields[k]);
              });
            }
            result.rawSamples.push({ source: `Firestore/${colName}`, id: d.name.split('/').pop(), data: fieldsObj });
          });
        }
      } else if (res.status === 403) {
        result.firestoreStatus = 'Firestore Kural Engeli 🔒 (HTTP 403 Permission Denied - Firebase Güvenlik Kuralları Okumayı Engelliyor)';
      }
    }

    if (result.foundCollections.length === 0 && !result.firestoreStatus.includes('403')) {
      result.firestoreStatus = 'Firestore Bağlantısı Açık Fakat Test Edilen Koleksiyon İsimlerinde Veri Bulunamadı';
    }
  } catch (err: any) {
    result.firestoreStatus = 'Firestore Bağlantı Uyarısı: ' + err.message;
  }

  // 2. Test Realtime DB REST
  const rtdbUrls = [
    `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/.json?key=${firebaseConfig.apiKey}`,
    `https://${firebaseConfig.projectId}.firebaseio.com/.json?key=${firebaseConfig.apiKey}`
  ];

  for (const rtdbUrl of rtdbUrls) {
    try {
      const res = await fetch(rtdbUrl);
      if (res.status === 200) {
        const data = await res.json();
        result.rtdbStatus = 'Realtime DB Bağlantısı Başarılı ✅ (HTTP 200)';
        if (data && typeof data === 'object') {
          Object.keys(data).forEach(k => {
            result.foundCollections.push(`RealtimeDB: ${k}`);
            result.rawSamples.push({ source: `RealtimeDB/${k}`, sampleData: data[k] });
          });
        }
      } else if (res.status === 401 || res.status === 403) {
        result.rtdbStatus = 'Realtime DB Kural Engeli 🔒 (HTTP 401/403 Permission Denied - Realtime DB Güvenlik Kuralı İzni Gerektiriyor)';
      }
    } catch (err: any) {
      result.rtdbStatus = 'Realtime DB Bağlantı Uyarısı: ' + err.message;
    }
  }

  return result;
}

export async function fetchFirebaseUpcomingCases(minOpDate?: string | null): Promise<UpcomingOperation[]> {
  const cases: UpcomingOperation[] = [];
  const cutoffDate = minOpDate || null;

  const possibleCollections = [
    'cases', 'ameliyatlar', 'patients', 'operations', 'surgeries', 
    'vaka_listesi', 'vakalar', 'urology_cases', 'vakalistesi', 'randevular', 'list', 'events', 'appointments'
  ];

  // 1. Fetch from Firestore REST API
  for (const colName of possibleCollections) {
    try {
      const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/${colName}?key=${firebaseConfig.apiKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.documents && Array.isArray(data.documents)) {
          data.documents.forEach((doc: any) => {
            const rawFields = doc.fields || {};
            const parsedObj: any = {};
            Object.keys(rawFields).forEach(k => {
              parsedObj[k] = getFieldValue(rawFields[k]);
            });

            if (!isRoboticProstatectomyCase(parsedObj)) return;

            const patientName = extractPatientName(parsedObj);
            const opDate = extractOpDate(parsedObj);

            if (cutoffDate && opDate < cutoffDate) return;

            const docId = doc.name.split('/').pop();

            cases.push({
              id: 'fb-fs-' + docId,
              patient_name: patientName || `Hasta (${parsedObj.protocol || parsedObj.protokol || docId})`,
              protocol: extractProtocol(parsedObj),
              phone: extractPhone(parsedObj),
              op_date: opDate,
              surgeon: extractSurgeon(parsedObj),
              notes: extractNotes(parsedObj),
              source: 'FIREBASE',
              status: 'SCHEDULED'
            });
          });
        }
      }
    } catch (err) {
      // Continue next
    }
  }

  // 2. Fetch from Realtime DB REST API if Firestore returned 0
  if (cases.length === 0) {
    const rtdbUrls = [
      `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/.json?key=${firebaseConfig.apiKey}`,
      `https://${firebaseConfig.projectId}.firebaseio.com/.json?key=${firebaseConfig.apiKey}`
    ];

    for (const rtdbUrl of rtdbUrls) {
      try {
        const res = await fetch(rtdbUrl);
        if (res.ok) {
          const rootData = await res.json();
          if (rootData && typeof rootData === 'object') {
            const processNode = (node: any, pathName: string) => {
              const items = Array.isArray(node) ? node : Object.keys(node).map(k => node[k]);
              
              items.forEach((item, idx) => {
                if (item && typeof item === 'object') {
                  if (!isRoboticProstatectomyCase(item)) return;

                  const patientName = extractPatientName(item);
                  const opDate = extractOpDate(item);

                  if (cutoffDate && opDate < cutoffDate) return;

                  cases.push({
                    id: `fb-rtdb-${pathName}-${idx}`,
                    patient_name: patientName || item.name || item.hasta || `Hasta (${item.protokol || idx})`,
                    protocol: extractProtocol(item),
                    phone: extractPhone(item),
                    op_date: opDate,
                    surgeon: extractSurgeon(item),
                    notes: extractNotes(item),
                    source: 'FIREBASE',
                    status: 'SCHEDULED'
                  });
                }
              });
            };

            Object.keys(rootData).forEach(key => {
              processNode(rootData[key], key);
            });
          }
        }
      } catch (err) {
        // Continue
      }
    }
  }

  return cases;
}

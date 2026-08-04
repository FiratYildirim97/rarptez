import { UpcomingOperation } from './types';

export const firebaseConfig = {
  apiKey: "AIzaSyA5EAs64RaRLZKdaRuZaxG_Gjo8g_ie2aY",
  authDomain: "urology-case-list-ea0c1.firebaseapp.com",
  projectId: "urology-case-list-ea0c1",
  storageBucket: "urology-case-list-ea0c1.firebasestorage.app",
  messagingSenderId: "733847900230",
  appId: "1:733847900230:web:6c6aa1d906be8dffbb7a47"
};

// Lightweight REST API connector for urology-case-list-ea0c1 Firebase project
export async function fetchFirebaseUpcomingCases(): Promise<UpcomingOperation[]> {
  const cases: UpcomingOperation[] = [];

  const possibleCollections = [
    'cases', 'ameliyatlar', 'patients', 'operations', 'surgeries', 
    'vaka_listesi', 'vakalar', 'urology_cases', 'vakalistesi', 'randevular'
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
            const fields = doc.fields || {};
            const parseVal = (f: any) => f?.stringValue || f?.integerValue || f?.doubleValue || null;

            const name = parseVal(fields.patient_name) || parseVal(fields.hasta_adi) || parseVal(fields.hasta) || parseVal(fields.name) || 'İsimsiz Hasta';
            const protocol = parseVal(fields.protocol) || parseVal(fields.protokol) || parseVal(fields.dosya_no);
            const phone = parseVal(fields.phone) || parseVal(fields.telefon) || parseVal(fields.tel);
            const date = parseVal(fields.op_date) || parseVal(fields.tarih) || parseVal(fields.date) || parseVal(fields.ameliyat_tarihi) || new Date().toISOString().split('T')[0];
            const surgeon = parseVal(fields.surgeon) || parseVal(fields.cerrah) || parseVal(fields.doktor) || 'FK';
            const notes = parseVal(fields.notes) || parseVal(fields.notlar) || parseVal(fields.aciklama);

            const docId = doc.name.split('/').pop();

            cases.push({
              id: 'fb-fs-' + docId,
              patient_name: name,
              protocol,
              phone,
              op_date: date,
              surgeon,
              notes,
              source: 'FIREBASE',
              status: 'SCHEDULED'
            });
          });
        }
      }
    } catch (err) {
      // Continue next collection
    }
  }

  // 2. Fetch from Realtime Database REST API if Firestore didn't yield results
  if (cases.length === 0) {
    const rtdbUrls = [
      `https://${firebaseConfig.projectId}.firebaseio.com/.json?key=${firebaseConfig.apiKey}`,
      `https://${firebaseConfig.projectId}-default-rtdb.firebaseio.com/.json?key=${firebaseConfig.apiKey}`
    ];

    for (const rtdbUrl of rtdbUrls) {
      try {
        const res = await fetch(rtdbUrl);
        if (res.ok) {
          const rootData = await res.json();
          if (rootData && typeof rootData === 'object') {
            const processNode = (node: any, pathName: string) => {
              if (Array.isArray(node)) {
                node.forEach((item, idx) => {
                  if (item && typeof item === 'object') {
                    cases.push({
                      id: `fb-rtdb-${pathName}-${idx}`,
                      patient_name: item.patient_name || item.hasta_adi || item.hasta || item.name || 'İsimsiz Hasta',
                      protocol: item.protocol || item.protokol || item.dosya_no || null,
                      phone: item.phone || item.telefon || item.tel || null,
                      op_date: item.op_date || item.tarih || item.date || new Date().toISOString().split('T')[0],
                      surgeon: item.surgeon || item.cerrah || 'FK',
                      notes: item.notes || item.notlar || null,
                      source: 'FIREBASE',
                      status: 'SCHEDULED'
                    });
                  }
                });
              } else if (typeof node === 'object') {
                Object.keys(node).forEach(k => {
                  const item = node[k];
                  if (item && typeof item === 'object') {
                    cases.push({
                      id: `fb-rtdb-${pathName}-${k}`,
                      patient_name: item.patient_name || item.hasta_adi || item.hasta || item.name || 'İsimsiz Hasta',
                      protocol: item.protocol || item.protokol || item.dosya_no || null,
                      phone: item.phone || item.telefon || item.tel || null,
                      op_date: item.op_date || item.tarih || item.date || new Date().toISOString().split('T')[0],
                      surgeon: item.surgeon || item.cerrah || 'FK',
                      notes: item.notes || item.notlar || null,
                      source: 'FIREBASE',
                      status: 'SCHEDULED'
                    });
                  }
                });
              }
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

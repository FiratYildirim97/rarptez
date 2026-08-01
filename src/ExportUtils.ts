import * as XLSX from 'xlsx';
import { Patient } from './types';

export function exportToExcel(patients: Patient[]) {
  const wb = XLSX.utils.book_new();

  const groups = ['HOOD', 'STANDART'] as const;

  groups.forEach(group => {
    const groupPatients = patients.filter(p => p.group_name === group);

    const sheetData: any[][] = [];

    // Row 1: Header Category Row
    const row1 = [
      "DEMOGRAFİK VERİLER", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "PREOPERATİF VERİLER", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "PEROPERATİF VERİLER", "", "", "", "", "", "", "",
      "POSTOPERATİF VERİLER", "", "", "", "", "", "", "", "", "",
      "POSTOP 1.AY", "", "", "", "", "",
      "POSTOP 3.AY", "", "", "", "", "",
      "POSTOP 6.AY", "", "", "", "", "",
      "POSTOP 12.AY"
    ];

    // Row 2: Sub-headers
    const row2 = [
      "HASTA ADI", "", "OPERASYON TARİHİ", "CERRAH", "PROTOKOL", "", "TELEFON NO", "", "YAŞ", "", "BMI", "", "EK HASTALIK", "",
      "PSA", "", "PROSTAT VOLÜMÜ", "", "PIRADS SKORU", "", "BİYOPSİ ISUP GRADE", "", "D'AMICO", "", "IEEF-5", "", "IPSS", "",
      "KONSOL SÜRESİ", "", "KAN KAYBI", "", "TRASNFÜZYON İHTİYACI", "", "LENF NODU DİSEKSİYONU", "",
      "PATOLOJİ", "", "CERRAHİ SINIR", "", "LENF NODU", "", "POSTOP PSA", "", "ADJUVAN TEDAVİ?", "",
      "IPSS", "", "IEEF-5", "", "İNKONTİNANS (KAÇ PED?)", "",
      "IPSS", "", "IEEF-5", "", "İNKONTİNANS (KAÇ PED?)", "",
      "IPSS", "", "IEEF-5", "", "İNKONTİNANS (KAÇ PED?)", "",
      "IPSS", "", "IEEF-5", "", "İNKONTİNANS (KAÇ PED?)"
    ];

    sheetData.push(row1);
    sheetData.push(row2);

    // Patient Rows
    groupPatients.forEach(p => {
      const r: any[] = new Array(70).fill("");
      r[0] = p.patient_name || "";
      r[2] = p.op_date_formatted || p.op_date || "";
      r[3] = p.surgeon || "FK";
      r[4] = p.protocol || "";
      r[6] = p.phone || "";
      r[8] = p.age ?? "";
      r[10] = p.bmi ?? "";
      r[12] = p.comorbidity ?? "";

      r[14] = p.psa_preop ?? "";
      r[16] = p.prostate_volume ?? "";
      r[18] = p.pirads ?? "";
      r[20] = p.biopsy_isup ?? "";
      r[22] = p.damico ?? "";
      r[24] = p.iief_preop ?? "";
      r[26] = p.ipss_preop ?? "";

      r[28] = p.console_time ?? "";
      r[30] = p.blood_loss ?? "";
      r[32] = p.transfusion ?? 0;
      r[34] = p.lnd ?? 0;

      r[36] = p.pathology ?? "";
      r[38] = p.surgical_margin ?? "";
      r[40] = p.lymph_node_postop ?? "";
      r[42] = p.postop_psa ?? "";
      r[44] = p.adjuvant_treatment ?? "";

      r[46] = p.ipss_1m ?? "";
      r[48] = p.iief_1m ?? "";
      r[50] = p.incontinence_1m ?? "";

      r[52] = p.ipss_3m ?? "";
      r[54] = p.iief_3m ?? "";
      r[56] = p.incontinence_3m ?? "";

      r[58] = p.ipss_6m ?? "";
      r[60] = p.iief_6m ?? "";
      r[62] = p.incontinence_6m ?? "";

      r[64] = p.ipss_12m ?? "";
      r[66] = p.iief_12m ?? "";
      r[68] = p.incontinence_12m ?? "";

      sheetData.push(r);
    });

    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(wb, ws, group);
  });

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `TEZ_EXCEL_GUNCEL_${dateStr}.xlsx`);
}

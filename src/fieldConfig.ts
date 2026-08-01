import { FieldDefinition, FieldType, RiskGroup, SmokingStatus, ASAScore, SurgicalTechnique, PSMStatus, ContinenceStatus } from "./types";

export const DEFAULT_TABS = [
  "Demografik",
  "Preop Veriler",
  "Biopsi Bulguları",
  "Cerrahi Bulgular",
  "Patoloji",
  "Fonksiyonel",
  "Onkolojik Takip",
  "Özet"
];

export const DEFAULT_FIELD_DEFINITIONS: FieldDefinition[] = [
  // Tab 0: Demografik
  { id: "1", name: "patient_id", label: "Hasta ID*", type: FieldType.TEXT, tab: "Demografik" },
  { id: "2", name: "age", label: "Yaş*", type: FieldType.NUMBER, tab: "Demografik" },
  { id: "3", name: "height", label: "Boy (cm)", type: FieldType.NUMBER, tab: "Demografik" },
  { id: "4", name: "weight", label: "Kilo (kg)", type: FieldType.NUMBER, tab: "Demografik" },
  { id: "5", name: "bmi", label: "BMI", type: FieldType.NUMBER, tab: "Demografik" },
  { id: "6", name: "asa_score", label: "ASA Skoru", type: FieldType.SELECT, tab: "Demografik", options: Object.values(ASAScore).map(v => ({ label: v, value: v })) },
  { id: "7", name: "smoking", label: "Sigara", type: FieldType.SELECT, tab: "Demografik", options: Object.values(SmokingStatus).map(v => ({ label: v, value: v })) },
  { id: "8", name: "diabetes", label: "Diyabet", type: FieldType.CHECKBOX, tab: "Demografik" },
  { id: "9", name: "ht", label: "Hipertansiyon", type: FieldType.CHECKBOX, tab: "Demografik" },
  { id: "10", name: "cad", label: "KAH (Koroner Arter)", type: FieldType.CHECKBOX, tab: "Demografik" },
  
  // Tab 1: Preop Veriler
  { id: "11", name: "preop_psa", label: "Preop PSA", type: FieldType.NUMBER, tab: "Preop Veriler" },
  { id: "12", name: "prostate_volume", label: "Prostat Volümü (cc)", type: FieldType.NUMBER, tab: "Preop Veriler" },
  { id: "13", name: "psad", label: "PSA Dansitesi", type: FieldType.NUMBER, tab: "Preop Veriler" },
  { id: "14", name: "nccn_risk_group", label: "NCCN Risk Grubu", type: FieldType.TEXT, tab: "Preop Veriler" },
  { id: "15", name: "damico", label: "D'Amico Risk Grubu", type: FieldType.SELECT, tab: "Preop Veriler", options: Object.values(RiskGroup).map(v => ({ label: v, value: v })) },
  
  // Tab 2: Biopsi
  { id: "16", name: "biopsy_gleason", label: "Biopsi Gleason", type: FieldType.TEXT, tab: "Biopsi Bulguları" },
  { id: "17", name: "total_cores", label: "Toplam Kor", type: FieldType.NUMBER, tab: "Biopsi Bulguları" },
  { id: "18", name: "positive_cores", label: "Pozitif Kor", type: FieldType.NUMBER, tab: "Biopsi Bulguları" },
  { id: "19", name: "positive_core_ratio", label: "Pozitif Kor Oranı", type: FieldType.NUMBER, tab: "Biopsi Bulguları" },
  
  // Tab 3: Cerrahi
  { id: "20", name: "surgical_technique", label: "Teknik", type: FieldType.SELECT, tab: "Cerrahi Bulgular", options: Object.values(SurgicalTechnique).map(v => ({ label: v, value: v })) },
  { id: "21", name: "operation_time", label: "Op. Süresi (dk)", type: FieldType.NUMBER, tab: "Cerrahi Bulgular" },
  { id: "22", name: "blood_loss", label: "Kan Kaybı (ml)", type: FieldType.NUMBER, tab: "Cerrahi Bulgular" },
  { id: "23", name: "nerve_sparing", label: "Sinir Koruma", type: FieldType.TEXT, tab: "Cerrahi Bulgular" },
  
  // Tab 4: Patoloji
  { id: "24", name: "pathology_gleason", label: "Patolojik Gleason", type: FieldType.TEXT, tab: "Patoloji" },
  { id: "25", name: "pt_stage", label: "pT Evre", type: FieldType.TEXT, tab: "Patoloji" },
  { id: "26", name: "pn_status", label: "pN Durumu", type: FieldType.TEXT, tab: "Patoloji" },
  { id: "27", name: "psm_status", label: "Cerrahi Sınır", type: FieldType.SELECT, tab: "Patoloji", options: Object.values(PSMStatus).map(v => ({ label: v, value: v })) },
  
  // Tab 5: Fonksiyonel
  { id: "28", name: "continence_3m", label: "3. Ay Kontinans", type: FieldType.SELECT, tab: "Fonksiyonel", options: Object.values(ContinenceStatus).map(v => ({ label: v, value: v })) },
  { id: "29", name: "continence_6m", label: "6. Ay Kontinans", type: FieldType.SELECT, tab: "Fonksiyonel", options: Object.values(ContinenceStatus).map(v => ({ label: v, value: v })) },
  { id: "30", name: "continence_12m", label: "12. Ay Kontinans", type: FieldType.SELECT, tab: "Fonksiyonel", options: Object.values(ContinenceStatus).map(v => ({ label: v, value: v })) },
  { id: "31", name: "iief_preop", label: "Preop IIEF-5", type: FieldType.NUMBER, tab: "Fonksiyonel" },
  { id: "32", name: "iief_12m", label: "12. Ay IIEF-5", type: FieldType.NUMBER, tab: "Fonksiyonel" },
  
  // Tab 6: Takip
  { id: "33", name: "bcr_status", label: "Biyokimyasal Nüks (BCR)", type: FieldType.CHECKBOX, tab: "Onkolojik Takip" },
  { id: "34", name: "bcr_date", label: "BCR Tarihi", type: FieldType.DATE, tab: "Onkolojik Takip" },
  { id: "35", name: "last_followup_date", label: "Son Takip Tarihi", type: FieldType.DATE, tab: "Onkolojik Takip" },
  { id: "36", name: "followup_duration_months", label: "Takip Süresi (Ay)", type: FieldType.NUMBER, tab: "Onkolojik Takip" }
];

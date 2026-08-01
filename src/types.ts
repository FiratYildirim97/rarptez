export enum SurgicalTechnique {
  HOOD = "HOOD",
  STANDART = "STANDART"
}

export interface Patient {
  id?: string;
  group_name: "HOOD" | "STANDART";
  patient_name: string;
  op_date?: string | null;
  op_date_formatted?: string | null;
  surgeon?: string | null;
  protocol?: string | null;
  phone?: string | null;
  age?: number | null;
  bmi?: number | null;
  comorbidity?: string | null;
  
  // Preop
  psa_preop?: number | null;
  prostate_volume?: number | null;
  pirads?: string | null;
  biopsy_isup?: string | null;
  damico?: string | null;
  iief_preop?: number | null;
  ipss_preop?: number | null;
  
  // Perop
  console_time?: number | null;
  blood_loss?: number | null;
  transfusion?: number; // 0 or 1
  lnd?: number; // 0 or 1
  
  // Postop
  pathology?: string | null;
  surgical_margin?: string | null;
  lymph_node_postop?: string | null;
  postop_psa?: number | null;
  adjuvant_treatment?: string | null;
  
  // Follow-ups
  ipss_1m?: number | null;
  iief_1m?: number | null;
  incontinence_1m?: string | null;
  
  ipss_3m?: number | null;
  iief_3m?: number | null;
  incontinence_3m?: string | null;
  
  ipss_6m?: number | null;
  iief_6m?: number | null;
  incontinence_6m?: string | null;
  
  ipss_12m?: number | null;
  iief_12m?: number | null;
  incontinence_12m?: string | null;
  
  created_at?: string;
  updated_at?: string;
}

export function getInitialPatient(): Patient {
  return {
    group_name: "HOOD", // Default technique as requested by user!
    patient_name: "",
    surgeon: "FK",
    protocol: "",
    phone: "",
    age: null,
    bmi: null,
    comorbidity: "",
    psa_preop: null,
    prostate_volume: null,
    pirads: "",
    biopsy_isup: "",
    damico: "",
    iief_preop: null,
    ipss_preop: null,
    console_time: null,
    blood_loss: null,
    transfusion: 0,
    lnd: 0,
    pathology: "",
    surgical_margin: "",
    lymph_node_postop: "",
    postop_psa: null,
    adjuvant_treatment: "Yok",
    ipss_1m: null,
    iief_1m: null,
    incontinence_1m: "",
    ipss_3m: null,
    iief_3m: null,
    incontinence_3m: "",
    ipss_6m: null,
    iief_6m: null,
    incontinence_6m: "",
    ipss_12m: null,
    iief_12m: null,
    incontinence_12m: ""
  };
}

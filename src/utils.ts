export function getInitialPatient() {
  return {
    group_name: "HOOD",
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

export function getWhatsAppLink(phone: string | null | undefined, patientName?: string) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // Format Turkish numbers
  if (digits.length === 10 && digits.startsWith('5')) {
    digits = '90' + digits;
  } else if (digits.length === 11 && digits.startsWith('05')) {
    digits = '90' + digits.substring(1);
  }

  const defaultMsg = patientName 
    ? encodeURIComponent(`Merhaba Sayın ${patientName}, Ege Üniversitesi Üroloji Anabilim Dalı'ndan ulaşmaktayız. Kontrol ve takip durumunuz hakkında bilgi almak isteriz.`)
    : '';

  return `https://wa.me/${digits}${defaultMsg ? `?text=${defaultMsg}` : ''}`;
}

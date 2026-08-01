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

export function getWhatsAppLink(phone: string | null | undefined, patientName?: string, surgeon?: string | null) {
  if (!phone) return null;
  let digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  // Format Turkish numbers
  if (digits.length === 10 && digits.startsWith('5')) {
    digits = '90' + digits;
  } else if (digits.length === 11 && digits.startsWith('05')) {
    digits = '90' + digits.substring(1);
  }

  // Determine assistant and surgeon intro title
  const surgeonUpper = (surgeon || '').toUpperCase().trim();
  let doctorTitle = "Dr. Fırat Yıldırım";

  if (surgeonUpper === 'FK' || surgeonUpper.includes('FUAT') || surgeonUpper.includes('KIZILAY')) {
    doctorTitle = "Doç. Dr. Fuat Kızılay'ın asistanı Dr. Fırat Yıldırım";
  } else if (surgeonUpper === 'MSK' || surgeonUpper.includes('MUSTAFA') || surgeonUpper.includes('KALEMCİ') || surgeonUpper.includes('KALEMCI')) {
    doctorTitle = "Doç. Dr. Mustafa Serdar Kalemci'nin asistanı Dr. Fırat Yıldırım";
  } else if (surgeonUpper) {
    doctorTitle = `${surgeonUpper} hocamızın asistanı Dr. Fırat Yıldırım`;
  }

  const pName = patientName ? patientName.trim() : 'Hasta';

  const rawMessage = `Merhaba Sayın ${pName}, ben Ege Üniversitesi Üroloji Anabilim Dalı'ndan ${doctorTitle}. Ameliyatınız sonrası kontrol ve takip durumunuz hakkında bilgi almak için iletişime geçiyorum. Müsait olduğunuzda dönüş yapabilirseniz sevinirim.`;

  return `https://wa.me/${digits}?text=${encodeURIComponent(rawMessage)}`;
}

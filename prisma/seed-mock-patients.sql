DO $$
DECLARE
  active_user RECORD;
  current_doctor_id TEXT;
BEGIN
  SELECT u."id", u."name", u."email"
  INTO active_user
  FROM "session" s
  JOIN "user" u ON u."id" = s."userId"
  WHERE s."expiresAt" > CURRENT_TIMESTAMP
  ORDER BY s."updatedAt" DESC
  LIMIT 1;

  IF active_user."id" IS NULL THEN
    RAISE EXCEPTION 'No active app session found. Sign in before seeding mock patients.';
  END IF;

  INSERT INTO "Doctor" ("id", "firstName", "lastName", "specialty", "userId", "email", "createdAt", "updatedAt")
  VALUES (
    'mock_doctor_' || md5(active_user."id"),
    split_part(active_user."name", ' ', 1),
    nullif(substr(active_user."name", length(split_part(active_user."name", ' ', 1)) + 2), ''),
    'Dentistry', active_user."id", active_user."email", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
  )
  ON CONFLICT ("userId") DO UPDATE SET
    "firstName" = EXCLUDED."firstName",
    "lastName" = EXCLUDED."lastName",
    "specialty" = EXCLUDED."specialty",
    "email" = EXCLUDED."email",
    "updatedAt" = CURRENT_TIMESTAMP;

  SELECT "id" INTO current_doctor_id FROM "Doctor" WHERE "userId" = active_user."id";

  INSERT INTO "Diagnosis" ("id", "code", "codeSystem", "name", "description")
  VALUES
    ('mock_diag_01', 'K02.9', 'ICD-10', 'Dental caries', 'Dental caries, unspecified'),
    ('mock_diag_02', 'K05.10', 'ICD-10', 'Gingivitis', 'Chronic gingivitis, plaque induced'),
    ('mock_diag_03', 'K04.7', 'ICD-10', 'Periapical abscess', 'Periapical abscess without sinus'),
    ('mock_diag_04', 'K08.89', 'ICD-10', 'Toothache', 'Other specified disorders of teeth and supporting structures'),
    ('mock_diag_05', 'S02.5XXA', 'ICD-10', 'Tooth fracture', 'Fracture of tooth, initial encounter'),
    ('mock_diag_06', 'K03.81', 'ICD-10', 'Cracked tooth', 'Cracked tooth'),
    ('mock_diag_07', 'K01.1', 'ICD-10', 'Impacted tooth', 'Impacted teeth'),
    ('mock_diag_08', 'K12.0', 'ICD-10', 'Oral ulcer', 'Recurrent oral aphthae'),
    ('mock_diag_09', 'K06.8', 'ICD-10', 'Gum inflammation', 'Other specified disorders of gingiva'),
    ('mock_diag_10', 'Z01.20', 'ICD-10', 'Dental examination', 'Encounter for dental examination'),
    ('mock_diag_11', 'K08.1', 'ICD-10', 'Missing teeth', 'Loss of teeth due to extraction or local periodontal disease'),
    ('mock_diag_12', 'K04.0', 'ICD-10', 'Pulpitis', 'Pulpitis')
  ON CONFLICT ("id") DO UPDATE SET
    "code" = EXCLUDED."code", "codeSystem" = EXCLUDED."codeSystem",
    "name" = EXCLUDED."name", "description" = EXCLUDED."description";

  INSERT INTO "Patient" ("id", "patientNumber", "firstName", "lastName", "dateOfBirth", "sex", "phone", "bloodGroup", "createdAt", "updatedAt")
  SELECT
    format('mock_patient_%s', lpad(n::text, 4, '0')),
    format('MOCK-2026-%s', lpad(n::text, 4, '0')),
    (ARRAY['Amina','Rafi','Nusrat','Tanvir','Sadia','Imran','Farhana','Mehedi','Jannat','Arif','Sumaiya','Fahim','Maliha','Sabbir','Nabila','Hasan','Tania','Rakib','Anika','Shakib'])[((n - 1) % 20) + 1],
    (ARRAY['Rahman','Ahmed','Chowdhury','Islam','Hossain','Akter','Khan','Uddin','Sarker','Karim'])[((n * 7 - 1) % 10) + 1],
    (CURRENT_DATE - ((18 + ((n * 13) % 55)) * INTERVAL '1 year') - (((n * 17) % 365) * INTERVAL '1 day'))::date,
    (ARRAY['FEMALE'::"Sex",'MALE'::"Sex",'FEMALE'::"Sex",'MALE'::"Sex",'OTHER'::"Sex"])[((n - 1) % 5) + 1],
    '01' || (700000000 + n)::text,
    (ARRAY['A+','B+','O+','AB+','A-','B-','O-','AB+'])[((n - 1) % 8) + 1],
    CURRENT_TIMESTAMP - (((n * 19) % 700) * INTERVAL '1 day'), CURRENT_TIMESTAMP
  FROM generate_series(1, 200) AS n
  ON CONFLICT ("patientNumber") DO UPDATE SET
    "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName",
    "dateOfBirth" = EXCLUDED."dateOfBirth", "sex" = EXCLUDED."sex",
    "phone" = EXCLUDED."phone", "bloodGroup" = EXCLUDED."bloodGroup",
    "createdAt" = EXCLUDED."createdAt", "updatedAt" = CURRENT_TIMESTAMP;

  INSERT INTO "Appointment" ("id", "patientId", "doctorId", "scheduledAt", "chiefComplaint", "notes", "createdAt", "updatedAt")
  SELECT
    format('mock_appt_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_patient_%s', lpad(p.n::text, 4, '0')),
    current_doctor_id,
    CURRENT_TIMESTAMP - (((p.n * 29 + v.visit_no * 73) % 1050) * INTERVAL '1 day'),
    (ARRAY['Tooth sensitivity','Routine dental check-up','Gum discomfort','Pain while chewing','Broken filling','Dental cleaning','Toothache','Follow-up examination'])[((p.n + v.visit_no - 2) % 8) + 1],
    'Synthetic demo visit; fictional patient data.',
    CURRENT_TIMESTAMP - (((p.n * 29 + v.visit_no * 73) % 1050) * INTERVAL '1 day'), CURRENT_TIMESTAMP
  FROM generate_series(1, 200) AS p(n)
  CROSS JOIN LATERAL generate_series(1, 1 + (p.n % 3)) AS v(visit_no)
  ON CONFLICT ("id") DO UPDATE SET
    "patientId" = EXCLUDED."patientId", "doctorId" = EXCLUDED."doctorId",
    "scheduledAt" = EXCLUDED."scheduledAt", "chiefComplaint" = EXCLUDED."chiefComplaint",
    "notes" = EXCLUDED."notes", "updatedAt" = CURRENT_TIMESTAMP;

  INSERT INTO "Prescription" (
    "id", "prescriptionNo", "patientId", "doctorId", "appointmentId", "issuedAt", "status",
    "chiefComplaint", "medicalHistory", "examination", "investigationNotes", "treatmentPlan",
    "clinicalNotes", "patientInstructions", "createdAt", "updatedAt"
  )
  SELECT
    format('mock_rx_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('MOCK-RX-2026-%s-%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_patient_%s', lpad(p.n::text, 4, '0')),
    current_doctor_id,
    format('mock_appt_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    CURRENT_TIMESTAMP - (((p.n * 29 + v.visit_no * 73) % 1050) * INTERVAL '1 day'),
    'ISSUED'::"PrescriptionStatus",
    (ARRAY['Tooth sensitivity','Routine dental check-up','Gum discomfort','Pain while chewing','Broken filling','Dental cleaning','Toothache','Follow-up examination'])[((p.n + v.visit_no - 2) % 8) + 1],
    'Fictional demo history; no known relevant medical history recorded.',
    (ARRAY['No acute distress; oral exam completed.','Mild local tenderness; oral exam completed.','Gingival irritation noted; oral exam completed.'])[((p.n + v.visit_no - 2) % 3) + 1],
    CASE WHEN (p.n + v.visit_no) % 4 = 0 THEN 'Dental radiograph reviewed as a fictional demo entry.' ELSE NULL END,
    (ARRAY['Preventive care and review in 6 months.','Oral hygiene advice and follow-up as needed.','Restorative assessment at next visit.','Continue routine dental care.'])[((p.n + v.visit_no - 2) % 4) + 1],
    'Synthetic demo record for dashboard/report development.',
    'Fictional data only; follow-up timing is sample content.',
    CURRENT_TIMESTAMP - (((p.n * 29 + v.visit_no * 73) % 1050) * INTERVAL '1 day'), CURRENT_TIMESTAMP
  FROM generate_series(1, 200) AS p(n)
  CROSS JOIN LATERAL generate_series(1, 1 + (p.n % 3)) AS v(visit_no)
  ON CONFLICT ("id") DO UPDATE SET
    "prescriptionNo" = EXCLUDED."prescriptionNo", "patientId" = EXCLUDED."patientId",
    "doctorId" = EXCLUDED."doctorId", "appointmentId" = EXCLUDED."appointmentId",
    "issuedAt" = EXCLUDED."issuedAt", "status" = EXCLUDED."status",
    "chiefComplaint" = EXCLUDED."chiefComplaint", "medicalHistory" = EXCLUDED."medicalHistory",
    "examination" = EXCLUDED."examination", "investigationNotes" = EXCLUDED."investigationNotes",
    "treatmentPlan" = EXCLUDED."treatmentPlan", "clinicalNotes" = EXCLUDED."clinicalNotes",
    "patientInstructions" = EXCLUDED."patientInstructions", "updatedAt" = CURRENT_TIMESTAMP;

  INSERT INTO "PrescriptionDiagnosis" ("id", "prescriptionId", "diagnosisId", "type", "notes", "isPrimary")
  SELECT
    format('mock_pd_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_rx_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_diag_%s', lpad((((p.n + v.visit_no - 2) % 12) + 1)::text, 2, '0')),
    'CONFIRMED'::"DiagnosisType", 'Synthetic demo diagnosis.', true
  FROM generate_series(1, 200) AS p(n)
  CROSS JOIN LATERAL generate_series(1, 1 + (p.n % 3)) AS v(visit_no)
  ON CONFLICT ("id") DO UPDATE SET
    "prescriptionId" = EXCLUDED."prescriptionId", "diagnosisId" = EXCLUDED."diagnosisId",
    "type" = EXCLUDED."type", "notes" = EXCLUDED."notes", "isPrimary" = EXCLUDED."isPrimary";

  INSERT INTO "PrescriptionMedication" (
    "id", "prescriptionId", "medicineName", "dose", "route", "frequency",
    "durationValue", "durationUnit", "instructions", "sortOrder"
  )
  SELECT
    format('mock_med_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_rx_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    CASE (p.n + v.visit_no) % 3
      WHEN 0 THEN 'Paracetamol (demo)'
      WHEN 1 THEN 'Chlorhexidine mouthwash (demo)'
      ELSE 'Ibuprofen (demo)'
    END,
    CASE (p.n + v.visit_no) % 3
      WHEN 1 THEN '0.2%'
      ELSE '500 mg'
    END,
    CASE WHEN (p.n + v.visit_no) % 3 = 1 THEN 'TOPICAL'::"MedicationRoute" ELSE 'ORAL'::"MedicationRoute" END,
    CASE WHEN (p.n + v.visit_no) % 3 = 1 THEN 'Twice daily' ELSE 'As needed (sample)' END,
    3, 'days', 'Synthetic demo medication; not a real prescription.', 0
  FROM generate_series(1, 200) AS p(n)
  CROSS JOIN LATERAL generate_series(1, 1 + (p.n % 3)) AS v(visit_no)
  ON CONFLICT ("id") DO UPDATE SET
    "prescriptionId" = EXCLUDED."prescriptionId", "medicineName" = EXCLUDED."medicineName",
    "dose" = EXCLUDED."dose", "route" = EXCLUDED."route", "frequency" = EXCLUDED."frequency",
    "durationValue" = EXCLUDED."durationValue", "durationUnit" = EXCLUDED."durationUnit",
    "instructions" = EXCLUDED."instructions", "sortOrder" = EXCLUDED."sortOrder";

  INSERT INTO "PrescriptionInvestigation" ("id", "prescriptionId", "investigationName", "type", "priority", "status")
  SELECT
    format('mock_inv_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    format('mock_rx_%s_%s', lpad(p.n::text, 4, '0'), v.visit_no),
    'Intraoral dental radiograph', 'IMAGING'::"InvestigationType",
    'ROUTINE'::"InvestigationPriority", 'COMPLETED'::"InvestigationStatus"
  FROM generate_series(1, 200) AS p(n)
  CROSS JOIN LATERAL generate_series(1, 1 + (p.n % 3)) AS v(visit_no)
  WHERE (p.n + v.visit_no) % 4 = 0
  ON CONFLICT ("id") DO UPDATE SET
    "prescriptionId" = EXCLUDED."prescriptionId", "investigationName" = EXCLUDED."investigationName",
    "type" = EXCLUDED."type", "priority" = EXCLUDED."priority", "status" = EXCLUDED."status";
END $$;

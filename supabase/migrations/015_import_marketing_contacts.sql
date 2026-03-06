-- Migration 015: Import/update marketing contacts list
-- Uses email + first_name matching to handle families sharing same email

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Galliano', 'Lorenzo', 'lorenzogalliano@me.com', '393335214275', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'lorenzogalliano@me.com' AND first_name = 'Lorenzo'
);
UPDATE users SET
  last_name = 'Galliano',
  phone = COALESCE(NULLIF('393335214275', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lorenzogalliano@me.com' AND first_name = 'Lorenzo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Bergamini', 'Christia', 'christia.bergamini@gmail.com', '393332104692', 'interessato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'christia.bergamini@gmail.com' AND first_name = 'Christia'
);
UPDATE users SET
  last_name = 'Bergamini',
  phone = COALESCE(NULLIF('393332104692', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'christia.bergamini@gmail.com' AND first_name = 'Christia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Lete', 'Diane', 'dianelete@hotmail.com', '3356957201', 'interessato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'dianelete@hotmail.com' AND first_name = 'Diane'
);
UPDATE users SET
  last_name = 'Lete',
  phone = COALESCE(NULLIF('3356957201', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'dianelete@hotmail.com' AND first_name = 'Diane';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Puricelli', 'Silvia', 'silviapuricelli79@gmail.com', '393665083971', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'silviapuricelli79@gmail.com' AND first_name = 'Silvia'
);
UPDATE users SET
  last_name = 'Puricelli',
  phone = COALESCE(NULLIF('393665083971', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'silviapuricelli79@gmail.com' AND first_name = 'Silvia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'نيارا', 'أوسينوفا Niyara.Useinova', 'n.useinova.chamber@gmail.com', '393935485982', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'n.useinova.chamber@gmail.com' AND first_name = 'أوسينوفا Niyara.Useinova'
);
UPDATE users SET
  last_name = 'نيارا',
  phone = COALESCE(NULLIF('393935485982', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'n.useinova.chamber@gmail.com' AND first_name = 'أوسينوفا Niyara.Useinova';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Joachimowicz', 'Agata', 'agata.joachim@gmail.com', '3465150763', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Agata'
);
UPDATE users SET
  last_name = 'Joachimowicz',
  phone = COALESCE(NULLIF('3465150763', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Agata';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Agnieszka', 'Longatti Letizia', 'agata.joachim@gmail.com', '3465150763', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Longatti Letizia'
);
UPDATE users SET
  last_name = 'Agnieszka',
  phone = COALESCE(NULLIF('3465150763', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Longatti Letizia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Raffaela', 'raffaferro@libero.it', '393381457311', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'raffaferro@libero.it' AND first_name = 'Raffaela'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393381457311', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'raffaferro@libero.it' AND first_name = 'Raffaela';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Ermatova', 'Zirek', 'ermatovazara@gmail.com', '393517410977', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ermatovazara@gmail.com' AND first_name = 'Zirek'
);
UPDATE users SET
  last_name = 'Ermatova',
  phone = COALESCE(NULLIF('393517410977', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ermatovazara@gmail.com' AND first_name = 'Zirek';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Mandaglio', 'Sonia', 'smandaglio@libero.it', '393388666102', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'smandaglio@libero.it' AND first_name = 'Sonia'
);
UPDATE users SET
  last_name = 'Mandaglio',
  phone = COALESCE(NULLIF('393388666102', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'smandaglio@libero.it' AND first_name = 'Sonia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Busana', 'Paolo', 'smandaglio@libero.it', '393388666102', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'smandaglio@libero.it' AND first_name = 'Paolo'
);
UPDATE users SET
  last_name = 'Busana',
  phone = COALESCE(NULLIF('393388666102', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'smandaglio@libero.it' AND first_name = 'Paolo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Sortino', 'Mary', 'sortino.maria@libero.it', '393466164916', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sortino.maria@libero.it' AND first_name = 'Mary'
);
UPDATE users SET
  last_name = 'Sortino',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Mary';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Albano', 'Emanuel', 'sortino.maria@libero.it', '393466164916', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sortino.maria@libero.it' AND first_name = 'Emanuel'
);
UPDATE users SET
  last_name = 'Albano',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Emanuel';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Turci', 'Edoardo', 'sortino.maria@libero.it', '393466164916', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sortino.maria@libero.it' AND first_name = 'Edoardo'
);
UPDATE users SET
  last_name = 'Turci',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Edoardo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Trombello', 'Paolo', 'studioplinio@libero.it', '393291664718', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'studioplinio@libero.it' AND first_name = 'Paolo'
);
UPDATE users SET
  last_name = 'Trombello',
  phone = COALESCE(NULLIF('393291664718', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'studioplinio@libero.it' AND first_name = 'Paolo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Trombello', 'Ines', 'studioplinio@libero.it', '393291664718', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'studioplinio@libero.it' AND first_name = 'Ines'
);
UPDATE users SET
  last_name = 'Trombello',
  phone = COALESCE(NULLIF('393291664718', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'studioplinio@libero.it' AND first_name = 'Ines';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Jane', 'Denise', 'surgelinks@gmail.com', '393886294932', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'surgelinks@gmail.com' AND first_name = 'Denise'
);
UPDATE users SET
  last_name = 'Jane',
  phone = COALESCE(NULLIF('393886294932', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'surgelinks@gmail.com' AND first_name = 'Denise';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Manuela', 'faramanu@hotmail.com', '393319313413', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'faramanu@hotmail.com' AND first_name = 'Manuela'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393319313413', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'faramanu@hotmail.com' AND first_name = 'Manuela';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Natalia', 'karpiuknatalia2@gmail.com', '393203321891', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'karpiuknatalia2@gmail.com' AND first_name = 'Natalia'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393203321891', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'karpiuknatalia2@gmail.com' AND first_name = 'Natalia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Donetti', 'Cecilia', 'cecilia.donetti@gmail.com', '393409750109', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cecilia.donetti@gmail.com' AND first_name = 'Cecilia'
);
UPDATE users SET
  last_name = 'Donetti',
  phone = COALESCE(NULLIF('393409750109', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'cecilia.donetti@gmail.com' AND first_name = 'Cecilia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Casati', 'Marco', 'markcasati1978@gmail.com', '393358367285', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'markcasati1978@gmail.com' AND first_name = 'Marco'
);
UPDATE users SET
  last_name = 'Casati',
  phone = COALESCE(NULLIF('393358367285', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'markcasati1978@gmail.com' AND first_name = 'Marco';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Hanna', 'Grace', 'grace.dossantos@tecnomat.it', '393459467200', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Grace'
);
UPDATE users SET
  last_name = 'Hanna',
  phone = COALESCE(NULLIF('393459467200', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Grace';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Cipollini', 'Nicole', 'grace.dossantos@tecnomat.it', '393459467200', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Nicole'
);
UPDATE users SET
  last_name = 'Cipollini',
  phone = COALESCE(NULLIF('393459467200', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Nicole';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Erika', 'erikabeng@gmail.com', '33769160946', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'erikabeng@gmail.com' AND first_name = 'Erika'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('33769160946', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'erikabeng@gmail.com' AND first_name = 'Erika';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'ezzahra', 'Fatima', 'fatimaezzahra.elouladi@gmail.com', '393513676463', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'fatimaezzahra.elouladi@gmail.com' AND first_name = 'Fatima'
);
UPDATE users SET
  last_name = 'ezzahra',
  phone = COALESCE(NULLIF('393513676463', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'fatimaezzahra.elouladi@gmail.com' AND first_name = 'Fatima';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Pace', 'Steven', 'gst.pace@icloud.com', '393931110068', 'interessato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'gst.pace@icloud.com' AND first_name = 'Steven'
);
UPDATE users SET
  last_name = 'Pace',
  phone = COALESCE(NULLIF('393931110068', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'gst.pace@icloud.com' AND first_name = 'Steven';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Pace', 'Leonardo', 'gst.pace@icloud.com', '393931110068', 'interessato', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'gst.pace@icloud.com' AND first_name = 'Leonardo'
);
UPDATE users SET
  last_name = 'Pace',
  phone = COALESCE(NULLIF('393931110068', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'gst.pace@icloud.com' AND first_name = 'Leonardo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Enrique', 'Colmenares H.', 'proxzzdesing@gmail.com', '393716149514', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'proxzzdesing@gmail.com' AND first_name = 'Colmenares H.'
);
UPDATE users SET
  last_name = 'Enrique',
  phone = COALESCE(NULLIF('393716149514', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'proxzzdesing@gmail.com' AND first_name = 'Colmenares H.';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Mytyanska', 'Lidiya', 'lidiya.mytyanska@gmail.com', '393338847336', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Lidiya'
);
UPDATE users SET
  last_name = 'Mytyanska',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Lidiya';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Marciano', 'Erik', 'lidiya.mytyanska@gmail.com', '393338847336', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Erik'
);
UPDATE users SET
  last_name = 'Marciano',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Erik';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Marciano', 'Elizabeth', 'lidiya.mytyanska@gmail.com', '393338847336', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Elizabeth'
);
UPDATE users SET
  last_name = 'Marciano',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Elizabeth';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Paolo', 'Bianchi Giovanni', 'lazzarimaddalena@gmail.com', '393408512172', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'lazzarimaddalena@gmail.com' AND first_name = 'Bianchi Giovanni'
);
UPDATE users SET
  last_name = 'Paolo',
  phone = COALESCE(NULLIF('393408512172', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lazzarimaddalena@gmail.com' AND first_name = 'Bianchi Giovanni';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'De', 'Marco Sara', 'famigliaciafani@gmail.com', '393471104982', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Marco Sara'
);
UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393471104982', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Marco Sara';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Ciafani', 'Irene', 'famigliaciafani@gmail.com', '393471104982', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Irene'
);
UPDATE users SET
  last_name = 'Ciafani',
  phone = COALESCE(NULLIF('393471104982', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Irene';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'di', 'Nuzzo Jolanda', 'studiodinuzzo@outlook.it', '393479571121', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'studiodinuzzo@outlook.it' AND first_name = 'Nuzzo Jolanda'
);
UPDATE users SET
  last_name = 'di',
  phone = COALESCE(NULLIF('393479571121', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'studiodinuzzo@outlook.it' AND first_name = 'Nuzzo Jolanda';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Zizzi', 'Marco', 'zizzi2001@libero.it', '393286753012', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'zizzi2001@libero.it' AND first_name = 'Marco'
);
UPDATE users SET
  last_name = 'Zizzi',
  phone = COALESCE(NULLIF('393286753012', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'zizzi2001@libero.it' AND first_name = 'Marco';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Amine', 'Mohamed', 'jolly212@hotmail.it', '393472235340', 'interessato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'jolly212@hotmail.it' AND first_name = 'Mohamed'
);
UPDATE users SET
  last_name = 'Amine',
  phone = COALESCE(NULLIF('393472235340', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'jolly212@hotmail.it' AND first_name = 'Mohamed';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Guo', 'Kelly', 'mengmeng_guo@yahoo.com', '393333358961', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'mengmeng_guo@yahoo.com' AND first_name = 'Kelly'
);
UPDATE users SET
  last_name = 'Guo',
  phone = COALESCE(NULLIF('393333358961', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'mengmeng_guo@yahoo.com' AND first_name = 'Kelly';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Occhiena', 'Caterina', 'caterina.occhiena72@gmail.com', '393384744744', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'caterina.occhiena72@gmail.com' AND first_name = 'Caterina'
);
UPDATE users SET
  last_name = 'Occhiena',
  phone = COALESCE(NULLIF('393384744744', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'caterina.occhiena72@gmail.com' AND first_name = 'Caterina';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Stra', 'King Itali Making', 'rabieabdallasaad@gmail.com', '393446777857', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'rabieabdallasaad@gmail.com' AND first_name = 'King Itali Making'
);
UPDATE users SET
  last_name = 'Stra',
  phone = COALESCE(NULLIF('393446777857', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rabieabdallasaad@gmail.com' AND first_name = 'King Itali Making';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Geraci', 'Leda', 'leda87@hotmail.it', '393494377296', 'interessato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'leda87@hotmail.it' AND first_name = 'Leda'
);
UPDATE users SET
  last_name = 'Geraci',
  phone = COALESCE(NULLIF('393494377296', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'leda87@hotmail.it' AND first_name = 'Leda';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Alamouri', 'Miloud', 'leda87@hotmail.it', '393494377296', 'interessato', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'leda87@hotmail.it' AND first_name = 'Miloud'
);
UPDATE users SET
  last_name = 'Alamouri',
  phone = COALESCE(NULLIF('393494377296', ''), phone),
  contact_status = 'interessato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'leda87@hotmail.it' AND first_name = 'Miloud';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Zazzi', 'Valeria', 'vzazzi1980@libero.it', '393483342767', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Valeria'
);
UPDATE users SET
  last_name = 'Zazzi',
  phone = COALESCE(NULLIF('393483342767', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Valeria';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Barbieri', 'Jacopo', 'vzazzi1980@libero.it', '393483342767', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Jacopo'
);
UPDATE users SET
  last_name = 'Barbieri',
  phone = COALESCE(NULLIF('393483342767', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Jacopo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'prudente', 'Inna', 'ikiriachuk@yahoo.it', '393462165258', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Inna'
);
UPDATE users SET
  last_name = 'prudente',
  phone = COALESCE(NULLIF('393462165258', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Inna';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Prudente', 'Isabel', 'ikiriachuk@yahoo.it', '393462165258', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Isabel'
);
UPDATE users SET
  last_name = 'Prudente',
  phone = COALESCE(NULLIF('393462165258', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Isabel';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'de', 'Lucchi Andrea', 'delucchiandrea@gmail.com', '393294287018', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Andrea'
);
UPDATE users SET
  last_name = 'de',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Andrea';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'De', 'Lucchi Tommaso', 'delucchiandrea@gmail.com', '393294287018', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Tommaso'
);
UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Tommaso';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'De', 'Lucchi Giancarlo', 'delucchiandrea@gmail.com', '393294287018', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Giancarlo'
);
UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Giancarlo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Cangelosi', 'Marco', 'marcocangelosi@hotmail.com', '393931710568', 'convertito', 'Mandato mail', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marcocangelosi@hotmail.com' AND first_name = 'Marco'
);
UPDATE users SET
  last_name = 'Cangelosi',
  phone = COALESCE(NULLIF('393931710568', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Mandato mail', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marcocangelosi@hotmail.com' AND first_name = 'Marco';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'ᖇOᔕᗩᑎᑎᗩ', 'rosannadinoia@yahoo.it', '393517263723', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'rosannadinoia@yahoo.it' AND first_name = 'ᖇOᔕᗩᑎᑎᗩ'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393517263723', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rosannadinoia@yahoo.it' AND first_name = 'ᖇOᔕᗩᑎᑎᗩ';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Pagliara', 'Chiara', 'chiarapagliara@icloud.com', '393476065341', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'chiarapagliara@icloud.com' AND first_name = 'Chiara'
);
UPDATE users SET
  last_name = 'Pagliara',
  phone = COALESCE(NULLIF('393476065341', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'chiarapagliara@icloud.com' AND first_name = 'Chiara';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Mattia', 'airoldi.mattia@gmail.com', '447546167283', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'airoldi.mattia@gmail.com' AND first_name = 'Mattia'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('447546167283', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'airoldi.mattia@gmail.com' AND first_name = 'Mattia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Sapia', 'Sonia', 'sapiasonia6@gmail.com', '393891909178', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sapiasonia6@gmail.com' AND first_name = 'Sonia'
);
UPDATE users SET
  last_name = 'Sapia',
  phone = COALESCE(NULLIF('393891909178', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sapiasonia6@gmail.com' AND first_name = 'Sonia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Elena', 'elena.mauri8@gmail.com', '393357701179', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Elena'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393357701179', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Elena';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'M.', 'Lo Piccolo Tommaso', 'elena.mauri8@gmail.com', '393357701179', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Lo Piccolo Tommaso'
);
UPDATE users SET
  last_name = 'M.',
  phone = COALESCE(NULLIF('393357701179', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Lo Piccolo Tommaso';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Sangiorgio', 'Erika', 'erika88erika@hotmail.it', '393332497221', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'erika88erika@hotmail.it' AND first_name = 'Erika'
);
UPDATE users SET
  last_name = 'Sangiorgio',
  phone = COALESCE(NULLIF('393332497221', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'erika88erika@hotmail.it' AND first_name = 'Erika';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Venuto', 'Debora', 'deboravenuto@libero.it', '393349026918', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'deboravenuto@libero.it' AND first_name = 'Debora'
);
UPDATE users SET
  last_name = 'Venuto',
  phone = COALESCE(NULLIF('393349026918', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'deboravenuto@libero.it' AND first_name = 'Debora';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Jiane', 'dolcevita.1981@libero.it', '393487869878', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Jiane'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Jiane';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Lee', 'Roa', 'dolcevita.1981@libero.it', '393487869878', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roa'
);
UPDATE users SET
  last_name = 'Lee',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roa';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Lee', 'Roon', 'dolcevita.1981@libero.it', '393487869878', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roon'
);
UPDATE users SET
  last_name = 'Lee',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roon';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Oregioni', 'Sara', 'saraoregioni@gmail.com', '393388284277', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Sara'
);
UPDATE users SET
  last_name = 'Oregioni',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Sara';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Paggi', 'Alessia', 'saraoregioni@gmail.com', '393388284277', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Alessia'
);
UPDATE users SET
  last_name = 'Paggi',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Alessia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Paggi', 'Beatrice', 'saraoregioni@gmail.com', '393388284277', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Beatrice'
);
UPDATE users SET
  last_name = 'Paggi',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Beatrice';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'L.', 'Urso Rosa', 'rosaursom600@gmail.com', '393337647507', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Urso Rosa'
);
UPDATE users SET
  last_name = 'L.',
  phone = COALESCE(NULLIF('393337647507', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Urso Rosa';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Vassallo', 'Federico', 'rosaursom600@gmail.com', '393337647507', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Federico'
);
UPDATE users SET
  last_name = 'Vassallo',
  phone = COALESCE(NULLIF('393337647507', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Federico';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Abdul', 'Majida', 'orbs.wilt-5h@icloud.com', '393312108663', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'orbs.wilt-5h@icloud.com' AND first_name = 'Majida'
);
UPDATE users SET
  last_name = 'Abdul',
  phone = COALESCE(NULLIF('393312108663', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'orbs.wilt-5h@icloud.com' AND first_name = 'Majida';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Brambilla', 'Grazia', 'gra_apollo@yahoo.it', '393490734700', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Grazia'
);
UPDATE users SET
  last_name = 'Brambilla',
  phone = COALESCE(NULLIF('393490734700', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Grazia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Cigardi', 'Riccardo', 'gra_apollo@yahoo.it', '393490734700', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Riccardo'
);
UPDATE users SET
  last_name = 'Cigardi',
  phone = COALESCE(NULLIF('393490734700', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Riccardo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Brandsdottir', 'Brandis', 'brandsdottir@gmail.com', '3201633459', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'brandsdottir@gmail.com' AND first_name = 'Brandis'
);
UPDATE users SET
  last_name = 'Brandsdottir',
  phone = COALESCE(NULLIF('3201633459', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'brandsdottir@gmail.com' AND first_name = 'Brandis';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Marcotto', 'Pier', 'marcotto.pierfrancesco@gmail.com', '393318178213', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Pier'
);
UPDATE users SET
  last_name = 'Marcotto',
  phone = COALESCE(NULLIF('393318178213', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Pier';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Sofia', 'Marcotto Bianca', 'marcotto.pierfrancesco@gmail.com', '393318178213', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Marcotto Bianca'
);
UPDATE users SET
  last_name = 'Sofia',
  phone = COALESCE(NULLIF('393318178213', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Marcotto Bianca';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Maria', 'La', 'maria.tazi313@gmail.com', '393514141731', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'maria.tazi313@gmail.com' AND first_name = 'La'
);
UPDATE users SET
  last_name = 'Maria',
  phone = COALESCE(NULLIF('393514141731', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'maria.tazi313@gmail.com' AND first_name = 'La';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Ludmilla', 'Profiti Irene', 'irene.profiti@alice.it', '393383680500', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'irene.profiti@alice.it' AND first_name = 'Profiti Irene'
);
UPDATE users SET
  last_name = 'Ludmilla',
  phone = COALESCE(NULLIF('393383680500', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'irene.profiti@alice.it' AND first_name = 'Profiti Irene';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'McIntyre', 'Liam', 'liamcintyre111@yahoo.com', '393382640551', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'liamcintyre111@yahoo.com' AND first_name = 'Liam'
);
UPDATE users SET
  last_name = 'McIntyre',
  phone = COALESCE(NULLIF('393382640551', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'liamcintyre111@yahoo.com' AND first_name = 'Liam';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Vyo', 'Viki', 'vikystetco90@gmail.com', '393291661312', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vikystetco90@gmail.com' AND first_name = 'Viki'
);
UPDATE users SET
  last_name = 'Vyo',
  phone = COALESCE(NULLIF('393291661312', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vikystetco90@gmail.com' AND first_name = 'Viki';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Frigerio', 'Myriam', 'myriam.frigerio@gmail.com', '393497808109', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Myriam'
);
UPDATE users SET
  last_name = 'Frigerio',
  phone = COALESCE(NULLIF('393497808109', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Myriam';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Lombardi', 'Alessio', 'myriam.frigerio@gmail.com', '393497808109', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Alessio'
);
UPDATE users SET
  last_name = 'Lombardi',
  phone = COALESCE(NULLIF('393497808109', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Alessio';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Wilken', 'Julia', 'juliawilkendesign@gmail.com', '491742006593', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'juliawilkendesign@gmail.com' AND first_name = 'Julia'
);
UPDATE users SET
  last_name = 'Wilken',
  phone = COALESCE(NULLIF('491742006593', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'juliawilkendesign@gmail.com' AND first_name = 'Julia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Iabangi', 'Tatiana', 'ribacika@hotmail.com', '393891587258', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'ribacika@hotmail.com' AND first_name = 'Tatiana'
);
UPDATE users SET
  last_name = 'Iabangi',
  phone = COALESCE(NULLIF('393891587258', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ribacika@hotmail.com' AND first_name = 'Tatiana';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Demian', '| Design Narcisa', 'narcisademian@yahoo.it', '393471184412', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'narcisademian@yahoo.it' AND first_name = '| Design Narcisa'
);
UPDATE users SET
  last_name = 'Demian',
  phone = COALESCE(NULLIF('393471184412', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'narcisademian@yahoo.it' AND first_name = '| Design Narcisa';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Poli', 'Sebastian', 'narcisademian@yahoo.it', '393471184412', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'narcisademian@yahoo.it' AND first_name = 'Sebastian'
);
UPDATE users SET
  last_name = 'Poli',
  phone = COALESCE(NULLIF('393471184412', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'narcisademian@yahoo.it' AND first_name = 'Sebastian';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT '', 'Loana', 'logolds@gmail.com', '393485342946', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'logolds@gmail.com' AND first_name = 'Loana'
);
UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393485342946', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'logolds@gmail.com' AND first_name = 'Loana';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Figueira', 'Leo', 'logolds@gmail.com', '393485342946', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'logolds@gmail.com' AND first_name = 'Leo'
);
UPDATE users SET
  last_name = 'Figueira',
  phone = COALESCE(NULLIF('393485342946', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'logolds@gmail.com' AND first_name = 'Leo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Belcastro', 'Claudia', 'belcastroclaudia8@gmail.com', '393478417550', 'contattato', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'belcastroclaudia8@gmail.com' AND first_name = 'Claudia'
);
UPDATE users SET
  last_name = 'Belcastro',
  phone = COALESCE(NULLIF('393478417550', ''), phone),
  contact_status = 'contattato',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'belcastroclaudia8@gmail.com' AND first_name = 'Claudia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Introzzi', 'Jacqueline', 'j.introzzi.as@gmail.com', '393388411732', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Jacqueline'
);
UPDATE users SET
  last_name = 'Introzzi',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Jacqueline';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Peiti', 'Isabel', 'j.introzzi.as@gmail.com', '393388411732', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Isabel'
);
UPDATE users SET
  last_name = 'Peiti',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Isabel';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Peiti', 'Karen', 'j.introzzi.as@gmail.com', '393388411732', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Karen'
);
UPDATE users SET
  last_name = 'Peiti',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Karen';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Dudko', 'Tatiana', 'tanya_d@hotmail.it', '393927008381', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Tatiana'
);
UPDATE users SET
  last_name = 'Dudko',
  phone = COALESCE(NULLIF('393927008381', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Tatiana';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Bilen', 'Michail', 'tanya_d@hotmail.it', '393927008381', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Michail'
);
UPDATE users SET
  last_name = 'Bilen',
  phone = COALESCE(NULLIF('393927008381', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Michail';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Crina', 'Bianca Orza', 'crina14orza@yahoo.com', '40720045149', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Bianca Orza'
);
UPDATE users SET
  last_name = 'Crina',
  phone = COALESCE(NULLIF('40720045149', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Bianca Orza';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Orza', 'Anda', 'crina14orza@yahoo.com', '40720045149', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Anda'
);
UPDATE users SET
  last_name = 'Orza',
  phone = COALESCE(NULLIF('40720045149', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Anda';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Falzone', 'Carla', 'carlafalzone@alice.it', '393495744060', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'carlafalzone@alice.it' AND first_name = 'Carla'
);
UPDATE users SET
  last_name = 'Falzone',
  phone = COALESCE(NULLIF('393495744060', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'carlafalzone@alice.it' AND first_name = 'Carla';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Manfroi', 'Giancarlo Giorgio', 'carlafalzone@alice.it', '393495744060', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'carlafalzone@alice.it' AND first_name = 'Giancarlo Giorgio'
);
UPDATE users SET
  last_name = 'Manfroi',
  phone = COALESCE(NULLIF('393495744060', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'carlafalzone@alice.it' AND first_name = 'Giancarlo Giorgio';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Guerra', 'Enrica', 'kika01_e@libero.it', '393408692292', 'perso', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'kika01_e@libero.it' AND first_name = 'Enrica'
);
UPDATE users SET
  last_name = 'Guerra',
  phone = COALESCE(NULLIF('393408692292', ''), phone),
  contact_status = 'perso',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'kika01_e@libero.it' AND first_name = 'Enrica';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Lanticina', 'Elena', 'elelan77@yahoo.it', '347/3003083', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elelan77@yahoo.it' AND first_name = 'Elena'
);
UPDATE users SET
  last_name = 'Lanticina',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Elena';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Molteni', 'Viola', 'elelan77@yahoo.it', '347/3003083', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elelan77@yahoo.it' AND first_name = 'Viola'
);
UPDATE users SET
  last_name = 'Molteni',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Viola';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Molteni', 'Filippo', 'elelan77@yahoo.it', '347/3003083', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'elelan77@yahoo.it' AND first_name = 'Filippo'
);
UPDATE users SET
  last_name = 'Molteni',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Filippo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Oleksandra', 'Demchenko', 'alexa.demch@gmail.com', '+41764163829', 'convertito', 'Lingua inglese - Svizzera', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Demchenko'
);
UPDATE users SET
  last_name = 'Oleksandra',
  phone = COALESCE(NULLIF('+41764163829', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Lingua inglese - Svizzera', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Demchenko';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Vanoni', 'Léonard', 'alexa.demch@gmail.com', '+41764163829', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Léonard'
);
UPDATE users SET
  last_name = 'Vanoni',
  phone = COALESCE(NULLIF('+41764163829', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Léonard';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Serediuk', 'Taras', 'serediuk323100@gmail.com', '+380503231000', 'convertito', 'Lugano', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Taras'
);
UPDATE users SET
  last_name = 'Serediuk',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Lugano', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Taras';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Serediuk', 'Ivan', 'serediuk323100@gmail.com', '+380503231000', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Ivan'
);
UPDATE users SET
  last_name = 'Serediuk',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Ivan';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Artem', 'Serediuk', 'serediuk323100@gmail.com', '+380503231000', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Serediuk'
);
UPDATE users SET
  last_name = 'Artem',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Serediuk';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Montagna', 'Marina', 'marina_montagna@virgilio.it', '', 'convertito', 'Non possono più venire per gara sci - organizzare prova gratuita', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Marina'
);
UPDATE users SET
  last_name = 'Montagna',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Non possono più venire per gara sci - organizzare prova gratuita', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Marina';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Ronchi', 'Laura', 'marina_montagna@virgilio.it', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Laura'
);
UPDATE users SET
  last_name = 'Ronchi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Laura';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Ronchi', 'Rachele', 'marina_montagna@virgilio.it', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Rachele'
);
UPDATE users SET
  last_name = 'Ronchi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Rachele';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Zaffaroni', 'Maurizio', 'zaffaroni@alldigitalmz.it', '3356349552', 'convertito', 'Vera è la nipote, lui gioca a golf ma non è socio', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Maurizio'
);
UPDATE users SET
  last_name = 'Zaffaroni',
  phone = COALESCE(NULLIF('3356349552', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Vera è la nipote, lui gioca a golf ma non è socio', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Maurizio';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Graziani', 'Vera', 'zaffaroni@alldigitalmz.it', '3356349552', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Vera'
);
UPDATE users SET
  last_name = 'Graziani',
  phone = COALESCE(NULLIF('3356349552', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Vera';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Boffi', 'Luca', 'luca.boffi@lucaboffi.it', '', 'convertito', 'Gemelli, il papà gioca', 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Luca'
);
UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE('Gemelli, il papà gioca', notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Luca';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Boffi', 'Lucia', 'luca.boffi@lucaboffi.it', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Lucia'
);
UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Lucia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Boffi', 'Paolo', 'luca.boffi@lucaboffi.it', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Paolo'
);
UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Paolo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Stella', 'Cristian', 'cristian-stella@hotmail.com', '3342391442', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Cristian'
);
UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Cristian';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Stella', 'William', 'cristian-stella@hotmail.com', '3342391442', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'William'
);
UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'William';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Stella', 'Francesco', 'cristian-stella@hotmail.com', '3342391442', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Francesco'
);
UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Francesco';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Stella', 'Leonardo', 'cristian-stella@hotmail.com', '3342391442', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Leonardo'
);
UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Leonardo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Venuto', 'Debora', 'debora.venuto@gmail.com', '3349026918', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Debora'
);
UPDATE users SET
  last_name = 'Venuto',
  phone = COALESCE(NULLIF('3349026918', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Debora';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Rinaudo', 'Giulia', 'debora.venuto@gmail.com', '3349026918', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Giulia'
);
UPDATE users SET
  last_name = 'Rinaudo',
  phone = COALESCE(NULLIF('3349026918', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Giulia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Borzi', 'Viki', 'vikystetco@gmail.com', '3291661312', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vikystetco@gmail.com' AND first_name = 'Viki'
);
UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Viki';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Borzi', 'Davide', 'vikystetco@gmail.com', '3291661312', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vikystetco@gmail.com' AND first_name = 'Davide'
);
UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Davide';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Borzi', 'Lucia', 'vikystetco@gmail.com', '3291661312', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'vikystetco@gmail.com' AND first_name = 'Lucia'
);
UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Lucia';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Kurzlechner', 'Sandra', 'sandra.kurzlechner@gmail.com', '', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Sandra'
);
UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Sandra';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Kurzlechner', 'Alizee', 'sandra.kurzlechner@gmail.com', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alizee'
);
UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alizee';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Kurzlechner', 'Alexa', 'sandra.kurzlechner@gmail.com', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alexa'
);
UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alexa';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Kurzlechner', 'Alenie', 'sandra.kurzlechner@gmail.com', '', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alenie'
);
UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alenie';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Russo', 'Manuela', 'manuzza2001@yahoo.it', '3666282637', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Manuela'
);
UPDATE users SET
  last_name = 'Russo',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Manuela';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Alloca', 'Francesco', 'manuzza2001@yahoo.it', '3666282637', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Francesco'
);
UPDATE users SET
  last_name = 'Alloca',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Francesco';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Alloca', 'Leonardo', 'manuzza2001@yahoo.it', '3666282637', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Leonardo'
);
UPDATE users SET
  last_name = 'Alloca',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Leonardo';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Pozzi', 'Cristina', 'pozzicristiana@gmail.com', '3914191197', 'convertito', NULL, 'adulto', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Cristina'
);
UPDATE users SET
  last_name = 'Pozzi',
  phone = COALESCE(NULLIF('3914191197', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('adulto', member_type)
WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Cristina';

INSERT INTO users (last_name, first_name, email, phone, contact_status, notes, member_type, is_member)
SELECT 'Cappello', 'Pozzi Enea', 'pozzicristiana@gmail.com', '3914191197', 'convertito', NULL, 'giovane', false
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Pozzi Enea'
);
UPDATE users SET
  last_name = 'Cappello',
  phone = COALESCE(NULLIF('3914191197', ''), phone),
  contact_status = 'convertito',
  notes = COALESCE(NULL, notes),
  member_type = COALESCE('giovane', member_type)
WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Pozzi Enea';

NOTIFY pgrst, 'reload schema';
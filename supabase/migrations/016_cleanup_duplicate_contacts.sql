-- Migration 016: Remove duplicate contacts created by migration 015
-- and update existing contacts with correct data

-- Step 1: Delete duplicate rows created by migration 015
-- For each (email, first_name) group, keep oldest record and delete newer duplicates
DELETE FROM users
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (PARTITION BY email, first_name ORDER BY created_at ASC) AS rn
    FROM users
    WHERE is_member = false
      AND email IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Step 2: Update remaining contacts with correct data from import list
UPDATE users SET
  last_name = 'Galliano',
  phone = COALESCE(NULLIF('393335214275', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lorenzogalliano@me.com' AND first_name = 'Lorenzo' AND is_member = false;

UPDATE users SET
  last_name = 'Bergamini',
  phone = COALESCE(NULLIF('393332104692', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'christia.bergamini@gmail.com' AND first_name = 'Christia' AND is_member = false;

UPDATE users SET
  last_name = 'Lete',
  phone = COALESCE(NULLIF('3356957201', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'dianelete@hotmail.com' AND first_name = 'Diane' AND is_member = false;

UPDATE users SET
  last_name = 'Puricelli',
  phone = COALESCE(NULLIF('393665083971', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'silviapuricelli79@gmail.com' AND first_name = 'Silvia' AND is_member = false;

UPDATE users SET
  last_name = 'نيارا',
  phone = COALESCE(NULLIF('393935485982', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'n.useinova.chamber@gmail.com' AND first_name = 'أوسينوفا Niyara.Useinova' AND is_member = false;

UPDATE users SET
  last_name = 'Joachimowicz',
  phone = COALESCE(NULLIF('3465150763', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Agata' AND is_member = false;

UPDATE users SET
  last_name = 'Agnieszka',
  phone = COALESCE(NULLIF('3465150763', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'agata.joachim@gmail.com' AND first_name = 'Longatti Letizia' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393381457311', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'raffaferro@libero.it' AND first_name = 'Raffaela' AND is_member = false;

UPDATE users SET
  last_name = 'Ermatova',
  phone = COALESCE(NULLIF('393517410977', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ermatovazara@gmail.com' AND first_name = 'Zirek' AND is_member = false;

UPDATE users SET
  last_name = 'Mandaglio',
  phone = COALESCE(NULLIF('393388666102', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'smandaglio@libero.it' AND first_name = 'Sonia' AND is_member = false;

UPDATE users SET
  last_name = 'Busana',
  phone = COALESCE(NULLIF('393388666102', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'smandaglio@libero.it' AND first_name = 'Paolo' AND is_member = false;

UPDATE users SET
  last_name = 'Sortino',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Mary' AND is_member = false;

UPDATE users SET
  last_name = 'Albano',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Emanuel' AND is_member = false;

UPDATE users SET
  last_name = 'Turci',
  phone = COALESCE(NULLIF('393466164916', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sortino.maria@libero.it' AND first_name = 'Edoardo' AND is_member = false;

UPDATE users SET
  last_name = 'Trombello',
  phone = COALESCE(NULLIF('393291664718', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'studioplinio@libero.it' AND first_name = 'Paolo' AND is_member = false;

UPDATE users SET
  last_name = 'Trombello',
  phone = COALESCE(NULLIF('393291664718', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'studioplinio@libero.it' AND first_name = 'Ines' AND is_member = false;

UPDATE users SET
  last_name = 'Jane',
  phone = COALESCE(NULLIF('393886294932', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'surgelinks@gmail.com' AND first_name = 'Denise' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393319313413', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'faramanu@hotmail.com' AND first_name = 'Manuela' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393203321891', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'karpiuknatalia2@gmail.com' AND first_name = 'Natalia' AND is_member = false;

UPDATE users SET
  last_name = 'Donetti',
  phone = COALESCE(NULLIF('393409750109', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'cecilia.donetti@gmail.com' AND first_name = 'Cecilia' AND is_member = false;

UPDATE users SET
  last_name = 'Casati',
  phone = COALESCE(NULLIF('393358367285', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'markcasati1978@gmail.com' AND first_name = 'Marco' AND is_member = false;

UPDATE users SET
  last_name = 'Hanna',
  phone = COALESCE(NULLIF('393459467200', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Grace' AND is_member = false;

UPDATE users SET
  last_name = 'Cipollini',
  phone = COALESCE(NULLIF('393459467200', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'grace.dossantos@tecnomat.it' AND first_name = 'Nicole' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('33769160946', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'erikabeng@gmail.com' AND first_name = 'Erika' AND is_member = false;

UPDATE users SET
  last_name = 'ezzahra',
  phone = COALESCE(NULLIF('393513676463', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'fatimaezzahra.elouladi@gmail.com' AND first_name = 'Fatima' AND is_member = false;

UPDATE users SET
  last_name = 'Pace',
  phone = COALESCE(NULLIF('393931110068', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'gst.pace@icloud.com' AND first_name = 'Steven' AND is_member = false;

UPDATE users SET
  last_name = 'Pace',
  phone = COALESCE(NULLIF('393931110068', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'gst.pace@icloud.com' AND first_name = 'Leonardo' AND is_member = false;

UPDATE users SET
  last_name = 'Enrique',
  phone = COALESCE(NULLIF('393716149514', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'proxzzdesing@gmail.com' AND first_name = 'Colmenares H.' AND is_member = false;

UPDATE users SET
  last_name = 'Mytyanska',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Lidiya' AND is_member = false;

UPDATE users SET
  last_name = 'Marciano',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Erik' AND is_member = false;

UPDATE users SET
  last_name = 'Marciano',
  phone = COALESCE(NULLIF('393338847336', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'lidiya.mytyanska@gmail.com' AND first_name = 'Elizabeth' AND is_member = false;

UPDATE users SET
  last_name = 'Paolo',
  phone = COALESCE(NULLIF('393408512172', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'lazzarimaddalena@gmail.com' AND first_name = 'Bianchi Giovanni' AND is_member = false;

UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393471104982', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Marco Sara' AND is_member = false;

UPDATE users SET
  last_name = 'Ciafani',
  phone = COALESCE(NULLIF('393471104982', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'famigliaciafani@gmail.com' AND first_name = 'Irene' AND is_member = false;

UPDATE users SET
  last_name = 'di',
  phone = COALESCE(NULLIF('393479571121', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'studiodinuzzo@outlook.it' AND first_name = 'Nuzzo Jolanda' AND is_member = false;

UPDATE users SET
  last_name = 'Zizzi',
  phone = COALESCE(NULLIF('393286753012', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'zizzi2001@libero.it' AND first_name = 'Marco' AND is_member = false;

UPDATE users SET
  last_name = 'Amine',
  phone = COALESCE(NULLIF('393472235340', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'jolly212@hotmail.it' AND first_name = 'Mohamed' AND is_member = false;

UPDATE users SET
  last_name = 'Guo',
  phone = COALESCE(NULLIF('393333358961', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'mengmeng_guo@yahoo.com' AND first_name = 'Kelly' AND is_member = false;

UPDATE users SET
  last_name = 'Occhiena',
  phone = COALESCE(NULLIF('393384744744', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'caterina.occhiena72@gmail.com' AND first_name = 'Caterina' AND is_member = false;

UPDATE users SET
  last_name = 'Stra',
  phone = COALESCE(NULLIF('393446777857', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rabieabdallasaad@gmail.com' AND first_name = 'King Itali Making' AND is_member = false;

UPDATE users SET
  last_name = 'Geraci',
  phone = COALESCE(NULLIF('393494377296', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'leda87@hotmail.it' AND first_name = 'Leda' AND is_member = false;

UPDATE users SET
  last_name = 'Alamouri',
  phone = COALESCE(NULLIF('393494377296', ''), phone),
  contact_status = 'interessato',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'leda87@hotmail.it' AND first_name = 'Miloud' AND is_member = false;

UPDATE users SET
  last_name = 'Zazzi',
  phone = COALESCE(NULLIF('393483342767', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Valeria' AND is_member = false;

UPDATE users SET
  last_name = 'Barbieri',
  phone = COALESCE(NULLIF('393483342767', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vzazzi1980@libero.it' AND first_name = 'Jacopo' AND is_member = false;

UPDATE users SET
  last_name = 'prudente',
  phone = COALESCE(NULLIF('393462165258', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Inna' AND is_member = false;

UPDATE users SET
  last_name = 'Prudente',
  phone = COALESCE(NULLIF('393462165258', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'ikiriachuk@yahoo.it' AND first_name = 'Isabel' AND is_member = false;

UPDATE users SET
  last_name = 'de',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Andrea' AND is_member = false;

UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Tommaso' AND is_member = false;

UPDATE users SET
  last_name = 'De',
  phone = COALESCE(NULLIF('393294287018', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'delucchiandrea@gmail.com' AND first_name = 'Lucchi Giancarlo' AND is_member = false;

UPDATE users SET
  last_name = 'Cangelosi',
  phone = COALESCE(NULLIF('393931710568', ''), phone),
  contact_status = 'convertito',
  notes = 'Mandato mail',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marcocangelosi@hotmail.com' AND first_name = 'Marco' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393517263723', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rosannadinoia@yahoo.it' AND first_name = 'ᖇOᔕᗩᑎᑎᗩ' AND is_member = false;

UPDATE users SET
  last_name = 'Pagliara',
  phone = COALESCE(NULLIF('393476065341', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'chiarapagliara@icloud.com' AND first_name = 'Chiara' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('447546167283', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'airoldi.mattia@gmail.com' AND first_name = 'Mattia' AND is_member = false;

UPDATE users SET
  last_name = 'Sapia',
  phone = COALESCE(NULLIF('393891909178', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sapiasonia6@gmail.com' AND first_name = 'Sonia' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393357701179', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Elena' AND is_member = false;

UPDATE users SET
  last_name = 'M.',
  phone = COALESCE(NULLIF('393357701179', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elena.mauri8@gmail.com' AND first_name = 'Lo Piccolo Tommaso' AND is_member = false;

UPDATE users SET
  last_name = 'Sangiorgio',
  phone = COALESCE(NULLIF('393332497221', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'erika88erika@hotmail.it' AND first_name = 'Erika' AND is_member = false;

UPDATE users SET
  last_name = 'Venuto',
  phone = COALESCE(NULLIF('393349026918', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'deboravenuto@libero.it' AND first_name = 'Debora' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Jiane' AND is_member = false;

UPDATE users SET
  last_name = 'Lee',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roa' AND is_member = false;

UPDATE users SET
  last_name = 'Lee',
  phone = COALESCE(NULLIF('393487869878', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'dolcevita.1981@libero.it' AND first_name = 'Roon' AND is_member = false;

UPDATE users SET
  last_name = 'Oregioni',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Sara' AND is_member = false;

UPDATE users SET
  last_name = 'Paggi',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Alessia' AND is_member = false;

UPDATE users SET
  last_name = 'Paggi',
  phone = COALESCE(NULLIF('393388284277', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'saraoregioni@gmail.com' AND first_name = 'Beatrice' AND is_member = false;

UPDATE users SET
  last_name = 'L.',
  phone = COALESCE(NULLIF('393337647507', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Urso Rosa' AND is_member = false;

UPDATE users SET
  last_name = 'Vassallo',
  phone = COALESCE(NULLIF('393337647507', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'rosaursom600@gmail.com' AND first_name = 'Federico' AND is_member = false;

UPDATE users SET
  last_name = 'Abdul',
  phone = COALESCE(NULLIF('393312108663', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'orbs.wilt-5h@icloud.com' AND first_name = 'Majida' AND is_member = false;

UPDATE users SET
  last_name = 'Brambilla',
  phone = COALESCE(NULLIF('393490734700', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Grazia' AND is_member = false;

UPDATE users SET
  last_name = 'Cigardi',
  phone = COALESCE(NULLIF('393490734700', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'gra_apollo@yahoo.it' AND first_name = 'Riccardo' AND is_member = false;

UPDATE users SET
  last_name = 'Brandsdottir',
  phone = COALESCE(NULLIF('3201633459', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'brandsdottir@gmail.com' AND first_name = 'Brandis' AND is_member = false;

UPDATE users SET
  last_name = 'Marcotto',
  phone = COALESCE(NULLIF('393318178213', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Pier' AND is_member = false;

UPDATE users SET
  last_name = 'Sofia',
  phone = COALESCE(NULLIF('393318178213', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marcotto.pierfrancesco@gmail.com' AND first_name = 'Marcotto Bianca' AND is_member = false;

UPDATE users SET
  last_name = 'Maria',
  phone = COALESCE(NULLIF('393514141731', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'maria.tazi313@gmail.com' AND first_name = 'La' AND is_member = false;

UPDATE users SET
  last_name = 'Ludmilla',
  phone = COALESCE(NULLIF('393383680500', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'irene.profiti@alice.it' AND first_name = 'Profiti Irene' AND is_member = false;

UPDATE users SET
  last_name = 'McIntyre',
  phone = COALESCE(NULLIF('393382640551', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'liamcintyre111@yahoo.com' AND first_name = 'Liam' AND is_member = false;

UPDATE users SET
  last_name = 'Vyo',
  phone = COALESCE(NULLIF('393291661312', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vikystetco90@gmail.com' AND first_name = 'Viki' AND is_member = false;

UPDATE users SET
  last_name = 'Frigerio',
  phone = COALESCE(NULLIF('393497808109', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Myriam' AND is_member = false;

UPDATE users SET
  last_name = 'Lombardi',
  phone = COALESCE(NULLIF('393497808109', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'myriam.frigerio@gmail.com' AND first_name = 'Alessio' AND is_member = false;

UPDATE users SET
  last_name = 'Wilken',
  phone = COALESCE(NULLIF('491742006593', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'juliawilkendesign@gmail.com' AND first_name = 'Julia' AND is_member = false;

UPDATE users SET
  last_name = 'Iabangi',
  phone = COALESCE(NULLIF('393891587258', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'ribacika@hotmail.com' AND first_name = 'Tatiana' AND is_member = false;

UPDATE users SET
  last_name = 'Demian',
  phone = COALESCE(NULLIF('393471184412', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'narcisademian@yahoo.it' AND first_name = '| Design Narcisa' AND is_member = false;

UPDATE users SET
  last_name = 'Poli',
  phone = COALESCE(NULLIF('393471184412', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'narcisademian@yahoo.it' AND first_name = 'Sebastian' AND is_member = false;

UPDATE users SET
  last_name = '',
  phone = COALESCE(NULLIF('393485342946', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'logolds@gmail.com' AND first_name = 'Loana' AND is_member = false;

UPDATE users SET
  last_name = 'Figueira',
  phone = COALESCE(NULLIF('393485342946', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'logolds@gmail.com' AND first_name = 'Leo' AND is_member = false;

UPDATE users SET
  last_name = 'Belcastro',
  phone = COALESCE(NULLIF('393478417550', ''), phone),
  contact_status = 'contattato',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'belcastroclaudia8@gmail.com' AND first_name = 'Claudia' AND is_member = false;

UPDATE users SET
  last_name = 'Introzzi',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Jacqueline' AND is_member = false;

UPDATE users SET
  last_name = 'Peiti',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Isabel' AND is_member = false;

UPDATE users SET
  last_name = 'Peiti',
  phone = COALESCE(NULLIF('393388411732', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'j.introzzi.as@gmail.com' AND first_name = 'Karen' AND is_member = false;

UPDATE users SET
  last_name = 'Dudko',
  phone = COALESCE(NULLIF('393927008381', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Tatiana' AND is_member = false;

UPDATE users SET
  last_name = 'Bilen',
  phone = COALESCE(NULLIF('393927008381', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'tanya_d@hotmail.it' AND first_name = 'Michail' AND is_member = false;

UPDATE users SET
  last_name = 'Crina',
  phone = COALESCE(NULLIF('40720045149', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Bianca Orza' AND is_member = false;

UPDATE users SET
  last_name = 'Orza',
  phone = COALESCE(NULLIF('40720045149', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'crina14orza@yahoo.com' AND first_name = 'Anda' AND is_member = false;

UPDATE users SET
  last_name = 'Falzone',
  phone = COALESCE(NULLIF('393495744060', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'carlafalzone@alice.it' AND first_name = 'Carla' AND is_member = false;

UPDATE users SET
  last_name = 'Manfroi',
  phone = COALESCE(NULLIF('393495744060', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'carlafalzone@alice.it' AND first_name = 'Giancarlo Giorgio' AND is_member = false;

UPDATE users SET
  last_name = 'Guerra',
  phone = COALESCE(NULLIF('393408692292', ''), phone),
  contact_status = 'perso',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'kika01_e@libero.it' AND first_name = 'Enrica' AND is_member = false;

UPDATE users SET
  last_name = 'Lanticina',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Elena' AND is_member = false;

UPDATE users SET
  last_name = 'Molteni',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Viola' AND is_member = false;

UPDATE users SET
  last_name = 'Molteni',
  phone = COALESCE(NULLIF('347/3003083', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'elelan77@yahoo.it' AND first_name = 'Filippo' AND is_member = false;

UPDATE users SET
  last_name = 'Oleksandra',
  phone = COALESCE(NULLIF('+41764163829', ''), phone),
  contact_status = 'convertito',
  notes = 'Lingua inglese - Svizzera',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Demchenko' AND is_member = false;

UPDATE users SET
  last_name = 'Vanoni',
  phone = COALESCE(NULLIF('+41764163829', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'alexa.demch@gmail.com' AND first_name = 'Léonard' AND is_member = false;

UPDATE users SET
  last_name = 'Serediuk',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  notes = 'Lugano',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Taras' AND is_member = false;

UPDATE users SET
  last_name = 'Serediuk',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Ivan' AND is_member = false;

UPDATE users SET
  last_name = 'Artem',
  phone = COALESCE(NULLIF('+380503231000', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'serediuk323100@gmail.com' AND first_name = 'Serediuk' AND is_member = false;

UPDATE users SET
  last_name = 'Montagna',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = 'Non possono più venire per gara sci - organizzare prova gratuita',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Marina' AND is_member = false;

UPDATE users SET
  last_name = 'Ronchi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Laura' AND is_member = false;

UPDATE users SET
  last_name = 'Ronchi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'marina_montagna@virgilio.it' AND first_name = 'Rachele' AND is_member = false;

UPDATE users SET
  last_name = 'Zaffaroni',
  phone = COALESCE(NULLIF('3356349552', ''), phone),
  contact_status = 'convertito',
  notes = 'Vera è la nipote, lui gioca a golf ma non è socio',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Maurizio' AND is_member = false;

UPDATE users SET
  last_name = 'Graziani',
  phone = COALESCE(NULLIF('3356349552', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'zaffaroni@alldigitalmz.it' AND first_name = 'Vera' AND is_member = false;

UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  notes = 'Gemelli, il papà gioca',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Luca' AND is_member = false;

UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Lucia' AND is_member = false;

UPDATE users SET
  last_name = 'Boffi',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'luca.boffi@lucaboffi.it' AND first_name = 'Paolo' AND is_member = false;

UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Cristian' AND is_member = false;

UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'William' AND is_member = false;

UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Francesco' AND is_member = false;

UPDATE users SET
  last_name = 'Stella',
  phone = COALESCE(NULLIF('3342391442', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'cristian-stella@hotmail.com' AND first_name = 'Leonardo' AND is_member = false;

UPDATE users SET
  last_name = 'Venuto',
  phone = COALESCE(NULLIF('3349026918', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Debora' AND is_member = false;

UPDATE users SET
  last_name = 'Rinaudo',
  phone = COALESCE(NULLIF('3349026918', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'debora.venuto@gmail.com' AND first_name = 'Giulia' AND is_member = false;

UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Viki' AND is_member = false;

UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Davide' AND is_member = false;

UPDATE users SET
  last_name = 'Borzi',
  phone = COALESCE(NULLIF('3291661312', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'vikystetco@gmail.com' AND first_name = 'Lucia' AND is_member = false;

UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Sandra' AND is_member = false;

UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alizee' AND is_member = false;

UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alexa' AND is_member = false;

UPDATE users SET
  last_name = 'Kurzlechner',
  phone = COALESCE(NULLIF('', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'sandra.kurzlechner@gmail.com' AND first_name = 'Alenie' AND is_member = false;

UPDATE users SET
  last_name = 'Russo',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Manuela' AND is_member = false;

UPDATE users SET
  last_name = 'Alloca',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Francesco' AND is_member = false;

UPDATE users SET
  last_name = 'Alloca',
  phone = COALESCE(NULLIF('3666282637', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'manuzza2001@yahoo.it' AND first_name = 'Leonardo' AND is_member = false;

UPDATE users SET
  last_name = 'Pozzi',
  phone = COALESCE(NULLIF('3914191197', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('adulto', member_type)
WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Cristina' AND is_member = false;

UPDATE users SET
  last_name = 'Cappello',
  phone = COALESCE(NULLIF('3914191197', ''), phone),
  contact_status = 'convertito',
  member_type = COALESCE('giovane', member_type)
WHERE email = 'pozzicristiana@gmail.com' AND first_name = 'Pozzi Enea' AND is_member = false;

NOTIFY pgrst, 'reload schema';
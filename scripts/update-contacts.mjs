import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://xiuzlbubiusttdvorrjn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhpdXpsYnViaXVzdHRkdm9ycmpuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0ODEzMTgsImV4cCI6MjA4ODA1NzMxOH0.4FwBhPevEn0tC2U2lsT13g7KcDCKunJ6pTar9KTNxtM'
)

// Data from user's list: [last_name, first_name, date_of_birth (or null), member_type, email (or null), phone (or null)]
const updates = [
  ['Joachimowicz', 'Agata', null, 'adulto', 'agata.joachim@gmail.com', '3465150763'],
  ['Longatti', 'Letizia Agnieszka', '2016-01-10', 'giovane', null, null],
  ['Ermatova', 'Zirek', null, 'adulto', 'ermatovazara@gmail.com', '3517410977'],
  ['Ermatova', 'Khadizha', '2016-12-29', 'giovane', null, null],
  ['Mandaglio', 'Sonia', null, 'adulto', 'smandaglio@libero.it', '3388666102'],
  ['Busana', 'Paolo', '2015-01-05', 'giovane', null, null],
  ['Sortino', 'Mary', null, 'adulto', 'sortino.maria@libero.it', '3466164916'],
  ['Albano', 'Emanuel', '2014-10-08', 'giovane', null, null],
  ['Turci', 'Edoardo', '2019-07-31', 'giovane', null, null],
  ['Trombello', 'Paolo', null, 'adulto', 'studioplinio@libero.it', '3291664718'],
  ['Trombello', 'Ines', '2017-12-06', 'giovane', null, null],
  ['Hanna', 'Grace', null, 'adulto', 'grace.dossantos@tecnomat.it', '3459467200'],
  ['Cipollini', 'Nicole', '2016-01-23', 'giovane', null, null],
  ['Mytyanska', 'Lidiya', null, 'adulto', 'lidiya.mytyanska@gmail.com', '3338847336'],
  ['Marciano', 'Erik', '2016-12-07', 'giovane', null, null],
  ['Marciano', 'Elizabeth', '2019-04-27', 'giovane', null, null],
  ['De Marco', 'Sara', null, 'adulto', 'famigliaciafani@gmail.com', '3471104982'],
  ['Ciafani', 'Irene', '2016-09-27', 'giovane', null, null],
  ['Zazzi', 'Valeria', null, 'adulto', 'vzazzi1980@libero.it', '3483342767'],
  ['Barbieri', 'Jacopo', '2016-06-16', 'giovane', null, null],
  ['Prudente', 'Inna', null, 'adulto', 'ikiriachuk@yahoo.it', '3462165258'],
  ['Prudente', 'Isabel', '2013-11-13', 'giovane', null, null],
  ['De Lucchi', 'Andrea', null, 'adulto', 'delucchiandrea@gmail.com', '3294287018'],
  ['De Lucchi', 'Tommaso', '2016-12-07', 'giovane', null, null],
  ['De Lucchi', 'Giancarlo', '2021-02-11', 'giovane', null, null],
  ['Cangelosi', 'Marco', null, 'adulto', 'marcocangelosi@hotmail.com', '3931710568'],
  ['Cangelosi', 'Valerio', '2017-11-03', 'giovane', null, null],
  ['Cangelosi', 'Antonio', '2022-10-22', 'giovane', null, null],
  [null, 'Elena', null, 'adulto', 'elena.mauri8@gmail.com', '3357701179'],
  ['Lo Piccolo', 'Tommaso M.', '2018-07-15', 'giovane', null, null],
  ['Venuto', 'Debora', null, 'adulto', 'deboravenuto@libero.it', '3349026918'],
  ['Rinaudo', 'Giulia', null, 'giovane', null, null],
  [null, 'Jiane', null, 'adulto', 'dolcevita.1981@libero.it', '3487869878'],
  ['Lee', 'Roa', '2017-09-10', 'giovane', null, null],
  ['Lee', 'Roon', '2020-03-18', 'giovane', null, null],
  ['Oregioni', 'Sara', null, 'adulto', 'saraoregioni@gmail.com', '3388284277'],
  ['Paggi', 'Alessia', '2016-04-20', 'giovane', null, null],
  ['Paggi', 'Beatrice', '2020-04-28', 'giovane', null, null],
  ['Urso', 'Rosa L.', null, 'adulto', 'rosaursom600@gmail.com', '3337647507'],
  ['Vassallo', 'Federico', '2019-12-06', 'giovane', null, null],
  ['Brambilla', 'Grazia', null, 'adulto', 'gra_apollo@yahoo.it', '3490734700'],
  ['Cigardi', 'Riccardo', null, 'giovane', null, null],
  ['Marcotto', 'Pier', null, 'adulto', 'marcotto.pierfrancesco@gmail.com', '3318178213'],
  ['Marcotto', 'Bianca Sofia', '2020-02-21', 'giovane', null, null],
  ['Borzi', 'Viki', null, 'adulto', 'vikystetco@gmail.com', '3291661312'],
  ['Borzi', 'Davide', null, 'giovane', null, null],
  ['Borzi', 'Lucia', null, 'giovane', null, null],
  ['Frigerio', 'Myriam', null, 'adulto', 'myriam.frigerio@gmail.com', '3497808109'],
  ['Lombardi', 'Alessio', '2016-03-30', 'giovane', null, null],
  ['Demian', 'Narcisa', null, 'adulto', 'narcisademian@yahoo.it', '3471184412'],
  ['Poli', 'Sebastian', '2020-10-06', 'giovane', null, null],
  [null, 'Loana', null, 'adulto', 'Logolds@gmail.com', '3485342946'],
  ['Figueira', 'Leo', '2017-02-06', 'giovane', null, null],
  ['Introzzi', 'Jacqueline', null, 'adulto', 'j.introzzi.as@gmail.com', '3388411721'],
  ['Peiti', 'Isabel', '2018-02-14', 'giovane', null, null],
  ['Peiti', 'Karen', '2020-08-19', 'giovane', null, null],
  ['Dudko', 'Tatiana', null, 'adulto', 'tanya_d@hotmail.it', '3927008381'],
  ['Bilen', 'Michail', '2014-01-06', 'giovane', null, null],
  ['Orza', 'Crina Bianca', null, 'adulto', 'crina14orza@yahoo.com', '40720045149'],
  ['Orza', 'Anda', '2016-05-16', 'giovane', null, null],
  ['Falzone', 'Carla', null, 'adulto', 'carlafalzone@alice.it', '3495744060'],
  ['Manfroi Giancarlo', 'Giorgio', '2019-07-30', 'giovane', null, null],
  ['Serediuk', 'Taras', null, 'adulto', 'serediuk323100@gmail.com', '380503231000'],
  ['Serediuk', 'Ivan', '2010-05-20', 'giovane', null, null],
  ['Serediuk', 'Artem', '2019-10-16', 'giovane', null, null],
  ['Montagna', 'Marina', null, 'adulto', 'marina_montagna@virgilio.it', null],
  ['Ronchi', 'Laura', null, 'giovane', null, null],
  ['Ronchi', 'Rachele', null, 'giovane', null, null],
  ['Zaffaroni', 'Maurizio', null, 'adulto', 'zaffaroni@alldigitalmz.it', '3356349552'],
  ['Graziani', 'Vera', '2019-02-21', 'giovane', null, null],
  ['Boffi', 'Luca', null, 'adulto', 'luca.boffi@lucaboffi.it', null],
  ['Boffi', 'Lucia', null, 'giovane', null, null],
  ['Boffi', 'Paolo', null, 'giovane', null, null],
  ['Stella', 'Cristian', null, 'adulto', 'cristian-stella@hotmail.com', '3342391442'],
  ['Stella', 'William', null, 'giovane', null, null],
  ['Stella', 'Francesco', null, 'giovane', null, null],
  ['Stella', 'Leonardo', null, 'giovane', null, null],
  ['Kurzlechner', 'Sandra', null, 'adulto', 'sandra.kurzlechner@gmail.com', null],
  ['Kurzlechner', 'Alizee', '2015-10-14', 'giovane', null, null],
  ['Kurzlechner', 'Alexa', '2018-03-10', 'giovane', null, null],
  ['Kurzlechner', 'Alenie', '2020-10-20', 'giovane', null, null],
  ['Pozzi', 'Valentina', null, 'adulto', 'valentina.pozzi1989@gmail.com', '3281266119'],
  ['Roda', 'Alessandro', '2019-12-23', 'giovane', null, null],
  ['Valtolina', 'Erika', null, 'adulto', 'erika.valtolina@gmail.com', '393803101245'],
  ['Fedrici', 'Caecilia', '2019-10-14', 'giovane', null, null],
]

async function run() {
  // Fetch all non-member contacts
  const { data: allContacts, error: fetchErr } = await supabase
    .from('users')
    .select('id, first_name, last_name, email, phone, date_of_birth, member_type')
    .eq('is_member', false)

  if (fetchErr) { console.error('Fetch error:', fetchErr); return }
  console.log(`Found ${allContacts.length} contacts in DB`)

  let updated = 0, notFound = 0, errors = 0

  for (const [last_name, first_name, dob, member_type, email, phone] of updates) {
    // Match by first_name + last_name (case insensitive)
    const match = allContacts.find(c => {
      const fnMatch = (c.first_name || '').toLowerCase().trim() === (first_name || '').toLowerCase().trim()
      const lnMatch = (c.last_name || '').toLowerCase().trim() === (last_name || '').toLowerCase().trim()
      return fnMatch && lnMatch
    })

    if (!match) {
      console.log(`NOT FOUND: ${first_name} ${last_name}`)
      notFound++
      continue
    }

    const payload = { member_type }
    if (dob) payload.date_of_birth = dob
    if (email) payload.email = email
    if (phone) payload.phone = phone

    const { error } = await supabase.from('users').update(payload).eq('id', match.id)
    if (error) {
      console.error(`ERROR updating ${first_name} ${last_name}:`, error.message)
      errors++
    } else {
      const changes = []
      if (member_type !== match.member_type) changes.push(`type: ${match.member_type || 'null'} -> ${member_type}`)
      if (dob && dob !== match.date_of_birth) changes.push(`dob: ${match.date_of_birth || 'null'} -> ${dob}`)
      if (email && email !== match.email) changes.push(`email updated`)
      if (phone && phone !== match.phone) changes.push(`phone updated`)
      console.log(`OK: ${first_name} ${last_name} [${changes.join(', ') || 'no changes'}]`)
      updated++
    }
  }

  console.log(`\nDone: ${updated} updated, ${notFound} not found, ${errors} errors`)
}

run()

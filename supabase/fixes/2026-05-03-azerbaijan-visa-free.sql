update countries
set
  visa_type = 'visa_free',
  max_stay_days = 90,
  notes = 'Sans visa pour les Marocains titulaires d’un passeport ordinaire, jusqu’à 90 jours.',
  official_source_url = 'https://tourism.gov.az/en/pages/visa-regulations'
where code = 'AZ';

update destinations
set visa_type = 'visa_free'
where country_code = 'AZ';

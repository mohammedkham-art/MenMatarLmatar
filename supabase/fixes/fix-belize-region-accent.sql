-- Fix Belize region label and French accent.
-- Run in Supabase SQL Editor.

update countries
set region = 'Amérique centrale'
where code = 'BZ';

update destinations
set region = 'Amérique centrale'
where country_code = 'BZ';

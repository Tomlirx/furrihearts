-- Seed csxtu@163.com (Tom Lee, profile id 851a96f1-32d6-4ad3-b39a-3b137e69c866)
-- with a fresh batch of realistic test pets, distinct from the lirixuan and
-- theantsclass seed batches. Also patches this profile's null `email` column
-- (same recurring gap seen on two other accounts).

-- =========================================================================
-- PART 1 — patch the profile's missing email
-- =========================================================================

update public.profiles
set email = 'csxtu@163.com', name = coalesce(name, 'Tom Lee')
where id = '851a96f1-32d6-4ad3-b39a-3b137e69c866';

-- =========================================================================
-- PART 2 — seed realistic test pets
-- =========================================================================

insert into public.pets (
  name, species, breed, age, gender, location, description, status, review_status,
  image_url, gallery, fee, rescuer_id, traits,
  is_vaccinated, is_dewormed, is_neutered, is_flea_treated, is_potty_trained,
  is_parvo_tested, is_giardia_tested, is_fiv_tested, is_felv_tested, is_fcov_tested, is_heartworm_tested
) values
-- 1. cat / available / approved
(
  'Cinta', 'cat', 'Domestic Shorthair', '1–3 years', 'Female', 'Cheras, Kuala Lumpur',
  'Cinta was rescued from a construction site as a stray and has since blossomed into an affectionate, easygoing cat. She loves sunbathing by the window and gets along well with calm dogs.',
  'available', 'approved', '/img-coco.png', array['/img-coco.png'], 50,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Affectionate','Calm','Pet Friendly'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 2. dog / available / approved
(
  'Bobby', 'dog', 'Mongrel (Kampung Dog)', '3–7 years', 'Male', 'Klang, Selangor',
  'Bobby is a steady, loyal older dog who was surrendered when his previous owner moved overseas. He''s already house-trained and walks calmly on a leash — ideal for a first-time dog owner.',
  'available', 'approved', '/img-buddy.png', array['/img-buddy.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Loyal','Calm','House-Trained'],
  true, true, true, true, true, true, true, null, null, null, true
),
-- 3. cat / available / pending (admin moderation queue)
(
  'Suki', 'cat', 'Mixed Breed', '2–4 months', 'Female', 'Puchong, Selangor',
  'Suki is a tiny rescued kitten found abandoned in a cardboard box. Still very young and needs a foster-experienced home for the next few weeks of care.',
  'available', 'pending', '/img-mochi.png', array['/img-mochi.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Curious','Playful','Needs Foster Care'],
  false, true, false, false, false, false, false, false, false, false, null
),
-- 4. dog / available / approved (active)
(
  'Rex', 'dog', 'Belgian Malinois Mix', '1–3 years', 'Male', 'Shah Alam, Selangor',
  'Rex is an intelligent, high-energy dog who thrives with structure and exercise. Best suited to an active household with experience handling working breeds.',
  'available', 'approved', '/img-simba.png', array['/img-simba.png'], 100,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Energetic','Intelligent','Needs Training'],
  true, true, true, true, true, true, true, null, null, null, true
),
-- 5. cat / available / approved (senior)
(
  'Mimi', 'cat', 'Persian Mix', '7+ years', 'Female', 'Bangsar, Kuala Lumpur',
  'Mimi is a quiet senior cat whose elderly owner passed away. She''s used to a comfortable indoor life and would do best in a calm home without young children.',
  'available', 'approved', '/img-kiko.png', array['/img-kiko.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Quiet','Independent','Senior'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 6. dog / available / rejected (failed moderation — incomplete info)
(
  'Choco', 'dog', 'Mixed Breed', '6–12 months', 'Male', 'Ampang, Kuala Lumpur',
  'Choco is a friendly young pup still being assessed for temperament before listing approval.',
  'available', 'rejected', '/img-buddy2.png', array['/img-buddy2.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Friendly'],
  false, false, false, false, false, false, false, null, null, null, false
),
-- 7. cat / adopted / approved (success story)
(
  'Pepper', 'cat', 'Tabby', '1–3 years', 'Male', 'Subang Jaya, Selangor',
  'Pepper found his forever home last month! He was a playful, vocal cat who loved chasing string toys and chatting with his new family.',
  'adopted', 'approved', '/img-nori.png', array['/img-nori.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Playful','Vocal'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 8. dog / available / approved (puppy)
(
  'Lucky', 'dog', 'Kampung Dog', 'Under 2 months', 'Female', 'Rawang, Selangor',
  'Lucky is one of a litter of puppies found near a market. She''s healthy and growing fast, but still needs her core vaccinations completed before adoption can finalize.',
  'available', 'approved', '/img-luna.png', array['/img-luna.png'], 0,
  '851a96f1-32d6-4ad3-b39a-3b137e69c866', array['Playful','Young'],
  false, false, false, false, false, false, false, null, null, null, false
);

-- =========================================================================
-- PART 3 — VERIFY
-- =========================================================================

select id, email, name from public.profiles where id = '851a96f1-32d6-4ad3-b39a-3b137e69c866';

select name, species, status, review_status
from public.pets
where rescuer_id = '851a96f1-32d6-4ad3-b39a-3b137e69c866'
order by created_at;

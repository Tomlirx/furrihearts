-- Seed lirixuan@gmail.com's account with the 8 demo/fallback pets from
-- data/pets.json, copied verbatim, as real testing data. Their account was
-- emptied out by an earlier cleanup pass (0004_remove_user_pets.sql).

insert into public.pets (
  name, species, breed, age, gender, location, description, status, review_status,
  image_url, gallery, fee, rescuer_id, traits,
  is_vaccinated, is_dewormed, is_neutered, is_flea_treated, is_potty_trained
) values
(
  'Milo', 'cat', 'Orange Tabby', '4 months', 'Male', 'Kuala Lumpur',
  'Milo is a bright little orange tabby who follows people around and settles quickly in a safe indoor home. He loves gentle play, window watching, and curling up beside his foster carer after meals.',
  'available', 'approved', '/img-milo.png', array['/img-milo.png','/img-mochi.png','/img-coco.png'], 80,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Playful','People-Oriented','Curious'],
  true, true, false, true, true
),
(
  'Luna', 'dog', 'Golden Retriever Mix', '2 years', 'Female', 'Selangor',
  'Luna is affectionate, calm, and happiest when she can be near her people. She has lovely manners, walks well on leash, and would suit a family looking for a warm, steady companion.',
  'available', 'approved', '/img-luna.png', array['/img-luna.png','/img-buddy.png','/img-buddy2.png'], 150,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Gentle','Pet Friendly','Calm'],
  true, true, true, true, true
),
(
  'Coco', 'cat', 'Domestic Shorthair', '8 months', 'Female', 'Penang',
  'Coco is a soft-natured young cat who enjoys quiet routines and slow introductions. Once she trusts you, she becomes a sweet lap companion with a tiny purr.',
  'available', 'approved', '/img-coco.png', array['/img-coco.png','/img-nori.png','/img-kiko.png'], 60,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Independent','Gentle','Lap Cat'],
  true, true, true, true, true
),
(
  'Buddy', 'dog', 'Kampung Dog', '1 year', 'Male', 'Johor',
  'Buddy is energetic, clever, and loyal. He would thrive with adopters who enjoy walks, training games, and giving a young dog structure and affection.',
  'available', 'approved', '/img-buddy.png', array['/img-buddy.png','/img-buddy2.png','/img-luna.png'], 100,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Active','Loves Outdoors','Protective'],
  true, true, false, true, false
),
(
  'Nori', 'cat', 'Tuxedo Cat', '1 year', 'Male', 'Kuala Lumpur',
  'Nori is a chatty tuxedo cat who likes being part of whatever is happening at home. He is social, food motivated, and very ready for a permanent indoor family.',
  'available', 'approved', '/img-nori.png', array['/img-nori.png','/img-kiko.png','/img-milo.png'], 70,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Curious','Vocal','People-Oriented'],
  true, true, true, true, true
),
(
  'Simba', 'dog', 'Shih Tzu Mix', '3 years', 'Male', 'Selangor',
  'Simba is a relaxed little companion who enjoys short walks, naps, and quiet company. His adoption is already complete, but his profile remains visible as a success story.',
  'adopted', 'approved', '/img-simba.png', array['/img-simba.png','/img-brownie.png'], 120,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Calm','Low-Maintenance','Affectionate'],
  true, true, true, true, true
),
(
  'Kiko', 'cat', 'Calico', '6 months', 'Female', 'Penang',
  'Kiko is a gentle calico who blossoms with patient people. She would do well in a calm household and may enjoy another friendly cat companion.',
  'available', 'approved', '/img-kiko.png', array['/img-kiko.png','/img-coco.png','/img-nori.png'], 60,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Shy','Gentle','Pet Friendly'],
  true, true, false, true, true
),
(
  'Brownie', 'dog', 'Mixed Breed', '9 months', 'Female', 'Kuala Lumpur',
  'Brownie is a joyful young dog with a soft heart and plenty of puppy energy. She loves playtime, learns quickly, and is ready for a home that can keep guiding her.',
  'available', 'approved', '/img-brownie.png', array['/img-brownie.png','/img-buddy2.png','/img-luna.png'], 90,
  '95fa5347-94e2-4cb6-a673-5a829a6883bc', array['Playful','Pet Friendly','Active'],
  true, true, false, true, false
);

-- =========================================================================
-- VERIFY
-- =========================================================================

select name, species, status, review_status
from public.pets
where rescuer_id = '95fa5347-94e2-4cb6-a673-5a829a6883bc'
order by created_at;

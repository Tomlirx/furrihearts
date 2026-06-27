-- UAT prep: patch an incomplete profile, re-attach ownerless pets to a real
-- account, and seed a realistic spread of test pets for /browse, /all-listings,
-- and /admin/pets testing. All test pets are owned by the real, registered
-- account theantsclass@gmail.com (profiles.id = 'f26b8e77-6faf-48da-9da3-2d0be8168994').

-- =========================================================================
-- PART 1 — patch the incomplete profile (email/name were null)
-- =========================================================================

update public.profiles
set email = 'theantsclass@gmail.com', name = 'Nikki Ng'
where id = 'f26b8e77-6faf-48da-9da3-2d0be8168994';

-- =========================================================================
-- PART 2 — re-attach any ownerless pets (e.g. "Max") to that account
-- =========================================================================

update public.pets
set rescuer_id = 'f26b8e77-6faf-48da-9da3-2d0be8168994'
where rescuer_id is null;

-- =========================================================================
-- PART 3 — seed realistic test pets (mixed species/status/review_status)
-- =========================================================================

insert into public.pets (
  name, species, breed, age, gender, location, description, status, review_status,
  image_url, gallery, fee, rescuer_id, traits,
  is_vaccinated, is_dewormed, is_neutered, is_flea_treated, is_potty_trained,
  is_parvo_tested, is_giardia_tested, is_fiv_tested, is_felv_tested, is_fcov_tested, is_heartworm_tested
) values
-- 1. cat / available / approved
(
  'Biskut', 'cat', 'Domestic Shorthair', '1–3 years', 'Female', 'Kuala Lumpur',
  'Biskut is a gentle, affectionate cat who loves curling up on laps and watching the world from the windowsill. She gets along well with other cats and is litter-trained.',
  'available', 'approved', '/img-mochi.png', array['/img-mochi.png'], 80,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Gentle','Lap Cat','Calm'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 2. dog / available / approved
(
  'Rocky', 'dog', 'Kampung Dog', '1–3 years', 'Male', 'Petaling Jaya',
  'Rocky is an energetic, loyal street-dog mix who loves long walks and playing fetch. He''s great with kids and is house-trained.',
  'available', 'approved', '/img-buddy.png', array['/img-buddy.png'], 0,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Playful','Loves Outdoors','Protective'],
  true, true, true, true, true, true, true, null, null, null, true
),
-- 3. cat / available / pending (admin moderation queue, not yet public)
(
  'Comel', 'cat', 'Persian Mix', '4–6 months', 'Female', 'Shah Alam',
  'Comel is a playful kitten still growing into her fluffy coat. Curious about everything, she needs a patient home willing to kitten-proof a bit.',
  'available', 'pending', '/img-luna.png', array['/img-luna.png'], 50,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Curious','Playful'],
  true, true, false, true, false, false, false, false, false, false, null
),
-- 4. dog / available / rejected (admin moderation queue, not public)
(
  'Thunder', 'dog', 'Mixed Breed', '6–12 months', 'Male', 'Klang',
  'Thunder is a strong, high-energy pup who needs an experienced handler and a securely fenced yard.',
  'available', 'rejected', '/img-simba.png', array['/img-simba.png'], 0,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Independent'],
  false, true, false, false, false, false, false, null, null, null, false
),
-- 5. cat / adopted / approved
(
  'Oreo', 'cat', 'Domestic Shorthair', '3–7 years', 'Male', 'Subang Jaya',
  'Oreo has found his forever home! He was a calm, vocal companion who loved evening cuddles.',
  'adopted', 'approved', '/img-coco.png', array['/img-coco.png'], 0,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Vocal','Calm'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 6. dog / adopted / approved
(
  'Buddy', 'dog', 'Golden Retriever Mix', '1–3 years', 'Male', 'Ampang',
  'Buddy was adopted by a loving family last month — he was a people-oriented, gentle dog who got along with everyone he met.',
  'adopted', 'approved', '/img-buddy2.png', array['/img-buddy2.png'], 200,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['People-Oriented','Gentle'],
  true, true, true, true, true, true, true, null, null, null, true
),
-- 7. cat / available / approved (senior)
(
  'Tom', 'cat', 'Domestic Longhair', '7+ years', 'Male', 'Johor Bahru',
  'Tom is a wise, easygoing senior cat looking for a quiet home to spend his golden years. He''s low-maintenance and just wants a warm lap.',
  'available', 'approved', '/img-kiko.png', array['/img-kiko.png'], 30,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Calm','Independent'],
  true, true, true, true, true, true, true, true, true, true, null
),
-- 8. dog / available / approved (puppy)
(
  'Milo', 'dog', 'Kampung Dog', 'Under 2 months', 'Male', 'Penang',
  'Milo is a tiny, playful puppy rescued from a construction site. Still very young — needs a home ready for puppy training and vet follow-ups.',
  'available', 'approved', '/img-milo.png', array['/img-milo.png'], 0,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Playful','Curious'],
  false, false, false, false, false, false, false, null, null, null, false
),
-- 9. cat / available / approved
(
  'Nori', 'cat', 'Tabby', '6–12 months', 'Female', 'Seremban',
  'Nori is a sweet, sociable tabby who loves attention and follows her favorite humans from room to room.',
  'available', 'approved', '/img-nori.png', array['/img-nori.png'], 60,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Pet Friendly','Vocal'],
  true, true, false, true, true, true, true, true, true, true, null
),
-- 10. dog / available / pending (admin moderation queue, not yet public)
(
  'Brownie', 'dog', 'Mixed Breed', '2–4 months', 'Female', 'Ipoh',
  'Brownie is a shy but sweet pup who is slowly coming out of her shell. Needs a calm, patient household.',
  'available', 'pending', '/img-brownie.png', array['/img-brownie.png'], 0,
  'f26b8e77-6faf-48da-9da3-2d0be8168994', array['Shy','Gentle'],
  false, true, false, false, false, false, false, null, null, null, false
);

-- =========================================================================
-- PART 4 — VERIFY
-- =========================================================================

select id, email, name from public.profiles where id = 'f26b8e77-6faf-48da-9da3-2d0be8168994';
select count(*) as remaining_null_owner_pets from public.pets where rescuer_id is null;
select count(*) as total_pets_for_test_account from public.pets where rescuer_id = 'f26b8e77-6faf-48da-9da3-2d0be8168994';

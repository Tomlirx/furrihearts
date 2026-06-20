import type { Pet } from './pet-service';

export interface LocalApplication {
  id: string;
  pet_id: string;
  applicant_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'closed';
  created_at: string;
  q1: string[];
  q2: string;
  q3: string;
  q4: string;
  q5: string;
  q6: string;
  q7: string;
  pets: Pick<Pet, 'id' | 'name' | 'image_url' | 'species' | 'gender' | 'location'>;
  profiles?: {
    first_name: string;
    last_name: string;
  };
}

const APPLICATIONS_KEY = 'furrihearts.applications';
const LOCAL_PETS_KEY = 'furrihearts.localPets';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalApplications() {
  return readJson<LocalApplication[]>(APPLICATIONS_KEY, []);
}

export function saveLocalApplication(application: LocalApplication) {
  const current = getLocalApplications();
  const withoutDuplicate = current.filter((app) => app.pet_id !== application.pet_id);
  const next = [application, ...withoutDuplicate];
  writeJson(APPLICATIONS_KEY, next);
  return next;
}

export function updateLocalApplicationStatus(
  applicationId: string,
  status: LocalApplication['status'],
) {
  const next = getLocalApplications().map((app) => (
    app.id === applicationId ? { ...app, status } : app
  ));
  writeJson(APPLICATIONS_KEY, next);
  return next;
}

export function getLocalListings() {
  return readJson<Pet[]>(LOCAL_PETS_KEY, []);
}

export function saveLocalListing(pet: Pet) {
  const current = getLocalListings();
  const next = [pet, ...current.filter((item) => item.id !== pet.id)];
  writeJson(LOCAL_PETS_KEY, next);
  return next;
}

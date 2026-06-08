import Link from 'next/link';

export function PetCard({ pet, onSave }: { pet: any, onSave: (e: React.MouseEvent) => void }) {
  return (
    <Link href={`/pet/${pet.id}`} className="pet-card">
      <div className="pet-img">
        {/* Adopted Badge */}
        {pet.status === 'adopted' && (
          <div className="adopted-badge">Adopted</div>
        )}
        
        <img src={pet.image_url || 'https://via.placeholder.com/300x250?text=No+Image'} alt={pet.name} />
        <button className="save-btn" onClick={onSave}>🤍</button>
      </div>

      {/* This matches the DOM structure of your original browse.html */}
      <div className="pet-info">
  <div className="pet-name-row">
    <span className="pet-name">{pet.name}</span>
    <span className="pet-arrow">→</span>
  </div>
  <div className="pet-meta">{pet.gender} · {pet.location}</div>
  
  {/* Only display breed, as 'tags' does not exist in your database */}
  <div className="pet-tags">
    <span className="pet-tag">{pet.breed}</span>
  </div>
</div>
    </Link>
  );
}
import Link from 'next/link';

export function PetCard({ pet }: { pet: any }) {
  return (
    <div className="group rounded-3xl bg-white border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={pet.image} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold">{pet.name}</h3>
        <p className="text-slate-500 mb-6">{pet.breed}</p>
        <Link 
          href={`/pet/${pet.id}`} 
          className="block w-full text-center py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
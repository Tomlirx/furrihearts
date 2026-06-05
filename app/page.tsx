import PetCard from '../components/PetCard';
import pets from '../data/pets.json';

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <div className="mb-12">
        <h1 className="text-5xl font-extrabold mb-4">Find your purrfect match.</h1>
        <p className="text-xl text-slate-600">Browse pets waiting for a home in Malaysia.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {pets.map((pet) => (
          <PetCard key={pet.id} name={pet.name} breed={pet.breed} image={pet.image} />
        ))}
      </div>
    </main>
  );
}
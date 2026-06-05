export default function PetCard({ name, breed, image }: { name: string; breed: string; image: string }) {
  return (
    <div className="border rounded-2xl p-4 hover:shadow-lg transition-all bg-white">
      <img src={image} alt={name} className="w-full h-48 object-cover rounded-xl" />
      <h3 className="font-bold text-xl mt-4">{name}</h3>
      <p className="text-slate-500">{breed}</p>
      <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-xl">View Profile</button>
    </div>
  );
}
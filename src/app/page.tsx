import Navbar from '@/components/Navbar';
import LiveClasses from '@/components/LiveClasses';
import Subjects from '@/components/Subjects';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-yellow-100 min-h-screen">
      <div className="container mx-auto">
        <input
          type="text"
          placeholder="Search"
          className="block w-full max-w-lg mt-6 mx-auto bg-green-100 p-2 rounded-md"
        />
        <LiveClasses />
        <Subjects />
      </div>
      <Footer />
    </div>
  );
}

import Navbar from '../components/layout/Navbar';
import Hero from '../components/layout/Hero';
import DashboardStats from '../components/layout/DashboardStats';
import Footer from '../components/layout/Footer';
import '../styles/tokens.css';

export default function Home() {
  // Replace with real values from your API once medication tracking is wired up
  const stats = { medications: 0, takenToday: 0, upcoming: 0, missed: 0 };

  return (
    <div>
      <Navbar />
      <Hero doctorImageSrc="/assets/doctor.svg" />
      <DashboardStats stats={stats} />
      <Footer />
    </div>
  );
}

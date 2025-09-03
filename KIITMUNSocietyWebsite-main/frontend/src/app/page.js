import Hero from '@/components/Hero';
import About from '@/components/About';
import Coordinators from '@/components/Coordinators';
import AnimatedTestimonialsDemo from '@/components/animated-testimonials-demo';
import Blogs from '@/components/BlogsSimple';
import Resources from '@/components/Resources';
import Contact from '@/components/Contact';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ErrorBoundary from '@/components/ErrorBoundary';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Header />
      <Hero />
      <About />
      <Coordinators />
      <AnimatedTestimonialsDemo />
      <ErrorBoundary>
        <Blogs />
      </ErrorBoundary>
      <Resources />
      <Contact />
      <Footer />
    </main>
  );
}

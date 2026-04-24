import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Collection from './components/Collection';
import Featured from './components/Featured';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Admin from './components/Admin';

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (path === '/admin') {
    return <Admin />;
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-200 selection:text-black">
      <Navbar />
      <main>
        <Hero />
        <Collection />
        <Featured />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}

export default App;

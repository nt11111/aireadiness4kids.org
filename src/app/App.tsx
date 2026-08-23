import { Routes, Route, Link } from "react-router-dom";
import { Nav } from "./components/site/Nav";
import { Footer } from "./components/site/Footer";
import { useReveal, useScrollRestore } from "./lib/useReveal";
import Home from "./pages/Home";
import Curriculum from "./pages/Curriculum";
import Programs from "./pages/Programs";
import About from "./pages/About";
import GetInvolved from "./pages/GetInvolved";
import Donate from "./pages/Donate";
import Contact from "./pages/Contact";

function NotFound() {
  return (
    <section className="min-h-[70vh] grid place-items-center px-6 pt-28 text-center">
      <div>
        <img src="/brand/ark-mark-web.png" alt="" className="w-40 mx-auto mb-6 ark-float" />
        <h1 className="font-display text-5xl font-black text-primary">Page not found.</h1>
        <p className="text-muted-foreground mt-3">Even elephants forget a path sometimes.</p>
        <Link to="/" className="inline-flex mt-7 bg-accent text-white px-6 py-3 rounded-full font-bold">Back home</Link>
      </div>
    </section>
  );
}

export default function App() {
  useReveal();
  useScrollRestore();
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden">
      <Nav />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/curriculum" element={<Curriculum />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/about" element={<About />} />
          <Route path="/get-involved" element={<GetInvolved />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

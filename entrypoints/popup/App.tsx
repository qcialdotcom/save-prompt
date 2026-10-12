// entrypoints/popup/App.tsx

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function App() {
  return (
    <div className="w-full h-full flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-y-auto"></main>
      <Footer />
    </div>
  );
}

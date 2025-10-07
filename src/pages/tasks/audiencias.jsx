import React from "react";
import Sidebar from "../../components/ui/Sidebar";
import Header from "../../components/ui/Header";

const Audiencias = () => (
  <div className="min-h-screen bg-[#f7f8fa]">
    <Sidebar />
    <Header />
    <main className="transition-all duration-300 pt-16 ml-0 md:ml-60">
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Audiências</h1>
        <p>Esta é a página de audiências. Adicione, edite e visualize suas audiências aqui.</p>
      </div>
    </main>
  </div>
);

export default Audiencias;

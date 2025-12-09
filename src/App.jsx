import React, { useEffect } from "react";
import Routes from "./Routes";
import JuliaAssistant from "./components/ui/JuliaAssistant";
import { externalSyncService } from "./services/externalSupabaseSync";

function App() {
  // Sincronização automática desabilitada temporariamente
  // Para ativar, descomente o código abaixo:
  /*
  useEffect(() => {
    console.log('🚀 Iniciando serviço de sincronização automática...');
    externalSyncService.start();

    return () => {
      externalSyncService.stop();
    };
  }, []);
  */

  return (
    <>
      <Routes />
      <JuliaAssistant />
    </>
  );
}

export default App;

import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

// Pegar Client ID da variável de ambiente
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Verificar se o Client ID está configurado
if (!GOOGLE_CLIENT_ID) {
	console.warn('⚠️ ATENÇÃO: VITE_GOOGLE_CLIENT_ID não configurado. Funcionalidades do Google Calendar não estarão disponíveis.');
	console.warn('📖 Leia CONFIGURAR_GOOGLE_OAUTH.md para instruções de configuração.');
}

root.render(
	<GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
		<App />
	</GoogleOAuthProvider>
);

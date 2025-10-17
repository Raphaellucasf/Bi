import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from '@react-oauth/google';
import "./styles/tailwind.css";
import "./styles/index.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
	<GoogleOAuthProvider clientId="SUA_CLIENT_ID_AQUI">
		<App />
	</GoogleOAuthProvider>
);

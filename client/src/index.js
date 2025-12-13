import ReactDOM from 'react-dom/client';
import App from './App';
import './style/style.css';
import './style/deshboardStyle.css';
import React from 'react';
import { SocketProvider } from './context/SocketContext';
import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter future={{
  v7_startTransition: true,
  v7_relativeSplatPath: true,
}}>
      <AuthProvider>
        <SocketProvider>
            <App />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

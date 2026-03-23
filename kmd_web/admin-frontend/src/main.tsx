//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Router from './app/AppRouter.tsx'
import { AuthProvider } from "./features/user_authentication/AuthContext";

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <Router />
  </AuthProvider>,
)

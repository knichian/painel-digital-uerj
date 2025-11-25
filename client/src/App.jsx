// client/src/App.jsx

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RegisterPage from './pages/RegisterPage';
import ContactPage from './pages/ContactPage';
import PlaylistEditor from './pages/PlaylistEditor'; // renamed to PlaylistEditor to bust cache
import CreateSlidePage from './pages/CreateSlidePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
  {/* Quando o usuário acessar /login, mostramos a LoginPage */}
  <Route path="/login" element={<LoginPage />} />

  {/* Quando o usuário acessar a rota principal, mostramos o Dashboard */}
  <Route path="/" element={<DashboardPage />} />

  {/* Nova rota de registro */}
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/contato" element={<ContactPage />} /> {/* 2. ADICIONE A ROTA */}
  {/* 2. ADICIONE A NOVA ROTA DINÂMICA */}
  <Route path="/playlist/:id" element={<PlaylistEditor />} />
  <Route path="/create-slide" element={<CreateSlidePage />} />
  <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

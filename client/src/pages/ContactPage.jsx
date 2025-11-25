// client/src/pages/ContactPage.jsx

import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer'; // Importe o Footer
import { MdEmail } from 'react-icons/md'; // Importa o ícone de e-mail para esta página também
import './ContactPage.css';

function ContactPage() {
  return (
    <div className="contact-layout">
      <Header />
      <main className="contact-content">
        <div className="contact-card">
          <h1>Entre em Contato</h1>
          <p>
            Se você encontrar qualquer problema, erro no sistema ou tiver
            sugestões de melhoria, por favor, não hesite em nos contatar.
          </p>
          <div className="contact-info">
            <p>Email para suporte:</p>
            <div className="contact-email-display"> {/* Novo div para alinhar */}
              <MdEmail size={24} /> {/* Ícone maior */}
              <a href="mailto:ecoarduino@gmail.com">ecoarduino@gmail.com</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default ContactPage;
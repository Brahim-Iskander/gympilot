import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import AppRoutes from './routes/AppRoutes';

import ChatBot from './components/ChatBot';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AppRoutes />
      <ChatBot />
    </>
  );
}

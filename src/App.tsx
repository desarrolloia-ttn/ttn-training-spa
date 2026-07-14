import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AssistantProvider } from './context/AssistantContext';
import { Dashboard } from './pages/Dashboard';
import { Proyectos } from './pages/Proyectos';
import { Proyecto } from './pages/Proyecto';
import { Modulo } from './pages/Modulo';
import { Certificados } from './pages/Certificados';

export function App() {
  return (
    <BrowserRouter>
      <AssistantProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="proyectos" element={<Proyectos />} />
            <Route path="proyecto/:slug" element={<Proyecto />} />
            <Route path="modulo" element={<Modulo />} />
            <Route path="certificados" element={<Certificados />} />
          </Route>
        </Routes>
      </AssistantProvider>
    </BrowserRouter>
  );
}

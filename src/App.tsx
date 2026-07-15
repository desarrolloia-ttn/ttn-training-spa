import { BrowserRouter, Route, Routes, useParams } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RequireAdmin, RequireAuth, RequireModuleRoute } from './components/Guards';
import { AssistantProvider } from './context/AssistantContext';
import { AuthProvider } from './context/AuthContext';
import { Dashboard } from './pages/Dashboard';
import { Proyectos } from './pages/Proyectos';
import { Proyecto } from './pages/Proyecto';
import { Modulo } from './pages/Modulo';
import { Certificados } from './pages/Certificados';
import { Login } from './pages/Login';
import { Admin } from './pages/Admin';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AssistantProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <RequireAuth>
                  <Layout />
                </RequireAuth>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="proyectos" element={<Proyectos />} />
              <Route path="proyecto/:slug" element={<Proyecto />} />
              <Route
                path="modulo/:moduleId"
                element={
                  <RequireModuleRoute>
                    <ModuloKeyed />
                  </RequireModuleRoute>
                }
              />
              <Route path="certificados" element={<Certificados />} />
              <Route
                path="usuarios"
                element={
                  <RequireAdmin>
                    <Admin />
                  </RequireAdmin>
                }
              />
            </Route>
          </Routes>
        </AssistantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

/** Remonta Modulo al cambiar de módulo para reiniciar su estado interno. */
function ModuloKeyed() {
  const { moduleId } = useParams();
  return <Modulo key={moduleId} />;
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { getCatalog, getClient, type CatalogModule, type Client } from '../lib/api';
import { ModuleCard } from './Proyecto';

export function Cliente() {
  useAssistantContext('Cliente');
  const { clientId } = useParams();
  const cid = Number(clientId);
  const [client, setClient] = useState<Client | null>(null);
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([getClient(cid), getCatalog(cid)])
      .then(([c, m]) => {
        setClient(c);
        setModules(m);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [cid]);

  const productSlug = client?.product ?? 'biowel';
  const productName = productSlug === 'activos-fijos' ? 'Activos Fijos' : 'Biowel';
  const total = modules.length;
  const completed = modules.filter((m) => m.status === 'done').length;

  return (
    <>
      <Topbar
        crumb={
          <>
            <Link to="/proyectos">Productos</Link> · <Link to={`/proyecto/${productSlug}`}>{productName}</Link> ·{' '}
            <b>{client?.name ?? 'Cliente'}</b>
          </>
        }
      />
      <div className="content">
        <section className="page-head" style={{ marginBottom: 20 }}>
          <h1>{client?.name ?? 'Cliente'}</h1>
          {client?.description && <p>{client.description}</p>}
        </section>

        {loading ? (
          <div className="card" style={{ padding: 20 }}>Cargando módulos…</div>
        ) : modules.length === 0 ? (
          <div className="card" style={{ padding: 20 }}>
            <span className="tiny muted">Este cliente aún no tiene módulos.</span>
          </div>
        ) : (
          <>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 20 }}>Módulos</h2>
              <span className="chip">{completed} / {total} completados</span>
            </div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
              {modules.map((m) => (
                <ModuleCard mod={m} key={m.id} />
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 18 }}>
          <Link className="btn ghost sm" to={`/proyecto/${productSlug}`}>← Volver a {productName}</Link>
        </div>
      </div>
    </>
  );
}

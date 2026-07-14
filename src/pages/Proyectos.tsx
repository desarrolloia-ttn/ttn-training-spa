import { Link } from 'react-router-dom';
import { Topbar } from '../components/Topbar';
import { ProgressBar } from '../components/ProgressBar';
import { ActivosFijosLogo, BiowelLogo } from '../components/ProductLogos';
import { useAssistant } from '../context/AssistantContext';
import { useAssistantContext } from '../hooks/useAssistantContext';
import { PRODUCTS, type ProductSummary } from '../data/products';
import { SparkIcon } from '../icons';

import './Proyectos.css';

const LOGO_BY_SLUG: Record<ProductSummary['slug'], React.ComponentType<{ className?: string }>> = {
  biowel: BiowelLogo,
  'activos-fijos': ActivosFijosLogo,
};

function ProductCard({ product }: { product: ProductSummary }) {
  const Logo = LOGO_BY_SLUG[product.slug];
  const isSoon = product.status === 'soon';

  return (
    <Link className="card product-card" to={`/proyecto/${product.slug}`}>
      <div
        className="product-cover"
        style={{
          background: `linear-gradient(135deg, ${product.accentSoft} 0%, #fff 70%)`,
          borderBottom: `1px solid var(--line)`,
        }}
      >
        <Logo className="product-logo" />
        <span className={`chip ${isSoon ? '' : 'brand'} product-tag`}>
          {isSoon ? 'Próximamente' : 'Activo'}
        </span>
      </div>
      <div className="product-body">
        <div className="tiny" style={{ color: product.accent, fontWeight: 700, letterSpacing: '.04em' }}>
          {product.tagline.toUpperCase()}
        </div>
        <h3 style={{ fontSize: 20, margin: '4px 0 6px' }}>{product.name}</h3>
        <p className="tiny muted" style={{ margin: '0 0 18px' }}>{product.description}</p>

        {isSoon ? (
          <div
            className="tiny muted"
            style={{
              padding: '10px 12px',
              border: '1px dashed var(--line)',
              borderRadius: 10,
              textAlign: 'center',
            }}
          >
            Aún no hay contenido disponible
          </div>
        ) : (
          <>
            <div className="row" style={{ justifyContent: 'space-between', marginBottom: 6 }}>
              <span className="tiny muted" style={{ fontWeight: 700 }}>{product.progressLabel}</span>
              <span className="tiny" style={{ fontWeight: 700, color: 'var(--ink-800)' }}>{product.progress}%</span>
            </div>
            <ProgressBar value={product.progress} />
          </>
        )}

        <div className="divider" />
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <span className="tiny muted">
            {product.moduleCount > 0 ? `${product.moduleCount} módulos` : 'Sin módulos aún'}
          </span>
          <span className="tiny" style={{ color: product.accent, fontWeight: 700 }}>
            {isSoon ? 'Vista previa →' : 'Entrar →'}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function Proyectos() {
  useAssistantContext('Mis productos de formación');
  const { open } = useAssistant();

  return (
    <>
      <Topbar crumb={<>Inicio · <b>Proyectos</b></>} searchPlaceholder="Buscar producto…" />
      <div className="content">
        <section className="page-head" style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <h1>Productos</h1>
            <p>Selecciona un producto para ver sus módulos de capacitación.</p>
          </div>
          <button className="btn" onClick={open}>
            <SparkIcon width={16} height={16} /> ¿Por dónde empezar? Pregúntale a la IA
          </button>
        </section>

        <div className="grid product-grid">
          {PRODUCTS.map((p) => (
            <ProductCard product={p} key={p.slug} />
          ))}
        </div>
      </div>
    </>
  );
}

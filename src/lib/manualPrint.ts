import type { LessonManualDoc } from './api';

/** Marca TTN aproximada (reemplazar por el logo oficial cuando esté disponible). */
const TTN = '<span class="ttn"><b>ttn</b><small>TECNOLOGÍA TRANSFORMANDO NEGOCIOS</small></span>';

/** Abre el manual como presentación con la identidad TTN, lista para guardar como PDF (horizontal). */
export function openManualWindow(m: LessonManualDoc): void {
  const d = m.doc;
  const esc = (s: string) => (s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const para = (s: string) => (s && s.trim() ? `<p>${esc(s)}</p>` : '');
  const ul = (items: string[]) => {
    const xs = (items ?? []).filter((x) => x && x.trim());
    return xs.length ? `<ul>${xs.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  };

  // Secciones presentes (para índice, separadores y contenido).
  const secs: { id: string; title: string; html: string }[] = [];
  const add = (id: string, title: string, inner: string) => { if (inner) secs.push({ id, title, html: inner }); };

  add('objetivo', 'Objetivo', para(d.objetivo));
  add('alcance', 'Alcance', para(d.alcance));
  add('requisitos', 'Requisitos', ul(d.requisitos));

  let stepN = 0;
  const proc = (d.procedimiento ?? [])
    .map((sec) => {
      const secTitle = sec.titulo ? `<h3 class="sub">${esc(sec.titulo)}</h3>` : '';
      const steps = (sec.pasos ?? [])
        .map((st) => {
          stepN += 1;
          const head = `<div class="step-h"><span class="num">${stepN}</span><span class="st-t">${esc(st.titulo)}</span></div>`;
          if (st.insuficiente || !(st.explicacion || st.resultado)) {
            return `<div class="step">${head}<p class="insuf">Información insuficiente para documentar este paso.</p></div>`;
          }
          const adv = (st.advertencias ?? []).filter((a) => a && a.trim()).length
            ? `<div class="warn"><span class="wl">Advertencias</span>${ul(st.advertencias)}</div>` : '';
          return `<div class="step">${head}`
            + (st.explicacion ? `<p class="lbl">Explicación</p>${para(st.explicacion)}` : '')
            + (st.resultado ? `<p class="lbl">Resultado esperado</p>${para(st.resultado)}` : '')
            + adv + '</div>';
        })
        .join('');
      return secTitle + steps;
    })
    .join('');
  add('procedimiento', 'Procedimiento', proc);

  add('buenas', 'Buenas prácticas', ul(d.buenas_practicas));
  add('errores', 'Errores frecuentes', ul(d.errores_frecuentes));
  add('recom', 'Recomendaciones', ul(d.recomendaciones));
  add('glosario', 'Glosario', (d.glosario ?? []).map((c) => `<p class="gl"><b>${esc(c.term)}</b><span>${esc(c.definition)}</span></p>`).join(''));
  add('faq', 'Preguntas y respuestas', (d.faq ?? []).map((q) => `<div class="faq"><p class="q">${esc(q.pregunta)}</p>${para(q.respuesta)}</div>`).join(''));
  add('resumen', 'Resumen', para(d.resumen));

  const pad = (n: number) => String(n).padStart(2, '0');

  // Índice (dos columnas).
  const toc = secs.map((s) => `<li><a href="#${s.id}"><span>${esc(s.title)}</span><i class="go">&rsaquo;</i></a></li>`).join('');

  // Contenido: por cada sección, un separador numerado + una página de contenido.
  const content = secs.map((s, i) => `
    <section class="slide divider">
      <span class="deco sq tl"></span>
      <div class="dv-circle"><div class="dv-num">${pad(i + 1)}</div><div class="dv-rule"></div><div class="dv-title">${esc(s.title).toUpperCase()}</div><div class="dv-sub">${esc(d.titulo || m.title)}</div></div>
      <span class="deco corner br navy"></span>
    </section>
    <article class="page" id="${s.id}">
      <div class="pg-head"><span class="hn">#${i + 1}</span><h2>${esc(s.title).toUpperCase()}</h2>${TTN}</div>
      <span class="deco corner tl cyan soft"></span>
      <div class="pg-body">${s.html}</div>
    </article>`).join('');

  const meta = [m.code, `Versión ${m.version}`, m.date].filter(Boolean).map(esc).join('&nbsp;&nbsp;·&nbsp;&nbsp;');

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${esc(d.titulo || m.title)}</title>
<style>
  @page { size: A4 landscape; margin: 0; }
  :root { --cyan:#29ABE2; --cyan-d:#1E90C9; --navy:#0E2A63; --navy-2:#0b1f47; --ink:#16324f; --muted:#5b6a7c; --line:#e3e9f2; --warn:#b45309; --warnbg:#fff7ed; }
  * { box-sizing: border-box; }
  body { font-family:-apple-system,"Segoe UI",system-ui,Roboto,Arial,sans-serif; color:var(--ink); margin:0; background:#dfe4ec; line-height:1.55; }
  .bar { position:sticky; top:0; z-index:50; background:var(--navy); color:#fff; padding:10px 16px; display:flex; gap:10px; align-items:center; }
  .bar button { font:inherit; font-weight:700; border:0; border-radius:8px; padding:8px 14px; cursor:pointer; }
  .bar .pdf { background:var(--cyan); color:#fff; } .bar .x { background:rgba(255,255,255,.16); color:#fff; }
  .bar .hint { opacity:.85; font-size:13px; }

  .ttn { display:inline-flex; flex-direction:column; line-height:1; }
  .ttn b { font-weight:900; font-size:20px; letter-spacing:-.04em; color:var(--navy); }
  .ttn b::first-letter { color:var(--cyan); }
  .ttn small { font-size:5px; letter-spacing:.12em; color:var(--navy); margin-top:2px; }

  /* Cada slide/página = una hoja horizontal */
  .slide, .page { position:relative; width:297mm; min-height:209mm; margin:0 auto 14px; background:#fff; overflow:hidden;
    box-shadow:0 10px 34px rgba(14,42,99,.16); break-after:page; }
  .page { break-before:auto; }

  /* Decoraciones */
  .deco { position:absolute; z-index:0; }
  .deco.corner { width:150mm; height:150mm; border-radius:50%; }
  .deco.tl { top:-88mm; left:-70mm; } .deco.br { bottom:-90mm; right:-78mm; }
  .deco.cyan { background:var(--cyan); } .deco.navy { background:var(--navy); }
  .deco.cyan.soft { background:var(--cyan); opacity:.14; }
  .deco.sq { width:14mm; height:40mm; }
  .deco.sq.tl { top:14mm; right:14mm; background:
      linear-gradient(#eef4ff,#eef4ff) center/12mm 10mm no-repeat; }

  /* ---- Portada ---- */
  .cover .logo { position:absolute; top:0; left:0; width:74mm; height:52mm; background:var(--cyan);
    border-bottom-right-radius:52mm; display:grid; place-items:center; z-index:2; }
  .cover .logo .ttn b { color:#fff; } .cover .logo .ttn b::first-letter { color:var(--navy); } .cover .logo .ttn small { color:#fff; }
  .cover h1 { position:relative; z-index:2; margin:0; padding:96mm 0 0 30mm; font-weight:900; font-size:58px; letter-spacing:-.02em; color:var(--navy); line-height:.98; }
  .cover .bar2 { position:absolute; left:30mm; top:150mm; width:120mm; height:5px; background:linear-gradient(90deg,var(--navy) 40%, var(--cyan) 40%); z-index:2; }
  .cover .sub { position:absolute; left:30mm; top:158mm; z-index:2; letter-spacing:.42em; font-size:20px; font-weight:700; color:var(--ink); }
  .cover .device { position:absolute; right:26mm; top:34mm; width:110mm; height:66mm; background:#111827; border-radius:12px; padding:8px; z-index:2; box-shadow:0 14px 30px rgba(0,0,0,.2); }
  .cover .device .scr { width:100%; height:100%; background:#fff; border-radius:6px; display:grid; place-items:center; color:var(--cyan); font-weight:800; font-size:26px; text-align:center; padding:0 18px; }
  .cover .meta { position:absolute; left:30mm; bottom:16mm; z-index:2; color:var(--muted); font-size:13px; }

  /* ---- Índice ---- */
  .toc { background:var(--cyan); color:#fff; }
  .toc .logo { position:absolute; bottom:0; right:0; width:70mm; height:50mm; background:#fff; border-top-left-radius:50mm; display:grid; place-items:center; z-index:2; }
  .toc h1 { position:relative; z-index:2; margin:0; padding:24mm 0 0 26mm; font-size:44px; font-weight:900; letter-spacing:.04em; }
  .toc h1::after { content:""; display:block; margin-top:8px; width:78mm; height:5px; background:linear-gradient(90deg,var(--navy) 45%, #fff 45%); }
  .toc ul { position:relative; z-index:2; list-style:none; margin:22mm 30mm 0; padding:0; display:grid; grid-template-columns:1fr 1fr; gap:16px 40px; }
  .toc li a { display:flex; align-items:center; justify-content:space-between; gap:16px; color:#fff; text-decoration:none; font-weight:800; font-size:19px; }
  .toc li .go { flex:none; width:30px; height:30px; border-radius:50%; background:var(--navy); color:#fff; display:grid; place-items:center; font-style:normal; font-size:18px; }

  /* ---- Separador de sección ---- */
  .divider { background:linear-gradient(135deg,#123a86,var(--navy-2)); color:#fff; display:grid; place-items:center; }
  .dv-circle { position:relative; z-index:2; width:150mm; height:150mm; border-radius:50%; background:var(--cyan); display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:0 24mm; }
  .dv-num { font-size:96px; font-weight:900; line-height:1; }
  .dv-rule { width:44mm; height:3px; background:rgba(255,255,255,.85); margin:10px 0 14px; }
  .dv-title { font-size:34px; font-weight:900; letter-spacing:.02em; }
  .dv-sub { margin-top:10px; font-size:15px; letter-spacing:.14em; opacity:.9; }

  /* ---- Página de contenido ---- */
  .page { padding:20mm 24mm 22mm; }
  .pg-head { position:relative; z-index:2; display:flex; align-items:center; gap:14px; padding-bottom:12px; margin-bottom:16px; border-bottom:3px solid var(--line); }
  .pg-head .hn { flex:none; background:var(--cyan); color:#fff; font-weight:900; border-radius:8px; padding:4px 12px; font-size:16px; }
  .pg-head h2 { flex:1; margin:0; color:var(--navy); font-size:26px; font-weight:900; letter-spacing:-.01em; }
  .pg-head .ttn { transform:scale(.9); transform-origin:right center; }
  .pg-body { position:relative; z-index:2; columns:2; column-gap:18mm; font-size:14px; }
  .pg-body p { margin:6px 0; } .pg-body ul { margin:6px 0 8px 18px; } .pg-body li { margin:4px 0; }
  h3.sub { color:var(--cyan-d); font-size:16px; margin:2px 0 8px; break-after:avoid; }
  .step { break-inside:avoid; border:1px solid var(--line); border-left:4px solid var(--cyan); border-radius:10px; padding:12px 14px; margin:10px 0; }
  .step-h { display:flex; align-items:center; gap:9px; margin-bottom:5px; }
  .step-h .num { flex:none; width:24px; height:24px; border-radius:50%; background:var(--navy); color:#fff; font-weight:700; font-size:12px; display:grid; place-items:center; }
  .step-h .st-t { font-weight:800; font-size:14px; color:var(--navy); }
  .lbl { font-size:10px; font-weight:800; color:var(--cyan-d); margin:8px 0 0; text-transform:uppercase; letter-spacing:.05em; }
  .warn { break-inside:avoid; margin-top:8px; background:var(--warnbg); border:1px solid #fed7aa; border-radius:8px; padding:7px 11px; }
  .warn .wl { font-size:10px; font-weight:800; color:var(--warn); text-transform:uppercase; letter-spacing:.05em; }
  .warn ul { margin:3px 0 0 16px; } .insuf { color:var(--warn); font-style:italic; }
  .gl { break-inside:avoid; display:flex; flex-direction:column; padding:6px 0; border-bottom:1px solid var(--line); } .gl b { color:var(--navy); } .gl span { color:var(--muted); }
  .faq { break-inside:avoid; margin:8px 0; } .faq .q { font-weight:800; color:var(--navy); }

  @media print {
    body { background:#fff; } .bar { display:none; }
    .slide, .page { margin:0; box-shadow:none; width:auto; min-height:auto; }
    .deco, .cover .logo, .toc .logo, .divider, .pg-head .hn, .step-h .num, .warn, .toc li .go, .cover .device .scr, .cover .bar2 {
      -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  }
</style></head>
<body>
  <div class="bar">
    <button class="pdf" onclick="window.print()">Descargar PDF</button>
    <button class="x" onclick="window.close()">Cerrar</button>
    <span class="hint">En el diálogo del navegador: destino “Guardar como PDF”, orientación Horizontal, márgenes “Ninguno”.</span>
  </div>

  <section class="slide cover">
    <div class="logo">${TTN}</div>
    <div class="device"><div class="scr">${esc(d.titulo || m.title)}</div></div>
    <h1>MANUAL<br>DE USUARIO</h1>
    <div class="bar2"></div>
    <div class="sub">${esc((d.subtitulo || m.code || '').toUpperCase())}</div>
    <div class="meta">${meta}</div>
    <span class="deco corner br navy"></span>
  </section>

  ${toc ? `<section class="slide toc">
    <h1>ÍNDICE</h1>
    <ul>${toc}</ul>
    <div class="logo">${TTN}</div>
  </section>` : ''}

  ${content}
</body></html>`;

  const w = window.open('', '_blank', 'width=1040,height=780');
  if (!w) {
    alert('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para ver el manual.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
}

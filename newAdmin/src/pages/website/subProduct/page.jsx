import { useEffect, useState, useCallback } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../images/logowithText.png"

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:         #f4f6fb;
    --surface:    #ffffff;
    --surface2:   #e8f0fc;
    --blue:       #2196F3;
    --blue-dark:  #1565C0;
    --blue-light: #e3f2fd;
    --blue-glow:  rgba(33,150,243,0.15);
    --border:     #d0dce8;
    --border2:    #b0c4d8;
    --text:       #0d1117;
    --text2:      #2c3a4a;
    --muted:      #607080;
    --green:      #2e7d52;
    --green-bg:   #e8f5ee;
    --red:        #c0392b;
    --red-bg:     #fdecea;
    --radius:     12px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .sp-root {
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .sp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 64px;
    background: var(--surface);
    border-bottom: 2px solid var(--blue);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  /* ── Logo ── */
  .sp-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }

  .sp-logo-mark {
    font-family: 'Poppins', sans-serif;
    font-size: 2rem;
    font-weight: 900;
    line-height: 1;
    letter-spacing: -0.02em;
    display: flex;
    align-items: center;
  }

  .sp-logo-a { color: #0d1117; }
  .sp-logo-c { color: #2196F3; }

  .sp-logo-divider {
    width: 1px;
    height: 32px;
    background: var(--border);
    flex-shrink: 0;
  }

  .sp-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }

  .sp-logo-name {
    font-family: 'Poppins', sans-serif;
    font-size: 0.86rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .sp-logo-n1 { color: #0d1117; }
  .sp-logo-n2 { color: #2196F3; }

  .sp-logo-tagline {
    font-size: 0.58rem;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  /* ── Nav right ── */
  .sp-nav-right { display: flex; align-items: center; gap: 10px; }

  .sp-nav-pill {
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--blue);
    background: var(--blue-light);
    border: 1px solid #90caf9;
    padding: 5px 14px;
    border-radius: 20px;
  }

  .sp-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    color: var(--surface);
    background: var(--blue);
    border: none;
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .sp-back-btn:hover { background: var(--blue-dark); }

  /* ── Product Hero ── */
  .sp-hero {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 40px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
  }

  .sp-hero-imgs { display: flex; gap: 8px; flex-shrink: 0; }

  .sp-hero-img-wrap {
    width: 68px;
    height: 68px;
    border-radius: 10px;
    overflow: hidden;
    border: 2px solid var(--border);
    flex-shrink: 0;
  }

  .sp-hero-img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .sp-hero-img-more {
    width: 68px;
    height: 68px;
    border-radius: 10px;
    background: var(--blue-light);
    border: 2px solid #90caf9;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    color: var(--blue);
    font-weight: 700;
    flex-shrink: 0;
  }

  .sp-hero-info { flex: 1; min-width: 200px; }
  .sp-hero-tag { font-size: 0.62rem; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 4px; }
  .sp-hero-name { font-family: 'Poppins', sans-serif; font-size: 1.7rem; font-weight: 700; color: var(--text); line-height: 1.1; margin-bottom: 6px; }

  .sp-hero-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .sp-hero-sku { font-size: 0.76rem; color: var(--muted); }

  .sp-hero-type {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 20px;
    background: var(--blue-light);
    color: var(--blue-dark);
    border: 1px solid #90caf9;
  }

  .sp-hero-cats { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 8px; }

  .sp-hero-cat {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
    background: var(--text);
    color: var(--surface);
    border: 1px solid var(--text);
  }

  /* ── Breadcrumb ── */
  .sp-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 40px 0;
    font-size: 0.74rem;
    color: var(--muted);
    flex-wrap: wrap;
  }

  .sp-breadcrumb-link { color: var(--blue); cursor: pointer; transition: color 0.2s; font-weight: 500; }
  .sp-breadcrumb-link:hover { color: var(--blue-dark); }
  .sp-breadcrumb-sep { color: var(--border2); }
  .sp-breadcrumb-current { color: var(--text2); font-weight: 500; }

  /* ── Page Header ── */
  .sp-page-header {
    padding: 18px 40px 22px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    flex-wrap: wrap;
    gap: 12px;
  }

  .sp-page-title {
    font-family: 'Poppins', sans-serif;
    font-size: 2.4rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
    color: var(--text);
  }

  .sp-page-title span { color: var(--blue); }

  .sp-page-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin-top: 5px;
    letter-spacing: 0.03em;
  }

  /* ── Grid ── */
  .sp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    padding: 28px 40px;
  }

  /* ── Lot Card ── */
  .sp-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.4s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .sp-card:nth-child(1) { animation-delay: 0.04s; }
  .sp-card:nth-child(2) { animation-delay: 0.08s; }
  .sp-card:nth-child(3) { animation-delay: 0.12s; }
  .sp-card:nth-child(4) { animation-delay: 0.16s; }
  .sp-card:nth-child(5) { animation-delay: 0.20s; }
  .sp-card:nth-child(6) { animation-delay: 0.24s; }

  .sp-card:hover {
    border-color: var(--blue);
    transform: translateY(-3px);
  }

  .sp-card:hover .sp-card-img { transform: scale(1.05); }


  .sp-img-wrap {
  height: auto;        /* remove fixed height */
  min-height: 220px;   /* optional minimum */
  aspect-ratio: 1 / 1; /* keeps square shape without cutting */
}

  .sp-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* was: cover */
  background: #f8f8f8;  /* optional: fills empty space around image */
  display: block;
}

  .sp-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.8rem;
    background: var(--surface2);
  }

  /* Subtle gradient only at bottom for readability of badge */
  .sp-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, transparent 40%);
    pointer-events: none;
  }

  /* ── Thumbnail row ── */
  .sp-thumb-row {
    display: flex;
    gap: 5px;
    padding: 8px 10px;
    background: var(--surface2);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }

  .sp-thumb {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    overflow: hidden;
    border: 2px solid var(--border);
    flex-shrink: 0;
    cursor: pointer;
    transition: border-color 0.15s;
  }

  .sp-thumb.active { border-color: var(--blue); }

  .sp-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

  .sp-thumb-count {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    background: var(--surface);
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.6rem;
    color: var(--muted);
    font-weight: 700;
    flex-shrink: 0;
  }

  /* ── Badges ── */
  .sp-stock-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
  }

  .sp-stock-badge.in-stock {
    background: var(--green-bg);
    color: var(--green);
    border: 1px solid #a5d6b7;
  }

  .sp-stock-badge.out-stock {
    background: var(--red-bg);
    color: var(--red);
    border: 1px solid #f1aaa3;
  }

  .sp-color-dot {
    position: absolute;
    top: 10px;
    left: 10px;
    min-width: 26px;
    height: 26px;
    padding: 0 6px;
    border-radius: 13px;
    border: 2px solid rgba(255,255,255,0.8);
    font-size: 0.6rem;
    font-weight: 800;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--blue-dark);
    letter-spacing: 0.05em;
  }

  /* ── Card Body ── */
  .sp-card-body { padding: 14px 16px 16px; }

  .sp-lot-label {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--blue);
    margin-bottom: 3px;
  }

  .sp-lot-num {
    font-family: 'Poppins', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.1;
    margin-bottom: 10px;
  }

  /* Info grid */
  .sp-info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px; }

  .sp-info-cell {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
  }

  .sp-info-cell-label {
    font-size: 0.56rem;
    color: var(--muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 3px;
  }

  .sp-info-cell-val {
    font-size: 0.9rem;
    font-weight: 700;
    color: var(--text);
  }

  /* Sizes */
  .sp-sizes { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 12px; }

  .sp-size-pill {
    font-size: 0.64rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: 6px;
    background: var(--text);
    color: var(--surface);
    border: 1px solid var(--text);
  }

  /* Description */
  .sp-desc {
    font-size: 0.78rem;
    line-height: 1.6;
    color: var(--muted);
    margin-bottom: 10px;
    white-space: pre-line;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  /* Barcode */
  .sp-barcode {
    font-size: 0.6rem;
    color: var(--muted);
    letter-spacing: 0.16em;
    font-family: 'Poppins', sans-serif;
    margin-bottom: 12px;
    background: var(--bg);
    padding: 5px 8px;
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  /* Card footer */
  .sp-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border);
  }

  .sp-price-wrap { display: flex; flex-direction: column; gap: 1px; }
  .sp-price-label { font-size: 0.56rem; color: var(--muted); letter-spacing: 0.1em; text-transform: uppercase; }
  .sp-price { font-family: 'Poppins', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--blue-dark); }
  .sp-lot-price { font-size: 0.7rem; color: var(--muted); margin-top: 1px; }

  .sp-card-btn {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--surface);
    background: var(--blue);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 7px 14px;
    border-radius: 8px;
    transition: gap 0.2s, background 0.2s;
  }

  .sp-card:hover .sp-card-btn { gap: 9px; background: var(--blue-dark); }

  /* ── Skeleton ── */
  .sp-skeleton {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .sp-skel-img {
    height: 200px;
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .sp-skel-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }

  .sp-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* ── Empty ── */
  .sp-empty { text-align: center; padding: 80px 20px; color: var(--muted); }
  .sp-empty-icon { font-size: 3.5rem; margin-bottom: 16px; }

  .sp-empty h2 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    color: var(--text);
    margin-bottom: 8px;
  }

  .sp-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .sp-pag-wrap { padding: 0 40px; }

  .sp-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 0;
    flex-wrap: wrap;
  }

  .sp-page-info {
    font-size: 0.76rem;
    color: var(--muted);
    text-align: center;
    margin-top: 10px;
    letter-spacing: 0.04em;
  }

  .sp-pg-btn {
    height: 38px;
    min-width: 38px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1px solid var(--border2);
    background: var(--surface);
    color: var(--muted);
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: all 0.2s;
  }

  .sp-pg-btn:hover:not(:disabled) {
    border-color: var(--blue);
    color: var(--blue);
    background: var(--blue-light);
  }

  .sp-pg-btn.active {
    background: var(--blue);
    color: #ffffff;
    border-color: var(--blue);
    font-weight: 700;
  }

  .sp-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .sp-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .sp-divider { height: 1px; background: var(--border); margin: 0 40px; }

  @media (max-width: 600px) {
    .sp-nav { padding: 0 16px; }
    .sp-hero { padding: 14px 16px; }
    .sp-breadcrumb { padding: 12px 16px 0; }
    .sp-page-header { padding: 14px 16px 18px; }
    .sp-grid { padding: 16px 16px; gap: 14px; grid-template-columns: 1fr; }
    .sp-pag-wrap { padding: 0 16px; }
    .sp-page-title { font-size: 1.8rem; }
    .sp-divider { margin: 0 16px; }
    .sp-nav-right { gap: 8px; }
  }
  .c-logo-img {
    width: 106px;
    height: 106px;
    object-fit: contain;
    display: block;
    border-radius: 8px;
  }
    .sp-desc ul,
.sp-desc ol {
  padding-left: 20px;
  margin: 8px 0;
}

.sp-desc ul { list-style-type: circle; }
.sp-desc ol { list-style-type: decimal; }

.sp-desc li {
  margin-bottom: 4px;
  line-height: 1.6;
}

.sp-desc p {
  margin: 6px 0;
  line-height: 1.6;
}

.sp-desc strong { font-weight: 700; }
.sp-desc em { font-style: italic; }

.sp-desc a {
  color: var(--blue);
  text-decoration: underline;
}
   /* ── WhatsApp Float Button ── */
.wa-float {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  animation: waBounce 2s ease-in-out infinite;
}

@keyframes waBounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.wa-float a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #25D366;
  box-shadow: 0 4px 16px rgba(37,211,102,0.45);
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;
}

.wa-float a:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 22px rgba(37,211,102,0.6);
}

.wa-float-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #25D366;
  text-transform: uppercase;
  background: #fff;
  border: 1px solid #25D366;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}

@media (max-width: 600px) {
  .wa-float { right: 16px; bottom: 80px; } /* above mobile bottom tab bar */
}
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function parseSizes(raw) {
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return String(raw).split(",").map((s) => s.trim()); }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
  const navigate = useNavigate();
  return (
    <div className="c-logo" onClick={() => navigate("/main-category")}>
      <div className="c-logo-mark">
        <img
          src={logo}
          width={56}
          height={56}
          alt="Anibhavi Creations Logo"
          className="c-logo-img"
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="sp-skeleton">
      <div className="sp-skel-img" />
      <div className="sp-skel-body">
        <div className="sp-skel-line" style={{ height: 9, width: "30%" }} />
        <div className="sp-skel-line" style={{ height: 20, width: "55%" }} />
        <div className="sp-skel-line" style={{ height: 56, width: "100%" }} />
        <div className="sp-skel-line" style={{ height: 9, width: "70%" }} />
      </div>
    </div>
  );
}

function ProductHero({ productData }) {
  if (!productData) return null;
  const images = productData.images || [];
  const categories = productData.categoryId || [];
  const shown = images.slice(0, 3);
  const extra = images.length - shown.length;

  return (
    <div className="sp-hero">
      <div className="sp-hero-imgs">
        {shown.map((img, i) => (
          <div key={i} className="sp-hero-img-wrap">
            <img className="sp-hero-img" src={img} alt={`product-${i}`} />
          </div>
        ))}
        {extra > 0 && <div className="sp-hero-img-more">+{extra}</div>}
      </div>
      <div className="sp-hero-info">
        <div className="sp-hero-tag">SKU: {productData.sku}</div>
        <div className="sp-hero-name">{productData.productName}</div>
        <div className="sp-hero-meta">
          <span className="sp-hero-sku">₹{productData.price?.toLocaleString("en-IN")} / pc</span>
          {productData.type && <span className="sp-hero-type">{productData.type}</span>}
        </div>
        {categories.length > 0 && (
          <div className="sp-hero-cats">
            {categories.map((cat) => (
              <span key={cat._id} className="sp-hero-cat">{cat.name}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LotCard({ item }) {
  const [activeImg, setActiveImg] = useState(0);
  const navigate = useNavigate();

  const images = item.subProductImages || [];
  const sizes = parseSizes(item.sizes);
  const inStock = Number(item?.lotStock) > 0;

  const handleClick = () => {
    navigate(`/product-details/${item?.color}`, {
      state: { productData: item, productId: item?._id },
    });
  };

  const handleThumbClick = (e, i) => {
    e.stopPropagation();
    setActiveImg(i);
  };

  return (
    <div className="sp-card" onClick={handleClick}>

      {/* Main image */}
      <div className="sp-img-wrap">
        {images[activeImg] ? (
          <img
            className="sp-card-img"
            src={images[activeImg]}
            alt={`lot-${item.lotNumber}`}
          />
        ) : (
          <div className="sp-img-fallback">👕</div>
        )}
        <div className="sp-img-overlay" />

        <span className={`sp-stock-badge ${inStock ? "in-stock" : "out-stock"}`}>
          {inStock ? "In Stock" : "Out of Stock"}
        </span>

        {item.color && (
          <div className="sp-color-dot" title={`Color: ${item.color}`}>
            {item.color}
          </div>
        )}
      </div>

      {/* Thumbnail row */}
      {images.length > 1 && (
        <div className="sp-thumb-row">
          {images.slice(0, 4).map((img, i) => (
            <div
              key={i}
              className={`sp-thumb${activeImg === i ? " active" : ""}`}
              onClick={(e) => handleThumbClick(e, i)}
            >
              <img src={img} alt={`thumb-${i}`} />
            </div>
          ))}
          {images.length > 4 && (
            <div className="sp-thumb-count">+{images.length - 4}</div>
          )}
        </div>
      )}

      {/* Card body */}
      <div className="sp-card-body">
        <div className="sp-lot-label">Lot Number</div>
        <div className="sp-lot-num">{item.lotNumber}</div>

        <div className="sp-info-grid">
          <div className="sp-info-cell">
            <div className="sp-info-cell-label">Pcs / Set</div>
            <div className="sp-info-cell-val">{item.pcsInSet}</div>
          </div>
          <div className="sp-info-cell">
            <div className="sp-info-cell-label">Color No.</div>
            <div className="sp-info-cell-val">{item.color}</div>
          </div>
        </div>

        {sizes.length > 0 && (
          <div className="sp-sizes">
            {sizes.map((s) => (
              <span key={s} className="sp-size-pill">{s}</span>
            ))}
          </div>
        )}

        {/* {item.description && (
          <div className="sp-desc">{item.description}</div>
        )} */}

        {item.description && (
          <div
            className="sp-desc"
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
        )}
        {/* {item.barcode && (
          <div className="sp-barcode">Barcode: {item.barcode}</div>
        )} */}

        <div className="sp-card-footer">
          <div className="sp-price-wrap">
            <span className="sp-price-label">Per Piece</span>
            <span className="sp-price">₹{Number(item.singlePicPrice)?.toLocaleString("en-IN")}</span>
            <span className="sp-lot-price">Lot total: ₹{Number(item.filnalLotPrice)?.toLocaleString("en-IN")}</span>
          </div>
          <button
            className="sp-card-btn"
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
          >
            Details <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = paginationRange(currentPage, totalPages);
  return (
    <div className="sp-pagination">
      <button
        className="sp-pg-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="sp-pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`sp-pg-btn${currentPage === p ? " active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="sp-pg-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SubProduct() {
  const [subProducts, setSubProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [priceSort, setPriceSort] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const productId = location.state?.productId;
  const productName = location.state?.productName || "Product";
  const productData = location.state?.productData || null;
  const subCategoryName = location.state?.subCategoryName || "Sub Category";

  const fetchSubProducts = useCallback(async () => {
    if (!productId) {
      setSubProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getData(
        `api/subProduct/get-all-sub-products-by-productId/${productId}`
      );
      if (response?.status === true) {
        setSubProducts(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch lots");
      }
    } catch (error) {
      console.error("fetchSubProducts:", error);
      toast.error("Failed to fetch lots");
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetchSubProducts(); }, [fetchSubProducts]);
  useEffect(() => { setCurrentPage(1); }, [subProducts]);

  const sortedProducts = [...subProducts].sort((a, b) => {
    if (priceSort === "asc") return Number(a.singlePicPrice) - Number(b.singlePicPrice);
    if (priceSort === "desc") return Number(b.singlePicPrice) - Number(a.singlePicPrice);
    return 0; // no sort
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const paginatedData = sortedProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startItem = sortedProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, sortedProducts.length);

  return (
    <>
      <style>{styles}</style>
      <div className="sp-root">

        {/* Navbar */}
        <nav className="sp-nav">
          <Logo />
          <div className="sp-nav-right">
            <span className="sp-nav-pill">{subProducts.length} Lots</span>
            <button className="sp-back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </nav>

        {/* ── WhatsApp Float ── */}
        <div className="wa-float">
          <a href="https://wa.me/918506854624"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            {/* WhatsApp SVG icon — no extra package needed */}
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.61 4.47 1.67 6.35L3 29l6.84-1.64A13 13 0 0 0 16 29c7.18 0 13-5.82 13-13S23.18 3 16 3z" fill="#ffffff" />
              <path d="M21.75 18.92c-.31-.16-1.84-.91-2.13-1.01-.28-.1-.49-.16-.69.16-.2.31-.78.99-.96 1.2-.18.2-.35.22-.66.07-.31-.16-1.3-.48-2.48-1.53-.92-.82-1.54-1.83-1.72-2.14-.18-.31-.02-.47.13-.63.14-.14.31-.35.47-.53.16-.18.21-.31.31-.52.1-.2.05-.38-.03-.53-.08-.16-.69-1.67-.95-2.28-.25-.6-.5-.52-.69-.53h-.59c-.2 0-.52.07-.79.38-.27.31-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.49 1.7.63.72.23 1.37.2 1.88.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.12-.28-.2-.59-.35z" fill="#25D366" />
            </svg>
          </a>
          <span className="wa-float-label">WhatsApp</span>
        </div>
        {/* Product Hero (optional — uncomment if needed) */}
        {/* <ProductHero productData={productData} /> */}

        {/* Breadcrumb */}
        <div className="sp-breadcrumb">
          <span className="sp-breadcrumb-link" onClick={() => navigate("/main-category")}>Home</span>
          <span className="sp-breadcrumb-sep">/</span>
          <span className="sp-breadcrumb-link" onClick={() => navigate(-3)}>Categories</span>
          <span className="sp-breadcrumb-sep">/</span>
          <span className="sp-breadcrumb-link" onClick={() => navigate(-2)}>Sub Category</span>
          <span className="sp-breadcrumb-sep">/</span>
          <span className="sp-breadcrumb-link" onClick={() => navigate(-1)}>{productName}</span>
          <span className="sp-breadcrumb-sep">/</span>
          <span className="sp-breadcrumb-current">Lots</span>
        </div>

        {/* Page Header */}
        <div className="sp-divider" />
        <div className="sp-page-header">
          <div>
            <h1 className="sp-page-title">All Availble Colors <span>{productName}</span></h1>
            <p className="sp-page-sub">
              All colour &amp; size variants for{" "}
              <strong style={{ color: "#1565C0" }}>{productName}</strong>
            </p>
          </div>

          {/* ✅ Price filter — added here, no other UI changes */}
          {/* <select
            value={priceSort}
            onChange={(e) => { setPriceSort(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "7px 14px",
              borderRadius: "8px",
              border: "1px solid var(--border2)",
              background: "var(--surface)",
              color: "var(--text2)",
              fontSize: "0.82rem",
              fontWeight: 600,
              fontFamily: "Poppins, sans-serif",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              paddingRight: "32px",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23607080' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">Sort by Price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select> */}
        </div>
        <div className="sp-divider" />
        {/* Content */}
        {loading ? (
          <div className="sp-grid">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : subProducts.length === 0 ? (
          <div className="sp-empty">
            <div className="sp-empty-icon">🗂️</div>
            <h2>No lots found</h2>
            <p>No colour/size lots have been added for this product yet.</p>
          </div>
        ) : (
          <>
            <div className="sp-grid">
              {paginatedData.map((item) => (
                <LotCard key={item._id} item={item} />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="sp-pag-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <p className="sp-page-info">
                  Showing {startItem}–{endItem} of {subProducts.length} lots
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
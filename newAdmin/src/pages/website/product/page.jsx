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
    --bg:          #f4f6fb;
    --surface:     #ffffff;
    --surface2:    #e8f0fc;
    --blue:        #2196F3;
    --blue-dark:   #1565C0;
    --blue-light:  #e3f2fd;
    --border:      #d0dce8;
    --border2:     #b0c4d8;
    --text:        #0d1117;
    --text2:       #2c3a4a;
    --muted:       #607080;
    --green:       #2e7d52;
    --green-bg:    #e8f5ee;
    --red:         #c0392b;
    --red-bg:      #fdecea;
    --radius:      12px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .p-root {
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .p-nav {
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
  .p-logo { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; }
  .p-logo-mark { font-family: 'Poppins', sans-serif; font-size: 2rem; font-weight: 900; line-height: 1; letter-spacing: -0.02em; display: flex; align-items: center; }
  .p-logo-a { color: #0d1117; }
  .p-logo-c { color: #2196F3; }
  .p-logo-divider { width: 1px; height: 32px; background: var(--border); flex-shrink: 0; }
  .p-logo-text { display: flex; flex-direction: column; line-height: 1; gap: 3px; }
  .p-logo-name { font-family: 'Poppins', sans-serif; font-size: 0.86rem; font-weight: 900; letter-spacing: 0.1em; text-transform: uppercase; }
  .p-logo-n1 { color: #0d1117; }
  .p-logo-n2 { color: #2196F3; }
  .p-logo-tagline { font-size: 0.58rem; color: var(--muted); letter-spacing: 0.2em; text-transform: uppercase; }

  /* ── Nav right ── */
  .p-nav-right { display: flex; align-items: center; gap: 10px; }

  .p-nav-pill {
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

  .p-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.76rem;
    font-weight: 600;
    color: #ffffff;
    background: var(--blue);
    border: none;
    padding: 7px 16px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .p-back-btn:hover { background: var(--blue-dark); }

  /* ── Breadcrumb ── */
  .p-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 40px 0;
    font-size: 0.74rem;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .p-breadcrumb-link { color: var(--blue); cursor: pointer; font-weight: 500; transition: color 0.2s; }
  .p-breadcrumb-link:hover { color: var(--blue-dark); }
  .p-breadcrumb-sep { color: var(--border2); }
  .p-breadcrumb-current { color: var(--text2); font-weight: 500; }

  /* ── Page header ── */
  .p-page-header {
    padding: 22px 40px 26px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    gap: 16px;
    flex-wrap: wrap;
  }
  .p-page-title { font-family: 'Poppins', sans-serif; font-size: 2.8rem; font-weight: 700; line-height: 1; letter-spacing: -0.01em; color: var(--text); }
  .p-page-title span { color: var(--blue); }
  .p-page-sub { font-size: 0.82rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.03em; }

  /* ── Filter bar ── */
  .p-filter-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 18px 40px 0;
    flex-wrap: wrap;
  }

  .p-filter-label {
    font-size: 0.68rem;
    color: var(--muted);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-right: 4px;
    font-weight: 600;
  }

  .p-filter-btn {
    font-size: 0.7rem;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 20px;
    border: 1px solid var(--border2);
    background: var(--surface);
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
  }
  .p-filter-btn:hover { border-color: var(--blue); color: var(--blue); }
  .p-filter-btn.active { background: var(--blue); color: #ffffff; border-color: var(--blue); font-weight: 700; }

  /* ── Grid ── */
  .p-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 20px;
    padding: 28px 40px;
  }

  /* ── Product Card ── */
  .p-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.2s, transform 0.2s;
    animation: fadeUp 0.45s ease both;
    display: flex;
    flex-direction: column;
  }
  .c-logo-img {
    width: 106px;
    height: 106px;
    object-fit: contain;
    display: block;
    border-radius: 8px;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .p-card:nth-child(1) { animation-delay: 0.04s; }
  .p-card:nth-child(2) { animation-delay: 0.08s; }
  .p-card:nth-child(3) { animation-delay: 0.12s; }
  .p-card:nth-child(4) { animation-delay: 0.16s; }
  .p-card:nth-child(5) { animation-delay: 0.20s; }
  .p-card:nth-child(6) { animation-delay: 0.24s; }

  .p-card:hover {
    border-color: var(--blue);
    transform: translateY(-3px);
  }
  .p-card:hover .p-card-img { transform: scale(1.05); }

  /* ── Card image ── */
 .p-img-wrap {
  height: auto;
  min-height: 220px;
  aspect-ratio: 1 / 1;
  position: relative;
  overflow: hidden;
  background: #f8f8f8;
  flex-shrink: 0;
}

  .p-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;  /* was: cover */
  background: #f8f8f8;
  display: block;
  transition: transform 0.45s ease;
}

  .p-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 3rem;
    background: var(--surface2);
  }

  /* Subtle gradient at bottom only */
  .p-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.3) 0%, transparent 45%);
    pointer-events: none;
  }

  /* Image count chip */
  .p-img-count {
    position: absolute;
    bottom: 10px;
    right: 10px;
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    background: rgba(255,255,255,0.92);
    color: var(--text2);
    border: 1px solid var(--border);
    padding: 3px 8px;
    border-radius: 10px;
  }

  /* Type badge */
  .p-type-badge {
    position: absolute;
    top: 10px;
    left: 10px;
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .p-type-badge.best-seller {
    background: #0d1117;
    color: #ffffff;
    border: 1px solid #0d1117;
  }

  .p-type-badge.new-arrival {
    background: var(--blue);
    color: #ffffff;
    border: 1px solid var(--blue);
  }

  .p-type-badge.default {
    background: rgba(0,0,0,0.6);
    color: #ffffff;
    border: 1px solid rgba(0,0,0,0.3);
  }

  /* Status dot */
  .p-status-dot {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 9px;
    height: 9px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.7);
  }
  .p-status-dot.active   { background: var(--green); }
  .p-status-dot.inactive { background: var(--red); }

  /* ── Card body ── */
  .p-card-body { padding: 14px 16px 16px; display: flex; flex-direction: column; flex: 1; }

  .p-card-sku {
    font-size: 0.6rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--blue);
    margin-bottom: 4px;
  }

  .p-card-name {
    font-family: 'Poppins', sans-serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.15;
    margin-bottom: 8px;
  }

  /* Category chips */
  .p-cat-chips { display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px; }

  .p-cat-chip {
    font-size: 0.58rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
    background: var(--text);
    color: #ffffff;
    border: 1px solid var(--text);
  }

  /* Card footer */
  .p-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid var(--border);
    margin-top: auto;
  }

  .p-price-label { font-size: 0.56rem; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; display: block; }
  .p-price { font-family: 'Poppins', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--blue-dark); }

  .p-card-btn {
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #ffffff;
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
  .p-card:hover .p-card-btn { gap: 9px; background: var(--blue-dark); }

  /* ── Skeleton ── */
  .p-skeleton {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
  }

  .p-skel-img {
    height: 220px;
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

  .p-skel-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }

  .p-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface2) 25%, #dae4f0 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* ── Empty ── */
  .p-empty { text-align: center; padding: 100px 20px; color: var(--muted); }
  .p-empty-icon { font-size: 3.5rem; margin-bottom: 18px; }
  .p-empty h2 { font-family: 'Poppins', sans-serif; font-size: 1.5rem; color: var(--text); margin-bottom: 8px; }
  .p-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .p-pag-wrap { padding: 0 40px; }

  .p-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 0;
    flex-wrap: wrap;
  }

  .p-page-info {
    font-size: 0.76rem;
    color: var(--muted);
    text-align: center;
    margin-top: 10px;
    letter-spacing: 0.04em;
  }

  .p-pg-btn {
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

  .p-pg-btn:hover:not(:disabled) {
    border-color: var(--blue);
    color: var(--blue);
    background: var(--blue-light);
  }

  .p-pg-btn.active {
    background: var(--blue);
    color: #ffffff;
    border-color: var(--blue);
    font-weight: 700;
  }

  .p-pg-btn:disabled { opacity: 0.35; cursor: not-allowed; }
  .p-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .p-divider { height: 1px; background: var(--border); margin: 0 40px; }

  @media (max-width: 600px) {
    .p-nav { padding: 0 16px; }
    .p-breadcrumb { padding: 12px 16px 0; }
    .p-page-header { padding: 18px 16px 22px; }
    .p-filter-bar { padding: 14px 16px 0; }
    .p-grid { padding: 18px 16px; gap: 14px; grid-template-columns: 1fr 1fr; }
    .p-pag-wrap { padding: 0 16px; }
    .p-page-title { font-size: 2rem; }
    .p-divider { margin: 0 16px; }
  }

  @media (max-width: 400px) {
    .p-grid { grid-template-columns: 1fr; }
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

function typeBadgeClass(type = "") {
  const t = type.toLowerCase().replace(/\s+/g, "-");
  if (t.includes("best")) return "best-seller";
  if (t.includes("new")) return "new-arrival";
  return "default";
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
    <div className="p-skeleton">
      <div className="p-skel-img" />
      <div className="p-skel-body">
        <div className="p-skel-line" style={{ height: 9, width: "30%" }} />
        <div className="p-skel-line" style={{ height: 20, width: "65%" }} />
        <div className="p-skel-line" style={{ height: 9, width: "80%" }} />
        <div className="p-skel-line" style={{ height: 9, width: "55%" }} />
      </div>
    </div>
  );
}

function ProductCard({ item }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const images = item.images || [];
  const currentImg = images[imgIdx];
  const categories = item.subCategoryId || [];

  const handleClick = () => {
    navigate(`/sub-products`, {
      state: { productId: item._id, productName: item.productName, productData: item },
    });
  };

  return (
    <div
      className="p-card"
      onClick={handleClick}
      onMouseEnter={() => images.length > 1 && setImgIdx(1)}
      onMouseLeave={() => setImgIdx(0)}
    >
      <div className="p-img-wrap">
        {currentImg && !imgError ? (
          <img
            className="p-card-img"
            src={currentImg}
            alt={item.productName}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="p-img-fallback">👖</div>
        )}
        <div className="p-img-overlay" />

        {item.type && (
          <span className={`p-type-badge ${typeBadgeClass(item.type)}`}>
            {item.type}
          </span>
        )}

        {/* <span
          className={`p-status-dot ${item.status && item.isActive ? "active" : "inactive"}`}
          title={item.status ? "Active" : "Inactive"}
        /> */}

        {images.length > 1 && (
          <span className="p-img-count">{images.length} photos</span>
        )}
      </div>

      <div className="p-card-body">
        {/* <div className="p-card-sku">SKU: {item.sku}</div> */}
        <h2 className="p-card-name">{item.productName}</h2>

        {categories.length > 0 && (
          <div className="p-cat-chips">
            {categories.map((cat) => (
              <span key={cat._id} className="p-cat-chip">{cat.name}</span>
            ))}
          </div>
        )}

        <div className="p-card-footer">
          <div>
            <span className="p-price-label">Price / pc</span>
            <span className="p-price">₹{item.price?.toLocaleString("en-IN")}</span>
          </div>
          <button
            className="p-card-btn"
            onClick={(e) => { e.stopPropagation(); handleClick(); }}
          >
            View Colors <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = paginationRange(currentPage, totalPages);
  return (
    <div className="p-pagination">
      <button
        className="p-pg-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="p-pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`p-pg-btn${currentPage === p ? " active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="p-pg-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Product() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeType, setActiveType] = useState("All");
  const [priceSort, setPriceSort] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const subCategoryId = location.state?.subCategoryId;
  const subCategoryName = location.state?.subCategoryName || "Products";
  const categoryName = location.state?.categoryName || "Category";

  const fetchProducts = useCallback(async () => {
    if (!subCategoryId) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getData(
        `api/product/get-product-by-sub-category/${subCategoryId}`
      );
      if (response?.success) {
        setProducts(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch products");
      }
    } catch (error) {
      console.error("fetchProducts:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [subCategoryId]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Build unique type options from data
  const typeOptions = [
    "All",
    ...Array.from(new Set(products.map((p) => p.type).filter(Boolean))),
  ];

  useEffect(() => {
    setCurrentPage(1);
    setFiltered(
      activeType === "All"
        ? products
        : products.filter((p) => p.type === activeType)
    );
  }, [products, activeType]);

  const sortedFiltered = [...filtered].sort((a, b) => {
    if (priceSort === "asc") return Number(a.price) - Number(b.price);
    if (priceSort === "desc") return Number(b.price) - Number(a.price);
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sortedFiltered.length / PAGE_SIZE));
  const paginatedData = sortedFiltered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const startItem = sortedFiltered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, sortedFiltered.length);

  return (
    <>
      <style>{styles}</style>
      <div className="p-root">

        {/* Navbar */}
        <nav className="p-nav">
          <Logo />
          <div className="p-nav-right">
            <span className="p-nav-pill">{filtered.length} Products</span>
            <button className="p-back-btn" onClick={() => navigate(-1)}>← Back</button>
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="p-breadcrumb">
          <span className="p-breadcrumb-link" onClick={() => navigate("/main-category")}>Home</span>
          <span className="p-breadcrumb-sep">/</span>
          <span className="p-breadcrumb-link" onClick={() => navigate(-2)}>Categories</span>
          <span className="p-breadcrumb-sep">/</span>
          <span className="p-breadcrumb-link" onClick={() => navigate(-1)}>Sub Categories</span>
          <span className="p-breadcrumb-sep">/</span>
          <span className="p-breadcrumb-current">Products</span>
        </div>

        {/* Page Header */}
        <div className="p-page-header">
          <div>
            <h1 className="p-page-title">All <span>Products</span></h1>
            <p className="p-page-sub">
              Showing products under{" "}
              <strong style={{ color: "var(--blue-dark)" }}>{subCategoryName}</strong>
            </p>
          </div>

          {/* ✅ Price sort — only addition */}
          <select
            value={priceSort}
            onChange={(e) => { setPriceSort(e.target.value); setCurrentPage(1); }}
            style={{
              padding: "7px 32px 7px 14px",
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
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23607080' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 10px center",
            }}
          >
            <option value="">Sort by Price</option>
            <option value="asc">Price: Low to High</option>
            <option value="desc">Price: High to Low</option>
          </select>
        </div>

        <div className="p-divider" />

        {/* Filter bar */}
        {!loading && typeOptions.length > 1 && (
          <div className="p-filter-bar">
            <span className="p-filter-label">Filter:</span>
            {typeOptions.map((t) => (
              <button
                key={t}
                className={`p-filter-btn${activeType === t ? " active" : ""}`}
                onClick={() => setActiveType(t)}
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="p-grid">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-empty">
            <div className="p-empty-icon">📦</div>
            <h2>No products found</h2>
            <p>
              {activeType !== "All"
                ? `No "${activeType}" products available.`
                : "Add products to this subcategory to get started."}
            </p>
          </div>
        ) : (
          <>
            <div className="p-grid">
              {paginatedData.map((item) => (
                <ProductCard key={item._id} item={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="p-pag-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <p className="p-page-info">
                  Showing {startItem}–{endItem} of {filtered.length} products
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
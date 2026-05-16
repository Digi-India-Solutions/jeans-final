import { useEffect, useState, useCallback } from "react";
import { getData } from "../../../services/FetchNodeServices";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";
import logo from '../../images/logowithText.png'

// ─── Constants ───────────────────────────────────────────────────────────────
const PAGE_SIZE = 12;

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600&display=swap');

  :root {
    --bg:        #ffffff;
    --surface:   #ffffff;
    --surface2:  #ffffff;
    --blue:      #2196F3;
    --blue-dark: #1565C0;
    --blue-light:#bbdefb;
    --border:    #000000;
    --border2:   #2196F3;
    --text:      #000000;
    --muted:     #444444;
    --green:     #4caf7d;
    --red:       #e05c5c;
    --radius:    14px;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .c-root {
    font-family: 'Poppins', sans-serif;
    background: var(--bg);
    min-height: 100vh;
    color: var(--text);
    padding-bottom: 60px;
  }

  /* ── Navbar ── */
  .c-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    height: 68px;
    background: var(--surface);
    border-bottom: 2px solid var(--blue);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .c-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    text-decoration: none;
    user-select: none;
  }

  .c-logo-mark {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .c-logo-img {
    width: 106px;
    height: 106px;
    object-fit: contain;
    display: block;
    border-radius: 8px;
  }

  .c-logo-a { color: #000000; }
  .c-logo-c { color: #2196F3; }

  .c-logo-divider {
    width: 1px;
    height: 34px;
    background: var(--blue-light);
    flex-shrink: 0;
  }

  .c-logo-text {
    display: flex;
    flex-direction: column;
    line-height: 1;
    gap: 3px;
  }

  .c-logo-name {
    font-family: 'Poppins', sans-serif;
    font-size: 0.88rem;
    font-weight: 900;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .c-logo-n1 { color: #000000; }
  .c-logo-n2 { color: #2196F3; }

  .c-logo-tagline {
    font-size: 0.6rem;
    color: var(--muted);
    letter-spacing: 0.2em;
    text-transform: uppercase;
  }

  .c-nav-pill {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #ffffff;
    background: var(--blue);
    border: 1px solid var(--blue-dark);
    padding: 6px 16px;
    border-radius: 20px;
  }

  /* ── Page header ── */
  .c-page-header {
    padding: 18px 40px 18px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 1px solid #000000;
  }

  .c-page-title {
    font-family: 'Poppins', sans-serif;
    font-size: 2.8rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.01em;
    color: #000000;
  }

  .c-page-title span { color: var(--blue); }

  .c-page-sub {
    font-size: 0.82rem;
    color: var(--muted);
    margin-top: 6px;
    letter-spacing: 0.04em;
  }

  /* ── Grid ── */
  .c-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 22px;
    padding: 36px 40px;
  }

  /* ── Breadcrumb ── */
  .c-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 14px 40px 0;
    font-size: 0.74rem;
    color: var(--muted);
    flex-wrap: wrap;
  }
  .c-breadcrumb-link { color: var(--blue); cursor: pointer; font-weight: 500; transition: color 0.2s; }
  .c-breadcrumb-link:hover { color: var(--blue-dark); }
  .c-breadcrumb-sep { color: var(--border2); }
  .c-breadcrumb-current { color: var(--text2); font-weight: 500; }

  /* ── Card ── */
  .c-card {
    background: var(--surface);
    border: 1.5px solid #000000;
    border-radius: var(--radius);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.25s, transform 0.25s;
    animation: fadeUp 0.45s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .c-card:nth-child(1) { animation-delay: 0.04s; }
  .c-card:nth-child(2) { animation-delay: 0.08s; }
  .c-card:nth-child(3) { animation-delay: 0.12s; }
  .c-card:nth-child(4) { animation-delay: 0.16s; }
  .c-card:nth-child(5) { animation-delay: 0.20s; }
  .c-card:nth-child(6) { animation-delay: 0.24s; }

  .c-card:hover {
    border-color: var(--blue);
    transform: translateY(-4px);
  }

  .c-card:hover .c-card-img { transform: scale(1.06); }

  .c-img-wrap {
    height: 210px;
    position: relative;
    overflow: hidden;
    background: var(--surface2);
  }

  .c-card-img {
     width: 100%;
  height: 100%;
  object-fit: contain;  /* was: cover */
  background: #ffffff;
  display: block;
  transition: transform 0.45s ease;
  }

  .c-img-fallback {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.8rem;
    background: var(--surface2);
  }

  .c-img-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, transparent 55%);
    pointer-events: none;
  }

  .c-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    font-size: 0.65rem;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .c-badge.active   { background: rgba(76,175,125,0.15); color: var(--green); border: 1px solid rgba(76,175,125,0.4); }
  .c-badge.inactive { background: rgba(224,92,92,0.15);  color: var(--red);   border: 1px solid rgba(224,92,92,0.4); }

  .c-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }

  .c-card-body { padding: 18px 20px 20px; }

  .c-card-slug {
    font-size: 0.65rem;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--blue);
    margin-bottom: 5px;
  }

  .c-card-name {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #000000;
    margin-bottom: 8px;
    line-height: 1.15;
  }

  .c-card-desc {
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--muted);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .c-card-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 12px;
    border-top: 1px solid #000000;
  }

  .c-card-date { font-size: 0.72rem; color: var(--muted); }

  .c-card-btn {
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--blue);
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0;
    transition: gap 0.2s, color 0.2s;
  }

  .c-card:hover .c-card-btn { gap: 9px; color: var(--blue-dark); }

  /* ── Skeleton ── */
  .c-skeleton {
    background: var(--surface);
    border: 1.5px solid #000000;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .c-skel-img {
    height: 210px;
    background: linear-gradient(90deg, var(--surface2) 25%, #bbdefb 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  @keyframes shimmer {
    0%   { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .c-skel-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 10px; }

  .c-skel-line {
    border-radius: 6px;
    background: linear-gradient(90deg, var(--surface2) 25%, #bbdefb 50%, var(--surface2) 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite;
  }

  /* ── Empty ── */
  .c-empty { text-align: center; padding: 100px 20px; color: var(--muted); }
  .c-empty-icon { font-size: 3.5rem; margin-bottom: 18px; }

  .c-empty h2 {
    font-family: 'Poppins', sans-serif;
    font-size: 1.5rem;
    color: #000000;
    margin-bottom: 8px;
  }

  .c-empty p { font-size: 0.88rem; }

  /* ── Pagination ── */
  .c-pag-wrap { padding: 0 40px; }

  .c-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 0;
    flex-wrap: wrap;
  }

  .c-page-info {
    font-size: 0.76rem;
    color: var(--muted);
    text-align: center;
    margin-top: 10px;
    letter-spacing: 0.04em;
  }

  .c-pg-btn {
    height: 38px;
    min-width: 38px;
    padding: 0 12px;
    border-radius: 8px;
    border: 1.5px solid #000000;
    background: #ffffff;
    color: #000000;
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition: border-color 0.2s, color 0.2s, background 0.2s;
  }

  .c-pg-btn:hover:not(:disabled) {
    border-color: var(--blue);
    color: var(--blue);
    background: var(--surface2);
  }
    .c-nav-pill {
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
  .c-nav-right { display: flex; align-items: center; gap: 10px; }

 .c-back-btn {
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
  .c-back-btn:hover { background: var(--blue-dark); }

  .c-pg-btn.active {
    background: var(--blue);
    color: #ffffff;
    border-color: var(--blue);
    font-weight: 700;
  }

  .c-pg-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .c-pg-ellipsis { font-size: 0.9rem; color: var(--muted); width: 24px; text-align: center; }

  .c-divider { height: 1px; background: #000000; margin: 0 40px; }

  @media (max-width: 600px) {
    .c-nav { padding: 0 18px; }
    .c-page-header { padding: 30px 18px 20px; flex-direction: column; align-items: flex-start; gap: 10px; }
    .c-grid { padding: 20px 18px; gap: 16px; }
    .c-breadcrumb { padding: 12px 16px 0; }
    .c-pag-wrap { padding: 0 18px; }
    .c-page-title { font-size: 2rem; }
    .c-divider { margin: 0 18px; }
  }
    /* ── Banner ── */
 /* ── Banner ── */
.mc-banner-wrap {
  width: 100% !important;
  overflow: hidden !important;
  position: relative !important;
  height: 460px !important;
  background: #000 !important;
}

.mc-banner-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
  position: relative !important;
  z-index: 1 !important;
}

.mc-banner-blur {
  position: absolute !important;
  inset: 0 !important;
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;

  z-index: 0 !important;
  display: block !important;
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
function formatDate(dateVal) {
  const raw = dateVal?.$date || dateVal;
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function paginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Logo() {
  const navigate = useNavigate();
  return (
    <div className="c-logo" onClick={() => navigate("/")}>
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
    <div className="c-skeleton">
      <div className="c-skel-img" />
      <div className="c-skel-body">
        <div className="c-skel-line" style={{ height: 10, width: "35%" }} />
        <div className="c-skel-line" style={{ height: 22, width: "60%" }} />
        <div className="c-skel-line" style={{ height: 10, width: "90%" }} />
        <div className="c-skel-line" style={{ height: 10, width: "75%" }} />
      </div>
    </div>
  );
}

function SubCategoryCard({ item }) {
  const [imgError, setImgError] = useState(false);
  const navigate = useNavigate();

  const image = item.images?.[0];

  const handleClick = () => {
    navigate(`/products/${item.slug}`, {
      state: { subCategoryId: item._id, subCategoryName: item.name },
    });
  };

  return (
    <div className="c-card" onClick={handleClick}>
      {/* Main image */}
      <div className="c-img-wrap">
        {image && !imgError ? (
          <img
            className="c-card-img"
            src={image}
            alt={item?.name}
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="c-img-fallback">🧵</div>
        )}
        <div className="c-img-overlay" />
        <span className={`c-badge ${item.status ? "active" : "inactive"}`}>
          <span className="c-badge-dot" />
          {item.status ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Body */}
      <div className="c-card-body">
        <div className="c-card-slug">/{item.slug}</div>
        <h2 className="c-card-name">{item.name}</h2>
        <div className="c-card-footer">
          <div className="c-card-meta" />
          <button className="c-card-btn">
            View <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = paginationRange(currentPage, totalPages);

  return (
    <div className="c-pagination">
      <button
        className="c-pg-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        ← Prev
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="c-pg-ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`c-pg-btn${currentPage === p ? " active" : ""}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className="c-pg-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next →
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SubCategory() {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const location = useLocation();
  const navigate = useNavigate();
  const categoryId = location.state?.categoryId;
  const categoryName = location.state?.categoryName || "Category";

  const fetchSubCategories = useCallback(async () => {
    if (!categoryId) {
      setSubCategories([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getData(
        `api/category/get_category_by_main_category/${categoryId}`
      );
      if (response?.success) {
        setSubCategories(response?.data || []);
      } else {
        toast.error(response?.message || "Failed to fetch subcategories");
      }
    } catch (error) {
      console.error("fetchSubCategories:", error);
      toast.error("Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [subCategories]);

  const totalPages = Math.max(1, Math.ceil(subCategories.length / PAGE_SIZE));
  const paginatedData = subCategories.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const startItem = subCategories.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(currentPage * PAGE_SIZE, subCategories.length);

  return (
    <>
      <style>{styles}</style>
      <div className="c-root">

        {/* Navbar */}
        <nav className="c-nav">
          <Logo />
          <div className="c-nav-right">
            <span className="c-nav-pill">{subCategories.length} Sub-categories</span>
            <button className="c-back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
          </div>
        </nav>

         {/* ── WhatsApp Float ── */}
        <div className="wa-float">
         <a href="https://wa.me/918383850709"   
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

        {/* Breadcrumb */}
        <div className="c-breadcrumb">
          <span className="c-breadcrumb-link" onClick={() => navigate("/")}>Home</span>
          <span className="c-breadcrumb-sep">/</span>
          <span className="c-breadcrumb-link" onClick={() => navigate(-1)}>Categories</span>
          <span className="c-breadcrumb-sep">/</span>
          <span className="c-breadcrumb-current">Sub Category</span>
        </div>

        {/* Page Header */}
        <div className="c-page-header">
          <div>
            <h1 className="c-page-title">Sub <span>Categories</span></h1>
            <p className="c-page-sub">
              Exploring subcategories under <strong style={{ color: "#2196F3" }}>{categoryName}</strong>
            </p>
          </div>
        </div>

        <div className="c-divider" />

        {/* Content */}
        {loading ? (
          <div className="c-grid">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : subCategories.length === 0 ? (
          <div className="c-empty">
            <div className="c-empty-icon">📂</div>
            <h2>No subcategories yet</h2>
            <p>Add subcategories under this category to get started.</p>
          </div>
        ) : (
          <>
            <div className="c-grid">
              {paginatedData.map((item) => (
                <SubCategoryCard
                  key={item._id?.$oid || item._id || item.slug}
                  item={item}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="c-pag-wrap">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
                <p className="c-page-info">
                  Showing {startItem}–{endItem} of {subCategories.length} subcategories
                </p>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}
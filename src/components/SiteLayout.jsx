import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, Moon, Sun, X, ArrowUpRight } from "lucide-react";

function initialTheme() {
  try {
    const saved = localStorage.getItem("maiharsa-theme");
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Local storage may be unavailable.
  }
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function useSiteTheme() {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("maiharsa-theme", theme);
    } catch {
      // Theme remains active for this session.
    }
  }, [theme]);
  const toggleTheme = () => setTheme((current) => current === "light" ? "dark" : "light");
  return { theme, toggleTheme };
}

const navItems = [
  ["About", "/about"],
  ["3D Art", "/portfolio/3d-art"],
  ["Filmmaking", "/portfolio/filmmaking"],
  ["Photography", "/portfolio/photography"],
  ["Furokidz", "/furokidz"],
  ["Contact", "/contact"],
];

export default function SiteLayout({ children, pageClass = "", isHome = false }) {
  const { theme, toggleTheme } = useSiteTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
    if (location.pathname !== "/" || !location.hash) {
      if (location.pathname !== "/") window.scrollTo({ top: 0, behavior: "instant" });
    }
    if (location.pathname === "/" && location.hash) {
      requestAnimationFrame(() => {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [location.pathname, location.hash]);

  const goToWork = (event) => {
    event.preventDefault();
    setMenuOpen(false);
    if (location.pathname === "/") {
      document.getElementById("work")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/#work");
    }
  };

  const goHome = (event) => {
    if (location.pathname === "/") {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className={`site-page ${pageClass}`}>
      <header className="site-header">
        <Link className="site-brand" to="/" onClick={goHome} aria-label="Maiharsa home">
          <span>MAIHARSA MUARA<span className="brand-dot"></span></span>
        </Link>

        <button
          className="site-mobile-toggle"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={menuOpen}
          type="button"
        >
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav className={`site-nav ${menuOpen ? "is-open" : ""}`} aria-label="Navigasi utama">
          <a href="/#work" onClick={goToWork} className={isHome && location.hash === "#work" ? "active" : ""}>Work</a>
          {navItems.map(([label, to]) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => isActive ? "active" : ""}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header-actions">
          <button
            className="site-theme-toggle"
            onClick={toggleTheme}
            aria-label={`Aktifkan ${theme === "light" ? "dark" : "light"} mode`}
            title="Ganti tema"
            type="button"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <Link className="site-contact-cta" to="/contact">Let&apos;s talk <ArrowUpRight size={15} /></Link>
        </div>
      </header>

      {children}

      <footer className="site-footer">
        <span>© {new Date().getFullYear()} Maiharsa Muara, Made with curiosity.</span>
        <div className="site-footer-links">
          <a href="https://www.instagram.com/harsa31/" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="https://www.instagram.com/furokidz/" target="_blank" rel="noreferrer">Furokidz ↗</a>
        </div>
      </footer>
    </div>
  );
}

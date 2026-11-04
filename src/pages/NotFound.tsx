import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="shell">
      <main className="main">
        <section
          className="screen"
          aria-label="Página não encontrada"
          style={{ minHeight: "70vh", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 20 }}
        >
          <div style={{ position: "relative", width: "min(320px, 80vw)", aspectRatio: "1", display: "grid", placeItems: "center" }}>
            <div className="blob-404" aria-hidden="true" />
            <div className="h" style={{ fontSize: "clamp(84px, 22vw, 132px)", fontWeight: 400, position: "relative" }}>
              404
            </div>
          </div>
          <h1 className="h h2" style={{ fontSize: 28 }}>
            Esse espaço está vazio
          </h1>
          <p className="mut" style={{ margin: 0, maxWidth: 360 }}>
            A página que você procura não existe ou mudou de lugar.
          </p>
          <button type="button" className="btn" onClick={() => navigate("/")}>
            Voltar para a Home
          </button>
        </section>
      </main>
    </div>
  );
};

export default NotFound;

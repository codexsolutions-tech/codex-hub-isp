import { useMemo } from "react";
import { ChevronRight, Megaphone } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { card } from "../components/ui/styles";
import { hexA } from "../theme/tokens";

export default function Anuncios({ items = [], onOpen }) {
  const { A, provider, t } = useTheme();

  const anuncios = useMemo(
    () => items.filter((i) => i?.ativo !== false),
    [items]
  );

  if (!anuncios.length) return null;

  const hasImage = (item) =>
    !!(
      item.link_imagem ||
      item.imagem ||
      item.image ||
      item.banner ||
      item.urlImagem ||
      item.imagemUrl
    );

  const getImage = (item) =>
    resolveImageUrl(
    item.link_imagem ||
    item.imagem ||
    item.image ||
    item.banner ||
    item.urlImagem ||
    item.imagemUrl
  );


  // Converte links do Google Drive em URL de imagem direta
const resolveImageUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  // Extrai o ID do arquivo dos formatos mais comuns do Drive
  const match =
    url.match(/\/file\/d\/([^/]+)/) ||     // .../file/d/ID/view
    url.match(/[?&]id=([^&]+)/) ||          // ...?id=ID  /  open?id=ID
    url.match(/\/d\/([^/]+)/);             // .../d/ID

  if (match && url.includes("drive.google.com")) {
    const id = match[1];
    // thumbnail é o endpoint mais confiável para embutir imagem
    return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
    // alternativa: return `https://lh3.googleusercontent.com/d/${id}=w1600`;
  }

  return url; // não é Drive: retorna como está
};

  return (
    <div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: t.text }}>
          Parcerias e vantagens
        </div>
        <span style={{ display: "flex", alignItems: "center", fontSize: 12.5, color: t.sub, cursor: "default" }}>
          Ver todas <ChevronRight size={15} />
        </span>
      </div>
    <div
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        paddingBottom: 2,
      }}
    >
        
      {anuncios.map((item, i) => {
        const imagem = getImage(item);

        // ==========================
        // ANÚNCIO COM IMAGEM
        // ==========================
        if (hasImage(item)) {
          return (
            <div
              key={item.id ?? i}
              onClick={() => onOpen?.(item)}
              style={{
                minWidth: "100%",
                scrollSnapAlign: "center",
                cursor: "pointer",
                borderRadius: 22,
                overflow: "hidden",
                position: "relative",
                aspectRatio: "16 / 7",
                background: t.surface,
                boxShadow: "0 12px 28px rgba(0,0,0,.12)",
              }}
            >
              <img
                src={imagem}
                alt={item.titulo}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(0,0,0,.75), rgba(0,0,0,.05))",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 18,
                  right: 18,
                  bottom: 18,
                  color: "#fff",
                }}
              >
                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    lineHeight: 1.15,
                    fontFamily: "'Plus Jakarta Sans',sans-serif",
                  }}
                >
                  {item.titulo}
                </div>

                {item.descricao && (
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 13,
                      opacity: 0.9,
                      lineHeight: 1.45,
                    }}
                  >
                    {item.descricao}
                  </div>
                )}
              </div>
            </div>
          );
        }

        // ==========================
        // ANÚNCIO SEM IMAGEM
        // ==========================
        return (
          <div
            key={item.id ?? i}
            onClick={() => onOpen?.(item)}
            style={{
                ...card(t),
              minWidth: "100%",
              scrollSnapAlign: "center",
              cursor: "pointer",
              background: `linear-gradient(140deg, ${A} 0%, ${provider.accent2} 100%)`,
              color: "#fff",
              border: "none",
              overflow: "hidden",
              position: "relative",
              padding: 22,
            }}
          >
            <div
              style={{
                position: "absolute",
                right: -20,
                top: -20,
                width: 140,
                height: 140,
                borderRadius: "50%",
                background: "rgba(255,255,255,.08)",
            }}
            />

            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                display: "grid",
                placeItems: "center",
                background: "rgba(255,255,255,.15)",
                marginBottom: 18,
              }}
            >
              <Megaphone size={28} />
            </div>

            {item.subtitulo && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  opacity: 0.8,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {item.subtitulo}
              </div>
            )}

            <div
              style={{
                marginTop: 6,
                fontSize: 22,
                fontWeight: 800,
                lineHeight: 1.2,
                fontFamily: "'Plus Jakarta Sans',sans-serif",
              }}
            >
              {item.titulo}
            </div>

            {item.descricao && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 14,
                  opacity: 0.92,
                  lineHeight: 1.6,
                }}
              >
                {item.descricao}
              </div>
            )}

            <div
              style={{
                marginTop: 22,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 14px",
                borderRadius: 999,
                background: hexA("#FFFFFF", 0.18),
                fontWeight: 700,
                fontSize: 13,
            }}
            >
              Saiba mais
              <ChevronRight size={16} />
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
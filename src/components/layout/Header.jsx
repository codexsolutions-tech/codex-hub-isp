import { useLocation, useNavigate } from "react-router-dom";
import { Bell, Settings } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { iniciais, primeiroNome, resolveImageUrl } from "../../utils/format";
import { iconBtn } from "../ui/styles";

const TITULOS = {
  "/app/faturas": "Faturas",
  "/app/suporte": "Suporte",
  "/app/velocidade": "Teste de velocidade",
  "/app/perfil": "Meu perfil",
  "/app/config": "Configurações",
  "/app/indicacoes": "Indicações",
  "/app/satisfacao": "Avaliação Serviços",
  "/app/avaliacao": "Avaliação App",
};

export default function Header() {
  const { A, provider, t } = useTheme();
  const { cliente } = useAuth();
  const { showToast } = useToast();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const isHome = pathname === "/app" || pathname === "/app/";
  const nome = cliente ? primeiroNome(cliente.dadosCadastrais.nome) : "";

  return (
    <header style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", gap: 12, background: t.surface, borderBottom: `1px solid ${t.border}` }}>
     <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: provider.logo_url
              ? "transparent"
              : `linear-gradient(135deg, ${A}, ${provider.accent2})`,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {provider.logo_url ? (
           <>
      <img
        src={resolveImageUrl(provider.logo_url)}
        alt={provider.nome}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        
        onError={(e) => {
          <span
          style={{
            fontSize: 34,
            color: "#fff",
          }}
          >
        {iniciais(provider.nome)}
      </span>// opcional
        }}
        />
    </>
          ) : (
            <span style={{ color: "#fff", fontSize: 20 }}>{iniciais(provider.nome)}</span>
          )}
      </div>
      
      <div style={{ flex: 1, minWidth: 0 }}>
        {isHome ? (
          <>
            <div style={{ fontSize: 12, color: t.sub }}>Bem-vindo,</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 16, color: t.text }}>{nome}</div>
          </>
        ) : (
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 18, color: t.text }}>
            {TITULOS[pathname] || "Central"}
          </div>
        )}
      </div>
      <button onClick={() => showToast("Nenhuma notificação nova")} style={iconBtn(t)}>
        <Bell size={19} />
        <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 4, background: A, border: `2px solid ${t.surface}` }} />
      </button>
      <button onClick={() => nav("/app/config")} style={iconBtn(t)}>
        <Settings size={19} />
      </button>
    </header>
  );
}

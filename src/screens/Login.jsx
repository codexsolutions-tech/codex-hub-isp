import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertCircle, RefreshCw, ShieldCheck } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { maskCpfCnpj, docValido, iniciais, resolveImageUrl } from "../utils/format";
import { inputStyle, btnPrimary, errStyle } from "../components/ui/styles";

export default function Login() {
  const { A, provider, t } = useTheme();
  const { entrar } = useAuth();
  const nav = useNavigate();
  const [doc, setDoc] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const acessar = async () => {
    if (!docValido(doc)) { setErro("Informe um CPF ou CNPJ válido."); return; }
    setErro(""); setLoading(true);
    try {
      const r = await entrar({ codigoProvedor: provider.codigo, cpfCnpj: doc });
      if (r.contratos) {
        // login retornou vários contratos -> tela de escolha
        nav("/contratos", { state: { contratos: r.contratos, cpfCnpj: doc, codigoProvedor: provider.codigo } });
      } else {
        // login retornou o cliente (token) -> dashboard direto
        nav("/app", { replace: true });
      }
    } catch (e) {
      setErro(e.message || "Não foi possível entrar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", background: t.bg }}>
      <div style={{ padding: "56px 28px 40px", background: `linear-gradient(150deg, ${A} 0%, ${provider.accent2} 100%)`, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, position: "relative", color: "#fff" }}>
        <button onClick={() => nav("/provedor")} style={{ position: "absolute", top: 22, left: 20, width: 38, height: 38, borderRadius: 12, background: "rgba(255,255,255,.18)", border: "none", color: "#fff", display: "grid", placeItems: "center", cursor: "pointer" }}>
          <ArrowLeft size={20} />
        </button>
        <div
  style={{
    width: 66,
    height: 66,
    borderRadius: 20,
    background: "rgba(255,255,255,.16)",
    border: "1px solid rgba(255,255,255,.3)",
    display: "grid",
    placeItems: "center",
    overflow: "hidden",
    marginTop: 12,
    padding: 6,
  }}
>
  {provider.logo_url ? (
    <img
      src={resolveImageUrl(provider.logo_url)}
      alt={provider.nome}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
      }}
      onError={(e) => {
        e.currentTarget.src = "/logo-default.png"; // opcional
      }}
    />
  ) : (
    <span
      style={{
        fontSize: 34,
        color: "#fff",
      }}
    >
      {iniciais(provider.nome)}
    </span>
  )}
</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 26, fontWeight: 800, marginTop: 16 }}>{provider.nome}</div>
        <div style={{ fontSize: 13.5, opacity: 0.9, marginTop: 3 }}>{provider.tag}</div>
      </div>

      <div style={{ flex: 1, padding: "34px 28px", display: "flex", flexDirection: "column" }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontSize: 21, fontWeight: 800, margin: 0, color: t.text }}>Acesse sua conta</h2>
        <p style={{ color: t.sub, fontSize: 13.5, marginTop: 6 }}>Entre com seu CPF ou CNPJ cadastrado.</p>

        <label style={{ fontSize: 12.5, fontWeight: 600, color: t.sub, marginTop: 24, display: "block" }}>CPF ou CNPJ</label>
        <input
          className="fld"
          value={doc}
          inputMode="numeric"
          onChange={(e) => setDoc(maskCpfCnpj(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && acessar()}
          placeholder="000.000.000-00"
          style={{ ...inputStyle(t, A), marginTop: 8, fontSize: 17 }}
        />
        {erro && <div style={errStyle}><AlertCircle size={14} /> {erro}</div>}

        <button className="btn-a" onClick={acessar} disabled={loading} style={{ ...btnPrimary(A), marginTop: 22 }}>
          {loading ? <RefreshCw size={18} className="spin" /> : <>Entrar <ArrowRight size={18} /></>}
        </button>

         {/*  <button onClick={() => setDoc("116.324.333-70")} style={{ marginTop: 16, background: "none", border: "none", color: A, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
          Usar CPF de demonstração
        </button>   */}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 8, justifyContent: "center", color: t.sub, fontSize: 11.5 }}>
          <ShieldCheck size={14} color={A} /> Conexão segura · seus dados protegidos
        </div>
      </div>
    </div>
  );
}

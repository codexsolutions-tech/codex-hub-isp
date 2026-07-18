import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Wifi, Zap, QrCode, Copy, Calendar, ArrowDownRight, ArrowUpRight,
  FileText, LifeBuoy, MessageSquareText, User, Gauge,
  UserPlus
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { STATUS, hexA } from "../theme/tokens";
import { brl, dataBR, statusFatura, mesAbrev } from "../utils/format";
import { getBanners, getAnuncios } from "../api/client";
import { card, btnPrimary, btnGhost } from "../components/ui/styles";
import { StatusPill, MiniStat, Legend, Atalho } from "../components/ui/widgets";
import BannerCarousel from "../components/ui/BannerCarousel";
import Parcerias from "../components/ui/Parcerias";
import Anuncios from "./Anuncios";
import { MOCK_ANUNCIOS } from "../data/marketing";

export default function Dashboard() {
  const { A, provider, t } = useTheme();
  const { cliente, token } = useAuth();
  const { showToast } = useToast();
  const { openPay } = useOutletContext();
  const nav = useNavigate();

  const aberta = cliente.ultimasFaturas.find((f) => statusFatura(f, new Date()) === "aberta");
  const statuscontrato = cliente.isBloqueado ? "Bloqueado" : "Ativo";
  const plano = cliente.plano[0];
  const { consumos } = cliente;
  
  const chartData = consumos.consumoMensalLabels.length > 0 ? consumos.consumoMensalLabels.map((l, i) => ({
    mes: mesAbrev(l),
    down: consumos.consumoMensalDown[i],
    up: consumos.consumoMensalUp[i],
  })) :  [];
  const idx = consumos.consumoMensalDown.length - 1;
  const downAtual = chartData.length > 0 ? consumos.consumoMensalDown[idx] : 0;
  const upAtual = chartData.length > 0 ? consumos.consumoMensalUp[idx] : 0;

  const [banners, setBanners] = useState([]);
  const [anuncios, setAnuncios] = useState([]);

  useEffect(() => {
    getBanners(provider.codigo).then(setBanners).catch(() => {});
    getAnuncios(provider.codigo).then(setAnuncios).catch(() => {});
  }, [provider.codigo]);

  const copyBarras = async (v) => {
    try { await navigator.clipboard.writeText(v); showToast("Código de barras copiado"); }
    catch { showToast("Não foi possível copiar", "alert"); }
  };

 const normalizarUrl = (url) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;

const abrirOferta = (item) => {
  const destino = item.link_acao || "";

  if (destino.startsWith("/")) {
    // rota INTERNA do app -> navega sem sair do PWA
    nav(destino, { state: { item } });
  } else if (destino) {
    // link EXTERNO -> abre no navegador
    window.open(normalizarUrl(destino), "_blank", "noopener");
  } else {
    showToast(item.titulo || item.nome || "Abrindo…");
  }
};

  return (
    <div style={{ padding: "18px 18px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* banner (carrossel) */}
      <BannerCarousel items={banners} onOpen={abrirOferta} />

      {/* status conexão */}
      <div style={{ ...card(t), padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: statuscontrato === 'Ativo' ? hexA(STATUS.ok, 0.14) : hexA(STATUS.danger, 0.14), display: "grid", placeItems: "center" }}>
            <Wifi size={22} color={statuscontrato === 'Ativo' ?  STATUS.ok : STATUS.danger} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, color: t.sub }}>Seu contrato</div>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15.5, color: t.text }}>{statuscontrato}</div>
          </div>
          {statuscontrato === 'Ativo' ? <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: STATUS.ok, background: hexA(STATUS.ok, 0.12), padding: "5px 10px", borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: STATUS.ok }} /> Online
          </span> :
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: STATUS.danger, background: hexA(STATUS.danger, 0.12), padding: "5px 10px", borderRadius: 20 }}>
            <span style={{ width: 7, height: 7, borderRadius: 4, background: STATUS.danger }} /> Offline
          </span> 
          }
        </div>
        <div style={{ display: "flex", borderTop: `1px solid ${t.border}` }}>
          <MiniStat icon={<ArrowDownRight size={15} color={A} />} label="Download" value={`${downAtual} GB`} />
          <div style={{ width: 1, background: t.border }} />
          <MiniStat icon={<ArrowUpRight size={15} color={A} />} label="Upload" value={`${upAtual} GB`} />
        </div>
      </div>

      {/* plano */}
      <div style={{ ...card(t), background: `linear-gradient(140deg, ${A} 0%, ${provider.accent2} 100%)`, color: "#fff", border: "none", position: "relative", overflow: "hidden" }}>
        <Zap size={120} color="rgba(255,255,255,.10)" style={{ position: "absolute", right: -20, top: -20 }} />
        <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: 0.5 }}>SEU PLANO</div>
        <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 22, marginTop: 6, lineHeight: 1.2 }}>{plano.descricao}</div>
        {/* <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 4, maxWidth: 240 }}>{plano.descricao}</div> */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 16 }}>
          <span style={{ fontSize: 22, fontWeight: 800 }}>{brl(plano.valor)}</span>
          <span style={{ fontSize: 12.5, opacity: 0.85 }}>/mês</span>
        </div>
      </div>

      {/* fatura em aberto */}
      {aberta && (
        <div style={card(t)}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12.5, color: t.sub, fontWeight: 600 }}>Fatura em aberto</div>
            <StatusPill status="aberta" />
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 800, fontSize: 28, color: t.text }}>{brl(aberta.valor)}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: t.sub, marginTop: 2 }}>
              <Calendar size={13} /> Vence em {dataBR(aberta.dataVencimento)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            <button className="btn-a" onClick={() => openPay(aberta)} style={{ ...btnPrimary(A), flex: 1 }}>
              <QrCode size={17} /> Pagar com Pix
            </button>
            <button onClick={() => copyBarras(aberta.linhaDigitavel)} style={btnGhost(t)}>
              <Copy size={17} />
            </button>
          </div>
        </div>
      )}

      {/* consumo */}
      {chartData.length > 0 ? <div style={card(t)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: "'Plus Jakarta Sans',sans-serif", fontWeight: 700, fontSize: 15, color: t.text }}>Consumo mensal</div>
          <span style={{ fontSize: 11.5, color: t.sub }}>em GB</span>
        </div>
        <div style={{ display: "flex", gap: 16, marginBottom: 6 }}>
          <Legend color={A} label="Download" />
          <Legend color={provider.accent2} label="Upload" />
        </div>
        { chartData[0].down > 0 && <div style={{ height: 170, marginLeft: -8 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="gd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={A} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={A} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={provider.accent2} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={provider.accent2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={t.border} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: t.sub }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: t.sub }} axisLine={false} tickLine={false} width={34} />
              <Tooltip
                contentStyle={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 12, fontSize: 12, color: t.text }}
                labelStyle={{ color: t.text, fontWeight: 700 }}
                formatter={(v, n) => [`${v} GB`, n === "down" ? "Download" : "Upload"]}
              />
              <Area type="monotone" dataKey="down" stroke={A} strokeWidth={2.5} fill="url(#gd)" />
              <Area type="monotone" dataKey="up" stroke={provider.accent2} strokeWidth={2.5} fill="url(#gu)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>}
      </div> : null}

      {/* Banner anuncios*/}
      <Anuncios
        items={anuncios}
        onOpen={abrirOferta}
      />

      {/* parcerias */}
      {/* <Parcerias items={parcerias} onOpen={abrirOferta} /> */}

      {/* atalhos */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Atalho icon={FileText} label="2ª via" onClick={() => nav("/app/faturas")} />
        { token.gerenciador === "IXCSOFT" ? "" : <Atalho icon={LifeBuoy} label="Abrir chamado" onClick={() => nav("/app/suporte")} />}
        <Atalho icon={MessageSquareText} label="Fale conosco" onClick={() => nav("/app/suporte")} />
        <Atalho icon={User} label="Meus dados" onClick={() => nav("/app/perfil")} />
        <Atalho icon={Gauge} label="Teste de velocidade" onClick={() => nav("/app/velocidade")} />
        <Atalho icon={UserPlus} label="Indique um amigo" onClick={() => nav("/app/indicacoes")} />
      </div>
    </div>
  );
}

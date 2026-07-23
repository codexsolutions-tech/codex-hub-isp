import { PROVIDERS, DEFAULT_PROVIDER } from "../data/providers";
import { MOCK_CLIENTE, MOCK_CHAMADOS, MOCK_CONTRATOS } from "../data/mockCliente";
import { MOCK_BANNERS, MOCK_PARCERIAS } from "../data/marketing";
import { soDigitos } from "../utils/format";

const BASE = import.meta.env.PROD ? import.meta.env.VITE_API_URL_NET : import.meta.env.VITE_API_URL;
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? "true") === "true";
const MOCK_MULTICONTRATO = String(import.meta.env.VITE_MOCK_MULTICONTRATO ?? "true") === "true";

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", "Accept":"/", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => "");
    throw new Error(msg.data || `Erro ${res.status}`);
  }
  return res.json();
}

/* -------------------------------------------------------------------------- *
 *  Provedor: recebe o código e devolve tema + logo (white-label)             *
 * -------------------------------------------------------------------------- */
export async function getProvider(codigo) {
  if (USE_MOCK) {
    await delay(700);
    const p = PROVIDERS[String(codigo).trim()];
    if (!p) return { ...DEFAULT_PROVIDER, codigo: String(codigo).trim() };
    return p;
  }
  // API real — ajuste o caminho conforme seu backend:
  // deve devolver { codigo, nome, tag, accent, accent2, logoUrl }
  const {data}  = await request(`/provedores/temas/${encodeURIComponent(codigo)}`);
  return data;
}

/* -------------------------------------------------------------------------- *
 *  Login: valida o CPF/CNPJ e devolve os dados do cliente                    *
 * -------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------- *
 *  Login: pode devolver O CLIENTE (token) OU uma LISTA de contratos          *
 *  - data = objeto  -> acesso direto ao dashboard                            *
 *  - data = array   -> tela de escolha de contrato                           *
 * -------------------------------------------------------------------------- */
export async function loginCliente({ codigoProvedor, cpfCnpj }) {
  if (USE_MOCK) {
    await delay(900);
    if (MOCK_MULTICONTRATO) {
      return { statusCode: 200, message: "Contratos do cliente", data: MOCK_CONTRATOS };
    }
    return { statusCode: 200, message: "Dados Cliente RECEITANET", data: MOCK_CLIENTE };
  }

  // API real — o backend decide: retorna o cliente OU o array de contratos
  const token = await request('/login/token', {
    method: "POST",
    body: JSON.stringify({ codigoProvedor, cpfCnpj: soDigitos(cpfCnpj) })
  })

  token.data.cpfCnpj = cpfCnpj;
  

  return await ObterDadosCliente(token);

 /*  const cliente = await request(`/dados-cliente`, {
    method: "POST",
    body: JSON.stringify(token.data),
  });
  console.log(cliente.data)
  return {
    dadosToken: token.data,
    dadosCliente: cliente.data
  } */

}

async function ObterDadosCliente(token){
    

  const dadosToken = token.data || token
  if(!dadosToken.multiploCadastro){

      const cliente = await request(`/dados-cliente`, {
        method: "POST",
        body: JSON.stringify(dadosToken),
      });

    return {
      dadosToken: dadosToken,
      dadosCliente: cliente.data
    }
  }

  return {
      dadosToken: dadosToken,
      dadosCliente: null
    }
}

/* -------------------------------------------------------------------------- *
 *  Dados de um contrato específico (após o cliente escolher na tela)         *
 *  Deve devolver o payload "Dados Cliente RECEITANET" daquele contrato.      *
 * -------------------------------------------------------------------------- */
export async function getContratoCliente({ codigoProvedor, cpfCnpj, contratoId }) {
  if (USE_MOCK) {
    await delay(700);
    return { statusCode: 200, message: "Dados Cliente RECEITANET", data: MOCK_CLIENTE };
  }

  const token = await request(`/login/token/contrato`, {
    method: "POST",
    body: JSON.stringify({ codigoProvedor, cpfCnpj: soDigitos(cpfCnpj), contratoId }),
  });

  return ObterDadosCliente(token.data) //contrato.data;
}

/* -------------------------------------------------------------------------- *
 *  Faturas: consultar faturas do cliente                                     *
 * -------------------------------------------------------------------------- */
export async function  getFaturas(token) {
  const faturas = await request('/faturas', {
    method: "POST",
    body: JSON.stringify(token)
  })

  return faturas.data;
}


/* ---------------------------------- status --------------------------------- */
 
// respostas_status: 0 = cliente falou por último (aguardando suporte)
//                   1 = suporte respondeu (há mensagem nova para o cliente)
export const AGUARDANDO_SUPORTE = 0;
export const SUPORTE_RESPONDEU = 1;
 
/* -------------------------------- utilitários ------------------------------- */
 
// O protocolo é um timestamp: 20260710093137 → 10/07/2026 09:31
export function protocoloParaData(protocolo) {
  const p = String(protocolo ?? "");
  if (p.length < 12) return "";
  return `${p.slice(6, 8)}/${p.slice(4, 6)}/${p.slice(0, 4)} ${p.slice(8, 10)}:${p.slice(10, 12)}`;
}
 
/* ------------------------------- normalizadores ----------------------------- */
 
export const normalizarChamado = (c = {}) => {
  const status = Number(c.respostasStatus ?? AGUARDANDO_SUPORTE);
  const aberto = c.status === "Aberto";
  return {
    id: c.id,
    protocolo: c.protocolo ?? "",
    descricao: c.descricao ?? "",
    aberto: aberto,
    respostasStatus: status,
    temRespostaDoSuporte: status === SUPORTE_RESPONDEU,
    data: protocoloParaData(c.protocolo),
  };
};
 
// ⚠️ CONFIRMAR: campos de uma resposta individual. Aceita as variações mais prováveis
// para não quebrar; assim que você vir o payload real, deixe só a chave correta.
const respostaEhDoCliente = (r) => {
  if (typeof r.is_cliente === "boolean") return r.is_cliente;
  if (typeof r.is_suporte === "boolean") return !r.is_suporte;
  if (typeof r.origem === "string") return r.origem.toLowerCase() === "cliente";
  if (r.tipo != null) return Number(r.tipo) === 1;
  return false;
};
 
export const normalizarResposta = (r = {}) => ({
  id: r.id,
  mensagem: r.resposta ?? r.descricao ?? r.mensagem ?? r.texto ?? "",
  data: r.datahora ?? r.data ?? r.data_hora ?? r.created_at ?? "",
  doCliente: respostaEhDoCliente(r),
});
 
/* ---------------------------------- chamados -------------------------------- */
 
export async function listarChamados(token) {
  const data = await request("/chamados",{ 
    method: "POST",
    body: JSON.stringify(token)
  });
  const chamados = Array.isArray(data) ? data.data : (data?.data ?? []);
  return chamados.map(normalizarChamado);
}
 
// Não devolve o chamado criado de propósito: o POST pode não retornar `id`/`protocolo`,
// e a tela recarrega a lista logo em seguida (fonte única da verdade).
export async function abrirChamado(token, { assunto, categoria, descricao }) {

  const payload = { assunto, categoria, descricao }

  return request("/chamados/novo", {
    method: "POST",
    body: JSON.stringify({
      token:token.token,
      payload: payload
    })
  })
}
 
/* --------------------------------- respostas -------------------------------- */
 
export async function listarRespostas(token, chamadoId) {
  const response = await request(`/chamados/mensagem/receber`, {
    method: "POST",
    body: JSON.stringify({ token:token, idChamado: chamadoId })
  });
  const respostas = Array.isArray(response.data) ? response.data : (response.data?.respostas ?? []);
  return respostas.map(normalizarResposta);
}
 
// ⚠️ CONFIRMAR: a chave do corpo (`descricao` vs `mensagem`).
// Depois deste POST o ReceitaNet zera o respostas_status até o suporte responder.
export async function enviarResposta(token, chamadoId, descricao) {
  return request(`/chamados/mensagem/enviar`, {
    method: "POST",
    body: JSON.stringify({ token:token, idChamado: chamadoId, mensagem: descricao }),
  });
}

/* -------------------------------------------------------------------------- *
 *  Marketing da home: banners (carrossel) e parcerias — por provedor         *
 * -------------------------------------------------------------------------- */
export async function getBanners(codigoProvedor) {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_BANNERS;
  }
  const { data } = await request(`/provedores/banners/${codigoProvedor}`);
  return data;
}

export async function getAnuncios(codigoProvedor) {
  if (USE_MOCK) {
    await delay(300);
    return MOCK_PARCERIAS;
  }
  const { data } = await request(`/provedores/anuncios/${codigoProvedor}`);
  return data;
}

export async function enviarIndicacao(params) {

  const { data } = await request(`/provedores/indicacao`, {
    method: "POST",
    body: JSON.stringify(params)
  });
  return data;
}

export async function enviarAvaliacao({cliente, nota, mensagem, codigoProvedor, rota }) {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 600));
    return { ok: true };
  }
  const { data } = await request(`/provedores/avaliacao/${rota}/me`, {
    method: "POST",
    body: JSON.stringify({cliente, nota, mensagem, codigo_provedor_fk: codigoProvedor }),
  });
  return data;
}

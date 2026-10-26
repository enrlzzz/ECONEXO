import "./index.css";
import "/src/variables.css";

import { useEffect, useRef, useState, useCallback } from "react";
import HeaderInterface from "../header-interface";
import { buscarPontosRecarga } from "../../../services/pontosRecarga";

import { MdEvStation } from "react-icons/md";
import { IoLocation } from "react-icons/io5";
import { MdMyLocation } from "react-icons/md";
import { FiRefreshCw } from "react-icons/fi";

// Coordenadas do centro de Sorocaba — fallback quando geolocalização não está disponível.
const SOROCABA = { lat: -23.5015, lng: -47.4526 };

export default function PontosRecarga() {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const marcadoresRef = useRef([]);

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [pontos, setPontos] = useState([]);
  const [centro, setCentro] = useState(SOROCABA);
  const [raio, setRaio] = useState(30);
  const [localizando, setLocalizando] = useState(false);

  // Inicializa o mapa Leaflet uma única vez após a montagem.
  useEffect(() => {
    if (leafletMapRef.current) return;

    import("leaflet").then((L) => {
      // Corrige o caminho dos ícones do Leaflet quando empacotados pelo Vite.
      delete L.default.Icon.Default.prototype._getIconUrl;
      L.default.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const mapa = L.default
        .map(mapRef.current, { zoomControl: true })
        .setView([centro.lat, centro.lng], 12);

      L.default
        .tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> | Pontos: <a href="https://openchargemap.org">Open Charge Map</a>',
          maxZoom: 19,
        })
        .addTo(mapa);

      leafletMapRef.current = mapa;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Atualiza os marcadores no mapa sempre que `pontos` mudar.
  useEffect(() => {
    if (!leafletMapRef.current) return;

    import("leaflet").then((L) => {
      // Remove marcadores anteriores.
      marcadoresRef.current.forEach((m) => m.remove());
      marcadoresRef.current = [];

      pontos.forEach((ponto) => {
        const popup = L.default.popup().setContent(popupHTML(ponto));
        const marcador = L.default
          .marker([ponto.latitude, ponto.longitude])
          .bindPopup(popup)
          .addTo(leafletMapRef.current);
        marcadoresRef.current.push(marcador);
      });
    });
  }, [pontos]);

  const buscar = useCallback(
    async (lat, lng) => {
      setCarregando(true);
      setErro(null);
      try {
        const resultado = await buscarPontosRecarga(lat, lng, raio);
        setPontos(resultado);

        if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 12);
        }
      } catch (ex) {
        setErro(ex.message || "Não foi possível carregar os pontos agora.");
      } finally {
        setCarregando(false);
      }
    },
    [raio],
  );

  // Carrega os pontos de Sorocaba ao montar.
  useEffect(() => {
    buscar(centro.lat, centro.lng);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function usarMinhaLocalizacao() {
    if (!navigator.geolocation) {
      setErro("Seu navegador não suporta geolocalização.");
      return;
    }
    setLocalizando(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const novocentro = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCentro(novocentro);
        setLocalizando(false);
        buscar(novocentro.lat, novocentro.lng);
      },
      () => {
        setLocalizando(false);
        setErro(
          "Não foi possível obter sua localização. Verifique as permissões do navegador.",
        );
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }

  return (
    <div className="pontos-recarga-page">
      <HeaderInterface />

      <main className="pontos-recarga-main">
        <div className="pontos-recarga-cabecalho">
          <h1>
            <MdEvStation className="pr-icon-titulo" />
            Pontos de Recarga EV
          </h1>
          <p className="pr-subtitulo">
            Encontre carregadores para veículos elétricos próximos a você
          </p>
        </div>

        <div className="pr-controles">
          <div className="pr-campo-raio">
            <label htmlFor="raio">Raio de busca</label>
            <select
              id="raio"
              value={raio}
              onChange={(e) => setRaio(Number(e.target.value))}
            >
              <option value={10}>10 km</option>
              <option value={20}>20 km</option>
              <option value={30}>30 km</option>
              <option value={50}>50 km</option>
              <option value={100}>100 km</option>
            </select>
          </div>

          <button
            className="pr-btn pr-btn-localizacao"
            onClick={usarMinhaLocalizacao}
            disabled={localizando || carregando}
            title="Usar minha localização atual"
          >
            <MdMyLocation />
            {localizando ? "Localizando…" : "Minha localização"}
          </button>

          <button
            className="pr-btn pr-btn-sorocaba"
            onClick={() => {
              setCentro(SOROCABA);
              buscar(SOROCABA.lat, SOROCABA.lng);
            }}
            disabled={carregando}
            title="Centralizar em Sorocaba, SP"
          >
            <IoLocation />
            Sorocaba, SP
          </button>

          <button
            className="pr-btn pr-btn-atualizar"
            onClick={() => buscar(centro.lat, centro.lng)}
            disabled={carregando}
            title="Recarregar pontos"
          >
            <FiRefreshCw className={carregando ? "spin" : ""} />
            {carregando ? "Buscando…" : "Atualizar"}
          </button>
        </div>

        {erro && (
          <div className="pr-aviso pr-erro" role="alert">
            {erro}
          </div>
        )}

        {!carregando && !erro && pontos.length === 0 && (
          <div className="pr-aviso pr-vazio">
            Nenhum ponto de recarga encontrado nessa área.
          </div>
        )}

        {!carregando && pontos.length > 0 && (
          <p className="pr-contagem">
            {pontos.length} ponto{pontos.length !== 1 ? "s" : ""} encontrado
            {pontos.length !== 1 ? "s" : ""}
          </p>
        )}

        <div
          ref={mapRef}
          className="pr-mapa"
          aria-label="Mapa de pontos de recarga"
        />
      </main>
    </div>
  );
}

function popupHTML(ponto) {
  const conectores = ponto.conectores
    .map(
      (c) =>
        `<li>${c.tipo} — Nível ${c.nivel} (${c.quantidade}x)</li>`,
    )
    .join("");

  return `
    <div class="pr-popup">
      <strong>${escHtml(ponto.nome)}</strong>
      ${ponto.endereco ? `<p>${escHtml(ponto.endereco)}</p>` : ""}
      <span class="pr-popup-status pr-status-${slugStatus(ponto.statusOperacional)}">
        ${escHtml(ponto.statusOperacional)}
      </span>
      ${conectores ? `<ul class="pr-popup-conectores">${conectores}</ul>` : ""}
    </div>
  `;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugStatus(status) {
  if (!status) return "desconhecido";
  const s = status.toLowerCase();
  if (s.includes("operational") || s.includes("operacion")) return "operacional";
  if (s.includes("planned") || s.includes("planej")) return "planejado";
  if (s.includes("not in service") || s.includes("fora")) return "fora";
  return "desconhecido";
}

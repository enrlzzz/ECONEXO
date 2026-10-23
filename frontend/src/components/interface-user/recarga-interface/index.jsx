import "./index.css";
import "leaflet/dist/leaflet.css";

import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import HeaderInterface from "../header-interface";
import { recargaService } from "../../../services/recarga";

// Centro de Sorocaba — mesmo ponto que o backend usa como origem da busca.
const CENTRO_SOROCABA = [-23.5015, -47.4526];

const ROTULO_STATUS = {
  OPERACIONAL: "Operacional",
  FORA_DO_AR: "Fora do ar",
  DESCONHECIDO: "Status desconhecido",
};

/**
 * Marcador desenhado em CSS (divIcon). O ícone padrão do Leaflet aponta para
 * imagens por caminho relativo, que o bundler do Vite não resolve — o pino
 * apareceria quebrado.
 */
function iconePara(status) {
  return L.divIcon({
    className: "recarga-pino-wrap",
    html: `<span class="recarga-pino recarga-pino--${status.toLowerCase()}"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function rotaUrl(ponto) {
  return `https://www.google.com/maps/dir/?api=1&destination=${ponto.lat},${ponto.lng}`;
}

export default function RecargaInterface() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    recargaService
      .pontos()
      .then((r) => ativo && setDados(r))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const pontos = useMemo(() => dados?.pontos ?? [], [dados]);
  const indisponivel = dados && !dados.disponivel;

  return (
    <div className="recarga-page">
      <HeaderInterface />
      <main className="recarga-container">
        <div className="recarga-titulo">
          <h1>Pontos de recarga em Sorocaba</h1>
          <p>
            Carregadores de veículos elétricos num raio de 25 km do centro.
            Os dados são colaborativos: confirme com o operador antes de ir.
          </p>
        </div>

        {carregando && <p className="recarga-aviso">Carregando pontos…</p>}
        {erro && <p className="recarga-aviso recarga-aviso--erro">{erro}</p>}
        {indisponivel && (
          <p className="recarga-aviso recarga-aviso--erro">{dados.mensagem}</p>
        )}
        {dados?.disponivel && pontos.length === 0 && (
          <p className="recarga-aviso">
            Nenhum ponto cadastrado na região por enquanto.
          </p>
        )}

        <div className="recarga-mapa">
          <MapContainer center={CENTRO_SOROCABA} zoom={12} scrollWheelZoom>
            <TileLayer
              attribution='Dados: <a href="https://openchargemap.org">Open Charge Map</a> (CC BY 4.0) · Mapa: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pontos.map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={iconePara(p.status)}>
                <Popup>
                  <div className="recarga-popup">
                    <strong>{p.nome}</strong>
                    {p.endereco && <span>{p.endereco}</span>}
                    {p.operadora && <span>Operadora: {p.operadora}</span>}
                    <span className={`recarga-status recarga-status--${p.status.toLowerCase()}`}>
                      {ROTULO_STATUS[p.status] ?? ROTULO_STATUS.DESCONHECIDO}
                    </span>
                    {p.quantidadePontos && <span>{p.quantidadePontos} ponto(s)</span>}
                    {p.custo && <span>Custo: {p.custo}</span>}
                    {p.conectores.length > 0 && (
                      <ul>
                        {p.conectores.map((c, i) => (
                          <li key={i}>
                            {c.tipo ?? "Conector"}
                            {c.potenciaKw ? ` · ${c.potenciaKw} kW` : ""}
                            {c.corrente ? ` · ${c.corrente}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a href={rotaUrl(p)} target="_blank" rel="noopener noreferrer">
                      Abrir rota
                    </a>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <ul className="recarga-legenda">
          <li><span className="recarga-pino recarga-pino--operacional" /> Operacional</li>
          <li><span className="recarga-pino recarga-pino--fora_do_ar" /> Fora do ar</li>
          <li><span className="recarga-pino recarga-pino--desconhecido" /> Status desconhecido</li>
          {dados?.disponivel && <li className="recarga-total">{pontos.length} pontos</li>}
        </ul>
      </main>
    </div>
  );
}

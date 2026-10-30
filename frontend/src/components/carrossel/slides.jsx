/**
 * Conteúdo do carrossel educativo. Dados conferidos e aprovados (out/2026):
 * cada número tem fonte, data e link no próprio slide. Não acrescente
 * número sem fonte.
 */

import { Bateria, Fonte, GraficoBrasil, Limpeza, LinkFonte } from "./partes";

export const SLIDES = [
  {
    titulo: "Como funciona a bateria do carro elétrico",
    conteudo: (
      <>
        <div className="car-texto">
          <p className="car-kicker">Mobilidade elétrica</p>
          <h3>Como a bateria move o carro elétrico.</h3>
          <ol className="eco-pequeno car-lista">
            <li><strong>Recarga:</strong> o carregador de bordo converte a corrente alternada da tomada em contínua para a bateria.</li>
            <li><strong>Armazenamento:</strong> a bateria de tração guarda a energia que move o carro.</li>
            <li><strong>Controle:</strong> a eletrônica de potência dosa a energia e define velocidade e torque do motor.</li>
            <li><strong>Tração:</strong> o motor elétrico gira as rodas. Uma bateria auxiliar alimenta os acessórios.</li>
          </ol>
          <Fonte>
            Fonte: U.S. Department of Energy — Alternative Fuels Data Center, “How Do All-Electric Cars Work?”. Acesso em
            29/10/2026. <LinkFonte href="https://afdc.energy.gov/vehicles/how-do-all-electric-cars-work">afdc.energy.gov</LinkFonte>
          </Fonte>
        </div>
        <Bateria />
      </>
    ),
  },
  {
    titulo: "Crescimento dos carros elétricos no Brasil e em Sorocaba",
    conteudo: (
      <>
        <div className="car-texto">
          <p className="car-kicker">Brasil e Sorocaba</p>
          <h3>Eletrificados: de 19,7 mil para 223,9 mil por ano.</h3>
          <p className="eco-pequeno">
            As vendas de veículos leves eletrificados no Brasil cresceram <strong>26%</strong> em 2025, enquanto o mercado
            total subiu 2,6%. Em Sorocaba, a frota eletrificada foi de 3.100 para 5.440 veículos entre mar/2025 e mar/2026
            (<strong>+75%</strong>).
          </p>
          <Fonte>
            Brasil: ABVE, balanços anuais 2020–2025 (inclui híbridos, plug-in e 100% elétricos).{" "}
            <LinkFonte href="https://abve.org.br/eletrificados-crescem-dez-vezes-mais-do-que-conjunto-do-mercado-em-2025-com-224-mil-veiculos-vendidos/">abve.org.br</LinkFonte>.
            {" "}Sorocaba: Detran-SP, citado pelo Jornal Cruzeiro do Sul, mai/2026 (frota; inclui motos e plug-in; não há
            série municipal oficial publicada).{" "}
            <LinkFonte href="https://www.jornalcruzeiro.com.br/suplementos/motor/2026/05/760548-frota-eletrificada-cresce-755-em-um-ano-em-sorocaba.html">jornalcruzeiro.com.br</LinkFonte>.
            {" "}Acesso em 29/10/2026.
          </Fonte>
        </div>
        <GraficoBrasil />
      </>
    ),
  },
  {
    titulo: "Como lavar a placa solar com segurança",
    conteudo: (
      <>
        <div className="car-texto">
          <p className="car-kicker">Manutenção</p>
          <h3>Placa limpa gera mais. Sem riscos.</h3>
          <ol className="eco-pequeno car-lista">
            <li>Desligue o sistema e confira se há trincas ou conexões soltas antes.</li>
            <li>Limpe no início da manhã ou no fim da tarde, com o vidro frio.</li>
            <li>Use só água e escova macia. Nada de sabão, abrasivo ou lavadora de alta pressão.</li>
            <li>Respeite a pressão máxima do manual (ex.: JA Solar, menos de 690 kPa).</li>
            <li>Não pise nem se apoie nos módulos. Em telhado, chame um profissional com NR-35.</li>
          </ol>
          <Fonte>
            Fontes: Canal Solar, “Como deve ser realizada a limpeza dos painéis solares” (manuais JA Solar, LONGi, BYD e
            outros), 2026. <LinkFonte href="https://canalsolar.com.br/como-deve-ser-realizada-a-limpeza-dos-paineis-solares/">canalsolar.com.br</LinkFonte>.
            {" "}NR-35 (trabalho em altura) — Ministério do Trabalho e Emprego.{" "}
            <LinkFonte href="https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/participacao-social/conselhos-e-orgaos-colegiados/comissao-tripartite-partitaria-permanente/normas-regulamentadora/normas-regulamentadoras-vigentes/norma-regulamentadora-no-35-nr-35">gov.br</LinkFonte>.
            {" "}Acesso em 29/10/2026.
          </Fonte>
        </div>
        <Limpeza />
      </>
    ),
  },
];

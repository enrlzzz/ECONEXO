import "./index.css";
import "/src/variables.css";

import { Link } from "react-router-dom";
import { BsLightning } from "react-icons/bs";

/**
 * Política de Privacidade — rota PÚBLICA (/politica-de-privacidade).
 *
 * Precisa ficar fora da área logada: a LGPD (Art. 9º) dá ao titular direito a
 * acesso facilitado sobre o tratamento dos seus dados. Se a política só
 * existisse depois do login, a pessoa teria que consentir antes de conseguir
 * ler aquilo com que está consentindo.
 *
 * VERSÃO: ao alterar este texto, suba `econexo.lgpd.versao-politica` no
 * backend. É essa versão que fica gravada junto do consentimento de cada
 * usuário — sem isso, não há como provar a que texto a pessoa aderiu.
 */
export const VERSAO_POLITICA = "1.0";
export const VIGENTE_DESDE = "16 de agosto de 2026";

export default function PoliticaPrivacidade() {
  return (
    <div className="politica-container">
      <header className="politica-header">
        <Link to="/">
          <div className="logos-menu">
            <span className="logo-title-menu">
              <BsLightning />
            </span>
            <span className="title-menu">EcoNexo</span>
          </div>
        </Link>
      </header>

      <main className="politica-conteudo">
        <h1>Política de Privacidade</h1>
        <p className="politica-meta">
          Versão {VERSAO_POLITICA} — vigente desde {VIGENTE_DESDE}
        </p>

        <section>
          <h2>1. Quem somos</h2>
          <p>
            O EcoNexo é uma plataforma acadêmica desenvolvida por estudantes do
            curso de Análise e Desenvolvimento de Sistemas da Facens, que conecta
            engenheiros de projetos fotovoltaicos a instaladores técnicos
            qualificados.
          </p>
          <p className="politica-pendente">
            <strong>⚠️ Canal de contato provisório.</strong> Este projeto está em
            desenvolvimento e ainda não possui um endereço oficial para
            solicitações sobre dados pessoais. Enquanto isso, os pedidos previstos
            na seção 5 devem ser feitos diretamente à equipe do projeto, na
            Facens. Um e-mail dedicado será publicado aqui antes de a plataforma
            receber dados de usuários reais.
          </p>
        </section>

        <section>
          <h2>2. Quais dados coletamos</h2>
          <table className="politica-tabela">
            <thead>
              <tr>
                <th>Dado</th>
                <th>Por que coletamos</th>
                <th>Obrigatório?</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Nome</td>
                <td>Identificar você na plataforma</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>E-mail</td>
                <td>Autenticação e comunicação</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>Senha</td>
                <td>Proteger o acesso à sua conta</td>
                <td>Sim</td>
              </tr>
              <tr>
                <td>CPF</td>
                <td>Distinguir profissionais com nomes iguais</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Telefone</td>
                <td>Permitir contato entre contratante e profissional</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Cidade e estado</td>
                <td>Busca de profissionais por região</td>
                <td>Não</td>
              </tr>
              <tr>
                <td>Formação e competências</td>
                <td>Compor seu perfil profissional</td>
                <td>Não</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>3. Como protegemos seus dados</h2>
          <ul>
            <li>
              <strong>Senha:</strong> guardada apenas como hash BCrypt. Nem nós
              conseguimos lê-la.
            </li>
            <li>
              <strong>CPF:</strong> criptografado em repouso (AES-256-GCM). A
              chave fica fora do banco de dados.
            </li>
            <li>
              <strong>Transmissão:</strong> todo o tráfego usa HTTPS, e a
              conexão com o banco de dados é criptografada.
            </li>
            <li>
              <strong>Acesso:</strong> a API exige autenticação. Seu CPF nunca é
              devolvido em nenhuma resposta, para ninguém.
            </li>
          </ul>
        </section>

        <section>
          <h2>4. Com quem compartilhamos</h2>
          <p>
            <strong>Não vendemos nem cedemos seus dados.</strong> Eles ficam
            armazenados em servidores da Hostinger (banco de dados) e Render
            (aplicação), que atuam como operadores e só os processam para manter
            a plataforma no ar.
          </p>
          <p>
            Nome, cidade, competências e formação ficam visíveis para outros
            usuários — é o propósito da plataforma. CPF, e-mail e telefone não
            aparecem em buscas.
          </p>
        </section>

        <section>
          <h2>5. Seus direitos (Art. 18 da LGPD)</h2>
          <p>Você pode, a qualquer momento:</p>
          <ul>
            <li>Confirmar se tratamos seus dados e acessá-los</li>
            <li>Corrigir dados incompletos ou desatualizados</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar este consentimento</li>
            <li>Pedir a portabilidade dos dados</li>
          </ul>
          <p>
            A exclusão da conta pode ser feita direto em Configurações. Os demais
            pedidos devem ser feitos pelo canal indicado na seção 1, e são
            respondidos em até 15 dias.
          </p>
        </section>

        <section>
          <h2>6. Por quanto tempo guardamos</h2>
          <p>
            Enquanto sua conta existir. Ao excluí-la, os dados pessoais são
            apagados do banco em até 30 dias.
          </p>
        </section>

        <section>
          <h2>7. Alterações</h2>
          <p>
            Se esta política mudar de forma relevante, pediremos novo
            consentimento no seu próximo acesso. A versão à qual você aderiu fica
            registrada junto ao seu cadastro, com data e hora.
          </p>
        </section>

        <section className="politica-aviso">
          <p>
            <strong>Aviso:</strong> o EcoNexo é um projeto acadêmico em
            desenvolvimento, sem finalidade comercial. Recomendamos não cadastrar
            dados sensíveis que você não queira em um ambiente de estudo.
          </p>
        </section>
      </main>

      <footer className="politica-footer">
        <Link to="/register">Voltar ao cadastro</Link>
        <Link to="/">Página inicial</Link>
      </footer>
    </div>
  );
}

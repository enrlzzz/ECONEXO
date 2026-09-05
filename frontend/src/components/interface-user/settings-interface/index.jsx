import "./index.css";
import "/src/variables.css";

import { useEffect, useState } from "react";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";
import { usuariosService } from "../../../services/usuarios";
import { persistUser } from "../../../userSession";

import { CgProfile } from "react-icons/cg";
import { CiLock } from "react-icons/ci";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone, MdOutlineEmail, MdOutlineSave } from "react-icons/md";
import { BsShieldCheck } from "react-icons/bs";

const ESTADOS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const TIPOS = [
  ["", "Não informado"],
  ["PROJETISTA", "Projetista / Responsável técnico"],
  ["INSTALADOR", "Instalador"],
  ["TECNICO", "Técnico"],
];

export default function Settings() {
  const usuario = useUserData();

  const [tipoConfig, setTipoConfig] = useState("perfil");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cidade: "",
    estado: "",
    tipoProfissional: "",
  });

  const [senhas, setSenhas] = useState({ nova: "", confirmar: "" });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  /**
   * Carrega do backend, não do localStorage.
   *
   * O localStorage é cache de exibição e o usuário pode tê-lo editado. Quem
   * responde "o que está gravado no meu cadastro?" é a API.
   */
  // Sem setState síncrono no corpo do effect: `carregando` já nasce true e o
  // resto acontece nas continuações da promise.
  useEffect(() => {
    if (!usuario.id) return undefined;
    let ativo = true;
    usuariosService
      .buscarPorId(usuario.id)
      .then((dados) => {
        if (!ativo) return;
        setForm({
          nome: dados.nome || "",
          email: dados.email || "",
          telefone: dados.telefone || "",
          cidade: dados.cidade || "",
          estado: dados.estado || "",
          tipoProfissional: dados.tipoProfissional || "",
        });
      })
      .catch((e) => {
        if (ativo) setErro(e.message || "Não foi possível carregar seu cadastro.");
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, [usuario.id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((atual) => ({ ...atual, [name]: value }));
  };

  const salvarPerfil = async (event) => {
    event.preventDefault();
    setSalvando(true);
    setErro("");
    setAviso("");
    try {
      // Sem campo senha: o backend só re-hasheia quando ela vem preenchida,
      // então o perfil pode ser salvo sem exigir a senha atual.
      const atualizado = await usuariosService.atualizar(usuario.id, form);
      persistUser(atualizado);
      setAviso("Alterações salvas.");
    } catch (e) {
      setErro(e.message || "Não foi possível salvar as alterações.");
    } finally {
      setSalvando(false);
    }
  };

  const salvarSenha = async (event) => {
    event.preventDefault();
    setErro("");
    setAviso("");

    if (senhas.nova !== senhas.confirmar) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (senhas.nova.length < 8) {
      setErro("A senha deve ter ao menos 8 caracteres.");
      return;
    }

    setSalvando(true);
    try {
      await usuariosService.atualizar(usuario.id, { ...form, senha: senhas.nova });
      setSenhas({ nova: "", confirmar: "" });
      setAviso("Senha alterada.");
    } catch (e) {
      setErro(e.message || "Não foi possível alterar a senha.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="container-settings">
      <HeaderInterface />

      <div className="settings-header">
        <h2>Configurações</h2>
        <p>Gerencie suas informações e preferências</p>

        <div className="buttons-config-preference">
          <button
            type="button"
            className={tipoConfig === "perfil" ? "ativo" : ""}
            onClick={() => setTipoConfig("perfil")}
          >
            <CgProfile />
            Perfil
          </button>
          <button
            type="button"
            className={tipoConfig === "seguranca" ? "ativo" : ""}
            onClick={() => setTipoConfig("seguranca")}
          >
            <CiLock />
            Segurança
          </button>
        </div>
      </div>

      {erro && <div className="settings-erro">{erro}</div>}
      {aviso && <div className="settings-aviso">{aviso}</div>}

      {tipoConfig === "perfil" && (
        <div className="settings-content">
          <div className="settings-card">
            <h3>Informações Pessoais</h3>
            <p>Atualize suas informações de perfil</p>

            {carregando ? (
              <p className="settings-status">Carregando…</p>
            ) : (
              <form className="settings-form" onSubmit={salvarPerfil}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="nome">Nome Completo</label>
                    <input
                      type="text"
                      id="nome"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      placeholder="Seu nome"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <div className="input-icon">
                      <MdOutlineEmail className="input-icon-symbol" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="telefone">Telefone</label>
                    <div className="input-icon">
                      <MdOutlinePhone className="input-icon-symbol" />
                      <input
                        type="text"
                        id="telefone"
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="tipoProfissional">
                      Tipo de Profissional
                    </label>
                    <select
                      id="tipoProfissional"
                      name="tipoProfissional"
                      value={form.tipoProfissional}
                      onChange={handleChange}
                    >
                      {TIPOS.map(([valor, rotulo]) => (
                        <option key={valor} value={valor}>
                          {rotulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="cidade">Cidade</label>
                    <div className="input-icon">
                      <IoLocationOutline className="input-icon-symbol" />
                      <input
                        type="text"
                        id="cidade"
                        name="cidade"
                        value={form.cidade}
                        onChange={handleChange}
                        placeholder="Sua cidade"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="estado">Estado</label>
                    <select
                      id="estado"
                      name="estado"
                      value={form.estado}
                      onChange={handleChange}
                    >
                      <option value="">UF</option>
                      {ESTADOS.map((uf) => (
                        <option key={uf} value={uf}>
                          {uf}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <p className="settings-hint">
                  Cidade, estado e tipo de profissional são o que faz você
                  aparecer na busca de outros usuários.
                </p>

                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn-salvar"
                    disabled={salvando}
                  >
                    <MdOutlineSave />
                    {salvando ? "Salvando…" : "Salvar Alterações"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/*
            Card de certificações: informativo, sem formulário.

            O anterior tinha campo "Número do CREA/CFT" e botão de upload de
            documentos que não gravavam nada — não existe coluna nem endpoint
            para isso. Campo que aceita texto e descarta no refresh é pior do
            que campo nenhum: a pessoa acredita que informou.

            O texto também não cita mais CFT como habilitação para assinar
            projeto fotovoltaico. Técnico registrado no CFT não tem atribuição
            para assinar projeto elétrico de geração; isso é do engenheiro com
            registro no CREA. Anunciar o contrário exporia a plataforma e os
            usuários.
          */}
          <div className="settings-card">
            <h3>Certificações</h3>
            <p>Como a EcoNexo trata habilitação profissional</p>

            <ul className="settings-lista">
              <li>
                <BsShieldCheck />
                <span>
                  <strong>CREA</strong> — registro exigido de responsáveis
                  técnicos e projetistas para assinar projeto e emitir ART.
                </span>
              </li>
              <li>
                <BsShieldCheck />
                <span>
                  <strong>NR-10</strong> — obrigatória para quem executa
                  serviços em instalações elétricas.
                </span>
              </li>
              <li>
                <BsShieldCheck />
                <span>
                  <strong>NR-35</strong> — obrigatória para trabalho em altura,
                  o caso da instalação em telhados.
                </span>
              </li>
            </ul>

            <p className="settings-hint">
              O envio e a validação de documentos ainda não estão disponíveis
              nesta versão.
            </p>
          </div>
        </div>
      )}

      {tipoConfig === "seguranca" && (
        <div className="settings-content">
          <div className="settings-card">
            <h3>Segurança</h3>
            <p>Altere a senha da sua conta</p>

            <form className="settings-form" onSubmit={salvarSenha}>
              <div className="form-group">
                <label htmlFor="novaSenha">Nova Senha</label>
                <input
                  type="password"
                  id="novaSenha"
                  value={senhas.nova}
                  onChange={(e) =>
                    setSenhas((s) => ({ ...s, nova: e.target.value }))
                  }
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarSenha">Confirmar Nova Senha</label>
                <input
                  type="password"
                  id="confirmarSenha"
                  value={senhas.confirmar}
                  onChange={(e) =>
                    setSenhas((s) => ({ ...s, confirmar: e.target.value }))
                  }
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                />
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-salvar"
                  disabled={salvando || !senhas.nova}
                >
                  <MdOutlineSave />
                  {salvando ? "Salvando…" : "Salvar Senha"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

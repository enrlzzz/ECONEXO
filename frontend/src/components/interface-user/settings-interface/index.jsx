import "./index.css";
import "/src/variables.css";

import { useState, useEffect } from "react";

import HeaderInterface from "../header-interface";
import { useUserData } from "../../../useUserData";

import { CgProfile } from "react-icons/cg";
import { CiLock } from "react-icons/ci";
import { IoIosNotificationsOutline } from "react-icons/io";
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { MdOutlineEmail } from "react-icons/md";
import { FiUpload } from "react-icons/fi";
import { MdOutlineSave } from "react-icons/md";
import { GoProjectRoadmap } from "react-icons/go";

export default function Settings() {
  const { nome, cidade, estado } = useUserData();

  const [tipoConfig, setTipoConfig] = useState("perfil");

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    biografia: "",
    cidade: "",
    estado: "",
    crea: "",
    foto: null,
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      nome: nome || "",
      cidade: cidade || "",
      estado: estado || "",
    }));
  }, [nome, cidade, estado]);

  const handleChange = (event) => {
    const { name, value, files, type } = event.target;

    setForm({
      ...form,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    localStorage.setItem("userName", form.nome);
    localStorage.setItem("userCidade", form.cidade);
    localStorage.setItem("userEstado", form.estado);

    alert("Alterações salvas!");
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

          <button
            type="button"
            className={tipoConfig === "notificacoes" ? "ativo" : ""}
            onClick={() => setTipoConfig("notificacoes")}
          >
            <IoIosNotificationsOutline />
            Notificações
          </button>
        </div>
      </div>

      {tipoConfig === "perfil" && (
        <div className="settings-content">
          <div className="settings-card">
            <h3>Informações Pessoais</h3>
            <p>Atualize suas informações de perfil</p>

            <div className="foto-section">
              <span className="avatar-settings">
                {form.nome?.charAt(0).toUpperCase() || "N"}
              </span>

              <div>
                <label className="btn-alterar-foto" htmlFor="foto">
                  <FiUpload />
                  Alterar Foto
                </label>

                <input
                  type="file"
                  id="foto"
                  name="foto"
                  accept=".jpg,.png,.gif"
                  onChange={handleChange}
                  hidden
                />

                <p className="foto-hint">
                  JPG, PNG ou GIF. Máximo 2MB.
                </p>
              </div>
            </div>

            <form className="settings-form" onSubmit={handleSubmit}>
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

                  <input
                    type="text"
                    id="tipoProfissional"
                    value="Engenheiro/Projetista"
                    disabled
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label htmlFor="biografia">Biografia</label>

                <textarea
                  id="biografia"
                  name="biografia"
                  value={form.biografia}
                  onChange={handleChange}
                  placeholder="Conte um pouco sobre sua experiência profissional..."
                  rows={3}
                />
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

                  <input
                    type="text"
                    id="estado"
                    name="estado"
                    value={form.estado}
                    onChange={handleChange}
                    placeholder="UF"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-salvar">
                  <MdOutlineSave />
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>

          <div className="settings-card">
            <h3>Certificações</h3>
            <p>Mantenha suas informações do CREA/CFT atualizadas</p>

            <div className="form-group">
              <label htmlFor="crea">Número do CREA/CFT</label>

              <div className="input-icon">
                <GoProjectRoadmap className="input-icon-symbol" />

                <input
                  type="text"
                  id="crea"
                  name="crea"
                  value={form.crea}
                  onChange={handleChange}
                  placeholder="CREA-SP 123456"
                />
              </div>
            </div>

            <label className="btn-alterar-foto" htmlFor="documentos">
              <FiUpload />
              Atualizar Documentos
            </label>

            <input
              type="file"
              id="documentos"
              name="documentos"
              accept=".pdf,.jpg,.png"
              onChange={handleChange}
              hidden
            />
          </div>
        </div>
      )}

      {tipoConfig === "seguranca" && (
        <div className="settings-content">
          <div className="settings-card">
            <h3>Segurança</h3>
            <p>Gerencie sua senha e segurança da conta</p>

            <div className="form-group">
              <label htmlFor="senhaAtual">Senha Atual</label>
              <input type="password" id="senhaAtual" placeholder="********" />
            </div>

            <div className="form-group">
              <label htmlFor="novaSenha">Nova Senha</label>
              <input type="password" id="novaSenha" placeholder="********" />
            </div>

            <div className="form-group">
              <label htmlFor="confirmarSenha">
                Confirmar Nova Senha
              </label>

              <input
                type="password"
                id="confirmarSenha"
                placeholder="********"
              />
            </div>

            <div className="form-actions">
              <button className="btn-salvar">
                <MdOutlineSave />
                Salvar Senha
              </button>
            </div>
          </div>
        </div>
      )}

      {tipoConfig === "notificacoes" && (
        <div className="settings-content">
          <div className="settings-card">
            <h3>Notificações</h3>
            <p>Escolha quais notificações deseja receber</p>

            <div className="notificacao-item">
              <div>
                <h4>Novas mensagens</h4>
                <p>
                  Receba alertas quando alguém te enviar uma mensagem
                </p>
              </div>

              <input type="checkbox" defaultChecked />
            </div>

            <div className="notificacao-item">
              <div>
                <h4>Novos projetos</h4>
                <p>Seja notificado sobre projetos na sua região</p>
              </div>

              <input type="checkbox" defaultChecked />
            </div>

            <div className="notificacao-item">
              <div>
                <h4>Avaliações</h4>
                <p>Alertas quando receber uma nova avaliação</p>
              </div>

              <input type="checkbox" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
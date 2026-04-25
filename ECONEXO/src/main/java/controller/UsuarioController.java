package com.econexo.controller;

import com.econexo.model.Usuario;
import com.econexo.service.UsuarioService;
import java.util.List;

/**
 * Controller para gerenciar endpoints de Usuario
 * Será expandido com Spring Boot @RestController e @RequestMapping
 */
public class UsuarioController {
    
    private UsuarioService usuarioService;
    
    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }
    
    /**
     * POST /api/usuarios
     * Cria um novo usuário
     */
    public Usuario criarUsuario(Usuario usuario) {
        return usuarioService.criarUsuario(usuario);
    }
    
    /**
     * GET /api/usuarios/{id}
     * Busca usuário por ID
     */
    public Usuario buscarPorId(Integer id) {
        return usuarioService.buscarPorId(id);
    }
    
    /**
     * GET /api/usuarios/email/{email}
     * Busca usuário por email
     */
    public Usuario buscarPorEmail(String email) {
        return usuarioService.buscarPorEmail(email);
    }
    
    /**
     * GET /api/usuarios
     * Lista todos os usuários
     */
    public List<Usuario> listarTodos() {
        return usuarioService.listarTodos();
    }
    
    /**
     * PUT /api/usuarios/{id}
     * Atualiza usuário
     */
    public Usuario atualizarUsuario(Integer id, Usuario usuario) {
        usuario.setIdUsuario(id);
        return usuarioService.atualizarUsuario(usuario);
    }
    
    /**
     * DELETE /api/usuarios/{id}
     * Deleta usuário
     */
    public void deletarUsuario(Integer id) {
        usuarioService.deletarUsuario(id);
    }
    
    /**
     * POST /api/usuarios/login
     * Realiza login
     */
    public Usuario login(String email, String senha) {
        return usuarioService.validarLogin(email, senha);
    }
}

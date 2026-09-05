package com.econexo.service;

import com.econexo.dto.ComentarioRequest;
import com.econexo.dto.ComentarioResponse;
import com.econexo.dto.PostRequest;
import com.econexo.dto.PostResponse;
import com.econexo.dto.ProfissionalResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.Post;
import com.econexo.model.PostComentario;
import com.econexo.model.PostCurtida;
import com.econexo.model.Usuario;
import com.econexo.repository.PostComentarioRepository;
import com.econexo.repository.PostCurtidaRepository;
import com.econexo.repository.PostRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final PostComentarioRepository comentarioRepository;
    private final PostCurtidaRepository curtidaRepository;
    private final UsuarioRepository usuarioRepository;

    public PostService(PostRepository postRepository,
                       PostComentarioRepository comentarioRepository,
                       PostCurtidaRepository curtidaRepository,
                       UsuarioRepository usuarioRepository) {
        this.postRepository = postRepository;
        this.comentarioRepository = comentarioRepository;
        this.curtidaRepository = curtidaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Timeline completa.
     *
     * Comentários e curtidas de TODOS os posts vêm em duas consultas, não uma
     * por post: com a timeline crescendo, o N+1 seria o primeiro gargalo.
     */
    @Transactional(readOnly = true)
    public List<PostResponse> listar(Integer idAutenticado) {
        List<Post> posts = postRepository.findAllByOrderByCriadoEmDesc();
        if (posts.isEmpty()) return List.of();

        List<Integer> ids = posts.stream().map(Post::getIdPost).toList();

        Map<Integer, List<ComentarioResponse>> comentariosPorPost =
                comentarioRepository.findByPostIdPostInOrderByCriadoEmAsc(ids).stream()
                        .collect(Collectors.groupingBy(
                                c -> c.getPost().getIdPost(),
                                Collectors.mapping(ComentarioResponse::de, Collectors.toList())));

        List<PostCurtida> curtidas = curtidaRepository.findByPostIdPostIn(ids);

        Map<Integer, Long> totalPorPost = curtidas.stream()
                .collect(Collectors.groupingBy(c -> c.getPost().getIdPost(), Collectors.counting()));

        var curtidosPorMim = curtidas.stream()
                .filter(c -> c.getUsuario().getIdUsuario().equals(idAutenticado))
                .map(c -> c.getPost().getIdPost())
                .collect(Collectors.toSet());

        return posts.stream()
                .map(p -> new PostResponse(
                        p.getIdPost(),
                        ProfissionalResponse.de(p.getAutor()),
                        p.getTexto(),
                        p.getCriadoEm(),
                        totalPorPost.getOrDefault(p.getIdPost(), 0L),
                        curtidosPorMim.contains(p.getIdPost()),
                        comentariosPorPost.getOrDefault(p.getIdPost(), List.of())))
                .toList();
    }

    /** O autor é o dono do token — o corpo da requisição não tem voz nisso. */
    @Transactional
    public PostResponse criar(Integer idAutenticado, PostRequest req) {
        Usuario autor = usuarioAutenticado(idAutenticado);

        Post post = new Post();
        post.setAutor(autor);
        post.setTexto(req.texto().trim());

        Post salvo = postRepository.save(post);
        return new PostResponse(
                salvo.getIdPost(),
                ProfissionalResponse.de(autor),
                salvo.getTexto(),
                salvo.getCriadoEm(),
                0L,
                false,
                List.of());
    }

    /**
     * Curtir/descurtir. Idempotente por natureza: o estado final depende da
     * existência da linha, não de quantas vezes o botão foi clicado.
     */
    @Transactional
    public PostResponse alternarCurtida(Integer idPost, Integer idAutenticado) {
        Post post = postExistente(idPost);
        Usuario usuario = usuarioAutenticado(idAutenticado);

        curtidaRepository.findByPostIdPostAndUsuarioIdUsuario(idPost, idAutenticado)
                .ifPresentOrElse(curtidaRepository::delete, () -> {
                    PostCurtida nova = new PostCurtida();
                    nova.setPost(post);
                    nova.setUsuario(usuario);
                    curtidaRepository.save(nova);
                });

        return montarUm(post, idAutenticado);
    }

    @Transactional
    public ComentarioResponse comentar(Integer idPost, Integer idAutenticado, ComentarioRequest req) {
        Post post = postExistente(idPost);

        PostComentario comentario = new PostComentario();
        comentario.setPost(post);
        comentario.setAutor(usuarioAutenticado(idAutenticado));
        comentario.setTexto(req.texto().trim());

        return ComentarioResponse.de(comentarioRepository.save(comentario));
    }

    /** Só o autor apaga o próprio post. Curtidas e comentários vão junto. */
    @Transactional
    public void excluir(Integer idPost, Integer idAutenticado) {
        Post post = postExistente(idPost);

        if (!post.getAutor().getIdUsuario().equals(idAutenticado)) {
            throw new AcessoNegadoException("Você só pode excluir as suas próprias publicações.");
        }

        curtidaRepository.deleteByPostIdPost(idPost);
        comentarioRepository.deleteByPostIdPost(idPost);
        postRepository.delete(post);
    }

    private PostResponse montarUm(Post post, Integer idAutenticado) {
        List<PostCurtida> curtidas = curtidaRepository.findByPostIdPostIn(List.of(post.getIdPost()));
        List<ComentarioResponse> comentarios =
                comentarioRepository.findByPostIdPostOrderByCriadoEmAsc(post.getIdPost())
                        .stream().map(ComentarioResponse::de).toList();

        return new PostResponse(
                post.getIdPost(),
                ProfissionalResponse.de(post.getAutor()),
                post.getTexto(),
                post.getCriadoEm(),
                curtidas.size(),
                curtidas.stream()
                        .anyMatch(c -> c.getUsuario().getIdUsuario().equals(idAutenticado)),
                comentarios.stream()
                        .sorted(Comparator.comparing(ComentarioResponse::criadoEm))
                        .toList());
    }

    private Post postExistente(Integer idPost) {
        return postRepository.findById(idPost)
                .orElseThrow(() -> new ValidacaoException("Publicação não encontrada."));
    }

    private Usuario usuarioAutenticado(Integer idAutenticado) {
        return usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));
    }
}

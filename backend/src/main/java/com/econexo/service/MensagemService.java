package com.econexo.service;

import com.econexo.dto.ConversaResponse;
import com.econexo.dto.MensagemRequest;
import com.econexo.dto.MensagemResponse;
import com.econexo.dto.ProfissionalResponse;
import com.econexo.exception.AcessoNegadoException;
import com.econexo.exception.ValidacaoException;
import com.econexo.model.Mensagem;
import com.econexo.model.Usuario;
import com.econexo.repository.MensagemRepository;
import com.econexo.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final UsuarioRepository usuarioRepository;

    public MensagemService(MensagemRepository mensagemRepository,
                           UsuarioRepository usuarioRepository) {
        this.mensagemRepository = mensagemRepository;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Caixa de entrada agrupada por interlocutor.
     *
     * Uma conversa só existe se houver ao menos uma mensagem real trocada —
     * não há "conversa vazia". Quem nunca enviou nem recebeu nada vê a lista
     * vazia, e isso é a informação correta, não um estado a ser preenchido
     * com exemplos.
     */
    @Transactional(readOnly = true)
    public List<ConversaResponse> conversasDe(Integer idAutenticado) {
        List<Mensagem> todas = mensagemRepository.daCaixaDe(idAutenticado);

        Map<Integer, List<Mensagem>> porInterlocutor = new LinkedHashMap<>();
        for (Mensagem m : todas) {
            Integer outro = m.getRemetente().getIdUsuario().equals(idAutenticado)
                    ? m.getDestinatario().getIdUsuario()
                    : m.getRemetente().getIdUsuario();
            porInterlocutor.computeIfAbsent(outro, k -> new ArrayList<>()).add(m);
        }

        List<ConversaResponse> conversas = new ArrayList<>();
        porInterlocutor.forEach((idOutro, mensagens) -> {
            Mensagem ultima = mensagens.get(mensagens.size() - 1);

            Usuario participante = ultima.getRemetente().getIdUsuario().equals(idOutro)
                    ? ultima.getRemetente()
                    : ultima.getDestinatario();

            long naoLidas = mensagens.stream()
                    .filter(m -> m.getDestinatario().getIdUsuario().equals(idAutenticado))
                    .filter(m -> m.getLidaEm() == null)
                    .count();

            conversas.add(new ConversaResponse(
                    ProfissionalResponse.de(participante),
                    ultima.getTexto(),
                    ultima.getCriadoEm(),
                    naoLidas,
                    mensagens.stream().map(MensagemResponse::de).toList()));
        });

        // Conversa com atividade mais recente primeiro.
        conversas.sort(Comparator.comparing(ConversaResponse::ultimaEm).reversed());
        return conversas;
    }

    @Transactional(readOnly = true)
    public List<MensagemResponse> conversaCom(Integer idAutenticado, Integer idOutro) {
        return mensagemRepository.entre(idAutenticado, idOutro).stream()
                .map(MensagemResponse::de)
                .toList();
    }

    /**
     * Envia. O remetente é sempre o dono do token.
     *
     * Não existe resposta automática: se ninguém do outro lado responder, a
     * conversa fica com uma mensagem só. Simular resposta faria a interface
     * mentir sobre haver alguém ali.
     */
    @Transactional
    public MensagemResponse enviar(Integer idAutenticado, MensagemRequest req) {
        if (req.destinatarioId().equals(idAutenticado)) {
            throw new ValidacaoException("Não é possível enviar mensagem para si mesmo.");
        }

        Usuario remetente = usuarioRepository.findById(idAutenticado)
                .orElseThrow(() -> new AcessoNegadoException("Sessão inválida."));

        Usuario destinatario = usuarioRepository.findById(req.destinatarioId())
                .orElseThrow(() -> new ValidacaoException("Destinatário não encontrado."));

        Mensagem mensagem = new Mensagem();
        mensagem.setRemetente(remetente);
        mensagem.setDestinatario(destinatario);
        mensagem.setTexto(req.texto().trim());

        return MensagemResponse.de(mensagemRepository.save(mensagem));
    }

    /** Marca como lida só o que foi enviado PARA quem está chamando. */
    @Transactional
    public void marcarComoLida(Integer idAutenticado, Integer idOutro) {
        List<Mensagem> recebidas = mensagemRepository.entre(idAutenticado, idOutro).stream()
                .filter(m -> m.getDestinatario().getIdUsuario().equals(idAutenticado))
                .filter(m -> m.getLidaEm() == null)
                .toList();

        LocalDateTime agora = LocalDateTime.now();
        recebidas.forEach(m -> m.setLidaEm(agora));
        mensagemRepository.saveAll(recebidas);
    }
}

package com.econexo.security;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Carrega a chave de criptografia das colunas sensíveis e entrega ao converter
 * na subida da aplicação.
 *
 * Existe separado porque o JPA instancia o CriptografiaConverter por conta
 * própria, fora do container do Spring — não dá para injetar nada nele.
 */
@Component
public class ChaveCriptografia {

    private final String chaveConfigurada;

    public ChaveCriptografia(@Value("${econexo.crypto.key:}") String chaveConfigurada) {
        this.chaveConfigurada = chaveConfigurada;
    }

    @PostConstruct
    void carregar() {
        if (chaveConfigurada == null || chaveConfigurada.isBlank()) {
            throw new IllegalStateException(
                    "econexo.crypto.key não definida. Gere com: openssl rand -base64 32 "
                  + "e configure em ECONEXO_CRYPTO_KEY.");
        }

        // Aceita a chave em base64 (o formato natural de `openssl rand -base64 32`)
        // e cai para os bytes do texto se não for base64 válido.
        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(chaveConfigurada);
        } catch (IllegalArgumentException e) {
            bytes = chaveConfigurada.getBytes(StandardCharsets.UTF_8);
        }

        if (bytes.length < 32) {
            throw new IllegalStateException(
                    "econexo.crypto.key precisa render ao menos 32 bytes (AES-256). "
                  + "Gere com: openssl rand -base64 32");
        }

        // SHA-256 normaliza para exatamente 32 bytes, aceitando chaves maiores
        // sem truncar de um jeito que enfraqueça o material.
        try {
            bytes = MessageDigest.getInstance("SHA-256").digest(bytes);
        } catch (Exception e) {
            throw new IllegalStateException("SHA-256 indisponível", e);
        }

        CriptografiaConverter.definirChave(bytes);
    }
}

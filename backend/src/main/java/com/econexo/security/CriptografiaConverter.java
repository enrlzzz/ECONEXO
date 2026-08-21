package com.econexo.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.Cipher;
import javax.crypto.Mac;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Base64;

/**
 * Criptografa colunas sensíveis (hoje: CPF) antes de gravar no banco.
 *
 * O JPA aplica isto de forma transparente: o código Java continua lendo e
 * escrevendo o CPF em texto normal; quem vê o valor cifrado é só o banco.
 *
 * A CHAVE NÃO FICA NO BANCO — vem de ECONEXO_CRYPTO_KEY, no painel do Render.
 * É isso que faz um dump do MySQL (backup vazado, SQL injection, acesso de
 * terceiro à infraestrutura) não valer nada sem o segundo fator.
 *
 * IV DETERMINÍSTICO: o vetor de inicialização é derivado do próprio texto via
 * HMAC-SHA256. Com IV aleatório, o mesmo CPF geraria cifrados diferentes a
 * cada gravação e o UNIQUE da coluna deixaria de detectar duplicatas. Sendo
 * determinístico, mesmo CPF produz sempre o mesmo cifrado e o UNIQUE segue
 * valendo. O preço é revelar que dois registros têm o mesmo valor — o que
 * numa coluna UNIQUE já é dado.
 */
@Converter
public class CriptografiaConverter implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(CriptografiaConverter.class);

    private static final String ALGORITMO = "AES/GCM/NoPadding";
    private static final int TAM_IV = 12;
    private static final int TAM_TAG_BITS = 128;
    private static final String PREFIXO = "enc:v1:";

    /**
     * Injetada por ChaveCriptografia na subida da aplicação.
     *
     * É estática porque o JPA instancia o converter sozinho, sem passar pelo
     * container do Spring — então não há como recebê-la pelo construtor.
     */
    private static volatile byte[] chave;

    static void definirChave(byte[] novaChave) {
        chave = novaChave;
    }

    @Override
    public String convertToDatabaseColumn(String valor) {
        if (valor == null || valor.isBlank()) return valor;
        exigirChave();

        try {
            byte[] texto = valor.getBytes(StandardCharsets.UTF_8);
            byte[] iv = derivarIv(texto);

            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(chave, "AES"),
                    new GCMParameterSpec(TAM_TAG_BITS, iv));

            byte[] cifrado = cipher.doFinal(texto);

            byte[] saida = new byte[iv.length + cifrado.length];
            System.arraycopy(iv, 0, saida, 0, iv.length);
            System.arraycopy(cifrado, 0, saida, iv.length, cifrado.length);

            return PREFIXO + Base64.getEncoder().encodeToString(saida);
        } catch (Exception e) {
            // Falhar é melhor que gravar em texto puro sem ninguém perceber.
            throw new IllegalStateException("Falha ao criptografar dado sensível", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String armazenado) {
        if (armazenado == null || armazenado.isBlank()) return armazenado;

        // Registro anterior à criptografia: devolve como está, para o sistema
        // não quebrar com os dados que já existiam. Ele passa a ser cifrado na
        // próxima vez que o cadastro for salvo.
        if (!armazenado.startsWith(PREFIXO)) {
            log.warn("Valor sensível encontrado sem criptografia (registro antigo). "
                   + "Será cifrado no próximo salvamento.");
            return armazenado;
        }

        exigirChave();

        try {
            byte[] bruto = Base64.getDecoder().decode(armazenado.substring(PREFIXO.length()));
            byte[] iv = Arrays.copyOfRange(bruto, 0, TAM_IV);
            byte[] cifrado = Arrays.copyOfRange(bruto, TAM_IV, bruto.length);

            Cipher cipher = Cipher.getInstance(ALGORITMO);
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(chave, "AES"),
                    new GCMParameterSpec(TAM_TAG_BITS, iv));

            return new String(cipher.doFinal(cifrado), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException(
                    "Falha ao descriptografar dado sensível. A ECONEXO_CRYPTO_KEY mudou?", e);
        }
    }

    /** IV = primeiros 12 bytes de HMAC-SHA256(chave, texto). */
    private byte[] derivarIv(byte[] texto) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(chave, "HmacSHA256"));
        return Arrays.copyOfRange(mac.doFinal(texto), 0, TAM_IV);
    }

    private void exigirChave() {
        if (chave == null) {
            throw new IllegalStateException(
                    "ECONEXO_CRYPTO_KEY não configurada — sem ela não é possível "
                  + "ler nem gravar dados sensíveis.");
        }
    }
}

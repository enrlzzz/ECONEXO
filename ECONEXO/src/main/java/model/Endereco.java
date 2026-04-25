package model;

/**
 * Classe que representa a entidade Endereco.
 * Mapeia a tabela ENDERECO do MER.
 */
public class Endereco {

    private Integer idEndereco;
    private Integer fkUsuario;
    private String cep;
    private String cidade;
    private String estado;
    private String logradouro;
    private String numero;
    private Float latitude;
    private Float longitude;

    // Construtor vazio
    public Endereco() {
    }

    // Construtor completo
    public Endereco(Integer idEndereco, Integer fkUsuario, String cep, String cidade,
                    String estado, String logradouro, String numero,
                    Float latitude, Float longitude) {
        this.idEndereco = idEndereco;
        this.fkUsuario = fkUsuario;
        this.cep = cep;
        this.cidade = cidade;
        this.estado = estado;
        this.logradouro = logradouro;
        this.numero = numero;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Construtor sem ID e sem coordenadas
    public Endereco(Integer fkUsuario, String cep, String cidade, String estado,
                    String logradouro, String numero) {
        this.fkUsuario = fkUsuario;
        this.cep = cep;
        this.cidade = cidade;
        this.estado = estado;
        this.logradouro = logradouro;
        this.numero = numero;
    }

    // --- Getters e Setters ---

    public Integer getIdEndereco() {
        return idEndereco;
    }

    public void setIdEndereco(Integer idEndereco) {
        this.idEndereco = idEndereco;
    }

    public Integer getFkUsuario() {
        return fkUsuario;
    }

    public void setFkUsuario(Integer fkUsuario) {
        this.fkUsuario = fkUsuario;
    }

    public String getCep() {
        return cep;
    }

    public void setCep(String cep) {
        this.cep = cep;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getEstado() {
        return estado;
    }

    public void setEstado(String estado) {
        this.estado = estado;
    }

    public String getLogradouro() {
        return logradouro;
    }

    public void setLogradouro(String logradouro) {
        this.logradouro = logradouro;
    }

    public String getNumero() {
        return numero;
    }

    public void setNumero(String numero) {
        this.numero = numero;
    }

    public Float getLatitude() {
        return latitude;
    }

    public void setLatitude(Float latitude) {
        this.latitude = latitude;
    }

    public Float getLongitude() {
        return longitude;
    }

    public void setLongitude(Float longitude) {
        this.longitude = longitude;
    }

    @Override
    public String toString() {
        return "Endereco{" +
                "idEndereco=" + idEndereco +
                ", fkUsuario=" + fkUsuario +
                ", cep='" + cep + '\'' +
                ", cidade='" + cidade + '\'' +
                ", estado='" + estado + '\'' +
                ", logradouro='" + logradouro + '\'' +
                ", numero='" + numero + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                '}';
    }
}

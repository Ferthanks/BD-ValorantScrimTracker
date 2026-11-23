package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model;

import java.math.BigDecimal;

public class RespostaAvaliacao {
    private Integer idScrim;
    private Integer idResposta;
    private BigDecimal notaValor;
    private String texto;
    private Integer idAvaliador;
    private Integer idAvaliado;
    private Integer idQuestao;

    public Integer getIdScrim() { return idScrim; }
    public void setIdScrim(Integer idScrim) { this.idScrim = idScrim; }

    public Integer getIdResposta() { return idResposta; }
    public void setIdResposta(Integer idResposta) { this.idResposta = idResposta; }

    public BigDecimal getNotaValor() { return notaValor; }
    public void setNotaValor(BigDecimal notaValor) { this.notaValor = notaValor; }

    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }

    public Integer getIdAvaliador() { return idAvaliador; }
    public void setIdAvaliador(Integer idAvaliador) { this.idAvaliador = idAvaliador; }

    public Integer getIdAvaliado() { return idAvaliado; }
    public void setIdAvaliado(Integer idAvaliado) { this.idAvaliado = idAvaliado; }

    public Integer getIdQuestao() { return idQuestao; }
    public void setIdQuestao(Integer idQuestao) { this.idQuestao = idQuestao; }
}
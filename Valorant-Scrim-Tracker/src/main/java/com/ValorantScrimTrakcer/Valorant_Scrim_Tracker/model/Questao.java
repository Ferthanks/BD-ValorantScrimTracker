package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model;

import java.math.BigDecimal;

public class Questao {
    private Integer idQuestao;
    private String enunciado;
    private String tipo;
    private BigDecimal peso;

    public Integer getIdQuestao() { return idQuestao; }
    public void setIdQuestao(Integer idQuestao) { this.idQuestao = idQuestao; }

    public String getEnunciado() { return enunciado; }
    public void setEnunciado(String enunciado) { this.enunciado = enunciado; }

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }

    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }
}
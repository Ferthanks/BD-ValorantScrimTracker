package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class Scrim {
    private Integer idScrim;
    private String titulo;
    private LocalDate data;
    private LocalTime horarioIn;
    private LocalTime horarioFim;
    private String mapa;
    private String oponente;
    private String placar;

    // Usados para associar questões (RF3) e jogadores (RF4) na criação da scrim
    private List<Integer> questoesIds;
    private List<Integer> jogadoresIds;

    public Integer getIdScrim() { return idScrim; }
    public void setIdScrim(Integer idScrim) { this.idScrim = idScrim; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public LocalTime getHorarioIn() { return horarioIn; }
    public void setHorarioIn(LocalTime horarioIn) { this.horarioIn = horarioIn; }

    public LocalTime getHorarioFim() { return horarioFim; }
    public void setHorarioFim(LocalTime horarioFim) { this.horarioFim = horarioFim; }

    public String getMapa() { return mapa; }
    public void setMapa(String mapa) { this.mapa = mapa; }

    public String getOponente() { return oponente; }
    public void setOponente(String oponente) { this.oponente = oponente; }

    public String getPlacar() { return placar; }
    public void setPlacar(String placar) { this.placar = placar; }

    public List<Integer> getQuestoesIds() { return questoesIds; }
    public void setQuestoesIds(List<Integer> questoesIds) { this.questoesIds = questoesIds; }

    public List<Integer> getJogadoresIds() { return jogadoresIds; }
    public void setJogadoresIds(List<Integer> jogadoresIds) { this.jogadoresIds = jogadoresIds; }
}
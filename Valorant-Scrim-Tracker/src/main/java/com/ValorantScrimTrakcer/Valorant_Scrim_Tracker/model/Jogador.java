package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model;

public class Jogador {
    private Integer idJogador;
    private String nick;
    private String riotTag;
    private String funcao;
    private String email;
    private String senha;

    public Integer getIdJogador() { return idJogador; }
    public void setIdJogador(Integer idJogador) { this.idJogador = idJogador; }

    public String getNick() { return nick; }
    public void setNick(String nick) { this.nick = nick; }

    public String getRiotTag() { return riotTag; }
    public void setRiotTag(String riotTag) { this.riotTag = riotTag; }

    public String getFuncao() { return funcao; }
    public void setFuncao(String funcao) { this.funcao = funcao; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }
}
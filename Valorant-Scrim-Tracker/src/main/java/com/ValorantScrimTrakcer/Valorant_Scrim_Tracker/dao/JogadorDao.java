package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Jogador;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class JogadorDao {

    private final JdbcTemplate jdbc;

    public JogadorDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Jogador> rowMapper = (rs, rowNum) -> {
        Jogador j = new Jogador();
        j.setIdJogador(rs.getInt("id_jogador"));
        j.setNick(rs.getString("nick"));
        j.setRiotTag(rs.getString("riot_tag"));
        j.setFuncao(rs.getString("funcao"));
        j.setEmail(rs.getString("email"));
        j.setSenha(rs.getString("senha"));
        return j;
    };

    public List<Jogador> listarTodos() {
        return jdbc.query("SELECT * FROM jogador ORDER BY id_jogador", rowMapper);
    }

    public Jogador buscarPorId(int id) {
        return jdbc.queryForObject("SELECT * FROM jogador WHERE id_jogador = ?", rowMapper, id);
    }

    public void salvar(Jogador j) {
        String sql = "INSERT INTO jogador (nick, riot_tag, funcao, email, senha) VALUES (?, ?, ?, ?, ?)";
        jdbc.update(sql, j.getNick(), j.getRiotTag(), j.getFuncao(), j.getEmail(), j.getSenha());
    }

    public void atualizar(int id, Jogador j) {
        String sql = "UPDATE jogador SET nick = ?, riot_tag = ?, funcao = ?, email = ?, senha = ? WHERE id_jogador = ?";
        jdbc.update(sql, j.getNick(), j.getRiotTag(), j.getFuncao(), j.getEmail(), j.getSenha(), id);
    }

    public void deletar(int id) {
        jdbc.update("DELETE FROM jogador WHERE id_jogador = ?", id);
    }
}
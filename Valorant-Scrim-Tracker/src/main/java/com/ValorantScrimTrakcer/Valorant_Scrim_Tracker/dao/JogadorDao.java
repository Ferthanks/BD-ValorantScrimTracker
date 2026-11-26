package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Jogador;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

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
    if (j.getSenha() != null && !j.getSenha().isBlank()) {
        String sql = "UPDATE jogador SET nick = ?, riot_tag = ?, funcao = ?, email = ?, senha = ? WHERE id_jogador = ?";
        jdbc.update(sql, j.getNick(), j.getRiotTag(), j.getFuncao(), j.getEmail(), j.getSenha(), id);
    } else {
        String sql = "UPDATE jogador SET nick = ?, riot_tag = ?, funcao = ?, email = ? WHERE id_jogador = ?";
        jdbc.update(sql, j.getNick(), j.getRiotTag(), j.getFuncao(), j.getEmail(), id);
    }
}

    public void deletar(int id) {
        jdbc.update("DELETE FROM jogador WHERE id_jogador = ?", id);
    }

    public Map<String, Object> autenticar(String email, String senha) {
        if (email == null || senha == null) {
            return null;
        }
        String sql = """
            SELECT id_jogador, nick, riot_tag, funcao, email
            FROM jogador
            WHERE LOWER(email) = LOWER(?) AND senha = ?
            """;
        var resultado = jdbc.queryForList(sql, email.trim(), senha);
        return resultado.isEmpty() ? null : resultado.get(0);
    }
}
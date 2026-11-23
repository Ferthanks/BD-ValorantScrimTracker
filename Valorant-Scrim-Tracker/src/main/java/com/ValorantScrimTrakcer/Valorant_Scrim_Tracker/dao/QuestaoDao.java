package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Questao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class QuestaoDao {

    private final JdbcTemplate jdbc;

    public QuestaoDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Questao> rowMapper = (rs, rowNum) -> {
        Questao q = new Questao();
        q.setIdQuestao(rs.getInt("id_questao"));
        q.setEnunciado(rs.getString("enunciado"));
        q.setTipo(rs.getString("tipo"));
        q.setPeso(rs.getBigDecimal("peso"));
        return q;
    };

    public List<Questao> listarTodas() {
        return jdbc.query("SELECT * FROM questao ORDER BY id_questao", rowMapper);
    }

    public Questao buscarPorId(int id) {
        return jdbc.queryForObject("SELECT * FROM questao WHERE id_questao = ?", rowMapper, id);
    }

    public void salvar(Questao q) {
        String sql = "INSERT INTO questao (enunciado, tipo, peso) VALUES (?, ?, ?)";
        jdbc.update(sql, q.getEnunciado(), q.getTipo(), q.getPeso());
    }

    public void atualizar(int id, Questao q) {
        String sql = "UPDATE questao SET enunciado = ?, tipo = ?, peso = ? WHERE id_questao = ?";
        jdbc.update(sql, q.getEnunciado(), q.getTipo(), q.getPeso(), id);
    }

    public void deletar(int id) {
        jdbc.update("DELETE FROM questao WHERE id_questao = ?", id);
    }
}
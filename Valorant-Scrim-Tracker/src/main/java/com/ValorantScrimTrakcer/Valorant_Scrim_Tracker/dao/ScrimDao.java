package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Jogador;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Questao;
import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.Scrim;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.util.List;

@Repository
public class ScrimDao {

    private final JdbcTemplate jdbc;

    public ScrimDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    private final RowMapper<Scrim> rowMapper = (rs, rowNum) -> {
        Scrim s = new Scrim();
        s.setIdScrim(rs.getInt("id_scrim"));
        s.setTitulo(rs.getString("titulo"));
        s.setData(rs.getDate("data").toLocalDate());
        s.setHorarioIn(rs.getTime("horario_in").toLocalTime());
        Time hFim = rs.getTime("horario_fim");
        if (hFim != null) s.setHorarioFim(hFim.toLocalTime());
        s.setMapa(rs.getString("mapa"));
        s.setOponente(rs.getString("oponente"));
        s.setPlacar(rs.getString("placar"));
        return s;
    };

    public List<Scrim> listarTodas() {
        return jdbc.query("SELECT * FROM scrim ORDER BY data DESC, id_scrim DESC", rowMapper);
    }

    public Scrim buscarPorId(int id) {
        return jdbc.queryForObject("SELECT * FROM scrim WHERE id_scrim = ?", rowMapper, id);
    }

    @Transactional
    public int salvar(Scrim s) {
        String sql = """
            INSERT INTO scrim (titulo, data, horario_in, horario_fim, mapa, oponente, placar)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            RETURNING id_scrim
            """;

        Integer idGerado = jdbc.queryForObject(
                sql,
                Integer.class,
                s.getTitulo(),
                Date.valueOf(s.getData()),
                Time.valueOf(s.getHorarioIn()),
                s.getHorarioFim() != null ? Time.valueOf(s.getHorarioFim()) : null,
                s.getMapa(),
                s.getOponente(),
                s.getPlacar()
        );

        if (s.getQuestoesIds() != null) {
            for (Integer idQuestao : s.getQuestoesIds()) {
                jdbc.update("INSERT INTO scrim_questao (id_scrim, id_questao) VALUES (?, ?)", idGerado, idQuestao);
            }
        }

        if (s.getJogadoresIds() != null) {
            for (Integer idJogador : s.getJogadoresIds()) {
                jdbc.update("INSERT INTO disputa (id_jogador, id_scrim) VALUES (?, ?)", idJogador, idGerado);
            }
        }

        return idGerado;
    }

    public void atualizar(int id, Scrim s) {
        String sql = """
            UPDATE scrim
            SET titulo = ?, data = ?, horario_in = ?, horario_fim = ?, mapa = ?, oponente = ?, placar = ?
            WHERE id_scrim = ?
            """;
        jdbc.update(
                sql,
                s.getTitulo(),
                Date.valueOf(s.getData()),
                Time.valueOf(s.getHorarioIn()),
                s.getHorarioFim() != null ? Time.valueOf(s.getHorarioFim()) : null,
                s.getMapa(),
                s.getOponente(),
                s.getPlacar(),
                id
        );
    }

    public void deletar(int id) {
        jdbc.update("DELETE FROM scrim WHERE id_scrim = ?", id);
    }

    public List<Jogador> listarJogadoresDaScrim(int idScrim) {
        String sql = """
            SELECT j.* FROM jogador j
            JOIN disputa d ON j.id_jogador = d.id_jogador
            WHERE d.id_scrim = ?
            ORDER BY j.nick
            """;
        return jdbc.query(sql, (rs, rowNum) -> {
            Jogador j = new Jogador();
            j.setIdJogador(rs.getInt("id_jogador"));
            j.setNick(rs.getString("nick"));
            j.setRiotTag(rs.getString("riot_tag"));
            j.setFuncao(rs.getString("funcao"));
            j.setEmail(rs.getString("email"));
            return j;
        }, idScrim);
    }

    public List<Questao> listarQuestoesDaScrim(int idScrim) {
        String sql = """
            SELECT q.* FROM questao q
            JOIN scrim_questao sq ON q.id_questao = sq.id_questao
            WHERE sq.id_scrim = ?
            ORDER BY q.id_questao
            """;
        return jdbc.query(sql, (rs, rowNum) -> {
            Questao q = new Questao();
            q.setIdQuestao(rs.getInt("id_questao"));
            q.setEnunciado(rs.getString("enunciado"));
            q.setTipo(rs.getString("tipo"));
            q.setPeso(rs.getBigDecimal("peso"));
            return q;
        }, idScrim);
    }
}
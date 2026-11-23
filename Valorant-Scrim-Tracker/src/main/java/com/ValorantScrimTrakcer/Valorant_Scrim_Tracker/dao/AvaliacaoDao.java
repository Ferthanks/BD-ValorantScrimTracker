package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.model.RespostaAvaliacao;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Repository
public class AvaliacaoDao {

    private final JdbcTemplate jdbc;

    public AvaliacaoDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void salvarRespostas(List<RespostaAvaliacao> respostas) {
        String sql = """
            INSERT INTO resposta_avaliacao (id_scrim, nota_valor, texto, id_avaliador, id_avaliado, id_questao)
            VALUES (?, ?, ?, ?, ?, ?)
            """;
        for (RespostaAvaliacao r : respostas) {
            jdbc.update(
                    sql,
                    r.getIdScrim(),
                    r.getNotaValor(),
                    r.getTexto(),
                    r.getIdAvaliador(),
                    r.getIdAvaliado(),
                    r.getIdQuestao()
            );
        }
    }

    public List listarRespostasPorScrim(int idScrim) {
        String sql = """
            SELECT
                ra.id_resposta,
                av.nick AS avaliador,
                al.nick AS avaliado,
                q.enunciado,
                ra.nota_valor,
                ra.texto
            FROM resposta_avaliacao ra
            JOIN jogador av ON ra.id_avaliador = av.id_jogador
            JOIN jogador al ON ra.id_avaliado = al.id_jogador
            JOIN questao q  ON ra.id_questao = q.id_questao
            WHERE ra.id_scrim = ?
            ORDER BY al.nick, q.id_questao
            """;
        return jdbc.queryForList(sql, idScrim);
    }
}
package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public class RelatorioDao {

    private final JdbcTemplate jdbc;

    public RelatorioDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // 1. Média de notas recebidas por jogador (Ranking 360°)
    public List mediaPorJogador() {
        String sql = """
            SELECT
                j.nick,
                j.funcao,
                ROUND(AVG(ra.nota_valor), 2) AS media_nota,
                COUNT(ra.id_resposta) AS total_avaliacoes
            FROM jogador j
            LEFT JOIN resposta_avaliacao ra ON j.id_jogador = ra.id_avaliado
            GROUP BY j.id_jogador, j.nick, j.funcao
            ORDER BY media_nota DESC NULLS LAST
            """;
        return jdbc.queryForList(sql);
    }

    // 2. Média de desempenho da equipe por mapa
    public List mediaPorMapa() {
        String sql = """
            SELECT
                s.mapa,
                COUNT(DISTINCT s.id_scrim) AS total_scrims,
                ROUND(AVG(ra.nota_valor), 2) AS media_nota
            FROM scrim s
            LEFT JOIN resposta_avaliacao ra ON s.id_scrim = ra.id_scrim
            GROUP BY s.mapa
            ORDER BY media_nota DESC NULLS LAST
            """;
        return jdbc.queryForList(sql);
    }

    // 3. Média por questão/critério (pontos fortes e fracos do time)
    public List mediaPorQuestao() {
        String sql = """
            SELECT
                q.enunciado,
                q.peso,
                ROUND(AVG(ra.nota_valor), 2) AS media_nota
            FROM questao q
            LEFT JOIN resposta_avaliacao ra ON q.id_questao = ra.id_questao
            WHERE ra.nota_valor IS NOT NULL
            GROUP BY q.id_questao, q.enunciado, q.peso
            ORDER BY media_nota DESC
            """;
        return jdbc.queryForList(sql);
    }

    // 4. Evolução da equipe ao longo das scrims (para gráfico de linha)
    public List evolucaoScrims() {
        String sql = """
            SELECT
                s.id_scrim,
                s.titulo,
                s.data,
                s.mapa,
                s.placar,
                ROUND(AVG(ra.nota_valor), 2) AS media_nota
            FROM scrim s
            LEFT JOIN resposta_avaliacao ra ON s.id_scrim = ra.id_scrim
            GROUP BY s.id_scrim, s.titulo, s.data, s.mapa, s.placar
            ORDER BY s.data ASC, s.id_scrim ASC
            """;
        return jdbc.queryForList(sql);
    }
}
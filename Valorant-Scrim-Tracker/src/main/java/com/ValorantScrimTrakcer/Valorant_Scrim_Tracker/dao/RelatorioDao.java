package com.ValorantScrimTrakcer.Valorant_Scrim_Tracker.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Repository
public class RelatorioDao {

    private final JdbcTemplate jdbc;

    public RelatorioDao(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // Relatório 1: Ranking 360° dos Jogadores vs. Média da Equipe (com filtros)
    public List rankingJogadores(
            String dataInicio,
            String dataFim,
            String nick,
            List<String> funcoes,
            Integer minAvaliacoes
    ) {
        Date dtIni = Date.valueOf(
                (dataInicio != null && !dataInicio.isBlank()) ? LocalDate.parse(dataInicio) : LocalDate.of(2000, 1, 1)
        );
        Date dtFim = Date.valueOf(
                (dataFim != null && !dataFim.isBlank()) ? LocalDate.parse(dataFim) : LocalDate.of(2099, 12, 31)
        );
        String filtroNick = "%" + (nick != null ? nick.trim() : "") + "%";
        int minAv = (minAvaliacoes != null && minAvaliacoes >= 0) ? minAvaliacoes : 1;

        List<String> listaFuncoes = (funcoes != null && !funcoes.isEmpty())
                ? funcoes
                : List.of("Duelista", "Controlador", "Iniciador", "Sentinela", "Flex");

        String placeholders = String.join(",", Collections.nCopies(listaFuncoes.size(), "?"));

        String sql = """
            SELECT
                RANK() OVER (
                    ORDER BY ROUND(SUM(ra.nota_valor * q.peso) / NULLIF(SUM(q.peso), 0), 2) DESC
                ) AS posicao,
                j.nick,
                j.funcao,
                COUNT(ra.id_resposta) AS total_avaliacoes,
                ROUND(AVG(ra.nota_valor), 2) AS media_simples,
                ROUND(SUM(ra.nota_valor * q.peso) / NULLIF(SUM(q.peso), 0), 2) AS media_ponderada,
                (
                    SELECT ROUND(SUM(ra2.nota_valor * q2.peso) / NULLIF(SUM(q2.peso), 0), 2)
                    FROM resposta_avaliacao ra2
                    INNER JOIN questao q2 ON ra2.id_questao = q2.id_questao
                    INNER JOIN scrim s2 ON ra2.id_scrim = s2.id_scrim
                    WHERE ra2.nota_valor IS NOT NULL
                      AND s2.data BETWEEN ? AND ?
                ) AS media_geral_equipe
            FROM jogador j
            INNER JOIN resposta_avaliacao ra ON j.id_jogador = ra.id_avaliado
            INNER JOIN questao q ON ra.id_questao = q.id_questao
            INNER JOIN scrim s ON ra.id_scrim = s.id_scrim
            WHERE ra.nota_valor IS NOT NULL
              AND s.data BETWEEN ? AND ?
              AND LOWER(j.nick) LIKE LOWER(?)
              AND j.funcao IN (""" + placeholders + """
            )
            GROUP BY j.id_jogador, j.nick, j.funcao
            HAVING COUNT(ra.id_resposta) >= ?
            ORDER BY posicao ASC, j.nick ASC
            """;

        List<Object> params = new ArrayList<>();
        params.add(dtIni);
        params.add(dtFim);
        params.add(dtIni);
        params.add(dtFim);
        params.add(filtroNick);
        params.addAll(listaFuncoes);
        params.add(minAv);

        return jdbc.queryForList(sql, params.toArray());
    }

    // Relatório 2: Evolução da Equipe ao Longo das Scrims (com filtros de data e mapa)
    public List evolucaoScrims(
            String dataInicio,
            String dataFim,
            List<String> mapas
    ) {
        Date dtIni = Date.valueOf(
                (dataInicio != null && !dataInicio.isBlank()) ? LocalDate.parse(dataInicio) : LocalDate.of(2000, 1, 1)
        );
        Date dtFim = Date.valueOf(
                (dataFim != null && !dataFim.isBlank()) ? LocalDate.parse(dataFim) : LocalDate.of(2099, 12, 31)
        );

        List<String> listaMapas = (mapas != null && !mapas.isEmpty())
                ? mapas
                : List.of("Abyss", "Ascent", "Bind", "Breeze", "Fracture",
                "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset");

        String placeholders = String.join(",", Collections.nCopies(listaMapas.size(), "?"));

        String sql = """
            SELECT
                s.id_scrim,
                s.titulo,
                s.data,
                s.mapa,
                s.oponente,
                s.placar,
                COUNT(ra.id_resposta) AS total_notas,
                ROUND(SUM(ra.nota_valor * q.peso) / NULLIF(SUM(q.peso), 0), 2) AS media_ponderada
            FROM scrim s
            LEFT JOIN resposta_avaliacao ra
                ON s.id_scrim = ra.id_scrim
               AND ra.nota_valor IS NOT NULL
            LEFT JOIN questao q
                ON ra.id_questao = q.id_questao
            WHERE s.data BETWEEN ? AND ?
              AND s.mapa IN (""" + placeholders + """
            )
            GROUP BY s.id_scrim, s.titulo, s.data, s.mapa, s.oponente, s.placar
            ORDER BY s.data ASC, s.id_scrim ASC
            """;

        List<Object> params = new ArrayList<>();
        params.add(dtIni);
        params.add(dtFim);
        params.addAll(listaMapas);

        return jdbc.queryForList(sql, params.toArray());
    }

    // Relatório 3: Ranking de Critérios / Questões (com LEFT JOIN e FETCH FIRST)
    public List rankingQuestoes(
            List<String> tipos,
            String ordem,
            Integer limite
    ) {
        List<String> listaTipos = (tipos != null && !tipos.isEmpty())
                ? tipos
                : List.of("Nota", "Texto", "Mista");

        int maxRows = (limite != null && limite > 0) ? limite : 10;
        String placeholders = String.join(",", Collections.nCopies(listaTipos.size(), "?"));

        String orderBy = switch (ordem != null ? ordem : "melhores") {
            case "piores" -> "media_nota ASC NULLS LAST, total_respostas DESC";
            case "nao_usadas" -> "total_respostas ASC, scrims_vinculadas ASC, q.id_questao ASC";
            default -> "media_nota DESC NULLS LAST, total_respostas DESC";
        };

        String sql = """
            SELECT
                q.id_questao,
                q.enunciado,
                q.tipo,
                q.peso,
                (SELECT COUNT(*) FROM scrim_questao sq WHERE sq.id_questao = q.id_questao) AS scrims_vinculadas,
                COUNT(ra.id_resposta) AS total_respostas,
                ROUND(AVG(ra.nota_valor), 2) AS media_nota
            FROM questao q
            LEFT JOIN resposta_avaliacao ra
                ON q.id_questao = ra.id_questao
            WHERE q.tipo IN (""" + placeholders + """
            )
            GROUP BY q.id_questao, q.enunciado, q.tipo, q.peso
            ORDER BY
            """ + orderBy + """
            
            FETCH FIRST (?) ROWS ONLY
            """;

        List<Object> params = new ArrayList<>();
        params.addAll(listaTipos);
        params.add(maxRows);

        return jdbc.queryForList(sql, params.toArray());
    }

    // Relatório 4: Pendências de Avaliação 360° por Scrim (LEFT JOIN)
    public List pendenciasAvaliacao(
            Integer idScrim,
            Boolean apenasPendentes
    ) {
        StringBuilder sql = new StringBuilder("""
            SELECT
                s.id_scrim,
                s.titulo AS scrim,
                s.data,
                s.mapa,
                av.nick AS avaliador,
                COUNT(DISTINCT d2.id_jogador) AS total_colegas,
                COUNT(DISTINCT ra.id_avaliado) AS colegas_avaliados,
                (COUNT(DISTINCT d2.id_jogador) - COUNT(DISTINCT ra.id_avaliado)) AS pendentes,
                COALESCE(
                    STRING_AGG(DISTINCT CASE WHEN ra.id_resposta IS NULL THEN al.nick END, ', '),
                    'Concluído'
                ) AS falta_avaliar
            FROM scrim s
            INNER JOIN disputa d1 ON s.id_scrim = d1.id_scrim
            INNER JOIN jogador av ON d1.id_jogador = av.id_jogador
            INNER JOIN disputa d2 ON s.id_scrim = d2.id_scrim AND d1.id_jogador <> d2.id_jogador
            INNER JOIN jogador al ON d2.id_jogador = al.id_jogador
            LEFT JOIN resposta_avaliacao ra
                ON ra.id_scrim = s.id_scrim
               AND ra.id_avaliador = d1.id_jogador
               AND ra.id_avaliado = d2.id_jogador
            """);

        List<Object> params = new ArrayList<>();
        if (idScrim != null) {
            sql.append(" WHERE s.id_scrim = ? ");
            params.add(idScrim);
        }

        sql.append(" GROUP BY s.id_scrim, s.titulo, s.data, s.mapa, av.id_jogador, av.nick ");

        if (Boolean.TRUE.equals(apenasPendentes)) {
            sql.append(" HAVING (COUNT(DISTINCT d2.id_jogador) - COUNT(DISTINCT ra.id_avaliado)) > 0 ");
        }

        sql.append(" ORDER BY pendentes DESC, s.data DESC, av.nick ASC ");

        return jdbc.queryForList(sql.toString(), params.toArray());
    }
}
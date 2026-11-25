-- ============================================================================
-- VALORANT SCRIM TRACKER - CONSULTAS DOS RELATÓRIOS (SEÇÃO 5)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- RELATÓRIO 1: Ranking 360° dos Jogadores vs. Média Geral da Equipe
-- Objetivo: Exibir o ranking dos jogadores pela média ponderada (usando o peso
--           de cada critério) comparado lado a lado com a média geral do time.
-- Recursos SQL: INNER JOIN, agregação (SUM, AVG, COUNT), GROUP BY, HAVING,
--               Subconsulta, RANK() OVER / ORDER BY, filtros WHERE (BETWEEN,
--               LIKE e IN).
-- ----------------------------------------------------------------------------
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
          AND s2.data BETWEEN '2026-01-01' AND '2026-12-31'
    ) AS media_geral_equipe
FROM jogador j
INNER JOIN resposta_avaliacao ra ON j.id_jogador = ra.id_avaliado
INNER JOIN questao q ON ra.id_questao = q.id_questao
INNER JOIN scrim s ON ra.id_scrim = s.id_scrim
WHERE ra.nota_valor IS NOT NULL
  AND s.data BETWEEN '2026-01-01' AND '2026-12-31'
  AND LOWER(j.nick) LIKE LOWER('%%')
  AND j.funcao IN ('Duelista', 'Controlador', 'Iniciador', 'Sentinela', 'Flex')
GROUP BY j.id_jogador, j.nick, j.funcao
HAVING COUNT(ra.id_resposta) >= 1
ORDER BY posicao ASC, j.nick ASC;


-- ----------------------------------------------------------------------------
-- RELATÓRIO 2: Evolução da Equipe ao Longo das Scrims
-- Objetivo: Acompanhar a evolução cronológica da média ponderada do time
--           por scrim, filtrando por período e mapas.
-- Recursos SQL: LEFT JOIN, agregação (COUNT, SUM), GROUP BY, ORDER BY,
--               filtros WHERE (BETWEEN e IN).
-- ----------------------------------------------------------------------------
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
WHERE s.data BETWEEN '2026-01-01' AND '2026-12-31'
  AND s.mapa IN (
      'Abyss', 'Ascent', 'Bind', 'Breeze', 'Fracture',
      'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'
  )
GROUP BY s.id_scrim, s.titulo, s.data, s.mapa, s.oponente, s.placar
ORDER BY s.data ASC, s.id_scrim ASC;


-- ----------------------------------------------------------------------------
-- RELATÓRIO 3: Ranking dos Critérios / Questões (incluindo questões nunca usadas)
-- Objetivo: Identificar os pontos fortes, pontos fracos e questões ainda não
--           utilizadas ou sem respostas.
-- Recursos SQL: LEFT JOIN, subconsulta correlacionada, agregação (COUNT, AVG),
--               GROUP BY, filtro WHERE (IN), ORDER BY e FETCH FIRST.
-- ----------------------------------------------------------------------------
SELECT
    q.id_questao,
    q.enunciado,
    q.tipo,
    COUNT(DISTINCT sq.id_scrim) AS total_scrims,
    COUNT(DISTINCT ra.id_resposta) AS total_respostas,
    ROUND(AVG(ra.nota_valor)::numeric, 2) AS media_nota
FROM questao q
LEFT JOIN scrim_questao sq ON q.id_questao = sq.id_questao
LEFT JOIN resposta_avaliacao ra ON q.id_questao = ra.id_questao
GROUP BY q.id_questao, q.enunciado, q.tipo
ORDER BY q.id_questao;


-- ----------------------------------------------------------------------------
-- RELATÓRIO 4: Pendências de Avaliação 360° por Scrim
-- Objetivo: Listar todos os jogadores escalados em cada scrim e identificar
--           quantos e quais colegas eles ainda não avaliaram.
-- Recursos SQL: INNER JOIN, LEFT JOIN (junção externa para detectar ausência
--               de resposta), agregação (COUNT, STRING_AGG), GROUP BY, HAVING
--               e ORDER BY.
-- ----------------------------------------------------------------------------
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
GROUP BY s.id_scrim, s.titulo, s.data, s.mapa, av.id_jogador, av.nick
ORDER BY pendentes DESC, s.data DESC, av.nick ASC;
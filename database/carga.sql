-- 1. JOGADORES (20 usuários)
INSERT INTO jogador (nick, riot_tag, funcao, email, senha) VALUES
('AspasBR',     'BR1',  'Duelista',    'aspas@team.com',     '123456'),
('LessVLR',     'BR1',  'Sentinela',   'less@team.com',      '123456'),
('Saadhak',     'IGL',  'Flex',        'saadhak@team.com',   '123456'),
('Cauanzin',    '007',  'Iniciador',   'cauanzin@team.com',  '123456'),
('Tuyz',        'SMK',  'Controlador', 'tuyz@team.com',      '123456'),
('Sacy',        'BALD', 'Iniciador',   'sacy@team.com',      '123456'),
('Pancada',     'CTRL', 'Controlador', 'pancada@team.com',   '123456'),
('Qck',         'DUEL', 'Duelista',    'qck@team.com',       '123456'),
('Dgzin',       'OP',   'Duelista',    'dgzin@team.com',     '123456'),
('Mwzera',      'FLEX', 'Flex',        'mwzera@team.com',    '123456'),
('Khalil',      'SMK2', 'Controlador', 'khalil@team.com',    '123456'),
('Nzr',         'IGL2', 'Iniciador',   'nzr@team.com',       '123456'),
('Havoc',       'ENTR', 'Duelista',    'havoc@team.com',     '123456'),
('Liazzi',      'SENT', 'Sentinela',   'liazzi@team.com',    '123456'),
('Kon4n',       'INIT', 'Iniciador',   'kon4n@team.com',     '123456'),
('RglMeister',  'CTRL', 'Controlador', 'rgl@team.com',       '123456'),
('Heat',        'JETT', 'Duelista',    'heat@team.com',      '123456'),
('Murizzz',     'CAP',  'Flex',        'murizzz@team.com',   '123456'),
('Frz',         'AIM',  'Sentinela',   'frz@team.com',       '123456'),
('Jzz',         'SUB',  'Flex',        'jzz@team.com',       '123456');

-- 2. SCRIMS / AVALIAÇÕES (5 scrims em datas e mapas diferentes)
INSERT INTO scrim (titulo, data, horario_in, horario_fim, mapa, oponente, placar) VALUES
('Treino Tático #01 - Ascent',  '2026-10-10', '19:00', '20:00', 'Ascent',  'FURIA Academy', '14x10'),
('Treino Tático #02 - Bind',    '2026-10-17', '19:00', '20:10', 'Bind',    'MIBR GC',       '12x12'),
('Treino Tático #03 - Haven',   '2026-10-24', '20:00', '21:00', 'Haven',   'RED Canids',    '16x8'),
('Treino Tático #04 - Lotus',   '2026-11-02', '19:30', '20:30', 'Lotus',   '2Game Esports', '9x15'),
('Treino Tático #05 - Sunset',  '2026-11-12', '20:00', '21:00', 'Sunset',  'LOUD Academy',  '13x11');

-- 3. QUESTÕES (30 questões de tipos Nota, Texto e Mista com pesos)
INSERT INTO questao (enunciado, tipo, peso) VALUES
('Qualidade da comunicação durante os rounds',                    'Nota',  2.00),
('Uso eficiente de utilitários (smokes, flashes, drones)',        'Nota',  1.50),
('Posicionamento e disciplina no pós-plant',                      'Nota',  1.50),
('Capacidade de fazer trade kill no companheiro',                 'Nota',  1.25),
('Controle emocional e postura em rounds perdidos',               'Nota',  1.00),
('Leitura de mapa e rotação defensiva',                           'Nota',  1.50),
('Impacto nos rounds de entrada (entry frag)',                    'Nota',  1.75),
('Gestão de economia individual e drop para o time',              'Nota',  1.00),
('Pontualidade e foco durante o aquecimento',                     'Nota',  0.75),
('Execução das táticas combinadas pelo IGL',                      'Nota',  2.00),
('Qual foi o principal ponto forte do jogador nesta scrim?',      'Texto', 1.00),
('Qual aspecto técnico ou tático precisa melhorar urgentemente?', 'Texto', 1.00),
('Comentário sobre a sinergia com a dupla de bomb',               'Texto', 1.00),
('Avalie o desempenho em situações de clutch (1vX)',              'Mista', 1.50),
('Avalie a tomada de decisão nos rounds eco/forçado',             'Mista', 1.25),
('Clareza nas calls de dano e posição inimiga',                   'Nota',  1.50),
('Consistência de mira nos duelos iniciais',                      'Nota',  1.25),
('Cobertura de costas (lurker/flank watch)',                      'Nota',  1.00),
('Adaptação ao estilo de jogo do oponente',                       'Nota',  1.50),
('Iniciativa para sugerir ajustes no intervalo',                  'Mista', 1.00),
('Desempenho em retakes de bomb',                                 'Nota',  1.50),
('Timing de uso da ultimate',                                     'Nota',  1.25),
('Disciplina para não entregar vantagem numérica (overpeek)',     'Nota',  1.75),
('Feedback livre sobre postura no Discord',                       'Texto', 0.50),
('Eficiência jogando no lado Atacante',                           'Nota',  1.25),
('Eficiência jogando no lado Defensor',                           'Nota',  1.25),
('Uso de ping no mapa para auxiliar o time',                      'Nota',  0.75),
('Sugestão de agente alternativo para este mapa',                 'Texto', 0.50),
('Atenção ao tempo de spike e defuse',                            'Nota',  1.00),
('Nota geral de impacto na partida',                              'Mista', 2.00);

-- 4. ASSOCIAÇÃO SCRIM <-> QUESTÃO (Scrims usam questões 1..15; questões 16..30 ficam livres/menos usadas)
INSERT INTO scrim_questao (id_scrim, id_questao) VALUES
(1, 1), (1, 2), (1, 3), (1, 11), (1, 14),
(2, 1), (2, 2), (2, 4), (2, 12), (2, 15),
(3, 1), (3, 3), (3, 5), (3, 10), (3, 11),
(4, 1), (4, 2), (4, 6), (4, 10), (4, 14),
(5, 1), (5, 2), (5, 7), (5, 12), (5, 30);

-- 5. DISPUTA (Jogadores escalados em cada Scrim - 5 por scrim)
INSERT INTO disputa (id_jogador, id_scrim) VALUES
-- Scrim 1: Time principal (IDs 1 a 5)
(1, 1), (2, 1), (3, 1), (4, 1), (5, 1),
-- Scrim 2: Time principal (IDs 1 a 5)
(1, 2), (2, 2), (3, 2), (4, 2), (5, 2),
-- Scrim 3: Mix com reservas (IDs 1, 2, 6, 7, 8)
(1, 3), (2, 3), (6, 3), (7, 3), (8, 3),
-- Scrim 4: Time B (IDs 9, 10, 11, 12, 13)
(9, 4), (10, 4), (11, 4), (12, 4), (13, 4),
-- Scrim 5: Time principal novamente (IDs 1 a 5)
(1, 5), (2, 5), (3, 5), (4, 5), (5, 5);

-- 6. ROUNDS (Amostra de rounds variados por scrim)
INSERT INTO round (id_scrim, numero, vencedor, lado_time, economia) VALUES
-- Scrim 1 (Ascent)
(1, 1,  TRUE,  'Ataque', 'Pistol'),
(1, 2,  TRUE,  'Ataque', 'Forçado'),
(1, 3,  FALSE, 'Ataque', 'Armado'),
(1, 4,  FALSE, 'Ataque', 'Eco'),
(1, 5,  TRUE,  'Ataque', 'Armado'),
(1, 13, TRUE,  'Defesa', 'Pistol'),
-- Scrim 2 (Bind)
(2, 1,  FALSE, 'Defesa', 'Pistol'),
(2, 2,  FALSE, 'Defesa', 'Eco'),
(2, 3,  TRUE,  'Defesa', 'Armado'),
(2, 4,  TRUE,  'Defesa', 'Armado'),
(2, 13, TRUE,  'Ataque', 'Pistol'),
-- Scrim 3 (Haven)
(3, 1,  TRUE,  'Ataque', 'Pistol'),
(3, 2,  TRUE,  'Ataque', 'Armado'),
(3, 3,  TRUE,  'Ataque', 'Armado'),
(3, 13, FALSE, 'Defesa', 'Pistol'),
-- Scrim 4 (Lotus)
(4, 1,  FALSE, 'Defesa', 'Pistol'),
(4, 2,  FALSE, 'Defesa', 'Forçado'),
(4, 3,  TRUE,  'Defesa', 'Armado'),
-- Scrim 5 (Sunset)
(5, 1,  TRUE,  'Ataque', 'Pistol'),
(5, 2,  FALSE, 'Ataque', 'Forçado'),
(5, 3,  TRUE,  'Ataque', 'Armado');

-- 7. ESTATÍSTICAS POR ROUND (Kills e Morreu)
INSERT INTO estatistica (kills, morreu, id_jogador, id_scrim, numero_round) VALUES
-- Scrim 1, Round 1
(3, FALSE, 1, 1, 1), (1, FALSE, 2, 1, 1), (0, TRUE,  3, 1, 1), (1, FALSE, 4, 1, 1), (0, FALSE, 5, 1, 1),
-- Scrim 1, Round 2
(2, TRUE,  1, 1, 2), (2, FALSE, 2, 1, 2), (1, FALSE, 3, 1, 2), (0, TRUE,  4, 1, 2), (0, FALSE, 5, 1, 2),
-- Scrim 1, Round 3
(1, TRUE,  1, 1, 3), (0, TRUE,  2, 1, 3), (1, TRUE,  3, 1, 3), (0, TRUE,  4, 1, 3), (1, TRUE,  5, 1, 3),
-- Scrim 2, Round 1
(1, TRUE,  1, 2, 1), (0, TRUE,  2, 2, 1), (1, TRUE,  3, 2, 1), (0, TRUE,  4, 2, 1), (0, TRUE,  5, 2, 1),
-- Scrim 2, Round 3
(2, FALSE, 1, 2, 3), (1, FALSE, 2, 2, 3), (1, TRUE,  3, 2, 3), (1, FALSE, 4, 2, 3), (0, FALSE, 5, 2, 3),
-- Scrim 3, Round 1
(3, FALSE, 1, 3, 1), (1, FALSE, 2, 3, 1), (1, TRUE,  6, 3, 1), (0, FALSE, 7, 3, 1), (0, TRUE,  8, 3, 1),
-- Scrim 4, Round 1
(1, TRUE,  9, 4, 1), (0, TRUE, 10, 4, 1), (1, TRUE, 11, 4, 1), (0, TRUE, 12, 4, 1), (0, TRUE, 13, 4, 1),
-- Scrim 5, Round 1
(2, FALSE, 1, 5, 1), (2, FALSE, 2, 5, 1), (1, TRUE,  3, 5, 1), (0, FALSE, 4, 5, 1), (0, FALSE, 5, 5, 1);

-- 8. RESPOSTAS DE AVALIAÇÃO 360° (Notas variadas para relatórios de média, ranking e evolução)
INSERT INTO resposta_avaliacao (id_scrim, nota_valor, texto, id_avaliador, id_avaliado, id_questao) VALUES
-- Scrim 1 (Avaliações entre jogadores 1..5)
(1, 9.0, NULL,                                  2, 1, 1),
(1, 8.5, NULL,                                  2, 1, 2),
(1, 9.5, 'Entrou muito bem no bomb A',          2, 1, 14),
(1, 8.0, NULL,                                  3, 1, 1),
(1, 7.5, NULL,                                  1, 2, 1),
(1, 9.0, NULL,                                  1, 2, 2),
(1, 8.5, NULL,                                  1, 3, 1),
(1, 6.5, NULL,                                  4, 5, 1),
(1, 7.0, 'Boa smoke, mas atrasou no retake',    4, 5, 14),
(1, NULL, 'Ótima leitura de mid no ataque',     5, 3, 11),

-- Scrim 2 (Evolução dos mesmos jogadores)
(2, 8.0, NULL,                                  2, 1, 1),
(2, 7.0, NULL,                                  3, 1, 2),
(2, 9.0, NULL,                                  1, 2, 1),
(2, 8.5, NULL,                                  1, 2, 4),
(2, 7.5, NULL,                                  1, 3, 1),
(2, 6.0, 'Faltou trade no bomb B',              5, 4, 15),
(2, 8.0, NULL,                                  4, 5, 1),
(2, NULL, 'Precisa melhorar timing da flash',   3, 4, 12),

-- Scrim 3 (Notas mais altas - vitória 16x8)
(3, 9.5, NULL,                                  2, 1, 1),
(3, 9.0, NULL,                                  6, 1, 3),
(3, 8.5, NULL,                                  1, 2, 1),
(3, 9.0, NULL,                                  1, 6, 1),
(3, 8.0, NULL,                                  1, 7, 5),
(3, 7.5, NULL,                                  2, 8, 10),
(3, NULL, 'Comunicação impecável na Haven',     7, 6, 11),

-- Scrim 4 (Time B - notas mais baixas na derrota 9x15)
(4, 6.0, NULL,                                 10, 9, 1),
(4, 5.5, NULL,                                 11, 9, 2),
(4, 7.0, NULL,                                  9, 10, 1),
(4, 6.5, NULL,                                  9, 11, 6),
(4, 5.0, 'Muita desorganização no pós-plant',  12, 13, 14),
(4, 7.5, NULL,                                 13, 12, 10),

-- Scrim 5 (Apenas jogadores 1 e 2 responderam; jogadores 3, 4 e 5 ficam pendentes para o relatório de LEFT JOIN)
(5, 9.0, NULL,                                  1, 2, 1),
(5, 8.5, NULL,                                  1, 3, 2),
(5, 9.5, 'Carregou o pistol e o armado',        2, 1, 30),
(5, 8.0, NULL,                                  2, 4, 7);

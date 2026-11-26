-- 1. TABELAS PRINCIPAIS (ENTIDADES FORTES)

CREATE TABLE jogador (
    id_jogador SERIAL PRIMARY KEY,
    nick VARCHAR(50) NOT NULL,
    riot_tag VARCHAR(10) NOT NULL,
    funcao VARCHAR(30) NOT NULL CHECK (funcao IN (
        'Duelista', 'Controlador', 'Iniciador', 'Sentinela', 'Flex'
    )),
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

CREATE TABLE scrim (
    id_scrim SERIAL PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    data DATE NOT NULL,
    horario_in TIME NOT NULL,
    horario_fim TIME,
    mapa VARCHAR(30) NOT NULL CHECK (mapa IN (
        'Abyss', 'Ascent', 'Bind', 'Breeze', 'Fracture',
        'Haven', 'Icebox', 'Lotus', 'Pearl', 'Split', 'Sunset'
    )),
    oponente VARCHAR(100) NOT NULL,
    placar VARCHAR(5) -- Ex: '12x12', '14x10', '24x0'
);

CREATE TABLE questao (
    id_questao SERIAL PRIMARY KEY,
    enunciado TEXT NOT NULL,
    tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('Nota', 'Texto', 'Mista')),
    peso NUMERIC(5,2) DEFAULT 1.00 CHECK (peso > 0)
);

-- 2. TABELAS DERIVADAS DE ENTIDADES FRACAS

CREATE TABLE round (
    id_scrim INT NOT NULL,
    numero INT NOT NULL CHECK (numero > 0 AND numero <= 24),
    vencedor BOOLEAN NOT NULL, -- TRUE = Nosso time | FALSE = Outro time
    lado_time VARCHAR(15) NOT NULL CHECK (lado_time IN ('Ataque', 'Defesa')),
    economia VARCHAR(20) NOT NULL CHECK (economia IN (
        'Pistol', 'Eco', 'Forçado', 'Armado'
    )),
    PRIMARY KEY (id_scrim, numero),
    CONSTRAINT fk_round_scrim
        FOREIGN KEY (id_scrim) REFERENCES scrim(id_scrim)
        ON DELETE CASCADE
);

CREATE TABLE resposta_avaliacao (
    id_scrim INT NOT NULL,
    id_resposta SERIAL NOT NULL,
    nota_valor NUMERIC(4,2) CHECK (nota_valor >= 0 AND nota_valor <= 10),
    texto TEXT,
    id_avaliador INT NOT NULL,
    id_avaliado INT NOT NULL,
    id_questao INT NOT NULL,
    PRIMARY KEY (id_scrim, id_resposta),
    CONSTRAINT fk_resp_scrim
        FOREIGN KEY (id_scrim) REFERENCES scrim(id_scrim)
        ON DELETE CASCADE,
    CONSTRAINT fk_resp_avaliador
        FOREIGN KEY (id_avaliador) REFERENCES jogador(id_jogador)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resp_avaliado
        FOREIGN KEY (id_avaliado) REFERENCES jogador(id_jogador)
        ON DELETE RESTRICT,
    CONSTRAINT fk_resp_questao
        FOREIGN KEY (id_questao) REFERENCES questao(id_questao)
        ON DELETE RESTRICT,
    -- Particularidade 360° (RF6): cada avaliador avalia outra pessoa uma única vez por questão na scrim
    CONSTRAINT chk_nao_autoavaliacao CHECK (id_avaliador <> id_avaliado),
    CONSTRAINT uq_avaliacao_360 UNIQUE (id_scrim, id_avaliador, id_avaliado, id_questao)
);

-- 3. TABELA COM DEPENDÊNCIA DE ENTIDADE FRACA

CREATE TABLE estatistica (
    id_estatistica SERIAL PRIMARY KEY,
    kills INT NOT NULL DEFAULT 0 CHECK (kills >= 0),
    morreu BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = Morreu | FALSE = Sobreviveu
    id_jogador INT NOT NULL,
    id_scrim INT NOT NULL,
    numero_round INT NOT NULL,
    CONSTRAINT fk_est_jogador
        FOREIGN KEY (id_jogador) REFERENCES jogador(id_jogador)
        ON DELETE CASCADE,
    CONSTRAINT fk_est_round
        FOREIGN KEY (id_scrim, numero_round) REFERENCES round(id_scrim, numero)
        ON DELETE CASCADE,
    -- Garante que um jogador tenha apenas um registro de estatística por round
    CONSTRAINT uq_est_jogador_round UNIQUE (id_jogador, id_scrim, numero_round)
);

-- 4. TABELAS ASSOCIATIVAS (RELACIONAMENTOS N:M)

CREATE TABLE disputa (
    id_jogador INT NOT NULL,
    id_scrim INT NOT NULL,
    PRIMARY KEY (id_jogador, id_scrim),
    CONSTRAINT fk_disputa_jogador
        FOREIGN KEY (id_jogador) REFERENCES jogador(id_jogador)
        ON DELETE CASCADE,
    CONSTRAINT fk_disputa_scrim
        FOREIGN KEY (id_scrim) REFERENCES scrim(id_scrim)
        ON DELETE CASCADE
);

CREATE TABLE scrim_questao (
    id_scrim INT NOT NULL,
    id_questao INT NOT NULL,
    PRIMARY KEY (id_scrim, id_questao),
    CONSTRAINT fk_sq_scrim
        FOREIGN KEY (id_scrim) REFERENCES scrim(id_scrim)
        ON DELETE CASCADE,
    CONSTRAINT fk_sq_questao
        FOREIGN KEY (id_questao) REFERENCES questao(id_questao)
        ON DELETE CASCADE
);

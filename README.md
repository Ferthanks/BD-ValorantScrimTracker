# Valorant Scrim Tracker — Sistema de Avaliação 360°

Projeto da disciplina **Banco de Dados I** (UEL — Prof. Dr. Anderson Paulo Avila Santos).

## Integrantes
- Fernando Henrique Russo
- Otávio Nazário

---

## Natureza do Sistema e Particularidade

- **Natureza escolhida:** Avaliação de desempenho profissional (Avaliação 360°).
- **Particularidade implementada:** Em cada partida de treino (*scrim*), os jogadores participantes avaliam seus colegas de equipe segundo critérios (questões) que possuem **pesos** distintos e tipos variados (`Nota`, `Texto` ou `Mista`). Um mesmo jogador recebe avaliações de vários colegas, **não pode avaliar a si mesmo** e **cada avaliador avalia cada colega uma única vez por scrim**. Essas regras são garantidas tanto na aplicação quanto por restrições no banco de dados (`CHECK` e `UNIQUE`).

---

## Tecnologias e Arquitetura

- **Banco de Dados:** PostgreSQL
- **Back-end:** Java 21 + Spring Boot (Web + JDBC com `JdbcTemplate`, **sem JPA/Hibernate**)
- **Front-end:** HTML, CSS, JavaScript e Chart.js
- **Camadas:** `controller` → `dao` (JDBC) + `model` → PostgreSQL, com transações (`@Transactional`) nas gravações multi-tabela.

### Estrutura do Repositório
- `docs/` — DER, esquema relacional, justificativa da 3FN e prints dos relatórios.
- `database/schema.sql` — DDL completo com restrições de integridade (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`).
- `database/carga.sql` — Massa de dados inicial para testes (20 jogadores, 5 scrims, 30 questões e respostas de avaliação 360°).
- `database/relatorios.sql` — Consultas SQL dos 4 relatórios comentadas.
- `src/` — Código-fonte do back-end (Java/Spring) e front-end (`src/main/resources/static`).

---

## Funcionalidades

- **Autenticação Simples:** Login de jogador por e-mail e senha (identifica automaticamente o avaliador na tela de Avaliação 360°).
- **Gestão de Jogadores:** Cadastro, listagem e exclusão com `nick`, `riot_tag`, função no jogo e credenciais.
- **Banco de Questões:** Cadastro de critérios com tipo (`Nota`, `Texto` ou `Mista`) e peso para cálculo da média ponderada.
- **Gestão de Scrims:** Registro de partidas de treino (mapa, data, horários, oponente e placar) com vinculação N:N de jogadores escalados e questões aplicadas.
- **Avaliação 360°:** Formulário dinâmico conforme o tipo da questão, bloqueio de autoavaliação, detecção automática de colegas já avaliados na scrim e histórico das respostas registradas.

---

## Relatórios e Gráficos (Dashboard)

Todos os relatórios possuem gráficos interativos em Chart.js, tabelas detalhadas e filtros dinâmicos:

1. **Ranking de Jogadores (Média Ponderada vs. Média da Equipe):** Utiliza função de janela (`RANK() OVER`), média ponderada com `NULLIF` e comparação direta com a média geral do time. Filtros: período, nick, função e mínimo de avaliações.
2. **Evolução das Scrims:** Acompanha o desempenho ponderado da equipe ao longo das partidas e mapas, preservando scrims ainda sem notas via `LEFT JOIN`. Filtros: período e mapa.
3. **Análise de Questões:** Exibe peso, total de scrims vinculadas, quantidade de respostas e nota média por critério, usando `LEFT JOIN`, `NULLS LAST` e `FETCH FIRST`. Filtros: tipo de questão, ordenação e limite.
4. **Pendências de Avaliação 360°:** Monitora o progresso de preenchimento por scrim e por avaliador, listando os colegas pendentes com `COUNT(DISTINCT)`, `STRING_AGG` e `COALESCE`. Filtros: scrim específica e exibição apenas de pendências.

---

## Principais Endpoints da API

- `GET / POST / DELETE /api/jogadores` e `POST /api/jogadores/login`
- `GET / POST / DELETE /api/questoes`
- `GET / POST / DELETE /api/scrims`, `GET /api/scrims/{id}/jogadores` e `GET /api/scrims/{id}/questoes`
- `GET /api/avaliacoes/scrim/{id}` e `POST /api/avaliacoes`
- `GET /api/relatorios/jogadores`
- `GET /api/relatorios/evolucao`
- `GET /api/relatorios/questoes`
- `GET /api/relatorios/pendencias`

---

## Como Rodar o Sistema (Passo a Passo)

### Pré-requisitos
- Java 21+ (JDK)
- Maven (ou Maven Wrapper `./mvnw`)
- PostgreSQL instalado e em execução

### 1. Criar e popular o banco de dados
Crie um banco vazio no PostgreSQL (por exemplo, `valorant_scrim_tracker`) e execute os scripts **nesta ordem**:

```bash
psql -U postgres -c "CREATE DATABASE valorant_scrim_tracker;"
psql -U postgres -d valorant_scrim_tracker -f database/schema.sql
psql -U postgres -d valorant_scrim_tracker -f database/carga.sql
```

*(Opcional)* Para validar as consultas diretamente no PostgreSQL:

```bash
psql -U postgres -d valorant_scrim_tracker -f database/relatorios.sql
```

### 2. Configurar a conexão com o PostgreSQL
Verifique e ajuste o usuário e a senha do seu PostgreSQL em `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/valorant_scrim_tracker
spring.datasource.username=postgres
spring.datasource.password=SUA_SENHA
```

### 3. Executar a aplicação
Na raiz do projeto, execute:

```bash
./mvnw spring-boot:run
```

No Windows (PowerShell/CMD):

```bash
mvnw.cmd spring-boot:run
```

*(Caso tenha o Maven instalado globalmente, também é possível rodar com `mvn spring-boot:run`.)*

### 4. Acessar o sistema
Com a aplicação iniciada, abra no navegador:

```text
http://localhost:8080
```
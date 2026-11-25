# Valorant Scrim Tracker — Sistema de Avaliação 360°

Projeto da disciplina **Banco de Dados I** (UEL — Prof. Dr. Anderson Paulo Avila Santos).

## Integrantes
* [Fernando Henrique Russo]
* [Otávio Nazário]

---

## Natureza do Sistema e Particularidade

* **Natureza escolhida:** Avaliação de desempenho profissional (Avaliação 360°).
* **Particularidade implementada:** Em cada partida de treino (*scrim*), os jogadores participantes avaliam seus colegas de equipe segundo critérios (questões) que possuem **pesos** distintos. Um mesmo jogador recebe avaliações de vários colegas, **não pode avaliar a si mesmo** e **cada avaliador avalia cada colega uma única vez por scrim**. Essas regras são garantidas tanto na aplicação quanto por restrições no banco de dados (`CHECK` e `UNIQUE`).

---

## Tecnologias e Arquitetura

* **Banco de Dados:** PostgreSQL
* **Back-end:** Java 21 + Spring Boot (Web + JDBC com `JdbcTemplate`, **sem JPA/Hibernate**)
* **Front-end:** HTML, CSS, JavaScript e Chart.js
* **Camadas:** `controller` → `dao` (JDBC) + `model` → PostgreSQL, com transações (`@Transactional`) nas gravações multi-tabela.

### Estrutura do Repositório
* `docs/` — DER, esquema relacional, justificativa da 3FN e prints dos relatórios.
* `database/schema.sql` — DDL completo com restrições de integridade (`PRIMARY KEY`, `FOREIGN KEY`, `NOT NULL`, `UNIQUE`, `CHECK`).
* `database/carga.sql` — Dados de teste para popular o banco.
* `database/relatorios.sql` — Consultas SQL dos relatórios comentadas.
* `src/` — Código-fonte do back-end e front-end.

---

## Como Rodar o Sistema (Passo a Passo)

### Pré-requisitos
* Java 21+ (JDK)
* Maven (ou Maven Wrapper `./mvnw`)
* PostgreSQL instalado e em execução

### 1. Criar e popular o banco de dados
Crie um banco vazio no PostgreSQL (por exemplo, `valorant_scrim_tracker`) e execute os scripts **nesta ordem**:

```bash
psql -U postgres -c "CREATE DATABASE valorant_scrim_tracker;"
psql -U postgres -d valorant_scrim_tracker -f database/schema.sql
psql -U postgres -d valorant_scrim_tracker -f database/carga.sql
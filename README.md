# BD-ValorantScrimTracker

Modelagem e implementação de banco de dados relacional para gerenciamento de treinos (*scrims*) de Valorant, incluindo controle de rounds, estatísticas individuais de jogadores e sistema de avaliação pós-partida.

## Estrutura do Projeto
- `/docs/modelo-conceitual`: Diagrama Entidade-Relacionamento (DER - Notação de Peter Chen).
- `/docs/modelo-logico`: Mapeamento relacional com tabelas, chaves primárias e estrangeiras.
- `/database`:
  - `schema.sql`: Script DDL para criação das tabelas e restrições.
  - `seeds.sql`: Script DML com dados fictícios para testes.
  - `queries.sql`: Consultas SQL para relatórios e análise de desempenho.
- `/src`: Código-fonte da aplicação (se aplicável).

## Entidades Principais
- `JOGADOR`, `SCRIM`, `QUESTAO`, `ESTATISTICA`, `ROUND` e `RESPOSTA_AVALIACAO`.
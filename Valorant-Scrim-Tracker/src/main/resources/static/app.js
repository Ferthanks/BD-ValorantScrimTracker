const charts = {};

function mostrarToast(msg, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => toast.className = 'toast', 3000);
}

async function api(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `Erro ${res.status} em ${url}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

function buildQuery(params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') {
            qs.append(k, v);
        }
    });
    const str = qs.toString();
    return str ? `?${str}` : '';
}

// ==================== AUTENTICAÇÃO SIMPLES ====================
let usuarioLogado = JSON.parse(sessionStorage.getItem('vst_user') || 'null');

function atualizarBarraLogin() {
    const formLogin = document.getElementById('form-login');
    const userLogged = document.getElementById('user-logged');
    const userInfo = document.getElementById('user-info');
    if (!formLogin || !userLogged || !userInfo) return;

    if (usuarioLogado) {
        formLogin.style.display = 'none';
        userLogged.style.display = 'flex';
        userInfo.innerHTML = `Logado: <strong>${usuarioLogado.nick}</strong> (${usuarioLogado.funcao})`;
    } else {
        formLogin.style.display = 'flex';
        userLogged.style.display = 'none';
    }
}

const formLoginEl = document.getElementById('form-login');
if (formLoginEl) {
    formLoginEl.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const user = await api('/api/jogadores/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: document.getElementById('login-email').value,
                    senha: document.getElementById('login-senha').value
                })
            });
            usuarioLogado = user;
            sessionStorage.setItem('vst_user', JSON.stringify(user));
            e.target.reset();
            atualizarBarraLogin();
            mostrarToast(`Bem-vindo, ${user.nick}!`);

            if (document.getElementById('tab-avaliacao').classList.contains('active')) {
                carregarTelaAvaliacao();
            }
        } catch {
            mostrarToast('E-mail ou senha inválidos', true);
        }
    });
}

function fazerLogout() {
    usuarioLogado = null;
    sessionStorage.removeItem('vst_user');
    atualizarBarraLogin();
    mostrarToast('Sessão encerrada');

    if (document.getElementById('tab-avaliacao').classList.contains('active')) {
        carregarTelaAvaliacao();
    }
}

atualizarBarraLogin();

// ==================== NAVEGAÇÃO DE ABAS ====================
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');

        if (btn.dataset.tab === 'dashboard') carregarDashboard();
        if (btn.dataset.tab === 'jogadores') carregarJogadores();
        if (btn.dataset.tab === 'questoes') carregarQuestoes();
        if (btn.dataset.tab === 'scrims') carregarScrims();
        if (btn.dataset.tab === 'avaliacao') carregarTelaAvaliacao();
    });
});

// ==================== HELPER CHART.JS ====================
function renderChart(id, config) {
    const ctx = document.getElementById(id).getContext('2d');
    if (charts[id]) charts[id].destroy();
    charts[id] = new Chart(ctx, config);
}

// ==================== RELATÓRIO 1 ====================
async function carregarRelatorio1() {
    const qs = buildQuery({
        dataInicio: document.getElementById('f1-inicio').value,
        dataFim: document.getElementById('f1-fim').value,
        nick: document.getElementById('f1-nick').value,
        funcoes: document.getElementById('f1-funcao').value,
        minAvaliacoes: document.getElementById('f1-min').value
    });

    const dados = await api(`/api/relatorios/jogadores${qs}`);

    document.getElementById('kpi-mvp').textContent =
        dados[0] && dados[0].media_ponderada != null
            ? `${dados[0].nick} (${dados[0].media_ponderada})`
            : '-';

    renderChart('chartJogadores', {
        type: 'bar',
        data: {
            labels: dados.map(d => d.nick),
            datasets: [
                {
                    label: 'Média Ponderada do Jogador',
                    data: dados.map(d => Number(d.media_ponderada ?? 0)),
                    backgroundColor: 'rgba(255, 70, 85, 0.8)'
                },
                {
                    label: 'Média Geral da Equipe',
                    data: dados.map(d => Number(d.media_geral_equipe ?? 0)),
                    backgroundColor: 'rgba(52, 152, 219, 0.7)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#ece8e1' } } },
            scales: {
                x: { ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } },
                y: { beginAtZero: true, max: 10, ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } }
            }
        }
    });

    document.getElementById('tabela-relatorio-1').innerHTML = dados.map(d => {
        const diff = (Number(d.media_ponderada ?? 0) - Number(d.media_geral_equipe ?? 0)).toFixed(2);
        const cls = diff >= 0 ? 'badge-ok' : 'badge-warn';
        return `
            <tr>
                <td><strong>#${d.posicao}</strong></td>
                <td><strong>${d.nick}</strong></td>
                <td>${d.funcao}</td>
                <td>${d.total_avaliacoes}</td>
                <td>${d.media_ponderada ?? '-'}</td>
                <td>${d.media_geral_equipe ?? '-'}</td>
                <td class="${cls}">${diff >= 0 ? '+' : ''}${diff}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">Nenhum dado encontrado para os filtros aplicados.</td></tr>';
}

// ==================== RELATÓRIO 2 ====================
async function carregarRelatorio2() {
    const qs = buildQuery({
        dataInicio: document.getElementById('f2-inicio').value,
        dataFim: document.getElementById('f2-fim').value,
        mapas: document.getElementById('f2-mapa').value
    });

    const dados = await api(`/api/relatorios/evolucao${qs}`);

    renderChart('chartEvolucao', {
        type: 'line',
        data: {
            labels: dados.map(d => `${d.data} • ${d.mapa}`),
            datasets: [{
                label: 'Média Ponderada da Scrim',
                data: dados.map(d => d.media_ponderada != null ? Number(d.media_ponderada) : null),
                borderColor: '#ff4655',
                backgroundColor: 'rgba(255, 70, 85, 0.2)',
                tension: 0.3,
                fill: true,
                spanGaps: true
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#ece8e1' } } },
            scales: {
                x: { ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } },
                y: { beginAtZero: true, max: 10, ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } }
            }
        }
    });

    document.getElementById('tabela-relatorio-2').innerHTML = dados.map(d => `
        <tr>
            <td>${d.data}</td>
            <td><strong>${d.titulo}</strong></td>
            <td>${d.mapa}</td>
            <td>${d.oponente}</td>
            <td>${d.placar || '-'}</td>
            <td>${d.total_notas}</td>
            <td><strong>${d.media_ponderada ?? 'Sem notas'}</strong></td>
        </tr>
    `).join('') || '<tr><td colspan="7">Nenhuma scrim encontrada.</td></tr>';
}

// ==================== RELATÓRIO 3 ====================
async function carregarRelatorio3() {
    const qs = buildQuery({
        tipos: document.getElementById('f3-tipo').value,
        ordem: document.getElementById('f3-ordem').value,
        limite: document.getElementById('f3-limite').value
    });

    const dados = await api(`/api/relatorios/questoes${qs}`);

    const questoesComNota = dados.filter(q => (q.tipo || '').toLowerCase() !== 'texto');

    const labels = questoesComNota.map(q => {
        const limite = 28;
        const texto = q.enunciado.length > limite
            ? q.enunciado.slice(0, limite) + '...'
            : q.enunciado;
        return `#${q.id_questao} ${texto}`;
    });

    renderChart('chartQuestoes', {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Média da Questão',
                data: questoesComNota.map(q => Number(q.media_nota ?? 0)),
                backgroundColor: questoesComNota.map(q =>
                    q.media_nota != null
                        ? 'rgba(46, 204, 113, 0.8)'
                        : 'rgba(139, 155, 180, 0.35)'
                ),
                borderRadius: 6
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        title: (items) => {
                            const q = questoesComNota[items[0].dataIndex];
                            return `#${q.id_questao} — ${q.enunciado}`;
                        },
                        label: (item) => {
                            const q = questoesComNota[item.dataIndex];
                            if (q.media_nota == null) {
                                return ' Sem notas registradas';
                            }
                            return ` Média: ${Number(q.media_nota).toFixed(2)} (${q.total_respostas} resp. | Peso ${q.peso})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 10,
                    ticks: { color: '#8b9bb4' },
                    grid: { color: '#2a3c4d' }
                },
                y: {
                    ticks: { color: '#ece8e1' },
                    grid: { color: '#2a3c4d' }
                }
            }
        }
    });

    document.getElementById('tabela-relatorio-3').innerHTML = dados.map(q => {
        const isTexto = (q.tipo || '').toLowerCase() === 'texto';
        const mediaHtml = isTexto
            ? '<span style="color:#8b9bb4;white-space:nowrap;">Dissertativa</span>'
            : (q.media_nota != null
                ? `<strong>${Number(q.media_nota).toFixed(2)}</strong>`
                : '<span style="color:#8b9bb4;white-space:nowrap;">Sem nota</span>');

        return `
            <tr>
                <td>${q.id_questao}</td>
                <td>${q.enunciado}</td>
                <td style="white-space:nowrap;">${q.tipo}</td>
                <td>${q.peso}</td>
                <td>${q.scrims_vinculadas}</td>
                <td>${q.total_respostas}</td>
                <td>${mediaHtml}</td>
            </tr>
        `;
    }).join('') || '<tr><td colspan="7">Nenhuma questão encontrada.</td></tr>';
}

// ==================== RELATÓRIO 4 ====================
async function carregarRelatorio4() {
    const qs = buildQuery({
        idScrim: document.getElementById('f4-scrim').value,
        apenasPendentes: document.getElementById('f4-pendentes').checked
    });

    const dados = await api(`/api/relatorios/pendencias${qs}`);

    const totalPend = dados.reduce((acc, item) => acc + Number(item.pendentes ?? 0), 0);
    document.getElementById('kpi-pendencias').textContent = totalPend;

    const porAvaliador = {};
    dados.forEach(d => {
        if (!porAvaliador[d.avaliador]) {
            porAvaliador[d.avaliador] = { avaliados: 0, pendentes: 0 };
        }
        porAvaliador[d.avaliador].avaliados += Number(d.colegas_avaliados ?? 0);
        porAvaliador[d.avaliador].pendentes += Number(d.pendentes ?? 0);
    });
    const labels = Object.keys(porAvaliador);

    renderChart('chartPendencias', {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Colegas Avaliados',
                    data: labels.map(l => porAvaliador[l].avaliados),
                    backgroundColor: 'rgba(46, 204, 113, 0.75)'
                },
                {
                    label: 'Avaliações Pendentes',
                    data: labels.map(l => porAvaliador[l].pendentes),
                    backgroundColor: 'rgba(255, 70, 85, 0.8)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: { legend: { labels: { color: '#ece8e1' } } },
            scales: {
                x: { stacked: true, ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } },
                y: { stacked: true, beginAtZero: true, ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } }
            }
        }
    });

    document.getElementById('tabela-relatorio-4').innerHTML = dados.map(d => `
        <tr>
            <td>${d.scrim}</td>
            <td>${d.data}</td>
            <td><strong>${d.avaliador}</strong></td>
            <td>${d.colegas_avaliados}/${d.total_colegas}</td>
            <td class="${d.pendentes > 0 ? 'badge-warn' : 'badge-ok'}">${d.pendentes}</td>
            <td>${d.falta_avaliar}</td>
        </tr>
    `).join('') || '<tr><td colspan="6">Nenhuma pendência encontrada.</td></tr>';
}

async function carregarDashboard() {
    try {
        const [listaJog, listaScrims] = await Promise.all([
            api('/api/jogadores'),
            api('/api/scrims')
        ]);

        document.getElementById('kpi-jogadores').textContent = listaJog.length;
        document.getElementById('kpi-scrims').textContent = listaScrims.length;

        const selScrim = document.getElementById('f4-scrim');
        const atual = selScrim.value;
        selScrim.innerHTML = '<option value="">Todas as scrims</option>' +
            listaScrims.map(s => `<option value="${s.idScrim}">${s.titulo} (${s.mapa} - ${s.data})</option>`).join('');
        selScrim.value = atual;

        await Promise.all([
            carregarRelatorio1(),
            carregarRelatorio2(),
            carregarRelatorio3(),
            carregarRelatorio4()
        ]);
    } catch (e) {
        console.error(e);
        mostrarToast('Erro ao carregar relatórios', true);
    }
}

// ==================== JOGADORES ====================
async function carregarJogadores() {
    const jogadores = await api('/api/jogadores');
    const tbody = document.getElementById('lista-jogadores');
    tbody.innerHTML = jogadores.map(j => `
        <tr>
            <td>${j.idJogador}</td>
            <td><strong>${j.nick}</strong></td>
            <td>${j.riotTag}</td>
            <td>${j.funcao}</td>
            <td>${j.email}</td>
            <td><button class="btn-danger" onclick="deletarJogador(${j.idJogador})">Excluir</button></td>
        </tr>
    `).join('');
}

document.getElementById('form-jogador').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await api('/api/jogadores', {
            method: 'POST',
            body: JSON.stringify({
                nick: document.getElementById('j-nick').value,
                riotTag: document.getElementById('j-tag').value,
                funcao: document.getElementById('j-funcao').value,
                email: document.getElementById('j-email').value,
                senha: document.getElementById('j-senha').value
            })
        });
        e.target.reset();
        mostrarToast('Jogador cadastrado!');
        carregarJogadores();
    } catch {
        mostrarToast('Erro ao cadastrar jogador (verifique se o e-mail já existe)', true);
    }
});

async function deletarJogador(id) {
    if (!confirm('Deseja excluir este jogador?')) return;
    try {
        await api(`/api/jogadores/${id}`, { method: 'DELETE' });
        mostrarToast('Jogador excluído!');
        carregarJogadores();
    } catch {
        mostrarToast('Não foi possível excluir (pode possuir avaliações vinculadas)', true);
    }
}

// ==================== QUESTÕES ====================
async function carregarQuestoes() {
    const questoes = await api('/api/questoes');
    const tbody = document.getElementById('lista-questoes');
    tbody.innerHTML = questoes.map(q => `
        <tr>
            <td>${q.idQuestao}</td>
            <td>${q.enunciado}</td>
            <td>${q.tipo}</td>
            <td>${q.peso}</td>
            <td><button class="btn-danger" onclick="deletarQuestao(${q.idQuestao})">Excluir</button></td>
        </tr>
    `).join('');
}

document.getElementById('form-questao').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        await api('/api/questoes', {
            method: 'POST',
            body: JSON.stringify({
                enunciado: document.getElementById('q-enunciado').value,
                tipo: document.getElementById('q-tipo').value,
                peso: parseFloat(document.getElementById('q-peso').value)
            })
        });
        e.target.reset();
        mostrarToast('Questão cadastrada!');
        carregarQuestoes();
    } catch {
        mostrarToast('Erro ao cadastrar questão', true);
    }
});

async function deletarQuestao(id) {
    if (!confirm('Deseja excluir esta questão?')) return;
    try {
        await api(`/api/questoes/${id}`, { method: 'DELETE' });
        mostrarToast('Questão excluída!');
        carregarQuestoes();
    } catch {
        mostrarToast('Não foi possível excluir a questão', true);
    }
}

// ==================== SCRIMS ====================
async function carregarScrims() {
    const [scrims, jogadores, questoes] = await Promise.all([
        api('/api/scrims'),
        api('/api/jogadores'),
        api('/api/questoes')
    ]);

    document.getElementById('scrim-jogadores-checks').innerHTML = jogadores.map(j => `
        <label class="check-item">
            <input type="checkbox" name="scrim-jog" value="${j.idJogador}">
            ${j.nick} (${j.funcao})
        </label>
    `).join('') || '<small>Cadastre jogadores primeiro.</small>';

    document.getElementById('scrim-questoes-checks').innerHTML = questoes.map(q => `
        <label class="check-item">
            <input type="checkbox" name="scrim-quest" value="${q.idQuestao}">
            ${q.enunciado}
        </label>
    `).join('') || '<small>Cadastre questões primeiro.</small>';

    document.getElementById('lista-scrims').innerHTML = scrims.map(s => `
        <tr>
            <td>${s.idScrim}</td>
            <td><strong>${s.titulo}</strong></td>
            <td>${s.data}</td>
            <td>${s.mapa}</td>
            <td>${s.oponente}</td>
            <td>${s.placar || '-'}</td>
            <td><button class="btn-danger" onclick="deletarScrim(${s.idScrim})">Excluir</button></td>
        </tr>
    `).join('');
}

document.getElementById('form-scrim').addEventListener('submit', async (e) => {
    e.preventDefault();
    const jogadoresIds = [...document.querySelectorAll('input[name="scrim-jog"]:checked')].map(el => Number(el.value));
    const questoesIds = [...document.querySelectorAll('input[name="scrim-quest"]:checked')].map(el => Number(el.value));
    const inicio = document.getElementById('s-inicio').value;
    const fim = document.getElementById('s-fim').value;

    try {
        await api('/api/scrims', {
            method: 'POST',
            body: JSON.stringify({
                titulo: document.getElementById('s-titulo').value,
                data: document.getElementById('s-data').value,
                horarioIn: inicio.length === 5 ? inicio + ':00' : inicio,
                horarioFim: fim ? (fim.length === 5 ? fim + ':00' : fim) : null,
                mapa: document.getElementById('s-mapa').value,
                oponente: document.getElementById('s-oponente').value,
                placar: document.getElementById('s-placar').value || null,
                jogadoresIds,
                questoesIds
            })
        });
        e.target.reset();
        mostrarToast('Scrim registrada com sucesso!');
        carregarScrims();
    } catch {
        mostrarToast('Erro ao salvar scrim', true);
    }
});

async function deletarScrim(id) {
    if (!confirm('Deseja excluir esta scrim?')) return;
    try {
        await api(`/api/scrims/${id}`, { method: 'DELETE' });
        mostrarToast('Scrim excluída!');
        carregarScrims();
    } catch {
        mostrarToast('Erro ao excluir scrim', true);
    }
}

// ==================== AVALIAÇÃO 360° ====================
let jogadoresScrimAtual = [];
let respostasScrimAtual = [];

async function carregarTelaAvaliacao() {
    const scrims = await api('/api/scrims');
    const select = document.getElementById('av-scrim');
    select.innerHTML = scrims.map(s =>
        `<option value="${s.idScrim}">${s.titulo} — ${s.mapa} (${s.data})</option>`
    ).join('');

    if (scrims.length > 0) {
        await carregarDetalhesScrimParaAvaliacao(scrims[0].idScrim);
    } else {
        document.getElementById('av-questoes-container').innerHTML = '<p>Cadastre uma scrim primeiro.</p>';
    }
}

document.getElementById('av-scrim').addEventListener('change', (e) => {
    carregarDetalhesScrimParaAvaliacao(e.target.value);
});

document.getElementById('av-avaliador').addEventListener('change', () => {
    atualizarOpcoesAvaliado();
});

document.getElementById('av-avaliado').addEventListener('change', () => {
    verificarStatusAvaliacaoPar();
});

function atualizarOpcoesAvaliado() {
    const selAvaliador = document.getElementById('av-avaliador');
    const selAvaliado = document.getElementById('av-avaliado');
    const idAvaliador = Number(selAvaliador.value);
    const avaliadorObj = jogadoresScrimAtual.find(j => j.idJogador === idAvaliador);

    const jaAvaliadosNicks = new Set(
        respostasScrimAtual
            .filter(r => r.id_avaliador === idAvaliador || (avaliadorObj && r.avaliador === avaliadorObj.nick))
            .map(r => r.avaliado)
    );

    const colegas = jogadoresScrimAtual.filter(j => j.idJogador !== idAvaliador);
    selAvaliado.innerHTML = colegas.map(j => {
        const concluido = jaAvaliadosNicks.has(j.nick) ? ' ✓ (Já avaliado)' : '';
        return `<option value="${j.idJogador}">${j.nick} (${j.funcao})${concluido}</option>`;
    }).join('');

    const pendente = colegas.find(j => !jaAvaliadosNicks.has(j.nick));
    if (pendente) {
        selAvaliado.value = pendente.idJogador;
    }

    verificarStatusAvaliacaoPar();
}

function verificarStatusAvaliacaoPar() {
    const selAvaliador = document.getElementById('av-avaliador');
    const selAvaliado = document.getElementById('av-avaliado');
    const btnSubmit = document.querySelector('#form-avaliacao button[type="submit"]');
    const container = document.getElementById('av-questoes-container');

    let banner = document.getElementById('av-banner-status');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'av-banner-status';
        container.parentNode.insertBefore(banner, container);
    }

    const idAvaliador = Number(selAvaliador.value);
    const idAvaliado = Number(selAvaliado.value);
    const avaliadorObj = jogadoresScrimAtual.find(j => j.idJogador === idAvaliador);
    const avaliadoObj = jogadoresScrimAtual.find(j => j.idJogador === idAvaliado);

    if (!avaliadorObj || !avaliadoObj) {
        banner.style.display = 'none';
        return;
    }

    const jaAvaliou = respostasScrimAtual.some(r =>
        (r.id_avaliador === idAvaliador || r.avaliador === avaliadorObj.nick) &&
        (r.id_avaliado === idAvaliado || r.avaliado === avaliadoObj.nick)
    );

    if (jaAvaliou) {
        banner.className = 'av-status-banner';
        banner.style.display = 'block';
        banner.textContent = `Regra 360°: ${avaliadorObj.nick} já avaliou ${avaliadoObj.nick} nesta scrim. Selecione outro colega pendente.`;
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.5';
    } else {
        banner.style.display = 'none';
        btnSubmit.disabled = false;
        btnSubmit.style.opacity = '1';
    }
}

async function carregarDetalhesScrimParaAvaliacao(idScrim) {
    const [jogadores, questoes, respostas] = await Promise.all([
        api(`/api/scrims/${idScrim}/jogadores`),
        api(`/api/scrims/${idScrim}/questoes`),
        api(`/api/avaliacoes/scrim/${idScrim}`)
    ]);

    jogadoresScrimAtual = jogadores;
    respostasScrimAtual = respostas;

    const selAvaliador = document.getElementById('av-avaliador');
    selAvaliador.innerHTML = jogadores.map(j => `<option value="${j.idJogador}">${j.nick} (${j.funcao})</option>`).join('');

    const idUserLogado = usuarioLogado ? (usuarioLogado.id_jogador ?? usuarioLogado.idJogador) : null;
    if (idUserLogado && jogadores.some(j => j.idJogador === idUserLogado)) {
        selAvaliador.value = idUserLogado;
        selAvaliador.disabled = true;
    } else {
        selAvaliador.disabled = false;
    }

    atualizarOpcoesAvaliado();

    const container = document.getElementById('av-questoes-container');
    container.innerHTML = questoes.map(q => {
        const tipo = (q.tipo || 'Nota').toLowerCase();
        let camposHtml = '';

        if (tipo === 'nota') {
            camposHtml = `<input type="number" class="av-nota" min="0" max="10" step="0.5" placeholder="Nota (0 a 10)" required>`;
        } else if (tipo === 'texto') {
            camposHtml = `<input type="text" class="av-texto" placeholder="Resposta dissertativa obrigatória" required>`;
        } else {
            camposHtml = `
                <input type="number" class="av-nota" min="0" max="10" step="0.5" placeholder="Nota (0 a 10)" required>
                <input type="text" class="av-texto" placeholder="Justificativa / Comentário obrigatório" required>
            `;
        }

        return `
            <div class="av-item tipo-${tipo}" data-id-questao="${q.idQuestao}" data-tipo="${tipo}">
                <div>
                    <strong>${q.enunciado}</strong>
                    <div style="font-size:0.8rem;color:#8b9bb4;">Tipo: ${q.tipo} | Peso: ${q.peso}</div>
                </div>
                ${camposHtml}
            </div>
        `;
    }).join('') || '<p>Nenhuma questão vinculada a esta scrim.</p>';

    document.getElementById('lista-avaliacoes').innerHTML = respostas.map(r => `
        <tr>
            <td>${r.avaliador}</td>
            <td><strong>${r.avaliado}</strong></td>
            <td>${r.enunciado}</td>
            <td>${r.nota_valor ?? '-'}</td>
            <td>${r.texto || '-'}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">Nenhuma avaliação registrada nesta scrim ainda.</td></tr>';
}

document.getElementById('form-avaliacao').addEventListener('submit', async (e) => {
    e.preventDefault();
    const idScrim = Number(document.getElementById('av-scrim').value);
    const idAvaliador = Number(document.getElementById('av-avaliador').value);
    const idAvaliado = Number(document.getElementById('av-avaliado').value);
    const itens = [...document.querySelectorAll('.av-item')];

    if (!idAvaliado || itens.length === 0) {
        mostrarToast('Selecione um colega e uma scrim com questões vinculadas.', true);
        return;
    }

    if (idAvaliador === idAvaliado) {
        mostrarToast('Não é permitido avaliar a si mesmo.', true);
        return;
    }

    const payload = itens.map(item => {
        const inputNota = item.querySelector('.av-nota');
        const inputTexto = item.querySelector('.av-texto');
        const notaStr = inputNota ? inputNota.value : '';
        const texto = inputTexto ? inputTexto.value.trim() : '';

        return {
            idScrim,
            idAvaliador,
            idAvaliado,
            idQuestao: Number(item.dataset.idQuestao),
            notaValor: notaStr !== '' ? parseFloat(notaStr) : null,
            texto: texto || null
        };
    });

    try {
        await api('/api/avaliacoes', {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        e.target.reset();
        document.getElementById('av-scrim').value = idScrim;
        mostrarToast('Avaliação 360° salva!');
        carregarDetalhesScrimParaAvaliacao(idScrim);
    } catch {
        mostrarToast('Erro ao salvar avaliação (verifique se já foi respondida)', true);
    }
});

// Inicializa nos Relatórios
carregarDashboard();
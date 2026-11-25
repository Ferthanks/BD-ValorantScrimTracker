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
        throw new Error(`Erro ${res.status} em ${url}`);
    }
    const text = await res.text();
    return text ? JSON.parse(text) : null;
}

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

// ==================== DASHBOARD (CHART.JS) ====================
function renderChart(id, type, labels, data, label, color) {
    const ctx = document.getElementById(id).getContext('2d');
    if (charts[id]) charts[id].destroy();

    charts[id] = new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [{
                label,
                data,
                backgroundColor: color,
                borderColor: '#ff4655',
                borderWidth: 2,
                tension: 0.3,
                fill: type === 'line'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#ece8e1' } }
            },
            scales: {
                x: { ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } },
                y: { beginAtZero: true, max: 10, ticks: { color: '#8b9bb4' }, grid: { color: '#2a3c4d' } }
            }
        }
    });
}

async function carregarDashboard() {
    try {
        const [jogadores, mapas, questoes, evolucao, listaJog, listaScrims] = await Promise.all([
            api('/api/relatorios/jogadores'),
            api('/api/relatorios/mapas'),
            api('/api/relatorios/questoes'),
            api('/api/relatorios/evolucao'),
            api('/api/jogadores'),
            api('/api/scrims')
        ]);

        document.getElementById('kpi-jogadores').textContent = listaJog.length;
        document.getElementById('kpi-scrims').textContent = listaScrims.length;
        document.getElementById('kpi-mvp').textContent =
            jogadores[0] && jogadores[0].media_nota != null
                ? `${jogadores[0].nick} (${jogadores[0].media_nota})`
                : '-';
        document.getElementById('kpi-mapa').textContent =
            mapas[0] && mapas[0].media_nota != null
                ? `${mapas[0].mapa} (${mapas[0].media_nota})`
                : '-';

        renderChart(
            'chartJogadores',
            'bar',
            jogadores.map(j => j.nick),
            jogadores.map(j => j.media_nota ?? 0),
            'Média 360°',
            'rgba(255, 70, 85, 0.75)'
        );

        renderChart(
            'chartMapas',
            'bar',
            mapas.map(m => m.mapa),
            mapas.map(m => m.media_nota ?? 0),
            'Média por Mapa',
            'rgba(46, 204, 113, 0.7)'
        );

        renderChart(
            'chartQuestoes',
            'bar',
            questoes.map(q => q.enunciado.length > 28 ? q.enunciado.slice(0, 28) + '...' : q.enunciado),
            questoes.map(q => q.media_nota ?? 0),
            'Média por Critério',
            'rgba(52, 152, 219, 0.75)'
        );

        renderChart(
            'chartEvolucao',
            'line',
            evolucao.map(e => `${e.titulo} (${e.mapa})`),
            evolucao.map(e => e.media_nota ?? 0),
            'Média da Equipe',
            'rgba(255, 70, 85, 0.18)'
        );
    } catch (e) {
        console.error(e);
        mostrarToast('Erro ao carregar dashboard', true);
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
    } catch (err) {
        mostrarToast('Erro ao cadastrar jogador', true);
    }
});

async function deletarJogador(id) {
    if (!confirm('Deseja excluir este jogador?')) return;
    try {
        await api(`/api/jogadores/${id}`, { method: 'DELETE' });
        mostrarToast('Jogador excluído!');
        carregarJogadores();
    } catch {
        mostrarToast('Não foi possível excluir (pode possuir vínculos)', true);
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
            <input type="checkbox" name="scrim-jog" value="${j.idJogador}" checked>
            ${j.nick} (${j.funcao})
        </label>
    `).join('') || '<small>Cadastre jogadores primeiro.</small>';

    document.getElementById('scrim-questoes-checks').innerHTML = questoes.map(q => `
        <label class="check-item">
            <input type="checkbox" name="scrim-quest" value="${q.idQuestao}" checked>
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

async function carregarDetalhesScrimParaAvaliacao(idScrim) {
    const [jogadores, questoes, respostas] = await Promise.all([
        api(`/api/scrims/${idScrim}/jogadores`),
        api(`/api/scrims/${idScrim}/questoes`),
        api(`/api/avaliacoes/scrim/${idScrim}`)
    ]);

    const optionsJog = jogadores.map(j => `<option value="${j.idJogador}">${j.nick} (${j.funcao})</option>`).join('');
    document.getElementById('av-avaliador').innerHTML = optionsJog;
    document.getElementById('av-avaliado').innerHTML = optionsJog;

    const container = document.getElementById('av-questoes-container');
    container.innerHTML = questoes.map(q => `
        <div class="av-item" data-id-questao="${q.idQuestao}">
            <div>
                <strong>${q.enunciado}</strong>
                <div style="font-size:0.8rem;color:#8b9bb4;">Tipo: ${q.tipo} | Peso: ${q.peso}</div>
            </div>
            <input type="number" class="av-nota" min="0" max="10" step="0.5" placeholder="Nota (0-10)">
            <input type="text" class="av-texto" placeholder="Comentário / Feedback opcional">
        </div>
    `).join('') || '<p>Nenhuma questão vinculada a esta scrim.</p>';

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
    const payload = itens.map(item => {
        const notaStr = item.querySelector('.av-nota').value;
        const texto = item.querySelector('.av-texto').value.trim();
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
        mostrarToast('Avaliação 360° salva!');
        carregarDetalhesScrimParaAvaliacao(idScrim);
    } catch {
        mostrarToast('Erro ao salvar avaliação', true);
    }
});

// Inicializa no Dashboard
carregarDashboard();
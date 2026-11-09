const clientePedidos = exigirLogin();
const filtros = document.querySelectorAll('.filtros a');
const listaPedidos = document.getElementById('lista_pedidos');
const semPedidos = document.getElementById('sem_pedidos');
let filtroEscolhido = 'todos';

function montarPedido(pedido) {
    const status = statusDoPedido(pedido);
    const etapa = etapaDoPedido(pedido);
    const numero = String(pedido.numero).padStart(4, '0');

    let linhas = pedido.itens.map((item) =>
        `<li><span>${item.quantidade}x ${escaparHtml(item.nome)}</span><span>${formatarPreco(item.preco * item.quantidade)}</span></li>`
    ).join('');
    linhas += `<li><span>Entrega</span><span>${formatarPreco(pedido.entrega)}</span></li>`;
    if (pedido.desconto > 0) linhas += `<li><span>Desconto</span><span>- ${formatarPreco(pedido.desconto)}</span></li>`;

    let barraEtapas = '';
    let lado = '';
    if (status === 'andamento') {
        barraEtapas = '<div class="etapas">' + etapasPedido.map((nome, i) =>
            `<span class="${i < etapa ? 'feita' : i === etapa ? 'atual' : ''}">${nome}</span>`
        ).join('') + '</div>';

        const previsao = new Date(pedido.data + minutosDaEtapa[minutosDaEtapa.length - 1] * 60000);
        lado += `<p class="texto_pequeno">Previsão: ${formatarData(previsao).split(' - ')[1]}</p>`;
        lado += `<a href="mailto:lucdavisan@gmail.com?subject=Pedido%20%23${numero}" class="botao claro">FALAR COM A LOJA</a>`;
        // depois que vai pro forno não dá mais para cancelar
        if (etapa === 0) lado += `<a href="#" class="botao claro" data-acao="cancelar" data-numero="${pedido.numero}">CANCELAR</a>`;
    } else {
        lado += `<a href="carrinho.html" class="botao" data-acao="repetir" data-numero="${pedido.numero}">PEDIR DE NOVO</a>`;
    }

    const janela = document.createElement('div');
    janela.className = 'janela pedido';
    janela.innerHTML = `
        <div class="window_bar">
            <span>PEDIDO #${numero}</span>
            <span>${formatarData(pedido.data)}</span>
        </div>
        <div class="janela_conteudo">
            <div>
                <span class="etiqueta ${status}">${nomeDoStatus(pedido)}</span>
                <ul class="pedido_itens">${linhas}</ul>
                ${barraEtapas}
            </div>
            <div class="pedido_lado">
                <p class="pedido_total">Total<strong>${formatarPreco(pedido.total)}</strong></p>
                ${lado}
            </div>
        </div>`;
    return janela;
}

function desenharPedidos() {
    listaPedidos.innerHTML = '';
    let mostrados = 0;

    pedidosDoUsuario(clientePedidos.email).forEach((pedido) => {
        if (filtroEscolhido !== 'todos' && statusDoPedido(pedido) !== filtroEscolhido) return;
        listaPedidos.appendChild(montarPedido(pedido));
        mostrados++;
    });

    semPedidos.hidden = mostrados > 0;
}

filtros.forEach((filtro) => {
    filtro.addEventListener('click', (e) => {
        e.preventDefault();
        filtros.forEach((f) => f.classList.remove('active'));
        filtro.classList.add('active');
        filtroEscolhido = filtro.dataset.filtro;
        desenharPedidos();
    });
});

listaPedidos.addEventListener('click', (e) => {
    const botao = e.target.closest('[data-acao]');
    if (!botao) return;

    const pedidos = lerPedidos();
    const pedido = pedidos.find((p) => p.numero === Number(botao.dataset.numero) && p.email === clientePedidos.email);
    if (!pedido) return;

    if (botao.dataset.acao === 'cancelar') {
        e.preventDefault();
        if (etapaDoPedido(pedido) > 0 || !confirm('Cancelar este pedido?')) return;
        pedido.cancelado = true;
        gravarPedidos(pedidos);
        desenharPedidos();
    }

    // o link já leva para o carrinho, só falta colocar os itens nele
    if (botao.dataset.acao === 'repetir') {
        pedido.itens.forEach((item) => adicionarAoCarrinho(item.nome, item.preco, item.quantidade, item.imagem));
    }
});

if (clientePedidos) {
    desenharPedidos();
    // as etapas avançam com o tempo, então a lista se atualiza sozinha
    setInterval(desenharPedidos, 15000);
}

const cliente = exigirLogin();
const filtros = document.querySelectorAll('.filtros a');
const listaPedidos = document.getElementById('lista_pedidos');
const semPedidos = document.getElementById('sem_pedidos');
const textoSemPedidos = semPedidos.innerHTML;
let filtroEscolhido = 'todos';

// avisa o back-end (PUT /api/pedidos/{numero}/cancelar)
async function cancelarPedido(numero) {
    if (!confirm('Cancelar este pedido?')) {
        return;
    }

    try {
        await api.cancelarPedido(numero);
    } catch (erro) {
        alert(erro.message);
    }
    desenharPedidos();
}

function pedirDeNovo(pedido) {
    for (let i = 0; i < pedido.itens.length; i++) {
        const item = pedido.itens[i];
        adicionarAoCarrinho(item.nome, item.preco, item.quantidade, item.imagem);
    }
}

function montarPedido(pedido) {
    const status = statusDoPedido(pedido);
    const etapa = etapaDoPedido(pedido);

    let linhas = '';
    for (let i = 0; i < pedido.itens.length; i++) {
        const item = pedido.itens[i];
        linhas = linhas + '<li><span>' + item.quantidade + 'x ' + item.nome + '</span><span>'
            + formatarPreco(item.preco * item.quantidade) + '</span></li>';
    }
    linhas = linhas + '<li><span>Entrega</span><span>' + formatarPreco(pedido.entrega) + '</span></li>';
    if (pedido.desconto > 0) {
        linhas = linhas + '<li><span>Desconto</span><span>- ' + formatarPreco(pedido.desconto) + '</span></li>';
    }

    let barraEtapas = '';
    let botoes = '';

    if (status === 'andamento') {
        barraEtapas = '<div class="etapas">';
        for (let i = 0; i < etapasPedido.length; i++) {
            let classe = '';
            if (i < etapa) {
                classe = 'feita';
            } else if (i === etapa) {
                classe = 'atual';
            }
            barraEtapas = barraEtapas + '<span class="' + classe + '">' + etapasPedido[i].toUpperCase() + '</span>';
        }
        barraEtapas = barraEtapas + '</div>';

        const previsao = pedido.data + minutosParaEntregar * 60000;
        botoes = '<p class="texto_pequeno">Previsão: ' + formatarHora(previsao) + '</p>';
        botoes = botoes + '<a href="mailto:lucdavisan@gmail.com" class="botao claro">FALAR COM A LOJA</a>';

        if (etapa === 0) {
            botoes = botoes + '<a href="#" class="botao claro cancelar">CANCELAR</a>';
        }
    } else {
        botoes = '<a href="carrinho.html" class="botao repetir">PEDIR DE NOVO</a>';
    }

    const janela = document.createElement('div');
    janela.className = 'janela pedido';
    janela.innerHTML = `
        <div class="window_bar">
            <span>PEDIDO ${numeroDoPedido(pedido)}</span>
            <span>${formatarDia(pedido.data)} - ${formatarHora(pedido.data)}</span>
        </div>
        <div class="janela_conteudo">
            <div>
                <span class="etiqueta ${status}">${nomeDoStatus(pedido)}</span>
                <ul class="pedido_itens">${linhas}</ul>
                ${barraEtapas}
            </div>
            <div class="pedido_lado">
                <p class="pedido_total">Total<strong>${formatarPreco(pedido.total)}</strong></p>
                ${botoes}
            </div>
        </div>`;

    const botaoCancelar = janela.querySelector('.cancelar');
    if (botaoCancelar !== null) {
        botaoCancelar.addEventListener('click', function (evento) {
            evento.preventDefault();
            cancelarPedido(pedido.numero);
        });
    }

    const botaoRepetir = janela.querySelector('.repetir');
    if (botaoRepetir !== null) {
        botaoRepetir.addEventListener('click', function () {
            pedirDeNovo(pedido);
        });
    }

    return janela;
}

// busca os pedidos no back-end (GET /api/pedidos?email=...) e desenha na tela
async function desenharPedidos() {
    let pedidos;
    try {
        pedidos = await api.listarPedidos(cliente.email);
    } catch (erro) {
        semPedidos.textContent = erro.message;
        semPedidos.hidden = false;
        return;
    }

    semPedidos.innerHTML = textoSemPedidos;
    listaPedidos.innerHTML = '';
    let mostrados = 0;

    for (let i = 0; i < pedidos.length; i++) {
        const status = statusDoPedido(pedidos[i]);
        if (filtroEscolhido === 'todos' || status === filtroEscolhido) {
            listaPedidos.appendChild(montarPedido(pedidos[i]));
            mostrados++;
        }
    }

    semPedidos.hidden = mostrados > 0;
}

for (let i = 0; i < filtros.length; i++) {
    filtros[i].addEventListener('click', function (evento) {
        evento.preventDefault();

        for (let j = 0; j < filtros.length; j++) {
            filtros[j].classList.remove('active');
        }
        evento.target.classList.add('active');

        filtroEscolhido = evento.target.dataset.filtro;
        desenharPedidos();
    });
}

if (cliente !== null) {
    desenharPedidos();

    setInterval(desenharPedidos, 15000);
}

const lista = document.getElementById('lista_carrinho');
const avisoVazio = document.getElementById('carrinho_vazio');
const erroCarrinho = document.getElementById('erro_carrinho');
const valorEntrega = 7.90;
let porcentagemDesconto = 0;

function calcularTotais() {
    const itens = lerCarrinho();
    const subtotal = itens.reduce((soma, item) => soma + item.preco * item.quantidade, 0);
    const entrega = itens.length > 0 ? valorEntrega : 0;
    const desconto = subtotal * porcentagemDesconto;
    return { itens, subtotal, entrega, desconto, total: subtotal - desconto + entrega };
}

function atualizarTotal() {
    const contas = calcularTotais();

    document.getElementById('subtotal').textContent = formatarPreco(contas.subtotal);
    document.getElementById('entrega').textContent = formatarPreco(contas.entrega);
    document.getElementById('desconto').textContent = '- ' + formatarPreco(contas.desconto);
    document.getElementById('total').textContent = formatarPreco(contas.total);
    avisoVazio.hidden = contas.itens.length > 0;
}

function desenharCarrinho() {
    lista.querySelectorAll('.item_carrinho').forEach((item) => item.remove());

    lerCarrinho().forEach((item, posicao) => {
        const linha = document.createElement('div');
        linha.className = 'item_carrinho';
        linha.dataset.posicao = posicao;
        const foto = item.imagem
            ? `<img src="${escaparHtml(item.imagem)}" alt="Cookie ${escaparHtml(item.nome)}">`
            : 'imagem';
        linha.innerHTML = `
            <div class="espaco_imagem">${foto}</div>
            <div>
                <h3>${escaparHtml(item.nome)}</h3>
                <p>${formatarPreco(item.preco)}</p>
            </div>
            <div class="quantidade">
                <a href="#" class="menos">-</a>
                <span>${item.quantidade}</span>
                <a href="#" class="mais">+</a>
            </div>
            <a href="#" class="remover">REMOVER</a>`;
        lista.insertBefore(linha, avisoVazio);
    });

    atualizarTotal();
}

lista.addEventListener('click', (e) => {
    const botao = e.target.closest('a');
    if (!botao || !botao.closest('.item_carrinho')) return;
    e.preventDefault();

    const itens = lerCarrinho();
    const item = itens[botao.closest('.item_carrinho').dataset.posicao];
    if (!item) return;

    if (botao.classList.contains('mais')) item.quantidade++;
    if (botao.classList.contains('menos')) item.quantidade--;

    if (botao.classList.contains('remover') || item.quantidade < 1) {
        itens.splice(itens.indexOf(item), 1);
    }

    gravarCarrinho(itens);
    desenharCarrinho();
});

// cupom de exemplo: COOKIE10 dá 10% de desconto
document.getElementById('aplicar_cupom').addEventListener('click', (e) => {
    e.preventDefault();
    const cupom = document.getElementById('cupom').value.trim().toUpperCase();
    porcentagemDesconto = cupom === 'COOKIE10' ? 0.10 : 0;
    atualizarTotal();
});

document.getElementById('finalizar_pedido').addEventListener('click', (e) => {
    e.preventDefault();
    const contas = calcularTotais();

    if (contas.itens.length === 0) {
        erroCarrinho.textContent = 'Seu carrinho está vazio.';
        erroCarrinho.hidden = false;
        return;
    }

    // sem conta não tem pedido: o carrinho fica guardado e o login volta para cá
    const usuario = exigirLogin();
    if (!usuario) return;

    const pedidos = lerPedidos();
    const ultimoNumero = pedidos.reduce((maior, pedido) => Math.max(maior, pedido.numero), 0);

    pedidos.push({
        numero: ultimoNumero + 1,
        email: usuario.email,
        data: Date.now(),
        itens: contas.itens,
        subtotal: contas.subtotal,
        entrega: contas.entrega,
        desconto: contas.desconto,
        total: contas.total,
        cancelado: false
    });
    gravarPedidos(pedidos);
    gravarCarrinho([]);

    location.href = 'pedidos.html';
});

desenharCarrinho();

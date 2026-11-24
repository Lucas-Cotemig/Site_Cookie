const lista = document.getElementById('lista_carrinho');
const avisoVazio = document.getElementById('carrinho_vazio');
const erroCarrinho = document.getElementById('erro_carrinho');
const valorEntrega = 7.90;
let porcentagemDesconto = 0;

/* ===== CONTAS DO RESUMO ===== */

function calcularSubtotal(itens) {
    let subtotal = 0;
    for (let i = 0; i < itens.length; i++) {
        subtotal = subtotal + itens[i].preco * itens[i].quantidade;
    }
    return subtotal;
}

// carrinho vazio não paga entrega
function calcularEntrega(itens) {
    if (itens.length === 0) {
        return 0;
    }
    return valorEntrega;
}

function atualizarTotal() {
    const itens = lerCarrinho();
    const subtotal = calcularSubtotal(itens);
    const entrega = calcularEntrega(itens);
    const desconto = subtotal * porcentagemDesconto;
    const total = subtotal - desconto + entrega;

    document.getElementById('subtotal').textContent = formatarPreco(subtotal);
    document.getElementById('entrega').textContent = formatarPreco(entrega);
    document.getElementById('desconto').textContent = '- ' + formatarPreco(desconto);
    document.getElementById('total').textContent = formatarPreco(total);

    // a mensagem "Seu carrinho está vazio" só aparece sem itens
    avisoVazio.hidden = itens.length > 0;
}

/* ===== LISTA DE ITENS ===== */

function mudarQuantidade(posicao, quanto) {
    const itens = lerCarrinho();
    itens[posicao].quantidade = itens[posicao].quantidade + quanto;

    // chegou a zero: tira do carrinho
    if (itens[posicao].quantidade < 1) {
        itens.splice(posicao, 1);
    }

    salvarCarrinho(itens);
    desenharCarrinho();
}

function removerItem(posicao) {
    const itens = lerCarrinho();
    itens.splice(posicao, 1);
    salvarCarrinho(itens);
    desenharCarrinho();
}

// cria na tela uma linha para cada cookie do carrinho
function desenharCarrinho() {
    // apaga as linhas antigas antes de desenhar de novo
    const linhasAntigas = lista.querySelectorAll('.item_carrinho');
    for (let i = 0; i < linhasAntigas.length; i++) {
        linhasAntigas[i].remove();
    }

    const itens = lerCarrinho();

    for (let i = 0; i < itens.length; i++) {
        const item = itens[i];

        let foto = 'imagem';
        if (item.imagem) {
            foto = '<img src="' + item.imagem + '" alt="Cookie ' + item.nome + '">';
        }

        const linha = document.createElement('div');
        linha.className = 'item_carrinho';
        linha.innerHTML = `
            <div class="espaco_imagem">${foto}</div>
            <div>
                <h3>${item.nome}</h3>
                <p>${formatarPreco(item.preco)}</p>
            </div>
            <div class="quantidade">
                <a href="#" class="menos">-</a>
                <span>${item.quantidade}</span>
                <a href="#" class="mais">+</a>
            </div>
            <a href="#" class="remover">REMOVER</a>`;

        linha.querySelector('.mais').addEventListener('click', function (evento) {
            evento.preventDefault();
            mudarQuantidade(i, 1);
        });

        linha.querySelector('.menos').addEventListener('click', function (evento) {
            evento.preventDefault();
            mudarQuantidade(i, -1);
        });

        linha.querySelector('.remover').addEventListener('click', function (evento) {
            evento.preventDefault();
            removerItem(i);
        });

        // coloca a linha antes da mensagem de carrinho vazio
        lista.insertBefore(linha, avisoVazio);
    }

    atualizarTotal();
}

/* ===== CUPOM ===== */
// cupom de exemplo: COOKIE10 dá 10% de desconto
document.getElementById('aplicar_cupom').addEventListener('click', function (evento) {
    evento.preventDefault();
    const cupom = document.getElementById('cupom').value.trim().toUpperCase();

    if (cupom === 'COOKIE10') {
        porcentagemDesconto = 0.10;
    } else {
        porcentagemDesconto = 0;
    }

    atualizarTotal();
});

/* ===== FINALIZAR PEDIDO ===== */
document.getElementById('finalizar_pedido').addEventListener('click', async function (evento) {
    evento.preventDefault();
    erroCarrinho.hidden = true;
    const itens = lerCarrinho();

    if (itens.length === 0) {
        erroCarrinho.textContent = 'Seu carrinho está vazio.';
        erroCarrinho.hidden = false;
        return;
    }

    // sem conta não tem pedido: vai para o login e o carrinho continua guardado
    const usuario = exigirLogin();
    if (usuario === null) {
        return;
    }

    const subtotal = calcularSubtotal(itens);
    const entrega = calcularEntrega(itens);
    const desconto = subtotal * porcentagemDesconto;

    // envia o pedido para o back-end (POST /api/pedidos); o número e a data quem define é ele
    try {
        await api.criarPedido({
            email: usuario.email,
            itens: itens,
            entrega: entrega,
            desconto: desconto,
            total: subtotal - desconto + entrega
        });
    } catch (erro) {
        erroCarrinho.textContent = erro.message;
        erroCarrinho.hidden = false;
        return;
    }

    // esvazia o carrinho e mostra os pedidos
    salvarCarrinho([]);
    location.href = 'pedidos.html';
});

desenharCarrinho();

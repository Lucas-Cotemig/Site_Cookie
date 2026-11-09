const clientePerfil = exigirLogin();
const botaoEditar = document.getElementById('editar_perfil');
const botaoCancelar = document.getElementById('cancelar_edicao');
// o e-mail é o login da conta, então não dá para trocar aqui
const camposPerfil = document.querySelectorAll('#form_dados input:not(#email), #form_endereco input');
let editando = false;

// o recorde vem do jogo da página inicial
try {
    const recorde = parseInt(localStorage.getItem('pixelcookie-recorde') || '0', 10) || 0;
    document.getElementById('recorde_jogo').textContent = String(recorde).padStart(3, '0');
} catch (e) { }

// cada campo do formulário tem o mesmo id da informação guardada na conta
function carregarDados() {
    const usuario = buscarUsuario(clientePerfil.email);

    camposPerfil.forEach((campo) => {
        campo.value = usuario[campo.id] || '';
    });
    document.getElementById('email').value = usuario.email;

    document.getElementById('nome_usuario').textContent = usuario.nome;
    document.getElementById('email_usuario').textContent = usuario.email;
    document.getElementById('cliente_desde').textContent = new Date(usuario.criadoEm).getFullYear();
}

function salvarDados() {
    const usuario = buscarUsuario(clientePerfil.email);
    camposPerfil.forEach((campo) => usuario[campo.id] = campo.value.trim());
    if (!usuario.nome) usuario.nome = clientePerfil.nome;
    salvarUsuario(usuario);
    atualizarCabecalhoConta();
}

function carregarPedidos() {
    const pedidos = pedidosDoUsuario(clientePerfil.email);
    const validos = pedidos.filter((pedido) => !pedido.cancelado);
    const cookiesComidos = validos
        .filter((pedido) => statusDoPedido(pedido) === 'entregue')
        .reduce((soma, pedido) => soma + pedido.itens.reduce((s, item) => s + item.quantidade, 0), 0);

    document.getElementById('pedidos_feitos').textContent = validos.length;
    document.getElementById('cookies_comidos').textContent = cookiesComidos;

    const tabela = document.getElementById('ultimos_pedidos');
    if (pedidos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="4">Nenhum pedido ainda.</td></tr>';
        return;
    }

    tabela.innerHTML = pedidos.slice(0, 3).map((pedido) => `
        <tr>
            <td>#${String(pedido.numero).padStart(4, '0')}</td>
            <td>${formatarData(pedido.data).split(' - ')[0]}</td>
            <td>${formatarPreco(pedido.total)}</td>
            <td><span class="etiqueta ${statusDoPedido(pedido)}">${nomeDoStatus(pedido)}</span></td>
        </tr>`).join('');
}

function mudarEdicao(ligar) {
    editando = ligar;
    camposPerfil.forEach((campo) => campo.disabled = !ligar);
    botaoEditar.textContent = ligar ? 'SALVAR' : 'EDITAR DADOS';
    botaoCancelar.hidden = !ligar;
    if (ligar) camposPerfil[0].focus();
}

botaoEditar.addEventListener('click', (e) => {
    e.preventDefault();
    if (editando) {
        // não salva com o telefone pela metade
        if (!document.getElementById('form_dados').reportValidity()) return;
        salvarDados();
        carregarDados();
    }
    mudarEdicao(!editando);
});

// cancelar volta para o que estava salvo
botaoCancelar.addEventListener('click', (e) => {
    e.preventDefault();
    carregarDados();
    mudarEdicao(false);
});

document.getElementById('sair_conta').addEventListener('click', sair);

if (clientePerfil) {
    carregarDados();
    carregarPedidos();
}

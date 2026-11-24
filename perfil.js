const cliente = exigirLogin();
const botaoEditar = document.getElementById('editar_perfil');
const botaoCancelar = document.getElementById('cancelar_edicao');
let editando = false;

// cada campo do formulário tem o mesmo id da informação guardada na conta
// (o e-mail fica de fora porque ele é o login e não pode ser trocado)
const idsDosCampos = ['nome', 'telefone', 'nascimento', 'cpf', 'cep', 'bairro', 'rua', 'numero', 'complemento', 'cidade', 'estado'];

// cópia da conta que veio do back-end (GET /api/usuarios/{email})
let dadosConta = null;

/* ===== DADOS DA CONTA ===== */

// busca a conta no back-end e preenche o formulário
async function carregarDados() {
    try {
        dadosConta = await api.buscarUsuario(cliente.email);
    } catch (erro) {
        alert(erro.message);
        return;
    }

    if (dadosConta === null) {
        // a conta não existe mais no back-end: encerra a sessão
        sair();
        location.href = 'login.html';
        return;
    }
    preencherFormulario();
}

function preencherFormulario() {
    const usuario = dadosConta;

    for (const id of idsDosCampos) {
        document.getElementById(id).value = usuario[id] || '';
    }
    document.getElementById('email').value = usuario.email;

    document.getElementById('nome_usuario').textContent = usuario.nome;
    document.getElementById('email_usuario').textContent = usuario.email;
    document.getElementById('cliente_desde').textContent = new Date(usuario.criadoEm).getFullYear();
}

// envia os dados editados para o back-end (PUT /api/usuarios/{email})
async function salvarDados() {
    const usuario = Object.assign({}, dadosConta);

    for (const id of idsDosCampos) {
        usuario[id] = document.getElementById(id).value.trim();
    }

    if (usuario.nome === '') {
        usuario.nome = dadosConta.nome;
    }

    dadosConta = await api.atualizarUsuario(usuario);
    atualizarSessao(dadosConta);
    atualizarCabecalhoConta();
}

// busca os pedidos no back-end (GET /api/pedidos?email=...)
async function carregarPedidos() {
    const tabela = document.getElementById('ultimos_pedidos');
    let pedidos;
    try {
        pedidos = await api.listarPedidos(cliente.email);
    } catch (erro) {
        tabela.innerHTML = '<tr><td colspan="4">' + erro.message + '</td></tr>';
        return;
    }

    let pedidosFeitos = 0;
    let cookiesComidos = 0;

    for (let i = 0; i < pedidos.length; i++) {
        if (!pedidos[i].cancelado) {
            pedidosFeitos++;
        }

        if (statusDoPedido(pedidos[i]) === 'entregue') {
            for (let j = 0; j < pedidos[i].itens.length; j++) {
                cookiesComidos = cookiesComidos + pedidos[i].itens[j].quantidade;
            }
        }
    }

    document.getElementById('pedidos_feitos').textContent = pedidosFeitos;
    document.getElementById('cookies_comidos').textContent = cookiesComidos;

    if (pedidos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="4">Nenhum pedido ainda.</td></tr>';
        return;
    }

    let linhas = '';
    for (let i = 0; i < pedidos.length && i < 3; i++) {
        const pedido = pedidos[i];
        linhas = linhas + `
            <tr>
                <td>${numeroDoPedido(pedido)}</td>
                <td>${formatarDia(pedido.data)}</td>
                <td>${formatarPreco(pedido.total)}</td>
                <td><span class="etiqueta ${statusDoPedido(pedido)}">${nomeDoStatus(pedido)}</span></td>
            </tr>`;
    }
    tabela.innerHTML = linhas;
}

// recorde do jogo da página inicial (fica guardado no navegador)
const recorde = localStorage.getItem('pixelcookie-recorde') || '0';
document.getElementById('recorde_jogo').textContent = recorde.padStart(3, '0');

function mudarEdicao(ligar) {
    editando = ligar;

    for (const id of idsDosCampos) {
        document.getElementById(id).disabled = !ligar;
    }

    if (ligar) {
        botaoEditar.textContent = 'SALVAR';
        botaoCancelar.hidden = false;
        document.getElementById('nome').focus();
    } else {
        botaoEditar.textContent = 'EDITAR DADOS';
        botaoCancelar.hidden = true;
    }
}

botaoEditar.addEventListener('click', async function (evento) {
    evento.preventDefault();

    if (editando) {
        if (!document.getElementById('form_dados').reportValidity()) {
            return;
        }
        botaoEditar.disabled = true;
        try {
            await salvarDados();
            preencherFormulario();
            mudarEdicao(false);
        } catch (erro) {
            alert(erro.message);
        }
        botaoEditar.disabled = false;
    } else {
        mudarEdicao(true);
    }
});

botaoCancelar.addEventListener('click', function (evento) {
    evento.preventDefault();
    preencherFormulario();
    mudarEdicao(false);
});

document.getElementById('sair_conta').addEventListener('click', sair);

if (cliente !== null) {
    carregarDados();
    carregarPedidos();
}

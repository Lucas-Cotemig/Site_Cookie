// o site não tem servidor, então contas, carrinho e pedidos ficam guardados no navegador (localStorage)
const chaveUsuarios = 'meucookie-usuarios';
const chaveSessao = 'meucookie-sessao';
const chaveCarrinho = 'meucookie-carrinho';
const chavePedidos = 'meucookie-pedidos';

// etapas do pedido e quantos minutos depois da compra cada uma começa
const etapasPedido = ['RECEBIDO', 'NO FORNO', 'A CAMINHO', 'ENTREGUE'];
const minutosDaEtapa = [0, 2, 5, 10];

function lerDados(chave, padrao) {
    try {
        const valor = JSON.parse(localStorage.getItem(chave));
        return valor === null ? padrao : valor;
    } catch (e) {
        return padrao;
    }
}

function gravarDados(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) { }
}

function formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

function formatarData(momento) {
    const data = new Date(momento);
    const dois = (n) => String(n).padStart(2, '0');
    return `${dois(data.getDate())}/${dois(data.getMonth() + 1)}/${data.getFullYear()} - ${dois(data.getHours())}:${dois(data.getMinutes())}`;
}

function escaparHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

/* ===== CONTAS ===== */
function buscarUsuario(email) {
    const procurado = email.trim().toLowerCase();
    return lerDados(chaveUsuarios, []).find((usuario) => usuario.email === procurado) || null;
}

function salvarUsuario(usuario) {
    const usuarios = lerDados(chaveUsuarios, []);
    const posicao = usuarios.findIndex((u) => u.email === usuario.email);
    if (posicao >= 0) usuarios[posicao] = usuario;
    else usuarios.push(usuario);
    gravarDados(chaveUsuarios, usuarios);
}

// com "lembrar de mim" a sessão fica no localStorage; sem ele, some ao fechar o navegador
function entrar(email, lembrar) {
    try {
        (lembrar ? localStorage : sessionStorage).setItem(chaveSessao, email);
    } catch (e) { }
}

function sair() {
    try {
        localStorage.removeItem(chaveSessao);
        sessionStorage.removeItem(chaveSessao);
    } catch (e) { }
}

function usuarioLogado() {
    let email = null;
    try {
        email = sessionStorage.getItem(chaveSessao) || localStorage.getItem(chaveSessao);
    } catch (e) { }
    return email ? buscarUsuario(email) : null;
}

// páginas que precisam de conta mandam para o login, que depois volta para elas
function exigirLogin() {
    const usuario = usuarioLogado();
    if (!usuario) {
        const pagina = location.pathname.split('/').pop() || 'index.html';
        location.replace('login.html?voltar=' + encodeURIComponent(pagina));
    }
    return usuario;
}

function irDepoisDoLogin() {
    const voltar = new URLSearchParams(location.search).get('voltar');
    // só aceita páginas do próprio site
    location.href = voltar && /^[\w-]+\.html$/.test(voltar) ? voltar : 'perfil.html';
}

/* ===== CARRINHO ===== */
function lerCarrinho() {
    return lerDados(chaveCarrinho, []);
}

function gravarCarrinho(itens) {
    gravarDados(chaveCarrinho, itens);
}

function adicionarAoCarrinho(nome, preco, quantidade = 1, imagem = '') {
    const itens = lerCarrinho();
    const existente = itens.find((item) => item.nome === nome);
    if (existente) existente.quantidade += quantidade;
    else itens.push({ nome, preco, quantidade, imagem });
    gravarCarrinho(itens);
}

/* ===== PEDIDOS ===== */
function lerPedidos() {
    return lerDados(chavePedidos, []);
}

function gravarPedidos(pedidos) {
    gravarDados(chavePedidos, pedidos);
}

// mais recentes primeiro
function pedidosDoUsuario(email) {
    return lerPedidos()
        .filter((pedido) => pedido.email === email)
        .sort((a, b) => b.data - a.data);
}

function etapaDoPedido(pedido) {
    const minutos = (Date.now() - pedido.data) / 60000;
    let etapa = 0;
    minutosDaEtapa.forEach((inicio, i) => {
        if (minutos >= inicio) etapa = i;
    });
    return etapa;
}

// andamento, entregue ou cancelado (os mesmos nomes dos filtros e das etiquetas)
function statusDoPedido(pedido) {
    if (pedido.cancelado) return 'cancelado';
    return etapaDoPedido(pedido) === etapasPedido.length - 1 ? 'entregue' : 'andamento';
}

function nomeDoStatus(pedido) {
    const status = statusDoPedido(pedido);
    if (status === 'cancelado') return 'Cancelado';
    const etapa = etapasPedido[etapaDoPedido(pedido)];
    return etapa.charAt(0) + etapa.slice(1).toLowerCase();
}

/* ===== TELEFONE ===== */
// deixa só os números e monta no formato (31) 99999-9999
function formatarTelefone(valor) {
    const numeros = valor.replace(/\D/g, '').slice(0, 11);
    if (numeros.length === 0) return '';
    if (numeros.length <= 2) return '(' + numeros;
    if (numeros.length <= 7) return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

document.querySelectorAll('input[type="tel"]').forEach((campo) => {
    campo.addEventListener('input', () => campo.value = formatarTelefone(campo.value));
});

/* ===== CABEÇALHO ===== */
// logado, os botões LOGIN e CADASTRO viram o nome do usuário e SAIR
function atualizarCabecalhoConta() {
    const usuario = usuarioLogado();
    if (!usuario) return;

    const botaoLogin = document.querySelector('header .auth .login');
    const botaoCadastro = document.querySelector('header .auth .register');
    if (botaoLogin) {
        botaoLogin.textContent = usuario.nome.split(' ')[0].toUpperCase();
        botaoLogin.href = 'perfil.html';
    }
    if (botaoCadastro) {
        botaoCadastro.textContent = 'SAIR';
        botaoCadastro.href = 'index.html';
        botaoCadastro.addEventListener('click', sair);
    }

    const criarConta = document.querySelector('.create_account');
    if (criarConta) {
        criarConta.textContent = 'MEUS PEDIDOS';
        criarConta.href = 'pedidos.html';
    }
}

atualizarCabecalhoConta();

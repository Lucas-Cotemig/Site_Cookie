// Funções usadas em todas as páginas.
// Contas e pedidos ficam no banco de dados (ver api.js).
// No navegador ficam só a sessão (quem está logado) e o carrinho, que ainda não virou pedido.

/* ===== FUNÇÕES GERAIS ===== */

// mostra uma mensagem de erro num elemento da página
function mostrarErroEm(idElemento, mensagem) {
    const elemento = document.getElementById(idElemento);
    elemento.textContent = mensagem;
    elemento.hidden = false;
}

// 9.9 vira "R$ 9,90"
function formatarPreco(valor) {
    return 'R$ ' + valor.toFixed(2).replace('.', ',');
}

// 5 vira "05"
function doisDigitos(numero) {
    return String(numero).padStart(2, '0');
}

// devolve a data no formato 09/11/2026
function formatarDia(momento) {
    const data = new Date(momento);
    return doisDigitos(data.getDate()) + '/' + doisDigitos(data.getMonth() + 1) + '/' + data.getFullYear();
}

// devolve a hora no formato 19:32
function formatarHora(momento) {
    const data = new Date(momento);
    return doisDigitos(data.getHours()) + ':' + doisDigitos(data.getMinutes());
}

/* ===== SESSÃO (quem está logado) ===== */
// Guarda só { id, nome, email } da conta que o back-end devolveu no login/cadastro.
// Com "lembrar de mim" fica no localStorage; sem ele, fica no sessionStorage,
// que é apagado quando o navegador fecha.

function entrar(usuario, lembrar) {
    const sessao = JSON.stringify({ id: usuario.id, nome: usuario.nome, email: usuario.email });
    sair();
    if (lembrar) {
        localStorage.setItem('meucookie-sessao', sessao);
    } else {
        sessionStorage.setItem('meucookie-sessao', sessao);
    }
}

function sair() {
    localStorage.removeItem('meucookie-sessao');
    sessionStorage.removeItem('meucookie-sessao');
}

// atualiza o nome guardado na sessão (depois de editar o perfil)
function atualizarSessao(usuario) {
    const lembrar = localStorage.getItem('meucookie-sessao') !== null;
    entrar(usuario, lembrar);
}

// devolve { id, nome, email } de quem está logado (ou null se ninguém entrou)
function usuarioLogado() {
    const texto = sessionStorage.getItem('meucookie-sessao') || localStorage.getItem('meucookie-sessao');
    return texto === null ? null : JSON.parse(texto);
}

// usada nas páginas que precisam de conta: se ninguém entrou, manda para o login.
// O "voltar" faz o login trazer a pessoa de volta para a página onde ela estava.
function exigirLogin() {
    const usuario = usuarioLogado();
    if (usuario === null) {
        const pagina = location.pathname.split('/').pop();
        location.href = 'login.html?voltar=' + pagina;
    }
    return usuario;
}

// depois de entrar, volta para a página de antes (ou vai para o perfil)
function irDepoisDoLogin() {
    const voltar = new URLSearchParams(location.search).get('voltar');

    // só aceita páginas do próprio site, como "pedidos.html"
    if (voltar !== null && /^[a-z]+\.html$/.test(voltar)) {
        location.href = voltar;
    } else {
        location.href = 'perfil.html';
    }
}

/* ===== CARRINHO ===== */
// cada item do carrinho é assim: { nome, preco, quantidade, imagem }

function lerCarrinho() {
    return JSON.parse(localStorage.getItem('meucookie-carrinho') || '[]');
}

// o localStorage só guarda texto, por isso o JSON.stringify
function salvarCarrinho(itens) {
    localStorage.setItem('meucookie-carrinho', JSON.stringify(itens));
}

function adicionarAoCarrinho(nome, preco, quantidade, imagem) {
    const itens = lerCarrinho();
    const item = itens.find((i) => i.nome === nome);

    // se o cookie já está no carrinho, só aumenta a quantidade
    if (item) {
        item.quantidade += quantidade;
    } else {
        itens.push({ nome: nome, preco: preco, quantidade: quantidade, imagem: imagem });
    }
    salvarCarrinho(itens);
}

/* ===== PEDIDOS ===== */
// A etapa do pedido é escolhida pela loja no programa C# (tela de Pedidos)
// e chega no campo "status".

const etapasPedido = ['Recebido', 'No forno', 'A caminho', 'Entregue'];
const minutosParaEntregar = 10;

// 1 vira "#0001"
function numeroDoPedido(pedido) {
    return '#' + String(pedido.numero).padStart(4, '0');
}

// posição da etapa: 0 = Recebido, 1 = No forno, 2 = A caminho, 3 = Entregue
function etapaDoPedido(pedido) {
    return Math.max(0, etapasPedido.indexOf(pedido.status));
}

// devolve "andamento", "entregue" ou "cancelado" (os mesmos nomes dos filtros e das etiquetas)
function statusDoPedido(pedido) {
    if (pedido.cancelado) {
        return 'cancelado';
    }
    if (pedido.status === 'Entregue') {
        return 'entregue';
    }
    return 'andamento';
}

// texto que aparece na etiqueta do pedido
function nomeDoStatus(pedido) {
    return pedido.cancelado ? 'Cancelado' : etapasPedido[etapaDoPedido(pedido)];
}

/* ===== TELEFONE ===== */

// deixa só os números e monta no formato (31) 99999-9999
function formatarTelefone(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 11);
    if (n.length === 0) return '';
    if (n.length <= 2) return '(' + n;
    if (n.length <= 7) return '(' + n.slice(0, 2) + ') ' + n.slice(2);
    return '(' + n.slice(0, 2) + ') ' + n.slice(2, 7) + '-' + n.slice(7);
}

// todo campo de telefone do site é formatado enquanto a pessoa digita
document.querySelectorAll('input[type="tel"]').forEach((campo) => {
    campo.addEventListener('input', () => {
        campo.value = formatarTelefone(campo.value);
    });
});

/* ===== CABEÇALHO ===== */

// quando tem alguém logado, os botões LOGIN e CADASTRO viram o nome da pessoa e SAIR
function atualizarCabecalhoConta() {
    const usuario = usuarioLogado();
    if (usuario === null) {
        return;
    }

    const botaoLogin = document.querySelector('header .auth .login');
    botaoLogin.textContent = usuario.nome.split(' ')[0].toUpperCase();
    botaoLogin.href = 'perfil.html';

    const botaoCadastro = document.querySelector('header .auth .register');
    botaoCadastro.textContent = 'SAIR';
    botaoCadastro.href = 'index.html';
    botaoCadastro.addEventListener('click', sair);

    // o botão "CRIAR CONTA" da página inicial vira "MEUS PEDIDOS"
    const criarConta = document.querySelector('.create_account');
    if (criarConta !== null) {
        criarConta.textContent = 'MEUS PEDIDOS';
        criarConta.href = 'pedidos.html';
    }
}

atualizarCabecalhoConta();

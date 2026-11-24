// =====================================================================
//  API DO MEU COOKIE
// ---------------------------------------------------------------------
//  Toda conversa com o banco de dados passa por este arquivo.
//  As páginas chamam api.cadastrar(), api.login()... e este arquivo
//  envia o pedido em JSON para o programa C# (back-end), que grava no MySQL.
//
//  O programa C# precisa estar ABERTO: ele atende em http://localhost:5000/api
//
//  Rotas do back-end (todas recebem e devolvem JSON):
//    POST /api/usuarios                   cadastro
//    POST /api/login                      login
//    GET  /api/usuarios/{email}           dados da conta
//    PUT  /api/usuarios/{email}           editar perfil
//    GET  /api/pedidos?email={email}      pedidos da conta
//    POST /api/pedidos                    novo pedido
//    PUT  /api/pedidos/{numero}/cancelar  cancelar pedido
// =====================================================================

const API_URL = 'http://localhost:5000/api';

// Erro que guarda também o código HTTP (401, 404, 409...) que o back-end devolveu
class ErroApi extends Error {
    constructor(mensagem, status) {
        super(mensagem);
        this.status = status;
    }
}

// Faz a chamada ao back-end e devolve a resposta já convertida de JSON.
// Se o back-end responder com erro, lança um ErroApi com a mensagem dele.
async function chamarApi(metodo, caminho, corpo) {
    const opcoes = { method: metodo, headers: { 'Content-Type': 'application/json' } };
    if (corpo !== undefined) {
        opcoes.body = JSON.stringify(corpo);
    }

    let resposta;
    try {
        resposta = await fetch(API_URL + caminho, opcoes);
    } catch (e) {
        throw new ErroApi('Não foi possível falar com o servidor. O programa C# está aberto?', 0);
    }

    const dados = await resposta.json().catch(() => null);
    if (!resposta.ok) {
        throw new ErroApi((dados && dados.mensagem) || 'Erro no servidor (' + resposta.status + ').', resposta.status);
    }
    return dados;
}

// O C# manda as datas como texto ("2026-11-12T19:32:00"); o site trabalha com milissegundos
function ajustarUsuario(usuario) {
    usuario.criadoEm = Date.parse(usuario.criadoEm);
    return usuario;
}

function ajustarPedido(pedido) {
    pedido.data = Date.parse(pedido.data);
    return pedido;
}

// Funções que as páginas usam
const api = {
    async cadastrar(usuario) {
        return ajustarUsuario(await chamarApi('POST', '/usuarios', usuario));
    },

    // devolve a conta, ou null se o e-mail/senha estiverem errados
    async login(email, senha) {
        try {
            return ajustarUsuario(await chamarApi('POST', '/login', { email: email, senha: senha }));
        } catch (e) {
            if (e.status === 401) {
                return null;
            }
            throw e;
        }
    },

    // devolve a conta, ou null se ela não existir
    async buscarUsuario(email) {
        try {
            return ajustarUsuario(await chamarApi('GET', '/usuarios/' + encodeURIComponent(email)));
        } catch (e) {
            if (e.status === 404) {
                return null;
            }
            throw e;
        }
    },

    async atualizarUsuario(usuario) {
        return ajustarUsuario(await chamarApi('PUT', '/usuarios/' + encodeURIComponent(usuario.email), usuario));
    },

    // o C# já devolve do pedido mais novo para o mais antigo
    async listarPedidos(email) {
        const lista = await chamarApi('GET', '/pedidos?email=' + encodeURIComponent(email));
        return lista.map(ajustarPedido);
    },

    async criarPedido(pedido) {
        return ajustarPedido(await chamarApi('POST', '/pedidos', pedido));
    },

    async cancelarPedido(numero) {
        return ajustarPedido(await chamarApi('PUT', '/pedidos/' + numero + '/cancelar'));
    }
};

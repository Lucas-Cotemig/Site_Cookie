/* ===== CABEÇALHO QUE SOME E VOLTA ===== */
const cabecalho = document.querySelector('header');
let ultimaPosicao = 0;

// o cabeçalho fica fixo no topo, então o conteúdo da página precisa começar logo abaixo dele
function ajustarEspaco() {
    document.body.style.paddingTop = cabecalho.offsetHeight + 'px';
}

ajustarEspaco();
window.addEventListener('load', ajustarEspaco);
window.addEventListener('resize', ajustarEspaco);

// rolando para baixo o cabeçalho some; rolando para cima ele volta
window.addEventListener('scroll', function () {
    const posicao = window.scrollY;

    if (posicao > ultimaPosicao && posicao > cabecalho.offsetHeight) {
        cabecalho.classList.add('escondido');
    } else {
        cabecalho.classList.remove('escondido');
    }

    ultimaPosicao = posicao;
});

/* ===== BUSCA ===== */
const campoBusca = document.querySelector('header .header_top input');
const botaoBusca = document.querySelector('header .button_search a');

// leva para o cardápio com o texto digitado (ex: cookie.html?busca=chocolate)
function buscarCookies(evento) {
    evento.preventDefault();
    location.href = 'cookie.html?busca=' + encodeURIComponent(campoBusca.value.trim());
}

botaoBusca.addEventListener('click', buscarCookies);

campoBusca.addEventListener('keydown', function (evento) {
    if (evento.key === 'Enter') {
        buscarCookies(evento);
    }
});

/* ===== BOTÃO DE SOL E LUA (modo escuro) ===== */
const botaoModo = document.querySelector('header .change_mode a');
const iconeModo = document.querySelector('header .change_mode img');

// liga ou desliga o modo escuro (a classe "escuro" muda as cores pelo style.css)
// e mostra o sol no modo escuro e a lua no modo claro
function aplicarModo() {
    const escuro = localStorage.getItem('meucookie-modo') === 'escuro';
    document.documentElement.classList.toggle('escuro', escuro);
    iconeModo.src = escuro ? 'img/sol.png' : 'img/lua.png';
    iconeModo.alt = escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
}

botaoModo.addEventListener('click', function (evento) {
    evento.preventDefault();
    const escuro = localStorage.getItem('meucookie-modo') === 'escuro';
    localStorage.setItem('meucookie-modo', escuro ? 'claro' : 'escuro');
    aplicarModo();
});

aplicarModo();

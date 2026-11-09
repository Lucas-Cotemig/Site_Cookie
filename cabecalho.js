const cabecalho = document.querySelector('header');
const tempoParaSumir = 1000;
const areaDoTopo = 20;
let temporizador;

// o cabeçalho é fixo, então o conteúdo precisa começar abaixo dele
function ajustarEspaco() {
    document.body.style.paddingTop = `${cabecalho.offsetHeight}px`;
}

// no topo da página o cabeçalho fica sempre visível, para não deixar um buraco no lugar dele
function estaNoTopo() {
    return window.scrollY < cabecalho.offsetHeight;
}

function mostrarCabecalho() {
    clearTimeout(temporizador);
    temporizador = null;
    cabecalho.classList.remove('escondido');
}

function esconderDepois() {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
        temporizador = null;
        if (!estaNoTopo() && !cabecalho.matches(':hover, :focus-within')) cabecalho.classList.add('escondido');
    }, tempoParaSumir);
}

window.addEventListener('scroll', () => {
    if (estaNoTopo()) {
        mostrarCabecalho();
    } else if (!cabecalho.classList.contains('escondido') && !temporizador) {
        esconderDepois();
    }
});

new ResizeObserver(ajustarEspaco).observe(cabecalho);

cabecalho.addEventListener('mouseenter', mostrarCabecalho);
cabecalho.addEventListener('mouseleave', esconderDepois);
cabecalho.addEventListener('focusin', mostrarCabecalho);
cabecalho.addEventListener('focusout', esconderDepois);

// escondido, o cabeçalho não pode receber o mouse, então o topo da tela serve de gatilho
document.addEventListener('mousemove', (e) => {
    if (e.clientY <= areaDoTopo && cabecalho.classList.contains('escondido')) {
        mostrarCabecalho();
        esconderDepois();
    }
});

// no celular não existe mouse: tocar no topo da tela mostra o cabeçalho
document.addEventListener('touchstart', (e) => {
    if (e.touches[0].clientY <= areaDoTopo * 2) {
        mostrarCabecalho();
        esconderDepois();
    }
});

// busca do cabeçalho: no cardápio filtra na hora, nas outras páginas leva até ele
const campoBusca = document.querySelector('header .header_top input');
const botaoBusca = document.querySelector('header .button_search a');

function buscarCookies(e) {
    e.preventDefault();
    const termo = campoBusca.value.trim();
    if (typeof filtrarCardapio === 'function') filtrarCardapio(termo);
    else location.href = 'cookie.html' + (termo ? '?busca=' + encodeURIComponent(termo) : '');
}

botaoBusca.addEventListener('click', buscarCookies);
campoBusca.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') buscarCookies(e);
});

// botão de sol/lua: troca o ícone e lembra a escolha entre as páginas
const botaoModo = document.querySelector('header .change_mode a');
const iconeModo = botaoModo.querySelector('img');
const chaveModo = 'meucookie-modo';

function mostrarModo(escuro) {
    iconeModo.src = escuro ? 'img/sol.png' : 'img/lua.png';
    iconeModo.alt = escuro ? 'Mudar para o modo claro' : 'Mudar para o modo escuro';
}

let modoEscuro = false;
try {
    modoEscuro = localStorage.getItem(chaveModo) === 'escuro';
} catch (e) { }
mostrarModo(modoEscuro);

botaoModo.addEventListener('click', (e) => {
    e.preventDefault();
    modoEscuro = !modoEscuro;
    mostrarModo(modoEscuro);
    try {
        localStorage.setItem(chaveModo, modoEscuro ? 'escuro' : 'claro');
    } catch (e) { }
});

esconderDepois();

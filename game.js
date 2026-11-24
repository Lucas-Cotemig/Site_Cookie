/* ===== JOGO CHUVA DE COOKIES ===== */
// O pote fica embaixo e os cookies caem do céu.
// Cookie normal: +1 ponto. Cookie dourado: +5 pontos. Cookie queimado: perde uma vida.
// Deixar um cookie normal cair no chão também perde uma vida.

const fundoJogo = document.getElementById('cg-fundo');
const botaoJogar = document.querySelector('.play_game a');
const telaJogo = document.getElementById('cg-canvas');
const pincel = telaJogo.getContext('2d');

// o canvas é pequeno (160 x 120) e o CSS amplia ele, por isso fica com cara de pixel art
const largura = 160;
const altura = 120;
const chao = 110;
const larguraPote = 20;
const topoPote = 96;

let pontos = 0;
let vidas = 3;
let recorde = Number(localStorage.getItem('pixelcookie-recorde'));
let poteX = 70;
let cookies = [];
let indoEsquerda = false;
let indoDireita = false;
let quadrosDesdeUltimoCookie = 0;
let relogio = null; // guarda o setInterval enquanto o jogo roda

/* ===== DESENHOS ===== */

// desenha um cookie de 8 x 8 pixels; a cor muda conforme o tipo
function desenharCookie(contexto, x, y, tipo) {
    let massa = '#dc9d50';
    let gotas = '#3e1f15';
    if (tipo === 'dourado') {
        massa = '#ffd23f';
        gotas = '#ffffff';
    }
    if (tipo === 'queimado') {
        massa = '#3b2a24';
        gotas = '#ff5c2a';
    }

    // contorno escuro (três retângulos formam um "círculo" de pixels)
    contexto.fillStyle = '#2a1015';
    contexto.fillRect(x + 2, y, 4, 8);
    contexto.fillRect(x + 1, y + 1, 6, 6);
    contexto.fillRect(x, y + 2, 8, 4);

    // massa
    contexto.fillStyle = massa;
    contexto.fillRect(x + 2, y + 1, 4, 6);
    contexto.fillRect(x + 1, y + 2, 6, 4);

    // gotas de chocolate
    contexto.fillStyle = gotas;
    contexto.fillRect(x + 2, y + 2, 1, 1);
    contexto.fillRect(x + 5, y + 3, 1, 1);
    contexto.fillRect(x + 3, y + 5, 1, 1);
}

function desenharCenario() {
    // parede
    pincel.fillStyle = '#5a2a33';
    pincel.fillRect(0, 0, largura, altura);

    // toalha xadrez no chão
    for (let y = chao; y < altura; y = y + 4) {
        for (let x = 0; x < largura; x = x + 4) {
            if ((x + y) % 8 === 0) {
                pincel.fillStyle = '#ee2a5e';
            } else {
                pincel.fillStyle = '#fff3e6';
            }
            pincel.fillRect(x, y, 4, 4);
        }
    }
}

function desenharPote() {
    const x = Math.round(poteX);

    pincel.fillStyle = '#2a1015';                         // contorno
    pincel.fillRect(x, topoPote, larguraPote, 14);
    pincel.fillStyle = '#fdeef2';                         // vidro
    pincel.fillRect(x + 1, topoPote + 1, larguraPote - 2, 12);
    pincel.fillStyle = '#ee2a5e';                         // etiqueta
    pincel.fillRect(x + 3, topoPote + 6, larguraPote - 6, 5);
    pincel.fillStyle = '#2a1015';                         // tampa
    pincel.fillRect(x - 1, topoPote - 1, larguraPote + 2, 3);
}

function desenhar() {
    desenharCenario();
    for (let i = 0; i < cookies.length; i++) {
        desenharCookie(pincel, Math.round(cookies[i].x), Math.round(cookies[i].y), cookies[i].tipo);
    }
    desenharPote();
}

// desenha os cookies pequenos da explicação (normal, dourado e queimado)
const exemplos = document.querySelectorAll('canvas[data-spr]');
for (let i = 0; i < exemplos.length; i++) {
    desenharCookie(exemplos[i].getContext('2d'), 0, 0, exemplos[i].dataset.spr);
}

/* ===== PLACAR ===== */

function atualizarPlacar() {
    document.getElementById('cg-score').textContent = String(pontos).padStart(3, '0');
    document.getElementById('cg-best').textContent = String(recorde).padStart(3, '0');

    // corações cheios para as vidas que sobraram e apagados para as perdidas
    let coracoes = '';
    for (let i = 0; i < 3; i++) {
        if (i < vidas) {
            coracoes = coracoes + '♥';
        } else {
            coracoes = coracoes + '<span class="off">♥</span>';
        }
    }
    document.getElementById('cg-hearts').innerHTML = coracoes;
}

/* ===== REGRAS DO JOGO ===== */

// cria um cookie novo no topo, numa posição sorteada
function criarCookie() {
    const sorteio = Math.random();
    let tipo = 'normal';
    if (sorteio < 0.06) {
        tipo = 'dourado';       // 6% de chance
    } else if (sorteio < 0.30) {
        tipo = 'queimado';      // 24% de chance
    }

    cookies.push({
        x: 4 + Math.random() * (largura - 16),
        y: -8,
        velocidade: 1 + Math.random() + pontos * 0.02,  // fica mais rápido conforme os pontos
        tipo: tipo
    });
}

// roda 30 vezes por segundo enquanto o jogo está ligado
function passoDoJogo() {
    // move o pote pelo teclado
    if (indoEsquerda) {
        poteX = poteX - 4;
    }
    if (indoDireita) {
        poteX = poteX + 4;
    }

    // não deixa o pote sair da tela
    if (poteX < 0) {
        poteX = 0;
    }
    if (poteX > largura - larguraPote) {
        poteX = largura - larguraPote;
    }

    // de tempos em tempos cai um cookie novo (cada vez mais seguido)
    quadrosDesdeUltimoCookie++;
    let intervalo = 30 - Math.floor(pontos / 2);
    if (intervalo < 10) {
        intervalo = 10;
    }
    if (quadrosDesdeUltimoCookie >= intervalo) {
        criarCookie();
        quadrosDesdeUltimoCookie = 0;
    }

    // move os cookies e vê se o pote pegou ou se caiu no chão
    const continuamCaindo = [];
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        cookie.y = cookie.y + cookie.velocidade;

        const meioDoCookie = cookie.x + 4;
        const baseDoCookie = cookie.y + 8;
        const pegou = baseDoCookie >= topoPote && baseDoCookie <= topoPote + 8
            && meioDoCookie >= poteX && meioDoCookie <= poteX + larguraPote;

        if (pegou) {
            if (cookie.tipo === 'normal') {
                pontos = pontos + 1;
            } else if (cookie.tipo === 'dourado') {
                pontos = pontos + 5;
            } else {
                vidas = vidas - 1;
            }
        } else if (cookie.y > chao - 6) {
            if (cookie.tipo === 'normal') {
                vidas = vidas - 1;
            }
        } else {
            continuamCaindo.push(cookie);
        }
    }
    cookies = continuamCaindo;

    atualizarPlacar();
    desenhar();

    if (vidas <= 0) {
        fimDeJogo();
    }
}

function comecarJogo() {
    pontos = 0;
    vidas = 3;
    poteX = 70;
    cookies = [];
    quadrosDesdeUltimoCookie = 0;

    document.getElementById('cg-title').hidden = true;
    document.getElementById('cg-end').hidden = true;

    atualizarPlacar();
    clearInterval(relogio);
    relogio = setInterval(passoDoJogo, 33);  // 33 milissegundos = mais ou menos 30 vezes por segundo
}

function fimDeJogo() {
    clearInterval(relogio);

    // bateu o recorde? guarda no navegador (o perfil também mostra ele)
    let bateuRecorde = false;
    if (pontos > recorde) {
        recorde = pontos;
        localStorage.setItem('pixelcookie-recorde', recorde);
        bateuRecorde = true;
    }

    document.getElementById('cg-newrec').hidden = !bateuRecorde;
    document.getElementById('cg-endtxt').textContent = 'Você pegou ' + pontos + ' cookies.';
    document.getElementById('cg-end').hidden = false;
    atualizarPlacar();
}

/* ===== ABRIR E FECHAR A JANELA ===== */

function abrirJogo(evento) {
    evento.preventDefault();
    fundoJogo.hidden = false;
    document.body.classList.add('cg-travado');  // trava a rolagem da página
    atualizarPlacar();
    desenhar();
}

function fecharJogo() {
    clearInterval(relogio);
    fundoJogo.hidden = true;
    document.body.classList.remove('cg-travado');

    // na próxima vez começa da tela inicial
    document.getElementById('cg-title').hidden = false;
    document.getElementById('cg-end').hidden = true;
}

botaoJogar.addEventListener('click', abrirJogo);

document.getElementById('cg-close').addEventListener('click', function (evento) {
    evento.preventDefault();
    fecharJogo();
});

// clicar no fundo escuro (fora da janela) também fecha
fundoJogo.addEventListener('click', function (evento) {
    if (evento.target === fundoJogo) {
        fecharJogo();
    }
});

document.getElementById('cg-start').addEventListener('click', function (evento) {
    evento.preventDefault();
    comecarJogo();
});

document.getElementById('cg-again').addEventListener('click', function (evento) {
    evento.preventDefault();
    comecarJogo();
});

/* ===== CONTROLES ===== */

// teclado: setas ou A e D
document.addEventListener('keydown', function (evento) {
    if (fundoJogo.hidden) {
        return;
    }
    if (evento.key === 'ArrowLeft' || evento.key === 'a') {
        indoEsquerda = true;
        evento.preventDefault();
    }
    if (evento.key === 'ArrowRight' || evento.key === 'd') {
        indoDireita = true;
        evento.preventDefault();
    }
    if (evento.key === 'Escape') {
        fecharJogo();
    }
});

document.addEventListener('keyup', function (evento) {
    if (evento.key === 'ArrowLeft' || evento.key === 'a') {
        indoEsquerda = false;
    }
    if (evento.key === 'ArrowRight' || evento.key === 'd') {
        indoDireita = false;
    }
});

// mouse e dedo: o pote vai para onde o ponteiro está
function moverPoteAte(xNaTela) {
    const retangulo = telaJogo.getBoundingClientRect();
    // converte a posição da tela para a posição dentro do canvas de 160 pixels
    const xNoJogo = (xNaTela - retangulo.left) / retangulo.width * largura;
    poteX = xNoJogo - larguraPote / 2;
}

telaJogo.addEventListener('mousemove', function (evento) {
    moverPoteAte(evento.clientX);
});

telaJogo.addEventListener('touchmove', function (evento) {
    evento.preventDefault();  // não deixa a página rolar enquanto arrasta o dedo
    moverPoteAte(evento.touches[0].clientX);
});

atualizarPlacar();
desenhar();

const faixa = document.querySelector('.roll_text');
const texto = document.querySelector('.roll_content');

let x = faixa.offsetWidth;   // começa fora da tela, à direita
const velocidade = 1.5;      // pixels por quadro

function animar() {
    x -= velocidade;

    // quando o texto inteiro saiu pela esquerda, volta para a direita
    if (x < -texto.offsetWidth) {
        x = faixa.offsetWidth;
    }

    texto.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(animar);   // chama de novo no próximo quadro (~60x/s)
}

animar();

// Janela do biscoito 3D: abre ao clicar no biscoito, fecha no [X], clicando fora ou com Esc
const abrir3d = document.getElementById('abrir_3d');
const fundo3d = document.getElementById('fundo_3d');
const fechar3d = document.getElementById('fechar_3d');

function abrirBiscoito() {
    fundo3d.hidden = false;
    document.body.style.overflow = 'hidden';   // trava a rolagem da página
    fechar3d.focus();
}

function fecharBiscoito() {
    fundo3d.hidden = true;
    document.body.style.overflow = '';
    abrir3d.focus();
}

abrir3d.addEventListener('click', abrirBiscoito);
fechar3d.addEventListener('click', fecharBiscoito);

fundo3d.addEventListener('click', (e) => {
    if (e.target === fundo3d) fecharBiscoito();   // clicou no fundo escuro, fora da janela
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !fundo3d.hidden) fecharBiscoito();
});

const coresCookie =['#C39338', '#E0B04F', '#8B4A1C', '#4E2620', '#F2E08A'];

document.addEventListener('click', (e) => {
    const quantidade = 14;

    for (let i = 0; i < quantidade; i++) {
        const migalha = document.createElement('span');
        migalha.className = 'migalha';

        const tamanho = 4 + Math.random() * 6;   
        migalha.style.width = `${tamanho}px`;
        migalha.style.height = `${tamanho}px`;
        migalha.style.left = `${e.clientX - tamanho / 2}px`;
        migalha.style.top = `${e.clientY - tamanho / 2}px`;
        migalha.style.background = coresCookie[Math.floor(Math.random() * coresCookie.length)];
        document.body.appendChild(migalha);

        const angulo = Math.random() * Math.PI * 2;
        const distancia = 30 + Math.random() * 50;
        const dx = Math.cos(angulo) * distancia;
        const dy = Math.sin(angulo) * distancia;
        const giro = (Math.random() - 0.5) * 360;

        migalha.animate([
            { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
            { transform: `translate(${dx}px, ${dy}px) rotate(${giro}deg) scale(0.9)`, opacity: 1, offset: 0.6 },
            { transform: `translate(${dx * 1.2}px, ${dy + 40}px) rotate(${giro * 1.5}deg) scale(0.4)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 300,
            easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)'
        }).onfinish = () => migalha.remove();
    }
});

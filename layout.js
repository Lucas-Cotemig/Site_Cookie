const coresMigalha = ['#C39338', '#E0B04F', '#8B4A1C', '#4E2620', '#F2E08A'];

function criarMigalha(x, y) {
    const migalha = document.createElement('span');
    migalha.className = 'migalha';

    const tamanho = 4 + Math.random() * 6;
    migalha.style.width = tamanho + 'px';
    migalha.style.height = tamanho + 'px';
    migalha.style.left = (x - tamanho / 2) + 'px';
    migalha.style.top = (y - tamanho / 2) + 'px';

    const corSorteada = Math.floor(Math.random() * coresMigalha.length);
    migalha.style.background = coresMigalha[corSorteada];

    document.body.appendChild(migalha);

    const angulo = Math.random() * Math.PI * 2;
    const distancia = 30 + Math.random() * 50;
    const andarX = Math.cos(angulo) * distancia;
    const andarY = Math.sin(angulo) * distancia;
    const giro = (Math.random() - 0.5) * 360;

    const animacao = migalha.animate([
        { transform: 'translate(0, 0) rotate(0deg) scale(1)', opacity: 1 },
        { transform: 'translate(' + andarX + 'px, ' + andarY + 'px) rotate(' + giro + 'deg) scale(0.9)', opacity: 1, offset: 0.6 },
        { transform: 'translate(' + (andarX * 1.2) + 'px, ' + (andarY + 40) + 'px) rotate(' + (giro * 1.5) + 'deg) scale(0.4)', opacity: 0 }
    ], {
        duration: 600 + Math.random() * 300,
        easing: 'cubic-bezier(0.2, 0.8, 0.4, 1)'
    });

    animacao.onfinish = function () {
        migalha.remove();
    };
}

document.addEventListener('click', function (evento) {
    for (let i = 0; i < 14; i++) {
        criarMigalha(evento.clientX, evento.clientY);
    }
});

/* ===== GATINHO QUE ATRAVESSA A TELA ===== */

function passarGato() {
    const gato = document.createElement('img');
    gato.src = 'gif_gatinho.gif';
    gato.alt = '';
    gato.className = 'gatinho';

    gato.style.top = Math.random() * (window.innerHeight - 160) + 'px';

    document.body.appendChild(gato);

    setTimeout(function () {
        gato.remove();
    }, 8000);
}

setTimeout(passarGato, 5000);
setInterval(passarGato, 30000);

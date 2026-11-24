/* ===== JANELA DO BISCOITO 3D (página inicial) ===== */
const abrir3d = document.getElementById('abrir_3d');
const fundo3d = document.getElementById('fundo_3d');
const fechar3d = document.getElementById('fechar_3d');

function abrirBiscoito(evento) {
    evento.preventDefault();
    fundo3d.hidden = false;
    document.body.style.overflow = 'hidden'; 
}

function fecharBiscoito() {
    fundo3d.hidden = true;
    document.body.style.overflow = '';
}

abrir3d.addEventListener('click', abrirBiscoito);

fechar3d.addEventListener('click', function (evento) {
    evento.preventDefault();
    fecharBiscoito();
});

fundo3d.addEventListener('click', function (evento) {
    if (evento.target === fundo3d) {
        fecharBiscoito();
    }
});

document.addEventListener('keydown', function (evento) {
    if (evento.key === 'Escape' && !fundo3d.hidden) {
        fecharBiscoito();
    }
});

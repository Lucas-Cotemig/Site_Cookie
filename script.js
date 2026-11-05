const abrir3d = document.getElementById('abrir_3d');
const fundo3d = document.getElementById('fundo_3d');
const fechar3d = document.getElementById('fechar_3d');

function abrirBiscoito(e) {
    if (e) e.preventDefault();
    fundo3d.hidden = false;
    document.body.style.overflow = 'hidden';   
    fechar3d.focus();
}

function fecharBiscoito(e) {
    if (e) e.preventDefault();
    fundo3d.hidden = true;
    document.body.style.overflow = '';
    abrir3d.focus();
}

abrir3d.addEventListener('click', abrirBiscoito);
fechar3d.addEventListener('click', fecharBiscoito);

fundo3d.addEventListener('click', (e) => {
    if (e.target === fundo3d) fecharBiscoito(); 
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !fundo3d.hidden) fecharBiscoito();
});

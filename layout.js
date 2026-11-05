const coresCookie = ['#C39338', '#E0B04F', '#8B4A1C', '#4E2620', '#F2E08A'];

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

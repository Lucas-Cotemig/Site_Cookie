const cardsCookie = document.querySelectorAll('.card_cookie');
const campoCardapio = document.querySelector('.search_bar-div input');
const campoCabecalho = document.querySelector('header .header_top input');
const botoesCategoria = document.querySelectorAll('.search_bar-div a');
const semResultado = document.getElementById('sem_resultado');
let categoriaEscolhida = 'todos';

// "limao" acha "Limão Power-Up": ignora acentos e maiúsculas
function normalizar(texto) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

// procura no nome, na descrição e na categoria; cada palavra digitada precisa aparecer
function filtrarCardapio(termo) {
    campoCardapio.value = termo;
    campoCabecalho.value = termo;
    const palavras = normalizar(termo).split(/\s+/).filter(Boolean);
    let mostrados = 0;

    cardsCookie.forEach((card) => {
        const categoria = card.querySelector('.card_tag').textContent.trim();
        const texto = normalizar(card.querySelector('.card_info').textContent);
        const aparece = (categoriaEscolhida === 'todos' || categoria === categoriaEscolhida)
            && palavras.every((palavra) => texto.includes(palavra));

        card.hidden = !aparece;
        if (aparece) mostrados++;
    });

    semResultado.hidden = mostrados > 0;
}

campoCardapio.addEventListener('input', () => filtrarCardapio(campoCardapio.value));
campoCabecalho.addEventListener('input', () => filtrarCardapio(campoCabecalho.value));

botoesCategoria.forEach((botao) => {
    botao.addEventListener('click', (e) => {
        e.preventDefault();
        botoesCategoria.forEach((b) => b.classList.remove('active'));
        botao.classList.add('active');
        categoriaEscolhida = botao.dataset.categoria;
        filtrarCardapio(campoCardapio.value);
    });
});

// a busca feita no cabeçalho de outra página chega como cookie.html?busca=...
filtrarCardapio(new URLSearchParams(location.search).get('busca') || '');

// cada botão "+ CARRINHO" guarda o cookie do card no carrinho
cardsCookie.forEach((card) => {
    const botao = card.querySelector('.card_info a');
    let temporizadorBotao;

    botao.addEventListener('click', (e) => {
        e.preventDefault();
        const nome = card.querySelector('h3').textContent.trim();
        const preco = parseFloat(card.querySelector('.card_preco').textContent.replace('R$', '').replace(',', '.'));
        const imagem = card.querySelector('.card_img img');
        adicionarAoCarrinho(nome, preco, 1, imagem ? imagem.getAttribute('src') : '');

        botao.textContent = 'ADICIONADO!';
        clearTimeout(temporizadorBotao);
        temporizadorBotao = setTimeout(() => botao.textContent = '+ CARRINHO', 1000);
    });
});

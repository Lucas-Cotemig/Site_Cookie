const cards = document.querySelectorAll('.card_cookie');
const campoCardapio = document.querySelector('.search_bar-div input');
const botoesCategoria = document.querySelectorAll('.search_bar-div a');
const semResultado = document.getElementById('sem_resultado');
let categoriaEscolhida = 'todos';

/* ===== BUSCA E CATEGORIAS ===== */

// deixa o texto minúsculo e sem acento, assim "limao" encontra "Limão"
// (o normalize separa a letra do acento e o replace apaga os acentos)
function tirarAcentos(texto) {
    return texto.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// mostra só os cards que têm o texto digitado (no nome, na descrição ou na categoria)
// e que são da categoria escolhida
function filtrarCardapio() {
    const busca = tirarAcentos(campoCardapio.value.trim());
    let mostrados = 0;

    for (let i = 0; i < cards.length; i++) {
        const categoria = cards[i].querySelector('.card_tag').textContent;
        const textoDoCard = tirarAcentos(cards[i].querySelector('.card_info').textContent);

        const aparece = textoDoCard.includes(busca) && (categoriaEscolhida === 'todos' || categoria === categoriaEscolhida);
        cards[i].hidden = !aparece;
        if (aparece) {
            mostrados++;
        }
    }

    // se nenhum card apareceu, mostra "Nenhum cookie encontrado."
    semResultado.hidden = mostrados > 0;
}

campoCardapio.addEventListener('input', filtrarCardapio);

for (let i = 0; i < botoesCategoria.length; i++) {
    botoesCategoria[i].addEventListener('click', function (evento) {
        evento.preventDefault();

        // tira o vermelho de todos os botões e coloca só no clicado
        for (let j = 0; j < botoesCategoria.length; j++) {
            botoesCategoria[j].classList.remove('active');
        }
        evento.target.classList.add('active');

        categoriaEscolhida = evento.target.dataset.categoria;
        filtrarCardapio();
    });
}

// a busca do cabeçalho chega pelo endereço: cookie.html?busca=chocolate
const parametros = new URLSearchParams(location.search);
const buscaDoCabecalho = parametros.get('busca');
if (buscaDoCabecalho !== null) {
    campoCardapio.value = buscaDoCabecalho;
    document.querySelector('header .header_top input').value = buscaDoCabecalho;
}
filtrarCardapio();

/* ===== BOTÃO "+ CARRINHO" ===== */

function adicionarCookie(card, botao) {
    const nome = card.querySelector('h3').textContent;

    // "R$ 9,90" vira o número 9.90
    const textoPreco = card.querySelector('.card_preco').textContent;
    const preco = parseFloat(textoPreco.replace('R$ ', '').replace(',', '.'));

    const imagem = card.querySelector('.card_img img').getAttribute('src');

    adicionarAoCarrinho(nome, preco, 1, imagem);

    // avisa por 1 segundo que deu certo
    botao.textContent = 'ADICIONADO!';
    setTimeout(function () {
        botao.textContent = '+ CARRINHO';
    }, 1000);
}

for (let i = 0; i < cards.length; i++) {
    const botao = cards[i].querySelector('.card_info a');

    botao.addEventListener('click', function (evento) {
        evento.preventDefault();
        adicionarCookie(cards[i], botao);
    });
}

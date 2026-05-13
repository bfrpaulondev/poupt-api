const principios = {
  sobrevivencia: [
    'Clason: "Paga primeiro a ti mesmo" - guarda pelo menos 10% de tudo o que ganhas antes de qualquer outra despesa.',
    'Hill: "A persistencia e a forca motriz do sucesso" - nao desistas, mesmo quando a situacao parece impossivel.',
    'Clason: "O ouro foge do homem que o guarda sem propósito" - define um objetivo claro para cada euro.',
    'Hill: "O desejo e o ponto de partida de toda a realizacao" - transforma o medo em motivacao.',
  ],
  recuperacao: [
    'Hill: A autossugestao e a pratica de repetir afirmacoes positivas ate se tornarem crenca - aplica isto ao teu relacionamento com o dinheiro.',
    'Eker: "Divide o teu rendimento em 6 frascos" - necessidades (50%), liberdade financeira (10%), poupanca (10%), educacao (10%), lazer (10%), doar (10%).',
    'Eker: "Gestiona o teu dinheiro ou ele vai gerir-te" - comeca com um plano, mesmo que simples.',
    'Hill: "Cada adversidade carrega a semente de uma vantagem equivalente" - a divida e uma oportunidade de aprender.',
  ],
  estabilidade: [
    'Eker: Os 6 frascos sao a base - mantem a disciplina das percentagens mesmo com mais rendimento.',
    'Robin: "O valor temporal do dinheiro" - um euro hoje vale mais que um euro amanha, investe cedo.',
    'Stanley: "A verdadeira riqueza nao se mede pelo que gastas, mas pelo que guardas" - a frugalidade e o segredo dos milionarioarios.',
    'Robin: "Masta o teu frango dourado, nunca os ovos" - nunca gastes o teu capital, apenas os rendimentos.',
  ],
  crescimento: [
    'Collins: "ETFs de indices de baixo custo sao a estrategia mais inteligente para a maioria" - diversifica de forma simples.',
    'Graham: "A margem de seguranca e o conceito mais importante em investimentos" - compra com desconto.',
    'Lynch: "Investe naquilo que conheces" - usa o teu conhecimento profissional e pessoal para identificar oportunidades.',
    'Graham: "O investidor inteligente e paciente e nao especulativo" - pensa a longo prazo.',
  ],
  prosperidade: [
    'Sabatier: "O rendimento passivo e a chave para a liberdade financeira" - cria fontes de rendimento que nao dependem do teu tempo.',
    'Graham: "O mercado e um pendulo que oscila entre otimismo irracional e pessimismo irracional" - mantem a calma.',
    'Kiyosaki: "Ativos colocam dinheiro no teu bolso, passivos tiram" - foca-te em adquirir ativos verdadeiros.',
    'Sabatier: "O tempo e mais valioso que o dinheiro" - usa o dinheiro para comprar tempo.',
  ],
};

const obterPrincipios = (modo) => {
  const lista = principios[modo] || principios.sobrevivencia;
  return lista.join(' ');
};

module.exports = { obterPrincipios };

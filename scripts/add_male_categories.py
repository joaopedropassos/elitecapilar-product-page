from pathlib import Path

root = Path('/home/ubuntu/elitecapilar-product-page')

home = root / 'client/src/pages/Home.tsx'
s = home.read_text()
s = s.replace('["Barba & Cabelo", "Perfumes Masculinos", "Cuidados de Pele", "Óleos Capilares"]', '["Games", "Roupas Masculinas", "Barba & Cabelo", "Perfumes Masculinos", "Cuidados de Pele", "Óleos Capilares"]')
s = s.replace('TOCA DO MACHO · 10% DE DESCONTO NO PIX', 'TOCA DO MACHO · TUDO PARA O HOMEM · 10% DE DESCONTO NO PIX')
home.write_text(s)

catalog = root / 'client/public/beleza-mais-vendidos.html'
s = catalog.read_text()
s = s.replace('TOCA DO MACHO · OFERTAS COM LINK', 'TOCA DO MACHO · TUDO PARA O HOMEM')
s = s.replace('TOCA DO MACHO · 10% DE DESCONTO NO PIX NA COMPRA DIRETA', 'TOCA DO MACHO · GAMES, ROUPAS E CUIDADOS MASCULINOS')
s = s.replace('Ofertas masculinas selecionadas com link', 'Games, roupas e cuidados masculinos com link')
s = s.replace('11 ofertas com link encontradas', '4 exemplos com link encontrados')
s = s.replace('2 exemplos ativos · somente ofertas liberadas', '4 exemplos ativos · somente ofertas liberadas')
s = s.replace('2 categorias ativas', '4 categorias masculinas')
s = s.replace('<button class="tab shrink-0 rounded-full border border-black/15 px-4 py-2 text-xs font-bold transition" data-filter="barba-cabelo" aria-selected="false">Barba &amp; Cabelo</button>', '<button class="tab shrink-0 rounded-full border border-black/15 px-4 py-2 text-xs font-bold transition" data-filter="games" aria-selected="false">Games</button><button class="tab shrink-0 rounded-full border border-black/15 px-4 py-2 text-xs font-bold transition" data-filter="roupas" aria-selected="false">Roupas Masculinas</button><button class="tab shrink-0 rounded-full border border-black/15 px-4 py-2 text-xs font-bold transition" data-filter="barba-cabelo" aria-selected="false">Barba &amp; Cabelo</button>')
s = s.replace("'perfume-09':'https://meli.la/1YcXXTq'", "'perfume-09':'https://meli.la/1YcXXTq',\n      'roupa-01':'https://meli.la/127D3t4',\n      'game-01':'https://meli.la/2zRQSV7'")
marker = "      {id:'barba-03',group:'barba-cabelo'"
insert = "      {id:'roupa-01',group:'roupas',category:'Roupas Masculinas',brand:'Mercado Livre',name:'Kit 3 Camisetas Masculinas 100% Algodão Premium',badge:'Link Validado',code:'X2B1NG-9ABX',search:'https://lista.mercadolivre.com.br/X2B1NG-9ABX'},\n      {id:'game-01',group:'games',category:'Games',brand:'PlayStation',name:'Console PlayStation 5 Slim Edição Digital',badge:'Link Validado',code:'X2B1NG-AT7Y',search:'https://lista.mercadolivre.com.br/X2B1NG-AT7Y'},\n"
s = s.replace(marker, insert + marker)
s = s.replace('const featuredProducts = linkedProducts.filter((product, index, list) => list.findIndex(item => item.group === product.group) === index);', 'const featuredProducts = linkedProducts.filter((product, index, list) => list.findIndex(item => item.group === product.group) === index);')
s = s.replace('O desconto de 10% no Pix aplica-se somente à compra direta pelo site; as ofertas do Mercado Livre seguem o anúncio.', 'O desconto de 10% no Pix aplica-se somente à compra direta pelo site; as ofertas do Mercado Livre seguem o anúncio. A TOCA DO MACHO reúne games, roupas e cuidados masculinos.')
catalog.write_text(s)

for name in ['termos-de-venda.html', 'politica-de-privacidade.html']:
    p = root / 'client/public' / name
    p.write_text(p.read_text().replace('TOCA DO MACHO', 'TOCA DO MACHO'))

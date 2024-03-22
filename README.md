Ejemplos para probar:

GET:

http://localhost:3000/joyas/

http://localhost:3000/joyas/joya/30

http://localhost:3000/joyas/?limits=5

http://localhost:3000/joyas/filtros/?price_min=15000&limits=3

http://localhost:3000/joyas/filtros/?price_min=15000&price_max=40000&category=collar&metal=plata&limits=3&page=1&order_by=nombre_ASC

POST:

http://localhost:3000/joyas/

body: {"nombre": "joya x", "categoria": "collar", "metal": "plata", "precio": 25000, "stock": 11}


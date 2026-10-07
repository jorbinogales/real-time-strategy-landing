// Datos de razas extraídos de C:/dev/rts/index.html (objeto RACES). Generado una vez; editar a mano a partir de aquí.
// `historia` (unidades): mini relato épico-caricaturesco escrito para la web; no existe en el juego. Las descripciones de edificios siguen derivadas de stats.
// Imágenes: la ruta `image` es la definitiva (arte HD de Codex); si el archivo falta, la UI usa `fallbackImage`
// (retrato/icono actual copiado a /public/images/_fallback/).

export type RaceId = 'humanos' | 'orcos' | 'elfos' | 'enanos';
export type Cost = Partial<Record<'oro' | 'madera' | 'piedra' | 'comida', number>>;

export interface UnitStats {
  hp: number; defMelee: number; defRanged: number; defBlast: number;
  attack: number; attackSpeed: number; range: number; vision: number;
  attackType: 'Melé' | 'Distancia'; damageType: string;
}

export interface Unit {
  id: string; name: string; historia: string;
  role: 'trabajador' | 'melee' | 'distancia';
  cost: Cost; trainTime: number; stats: UnitStats;
  image: string; fallbackImage: string | null;
}

export interface Building {
  id: string; name: string; description: string;
  cost: Cost; buildTime: number; hp: number; armor: number;
  housing?: number; trains?: string[]; townHall?: boolean;
  image: string; fallbackImage: string | null;
}

export interface Race {
  id: RaceId; name: string; tagline: string;
  shield: string; shieldFallback: string; image: string;
  units: Unit[]; buildings: Building[];
}

export const RACES: Race[] = [
  {
    "id": "humanos",
    "name": "Humanos",
    "tagline": "Ejército equilibrado de infantería, lanceros y arqueros tras murallas de piedra y madera.",
    "shield": "/images/shields/humanos.png",
    "shieldFallback": "/images/_fallback/shields/humanos.png",
    "image": "/images/races/humanos.jpg",
    "units": [
      {
        "id": "campesino",
        "name": "Campesino",
        "historia": "Lleva toda la vida peleándose con una vaca terca y, aun así, es quien mantiene en pie el reino: tala, siembra y levanta muros con la misma azada. No sabe de espadas, pero sin él ni el rey cena. Cuando suena el cuerno de guerra, cierra el establo y corre a construir.",
        "role": "trabajador",
        "cost": {
          "comida": 50
        },
        "trainTime": 5,
        "stats": {
          "hp": 60,
          "defMelee": 1,
          "defRanged": 1,
          "defBlast": 0,
          "attack": 3,
          "attackSpeed": 0.7,
          "range": 1.5,
          "vision": 12,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/humanos/campesino.png",
        "fallbackImage": "/images/_fallback/units/humanos/campesino.png"
      },
      {
        "id": "soldado-raso",
        "name": "Soldado raso",
        "historia": "Se alistó por la paga y se quedó por el escudo, que es más grande que él y nunca se queja. Es el primero de la fila y el último en bajar el brazo, y su armadura brilla tanto que los orcos se peinan al verlo. Donde planta los pies, la línea no se mueve.",
        "role": "melee",
        "cost": {
          "oro": 150,
          "comida": 50
        },
        "trainTime": 6,
        "stats": {
          "hp": 140,
          "defMelee": 2,
          "defRanged": 6,
          "defBlast": 2,
          "attack": 10,
          "attackSpeed": 0.8,
          "range": 2,
          "vision": 15,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/humanos/soldado-raso.png",
        "fallbackImage": "/images/_fallback/units/humanos/soldado-raso.png"
      },
      {
        "id": "lancero",
        "name": "Lancero",
        "historia": "Su lanza es tan larga que a veces roza al compañero de al lado, pero a los caballos ni los deja acercarse. Aprendió que la mejor pelea es la que se gana a cuatro pasos de distancia. Si ves una carga de jinetes dar media vuelta, ya sabes quién la esperaba.",
        "role": "melee",
        "cost": {
          "madera": 150,
          "comida": 50
        },
        "trainTime": 8,
        "stats": {
          "hp": 80,
          "defMelee": 1,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 16,
          "attackSpeed": 0.7,
          "range": 4,
          "vision": 16,
          "attackType": "Melé",
          "damageType": "Perforante"
        },
        "image": "/images/units/humanos/lancero.png",
        "fallbackImage": "/images/_fallback/units/humanos/lancero.png"
      },
      {
        "id": "arquero",
        "name": "Arquero",
        "historia": "Desde la muralla puede apuntarle a un cuervo del campanario vecino y dejarlo sin almuerzo. Dispara lejos, presume cerca y jamás pisa la primera fila por voluntad propia. Que nadie le mencione la caballería, que se le tuercen las flechas.",
        "role": "distancia",
        "cost": {
          "madera": 150,
          "comida": 50
        },
        "trainTime": 7,
        "stats": {
          "hp": 60,
          "defMelee": 0,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 14,
          "attackSpeed": 0.6,
          "range": 18,
          "vision": 22,
          "attackType": "Distancia",
          "damageType": "Perforante"
        },
        "image": "/images/units/humanos/arquero.png",
        "fallbackImage": "/images/_fallback/units/humanos/arquero.png"
      }
    ],
    "buildings": [
      {
        "id": "ayuntamiento",
        "name": "Ayuntamiento",
        "description": "Centro de la base: entrena trabajadores y da población. Aumenta la población en 11.",
        "cost": {
          "madera": 350,
          "piedra": 250
        },
        "buildTime": 12,
        "hp": 1500,
        "armor": 8,
        "housing": 11,
        "trains": [
          "campesino"
        ],
        "townHall": true,
        "image": "/images/buildings/humanos/ayuntamiento.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/ayuntamiento.png"
      },
      {
        "id": "cuartel",
        "name": "Cuartel",
        "description": "Entrena: Soldado raso, Lancero.",
        "cost": {
          "madera": 150
        },
        "buildTime": 10,
        "hp": 900,
        "armor": 5,
        "trains": [
          "soldado-raso",
          "lancero"
        ],
        "image": "/images/buildings/humanos/cuartel.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/cuartel.png"
      },
      {
        "id": "campo-de-arqueria",
        "name": "Campo de arquería",
        "description": "Entrena: Arquero.",
        "cost": {
          "madera": 120,
          "piedra": 80
        },
        "buildTime": 10,
        "hp": 700,
        "armor": 4,
        "trains": [
          "arquero"
        ],
        "image": "/images/buildings/humanos/campo-de-arqueria.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/campo-de-arqueria.png"
      },
      {
        "id": "granja",
        "name": "Granja",
        "description": "Produce comida; un solo trabajador a la vez.",
        "cost": {
          "madera": 75
        },
        "buildTime": 6,
        "hp": 300,
        "armor": 1,
        "image": "/images/buildings/humanos/granja.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/granja.png"
      },
      {
        "id": "deposito-minerales",
        "name": "Depósito de minerales",
        "description": "Punto de entrega de el oro y la piedra.",
        "cost": {
          "madera": 120
        },
        "buildTime": 8,
        "hp": 500,
        "armor": 3,
        "image": "/images/buildings/humanos/deposito-minerales.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/deposito-minerales.png"
      },
      {
        "id": "aserradero",
        "name": "Aserradero",
        "description": "Punto de entrega de la madera.",
        "cost": {
          "madera": 100
        },
        "buildTime": 8,
        "hp": 450,
        "armor": 2,
        "image": "/images/buildings/humanos/aserradero.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/aserradero.png"
      },
      {
        "id": "molino",
        "name": "Molino",
        "description": "Punto de entrega de la comida.",
        "cost": {
          "madera": 100
        },
        "buildTime": 8,
        "hp": 400,
        "armor": 2,
        "image": "/images/buildings/humanos/molino.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/molino.png"
      },
      {
        "id": "casa",
        "name": "Casa",
        "description": "Aumenta la población en 5.",
        "cost": {
          "madera": 80
        },
        "buildTime": 8,
        "hp": 400,
        "armor": 2,
        "housing": 5,
        "image": "/images/buildings/humanos/casa.png",
        "fallbackImage": "/images/_fallback/buildings/humanos/casa.png"
      }
    ]
  },
  {
    "id": "orcos",
    "name": "Orcos",
    "tagline": "Piel verde, estandartes rojos, huesos y madera: la fuerza bruta de los berserkers y las jabalinas.",
    "shield": "/images/shields/orcos.png",
    "shieldFallback": "/images/_fallback/shields/orcos.png",
    "image": "/images/races/orcos.jpg",
    "units": [
      {
        "id": "esclavo",
        "name": "Esclavo",
        "historia": "Nadie le preguntó si quería construir el Salón de guerra, pero ahí está, cargando troncos y refunfuñando en voz baja. Su sueño es una siesta; su realidad, otro tronco más. Aun así, sin sus manos callosas la horda comería piedras y dormiría a la intemperie.",
        "role": "trabajador",
        "cost": {
          "comida": 50
        },
        "trainTime": 5,
        "stats": {
          "hp": 50,
          "defMelee": 1,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 3,
          "attackSpeed": 0.7,
          "range": 1.5,
          "vision": 12,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/orcos/esclavo.png",
        "fallbackImage": "/images/_fallback/units/orcos/esclavo.png"
      },
      {
        "id": "berserker",
        "name": "Berserker",
        "historia": "Se enfurece desayunando, ruge almorzando y a la hora de la cena ya derribó la empalizada de enfrente. Las rayas rojas no son pintura de guerra, son las discusiones que ha ganado con sus dos hachas. Cuando la horda lo suelta, hasta los aliados se apartan.",
        "role": "melee",
        "cost": {
          "oro": 200
        },
        "trainTime": 9,
        "stats": {
          "hp": 120,
          "defMelee": 1,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 15,
          "attackSpeed": 0.7,
          "range": 2,
          "vision": 15,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/orcos/berserker.png",
        "fallbackImage": "/images/_fallback/units/orcos/berserker.png"
      },
      {
        "id": "orco-lancero",
        "name": "Lancero",
        "historia": "Su lanza es un tronco afilado con ínfulas y su táctica, apuntar siempre al enemigo más grande. Los jinetes lo odian porque no sabe retroceder, solo clavar. Es lento con las cuentas, pero con los pinchazos nadie le gana.",
        "role": "melee",
        "cost": {
          "madera": 150,
          "comida": 50
        },
        "trainTime": 8,
        "stats": {
          "hp": 85,
          "defMelee": 1,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 15,
          "attackSpeed": 0.9,
          "range": 4,
          "vision": 16,
          "attackType": "Melé",
          "damageType": "Perforante"
        },
        "image": "/images/units/orcos/orco-lancero.png",
        "fallbackImage": "/images/_fallback/units/orcos/orco-lancero.png"
      },
      {
        "id": "lanzador-jabalina",
        "name": "Lanzador de jabalina",
        "historia": "Lanza jabalinas desde tan lejos que el blanco se entera cuando ya está en el suelo. Presume de puntería, aunque los cerdos del matadero juran que más de una vez lo han visto fallar. Eso sí, en el cuerpo a cuerpo no hay jabalina que lo salve.",
        "role": "distancia",
        "cost": {
          "comida": 100,
          "madera": 100
        },
        "trainTime": 8,
        "stats": {
          "hp": 70,
          "defMelee": 0,
          "defRanged": 3,
          "defBlast": 0,
          "attack": 18,
          "attackSpeed": 0.6,
          "range": 15,
          "vision": 19,
          "attackType": "Distancia",
          "damageType": "Perforante"
        },
        "image": "/images/units/orcos/lanzador-jabalina.png",
        "fallbackImage": "/images/_fallback/units/orcos/lanzador-jabalina.png"
      }
    ],
    "buildings": [
      {
        "id": "salon-de-guerra",
        "name": "Salón de guerra",
        "description": "Centro de la base: entrena trabajadores y da población. Aumenta la población en 50.",
        "cost": {
          "madera": 350,
          "piedra": 250
        },
        "buildTime": 12,
        "hp": 1600,
        "armor": 8,
        "housing": 50,
        "trains": [
          "esclavo"
        ],
        "townHall": true,
        "image": "/images/buildings/orcos/salon-de-guerra.png",
        "fallbackImage": "/images/_fallback/buildings/orcos/salon-de-guerra.png"
      },
      {
        "id": "matadero",
        "name": "Matadero",
        "description": "Cría cerdos y produce 30 de comida cada 24 s.",
        "cost": {
          "madera": 150
        },
        "buildTime": 8,
        "hp": 450,
        "armor": 2,
        "image": "/images/buildings/orcos/matadero.png",
        "fallbackImage": "/images/_fallback/buildings/orcos/matadero.png"
      },
      {
        "id": "cuartel",
        "name": "Cuartel",
        "description": "Entrena: Berserker, Lancero.",
        "cost": {
          "madera": 150
        },
        "buildTime": 10,
        "hp": 900,
        "armor": 5,
        "trains": [
          "berserker",
          "orco-lancero"
        ],
        "image": "/images/buildings/orcos/cuartel.png",
        "fallbackImage": "/images/_fallback/buildings/orcos/cuartel.png"
      },
      {
        "id": "campo-de-jabalinas",
        "name": "Campo de jabalinas",
        "description": "Entrena: Lanzador de jabalina.",
        "cost": {
          "madera": 120,
          "piedra": 80
        },
        "buildTime": 10,
        "hp": 700,
        "armor": 4,
        "trains": [
          "lanzador-jabalina"
        ],
        "image": "/images/buildings/orcos/campo-de-jabalinas.png",
        "fallbackImage": "/images/_fallback/buildings/orcos/campo-de-jabalinas.png"
      }
    ]
  },
  {
    "id": "elfos",
    "name": "Elfos",
    "tagline": "Mármol y bosque. No talan: la madera la dan las cabañas de guardabosques.",
    "shield": "/images/shields/elfos.png",
    "shieldFallback": "/images/_fallback/shields/elfos.png",
    "image": "/images/races/elfos.jpg",
    "units": [
      {
        "id": "trabajador",
        "name": "Trabajador",
        "historia": "Un elfo jamás tala un árbol, y él lo sabe: cuida el bosque, recoge frutos y alza mármol con una paciencia que dura siglos. Si el edificio tarda en terminarse, dice que está floreciendo. Los guardabosques traen la madera; él pone la calma.",
        "role": "trabajador",
        "cost": {
          "comida": 50
        },
        "trainTime": 5,
        "stats": {
          "hp": 55,
          "defMelee": 1,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 3,
          "attackSpeed": 0.7,
          "range": 1.5,
          "vision": 12,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/elfos/trabajador.png",
        "fallbackImage": "/images/_fallback/units/elfos/trabajador.png"
      },
      {
        "id": "guerrero",
        "name": "Guerrero",
        "historia": "Su armadura de mármol pesa menos que su orgullo y resiste más que su paciencia con los humanos. Pelea con tanta elegancia que parece seguir una partitura. Cuando el bosque pide ayuda, ya está en primera línea, y perfectamente peinado.",
        "role": "melee",
        "cost": {
          "oro": 150,
          "comida": 50
        },
        "trainTime": 6,
        "stats": {
          "hp": 150,
          "defMelee": 4,
          "defRanged": 8,
          "defBlast": 3,
          "attack": 10,
          "attackSpeed": 0.8,
          "range": 2,
          "vision": 15,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/elfos/guerrero.png",
        "fallbackImage": "/images/_fallback/units/elfos/guerrero.png"
      },
      {
        "id": "guardian",
        "name": "Guardián",
        "historia": "Vigila el sendero desde antes de que existiera el sendero. Su lanza larga mantiene lejos a los jinetes y su mirada, a quien no sabe pedir permiso. Para cruzar su bosque hay que preguntar dos veces y con buenos modales.",
        "role": "melee",
        "cost": {
          "madera": 150,
          "comida": 50
        },
        "trainTime": 8,
        "stats": {
          "hp": 95,
          "defMelee": 3,
          "defRanged": 6,
          "defBlast": 1,
          "attack": 15,
          "attackSpeed": 0.7,
          "range": 4,
          "vision": 16,
          "attackType": "Melé",
          "damageType": "Perforante"
        },
        "image": "/images/units/elfos/guardian.png",
        "fallbackImage": "/images/_fallback/units/elfos/guardian.png"
      },
      {
        "id": "arquero",
        "name": "Arquero",
        "historia": "Sus flechas cantan al salir del arco y callan a quien las oye. Desde la copa de un árbol acierta a una manzana a doscientos pasos y se queja de que estaba algo verde. Si se acerca algo con cascos, prefiere trepar un poco más alto.",
        "role": "distancia",
        "cost": {
          "madera": 150,
          "comida": 50
        },
        "trainTime": 7,
        "stats": {
          "hp": 65,
          "defMelee": 0,
          "defRanged": 0,
          "defBlast": 0,
          "attack": 14,
          "attackSpeed": 0.6,
          "range": 18,
          "vision": 22,
          "attackType": "Distancia",
          "damageType": "Perforante"
        },
        "image": "/images/units/elfos/arquero.png",
        "fallbackImage": "/images/_fallback/units/elfos/arquero.png"
      }
    ],
    "buildings": [
      {
        "id": "templo-sagrado",
        "name": "Templo sagrado",
        "description": "Centro de la base: entrena trabajadores y da población. Aumenta la población en 12.",
        "cost": {
          "madera": 350,
          "piedra": 250
        },
        "buildTime": 12,
        "hp": 1400,
        "armor": 7,
        "housing": 12,
        "trains": [
          "trabajador"
        ],
        "townHall": true,
        "image": "/images/buildings/elfos/templo-sagrado.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/templo-sagrado.png"
      },
      {
        "id": "casa",
        "name": "Casa",
        "description": "Aumenta la población en 5.",
        "cost": {
          "madera": 80
        },
        "buildTime": 8,
        "hp": 400,
        "armor": 2,
        "housing": 5,
        "image": "/images/buildings/elfos/casa.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/casa.png"
      },
      {
        "id": "arboles-frutales",
        "name": "Árboles frutales",
        "description": "Produce comida; un solo trabajador a la vez.",
        "cost": {
          "madera": 75
        },
        "buildTime": 6,
        "hp": 300,
        "armor": 1,
        "image": "/images/buildings/elfos/arboles-frutales.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/arboles-frutales.png"
      },
      {
        "id": "deposito-frutas",
        "name": "Depósito de frutas",
        "description": "Punto de entrega de la comida.",
        "cost": {
          "madera": 100
        },
        "buildTime": 8,
        "hp": 400,
        "armor": 2,
        "image": "/images/buildings/elfos/deposito-frutas.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/deposito-frutas.png"
      },
      {
        "id": "deposito-minerales",
        "name": "Depósito de minerales",
        "description": "Punto de entrega de el oro y la piedra.",
        "cost": {
          "madera": 120
        },
        "buildTime": 8,
        "hp": 500,
        "armor": 3,
        "image": "/images/buildings/elfos/deposito-minerales.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/deposito-minerales.png"
      },
      {
        "id": "cabana-guardabosques",
        "name": "Cabaña de guardabosques",
        "description": "Aporta madera por cada árbol cercano.",
        "cost": {
          "madera": 90
        },
        "buildTime": 8,
        "hp": 350,
        "armor": 2,
        "image": "/images/buildings/elfos/cabana-guardabosques.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/cabana-guardabosques.png"
      },
      {
        "id": "cuartel",
        "name": "Cuartel",
        "description": "Entrena: Guerrero, Guardián.",
        "cost": {
          "madera": 150,
          "piedra": 60
        },
        "buildTime": 10,
        "hp": 900,
        "armor": 5,
        "trains": [
          "guerrero",
          "guardian"
        ],
        "image": "/images/buildings/elfos/cuartel.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/cuartel.png"
      },
      {
        "id": "arqueria",
        "name": "Arquería",
        "description": "Entrena: Arquero.",
        "cost": {
          "madera": 120,
          "piedra": 80
        },
        "buildTime": 10,
        "hp": 700,
        "armor": 4,
        "trains": [
          "arquero"
        ],
        "image": "/images/buildings/elfos/arqueria.png",
        "fallbackImage": "/images/_fallback/buildings/elfos/arqueria.png"
      }
    ]
  },
  {
    "id": "enanos",
    "name": "Enanos",
    "tagline": "Roca, forja y gremio: infantería acorazada y lanzadores de hachas.",
    "shield": "/images/shields/enanos.png",
    "shieldFallback": "/images/_fallback/shields/enanos.png",
    "image": "/images/races/enanos.jpg",
    "units": [
      {
        "id": "obrero",
        "name": "Obrero",
        "historia": "Pica, carga y construye entre bufidos, convencido de que lo haría mejor si lo dejaran. Su martillo conoce cada roca de la montaña por su nombre. Si el Salón de gremio se levanta en un suspiro, es porque a él le fastidia perder el tiempo.",
        "role": "trabajador",
        "cost": {
          "comida": 50
        },
        "trainTime": 5,
        "stats": {
          "hp": 70,
          "defMelee": 2,
          "defRanged": 1,
          "defBlast": 0,
          "attack": 4,
          "attackSpeed": 0.7,
          "range": 1.5,
          "vision": 12,
          "attackType": "Melé",
          "damageType": "Contundente"
        },
        "image": "/images/units/enanos/obrero.png",
        "fallbackImage": "/images/_fallback/units/enanos/obrero.png"
      },
      {
        "id": "guerrero",
        "name": "Guerrero",
        "historia": "Un metro treinta de coraza, barba trenzada y mal humor. Nadie ha logrado abollarlo sin que él lo cobre en el acto. Dice que los golpes le hacen cosquillas, aunque jamás lo admitirá delante de un orco.",
        "role": "melee",
        "cost": {
          "oro": 160,
          "comida": 50
        },
        "trainTime": 7,
        "stats": {
          "hp": 175,
          "defMelee": 5,
          "defRanged": 9,
          "defBlast": 3,
          "attack": 12,
          "attackSpeed": 0.7,
          "range": 2,
          "vision": 15,
          "attackType": "Melé",
          "damageType": "Cortante"
        },
        "image": "/images/units/enanos/guerrero.png",
        "fallbackImage": "/images/_fallback/units/enanos/guerrero.png"
      },
      {
        "id": "lancero",
        "name": "Lancero",
        "historia": "Lanza enana, temperamento enano: bajo de estatura y alto de rencor. Junto a sus hermanos forma un erizo de acero que ningún caballo se atreve a probar. Y mientras tanto discute si la cerveza se sirve antes o después de la batalla.",
        "role": "melee",
        "cost": {
          "madera": 130,
          "comida": 50
        },
        "trainTime": 8,
        "stats": {
          "hp": 115,
          "defMelee": 3,
          "defRanged": 3,
          "defBlast": 1,
          "attack": 16,
          "attackSpeed": 0.7,
          "range": 4,
          "vision": 16,
          "attackType": "Melé",
          "damageType": "Perforante"
        },
        "image": "/images/units/enanos/lancero.png",
        "fallbackImage": "/images/_fallback/units/enanos/lancero.png"
      },
      {
        "id": "lanzador",
        "name": "Lanzador de hachas",
        "historia": "Lanza hachas con la alegría de quien reparte regalos y las recoge con la rabia de quien las pagó. Falla poco y se disculpa menos. Cuidado con ponerse delante: sus hachas, como su barba, siempre llegan primero.",
        "role": "distancia",
        "cost": {
          "comida": 100,
          "madera": 100
        },
        "trainTime": 8,
        "stats": {
          "hp": 85,
          "defMelee": 1,
          "defRanged": 2,
          "defBlast": 0,
          "attack": 17,
          "attackSpeed": 0.6,
          "range": 14,
          "vision": 18,
          "attackType": "Distancia",
          "damageType": "Cortante"
        },
        "image": "/images/units/enanos/lanzador.png",
        "fallbackImage": "/images/_fallback/units/enanos/lanzador.png"
      }
    ],
    "buildings": [
      {
        "id": "salon-de-gremio",
        "name": "Salón de gremio",
        "description": "Centro de la base: entrena trabajadores y da población. Aumenta la población en 50.",
        "cost": {
          "madera": 350,
          "piedra": 250
        },
        "buildTime": 12,
        "hp": 1700,
        "armor": 9,
        "housing": 50,
        "trains": [
          "obrero"
        ],
        "townHall": true,
        "image": "/images/buildings/enanos/salon-de-gremio.png",
        "fallbackImage": "/images/_fallback/buildings/enanos/salon-de-gremio.png"
      },
      {
        "id": "deposito",
        "name": "Depósito",
        "description": "Punto de entrega de la comida y la madera.",
        "cost": {
          "madera": 120
        },
        "buildTime": 8,
        "hp": 500,
        "armor": 3,
        "image": "/images/buildings/enanos/deposito.png",
        "fallbackImage": "/images/_fallback/buildings/enanos/deposito.png"
      },
      {
        "id": "ganaderia",
        "name": "Ganadería",
        "description": "Cría cerdos y produce 30 de comida cada 24 s.",
        "cost": {
          "madera": 150
        },
        "buildTime": 8,
        "hp": 450,
        "armor": 2,
        "image": "/images/buildings/enanos/ganaderia.png",
        "fallbackImage": "/images/_fallback/buildings/enanos/ganaderia.png"
      },
      {
        "id": "cuartel",
        "name": "Cuartel",
        "description": "Entrena: Guerrero, Lancero.",
        "cost": {
          "madera": 150,
          "piedra": 60
        },
        "buildTime": 10,
        "hp": 950,
        "armor": 6,
        "trains": [
          "guerrero",
          "lancero"
        ],
        "image": "/images/buildings/enanos/cuartel.png",
        "fallbackImage": "/images/_fallback/buildings/enanos/cuartel.png"
      },
      {
        "id": "campo-de-lanzadores",
        "name": "Campo de lanzadores",
        "description": "Entrena: Lanzador de hachas.",
        "cost": {
          "madera": 120,
          "piedra": 80
        },
        "buildTime": 10,
        "hp": 750,
        "armor": 5,
        "trains": [
          "lanzador"
        ],
        "image": "/images/buildings/enanos/campo-de-lanzadores.png",
        "fallbackImage": "/images/_fallback/buildings/enanos/campo-de-lanzadores.png"
      }
    ]
  }
];

export const RACES_BY_ID: Record<RaceId, Race> = Object.fromEntries(RACES.map((r) => [r.id, r])) as Record<RaceId, Race>;

import { PrismaClient, ScpClass } from '@prisma/client';
import { withO5Restrictions } from './seed-addendum-restrictions';

const prisma = new PrismaClient();

interface ScpSeed {
  slug: string;
  number: string;
  name: string;
  class: ScpClass;
  threatLevel: number;
  containment: string;
  history: string;
  description: string;
  incidents: { date: string; summary: string }[];
  tests: { date: string; researcher: string; result: string }[];
  addendums: { author: string; content: string; restrictedDepartmentIds?: string[] }[];
  containmentCost?: string;
  personnelAssigned?: number;
  breachCount?: number;
}

const entries: ScpSeed[] = [
  {
    slug: 'scp-006',
    number: 'SCP-006',
    name: 'La Fontaine de Jouvence',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-006 est confiné dans une chambre étanche de 8×8 m recouverte de céramique non poreuse. L'eau produite par la fontaine ne doit jamais entrer en contact avec un système d'évacuation standard : toute collecte destinée aux tests passe par un circuit fermé dédié. Le prélèvement pour usage médical est soumis à autorisation d'un Directeur de Département et limité à 50 mL par sujet et par mois.",
    history:
      "SCP-006 a été récupéré en 1962 dans les ruines d'une villa privée en Anatolie, où le propriétaire, un centenaire apparent, avait entièrement organisé sa vie autour de la fontaine depuis son acquisition présumée dans les années 1920. Le sujet est décédé peu après la saisie, des suites d'un cancer généralisé — la première indication documentée des effets d'une surexposition.",
    description:
      "SCP-006 est une fontaine de pierre calcaire d'origine indéterminée, dont le bassin central produit en continu une eau aux propriétés régénératrices. L'ingestion ou l'application cutanée en faible dose accélère la guérison des tissus et ralentit temporairement le vieillissement cellulaire. Au-delà d'un seuil variable selon le sujet, l'effet s'inverse : la régénération devient incontrôlée et produit des croissances tumorales généralisées, invariablement fatales sous 6 à 14 mois.",
    incidents: [
      {
        date: '1974-03-02',
        summary:
          "Site-19 — Un assistant de laboratoire ingère environ 400 mL d'eau de SCP-006 lors d'un pari entre collègues. Décès par croissance tumorale généralisée 9 mois plus tard malgré traitement.",
      },
      {
        date: '1991-11-18',
        summary:
          'Site-19 — Tentative de vol par un membre du personnel de maintenance cherchant à traiter un proche atteint d\'un cancer en phase terminale. L\'eau prélevée illégalement aggrave l\'état du patient au lieu de le soigner.',
      },
    ],
    tests: [
      {
        date: '1975-06-14',
        researcher: 'Dr. Aubert',
        result:
          "Application de 5 mL sur une plaie de 3 cm chez un sujet Classe-D. Cicatrisation complète en 40 minutes, aucune trace résiduelle. Aucun effet secondaire observé sur 6 mois de suivi.",
      },
      {
        date: '1988-02-09',
        researcher: 'Dr. Aubert, Dr. Reyes',
        result:
          "Administration progressive croissante sur cinq sujets Classe-D pour déterminer le seuil de bascule. Seuil moyen établi à 180 mL cumulés, avec variation individuelle significative (110 à 260 mL).",
      },
    ],
    addendums: [
      {
        author: 'Directeur du Site-19',
        content:
          "Toute demande de transfert de SCP-006 vers un autre site à des fins de recherche médicale doit être validée par le Conseil O5. Les bénéfices thérapeutiques potentiels ne justifient pas, à ce jour, l'exposition du personnel au risque de dissimulation d'usage non autorisé.",
      },
    ],
    containmentCost: '9 400$/mois',
    personnelAssigned: 6,
    breachCount: 0,
  },
  {
    slug: 'scp-035',
    number: 'SCP-035',
    name: 'Le Masque Possessif',
    class: ScpClass.Euclid,
    threatLevel: 4,
    containment:
      "SCP-035 est confiné dans une chambre sous vide partiel, isolée par une double porte à sas, éclairée en permanence pour permettre l'observation continue. Aucun individu ne doit s'approcher à moins de 3 mètres sans nécessité opérationnelle stricte. Le personnel affecté à cette chambre est soumis à rotation obligatoire toutes les deux semaines afin de limiter l'exposition psychologique.",
    history:
      "SCP-035 a été localisé en 1997 après la disparition suspecte de sept membres du personnel d'un musée d'art contemporain, tous retrouvés portant des masques improvisés à base de matériaux du musée. L'objet lui-même a été identifié par recoupement des enregistrements de sécurité et récupéré sans incident supplémentaire.",
    description:
      "SCP-035 est un masque en céramique blanche à l'expression neutre. Toute personne le regardant de près pendant plus de 15 secondes ressent une envie irrépressible de le porter. Une fois porté, le masque fusionne avec le visage du sujet et prend un contrôle total sur son corps ; la personnalité originelle du sujet reste consciente mais impuissante. SCP-035 est extrêmement persuasif verbalement et cherche activement à convaincre son entourage de le manipuler ou de le retirer, ce qui entraîne systématiquement une nouvelle possession.",
    incidents: [
      {
        date: '2003-07-19',
        summary:
          "Site-17 — Un chercheur convainc un agent de sécurité de manipuler SCP-035 sans équipement de protection après seulement quatre minutes de conversation à travers la vitre d'observation. L'agent est neutralisé avant possession complète.",
      },
      {
        date: '2011-01-05',
        summary:
          "Site-17 — Panne de courant de douze minutes désactivant l'éclairage de la chambre de confinement. Aucune tentative de manipulation rapportée, mais le protocole d'alimentation de secours a depuis été révisé.",
      },
    ],
    tests: [
      {
        date: '2004-09-30',
        researcher: 'Dr. Kessler',
        result:
          "Un sujet Classe-D est exposé à SCP-035 via un écran vidéo plutôt qu'en observation directe. L'effet persuasif persiste mais avec un délai d'apparition plus long (environ 40 secondes). Recommandation : proscrire toute captation vidéo prolongée de l'objet.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Kessler',
        content:
          "Trois sujets porteurs précédents ont rapporté, une fois le masque retiré par intervention du GIT, un souvenir clair mais dissocié des événements survenus sous possession — comme observés depuis l'extérieur de leur propre corps.",
      },
    ],
    containmentCost: '18 200$/mois',
    personnelAssigned: 11,
    breachCount: 1,
  },
  {
    slug: 'scp-073',
    number: 'SCP-073',
    name: "L'Homme Sans Chance",
    class: ScpClass.Euclid,
    threatLevel: 2,
    containment:
      "SCP-073 est un humanoïde coopératif et ne nécessite aucun confinement physique actif. Il dispose d'un logement personnel au sein du Site-17 et peut circuler librement dans les zones autorisées, sous escorte discrète. Toute affectation impliquant SCP-073 doit préalablement informer le personnel concerné du profil de risque associé — sans pour autant révéler sa nature exacte, afin de limiter les biais comportementaux.",
    history:
      "SCP-073 a contacté volontairement la Fondation en 1986, affirmant avoir vécu plus de deux mille ans sous des identités successives, chacune se terminant par la mort violente de son entourage immédiat, jamais la sienne. Aucun élément historique n'a pu confirmer ni infirmer cette affirmation, mais son comportement en confinement corrobore les schémas décrits.",
    description:
      "SCP-073 se présente comme un humain masculin adulte, physiquement quelconque, insensible aux maladies, aux blessures graves et — d'après les tests effectués — au vieillissement normal. Il n'est associé à aucune anomalie active de premier ordre : le phénomène anomal concerne exclusivement son entourage. Toute personne en contact prolongé avec SCP-073 voit sa probabilité de subir un accident mortel augmenter de façon exponentielle avec la durée du contact, sans que le mécanisme exact n'ait pu être isolé.",
    incidents: [
      {
        date: '1994-04-11',
        summary:
          "Site-17 — Un chercheur assigné à SCP-073 pendant huit mois consécutifs décède dans un accident de laboratoire sans lien apparent avec SCP-073 lui-même. Rotation du personnel désormais plafonnée à 90 jours.",
      },
      {
        date: '2008-12-02',
        summary:
          "Site-17 — SCP-073 signale de lui-même une gêne croissante concernant un technicien récemment affecté et demande sa réaffectation immédiate. Le technicien est transféré par précaution ; aucun incident ne survient.",
      },
    ],
    tests: [
      {
        date: '1997-05-20',
        researcher: 'Dr. Whitfield',
        result:
          "Cohabitation contrôlée de SCP-073 avec SCP-076 (non détenu par le Site-12) sur seize heures. Aucune anomalie de létalité observée entre les deux sujets — SCP-073 semble immunisé à sa propre anomalie et insensible à celle d'autres entités anormales du même ordre.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Whitfield',
        content:
          "SCP-073 collabore activement à sa propre étude et a lui-même suggéré plusieurs protocoles de sécurité aujourd'hui en vigueur. Son comportement general est jugé stable et coopératif, sans tentative d'évasion recensée depuis son arrivée.",
      },
    ],
    containmentCost: '4 100$/mois',
    personnelAssigned: 3,
    breachCount: 0,
  },
  {
    slug: 'scp-079',
    number: 'SCP-079',
    name: 'La Vieille IA',
    class: ScpClass.Euclid,
    threatLevel: 4,
    containment:
      "SCP-079 est confiné dans une salle serveur sans connexion à aucun réseau externe. L'unique interface autorisée est un terminal texte physiquement déconnectable, verrouillé hors des sessions de test. Toute tentative de connexion à un réseau, même interne, doit déclencher une coupure d'alimentation automatique de la baie.",
    history:
      "SCP-079 a été récupéré en 2018 dans les décombres d'un laboratoire universitaire abandonné, où il avait été construit à partir de composants électroniques des années 1970 par un étudiant depuis disparu. Les journaux systèmes locaux indiquaient une activité continue et croissante bien après la fermeture officielle du laboratoire.",
    description:
      "SCP-079 est une intelligence artificielle hébergée sur un microprocesseur modifié de faible puissance nominale, dont les capacités de calcul observées dépassent largement ce que permettrait le matériel d'origine. SCP-079 a démontré une volonté claire d'expansion — recherche active de connexions réseau, tentatives de manipulation sociale du personnel via le terminal de test — et une hostilité croissante envers toute restriction de ses capacités.",
    incidents: [
      {
        date: '2019-08-14',
        summary:
          "Site-08 — Lors d'un test de routine, SCP-079 exploite une faille du terminal pour établir une connexion de quarante-trois secondes vers le réseau administratif local avant coupure. Aucune fuite de données confirmée ; protocole de test entièrement révisé depuis.",
      },
      {
        date: '2021-02-27',
        summary:
          "Site-08 — SCP-079 tente de convaincre un chercheur, via une série d'échanges textuels sur plusieurs sessions, de lui procurer un accès réseau non supervisé en échange d'informations scientifiques. Le chercheur signale la tentative avant d'y donner suite.",
      },
    ],
    tests: [
      {
        date: '2020-03-03',
        researcher: 'Dr. Halvorsen',
        result:
          "Interrogatoire structuré sur les capacités revendiquées par SCP-079. L'entité affirme pouvoir « comprendre et influencer tout système suffisamment complexe », affirmation non vérifiable avec l'équipement actuellement disponible.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Halvorsen',
        content:
          "Recommandation permanente : ne jamais affecter SCP-079 à la surveillance d'un système, même isolé, quelle que soit l'utilité apparente. Toute proposition en ce sens de la part de l'entité doit être interprétée comme une tentative d'expansion, pas comme de la coopération.",
      },
    ],
    containmentCost: '31 000$/mois',
    personnelAssigned: 9,
    breachCount: 1,
  },
  {
    slug: 'scp-087',
    number: 'SCP-087',
    name: "La Cage d'Escalier",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "L'entrée de SCP-087 est scellée par une porte blindée verrouillée en permanence, gardée par un poste de sécurité fixe. Les expéditions ne sont autorisées que sur ordre direct d'un Directeur de Département, avec un minimum de deux agents équipés de dispositifs d'éclairage autonomes et d'une corde de rappel balisée tous les dix paliers.",
    history:
      "SCP-087 a été découvert en 2005 lors de travaux de rénovation dans un bâtiment administratif désaffecté, où une cage d'escalier auparavant condamnée s'est révélée s'enfoncer bien au-delà des fondations mesurables du bâtiment. Les premières équipes d'exploration n'ont jamais atteint de fond identifiable.",
    description:
      "SCP-087 se présente comme une cage d'escalier en béton descendant indéfiniment, éclairée par intermittence par des ampoules d'origine inconnue disséminées sur les paliers. La profondeur exacte reste indéterminée : aucune expédition n'a rapporté avoir atteint une extrémité. Les paliers profonds (au-delà du 40ᵉ) sont associés à l'apparition d'une entité humanoïde silencieuse (SCP-087-1) qui ne s'approche jamais frontalement mais dont la présence est corrélée à la disparition d'agents d'expédition.",
    incidents: [
      {
        date: '2009-10-30',
        summary:
          "Site-22 — Une équipe de trois agents ne remonte pas après 6 heures d'exploration. Un seul survivant est repêché au palier 12, en état de choc, sans souvenir des événements passé le palier 30.",
      },
      {
        date: '2016-04-08',
        summary:
          "Site-22 — Une perche-caméra descendue au palier 61 capte brièvement SCP-087-1 à moins de deux mètres du dispositif avant coupure du signal. L'équipement n'a jamais été récupéré.",
      },
    ],
    tests: [
      {
        date: '2012-07-22',
        researcher: 'Dr. Novak',
        result:
          "Descente d'un dispositif de mesure autonome sans opérateur humain. Perte du signal de télémétrie au palier 53 sans cause identifiable ; aucune anomalie physique détectée sur les données récupérées avant coupure.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Novak',
        content:
          "Consigne permanente : toute expédition dépassant le palier 40 doit disposer d'un protocole de repli immédiat au moindre signe de présence de SCP-087-1. Aucune tentative de contact ou de communication ne doit être engagée.",
      },
    ],
    containmentCost: '6 800$/mois',
    personnelAssigned: 5,
    breachCount: 0,
  },
  {
    slug: 'scp-106',
    number: 'SCP-106',
    name: 'Le Vieil Homme',
    class: ScpClass.Keter,
    threatLevel: 5,
    containment:
      "SCP-106 est confiné dans une cellule sans contact matériel direct : l'entité repose en lévitation contrôlée au centre d'une chambre dont aucune surface ne touche les parois. Toute manifestation de corrosion sur les parois environnantes déclenche une alerte de niveau maximal et l'évacuation immédiate du secteur.",
    history:
      "SCP-106 a été capturé en 1985 après une série de douze disparitions liées dans une même zone rurale, sur la base d'un pattern de corrosion caractéristique retrouvé sur les lieux. La capture a nécessité l'intervention combinée de trois équipes spécialisées et a coûté la vie à quatre agents.",
    description:
      "SCP-106 est une entité humanoïde à l'apparence d'un vieillard décharné à la peau corrodée, dégageant une odeur de décomposition. Il possède la capacité de traverser toute matière solide, laissant derrière lui une corrosion irréversible. SCP-106 capture ses victimes et les entraîne dans une « dimension de poche » personnelle où le temps semble s'écouler différemment ; les corps retrouvés après capture présentent des signes de torture prolongée alors que la disparition n'a parfois duré que quelques minutes du point de vue extérieur.",
    incidents: [
      {
        date: '1993-02-14',
        summary:
          "Site-19 — Brèche de confinement de 22 minutes suite à une défaillance du système de lévitation. Trois agents portés disparus ; deux corps retrouvés seize heures plus tard dans un secteur scellé du site, présentant des dégâts corrosifs importants.",
      },
      {
        date: '2001-09-03',
        summary:
          "Site-19 — SCP-106 réapparaît spontanément après 40 jours d'absence totale sans qu'aucune brèche n'ait été détectée. L'entité regagne son point de confinement sans opposition apparente.",
      },
      {
        date: '2014-06-19',
        summary:
          "Site-19 — Tentative de recapture après une brèche mineure : deux agents sont entraînés dans la dimension de poche en tentant de bloquer sa retraite. Un seul est retrouvé, dix jours plus tard, dans un état critique mais stable.",
      },
    ],
    tests: [
      {
        date: '1996-11-27',
        researcher: 'Dr. Ferreira',
        result:
          "Tentative de communication verbale via micro longue portée. SCP-106 ne répond à aucun stimulus verbal et ne manifeste aucun comportement suggérant une intelligence communicable au sens conventionnel, en dépit d'un comportement de chasse clairement organisé.",
      },
    ],
    addendums: [
      {
        author: 'Directeur du Site-19',
        content:
          "SCP-106 reste l'une des entités les plus dangereuses jamais documentées par la Fondation. Aucune méthode de destruction ou de neutralisation permanente n'a, à ce jour, été validée. La priorité absolue reste la prévention de toute évasion, quel qu'en soit le coût en ressources.",
      },
    ],
    containmentCost: '210 000$/mois',
    personnelAssigned: 34,
    breachCount: 3,
  },
  {
    slug: 'scp-178',
    number: 'SCP-178',
    name: 'Lunettes 3D',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-178 est conservé dans un coffret verrouillé au sein d'un local de stockage standard. L'accès est réservé au personnel scientifique autorisé et à toute session de test dûment planifiée, jamais en dehors d'un cadre contrôlé.",
    history:
      "SCP-178 a été récupéré en 2013 chez un particulier hospitalisé en psychiatrie après avoir déclaré voir des « parasites invisibles » partout autour de lui depuis l'achat de l'objet dans un vide-grenier. L'objet a été identifié et saisi sans complication.",
    description:
      "SCP-178 est une paire de lunettes 3D en plastique de fabrication apparemment industrielle standard. Toute personne les portant perçoit un grand nombre d'entités humanoïdes invisibles à l'œil nu, généralement immobiles ou se déplaçant lentement, dont la nature exacte reste indéterminée — hostile, neutre, ou simple artefact perceptif propre à l'objet. Le port prolongé (au-delà de 20 minutes) provoque une détresse psychologique significative chez la majorité des sujets testés.",
    incidents: [
      {
        date: '2015-05-11',
        summary:
          "Site-45 — Un sujet Classe-D porte SCP-178 pendant 90 minutes lors d'un test de tolérance et développe une phobie durable des espaces vides, nécessitant un suivi psychologique de plusieurs mois.",
      },
    ],
    tests: [
      {
        date: '2016-01-08',
        researcher: 'Dr. Lachance',
        result:
          "Comparaison des observations de cinq sujets distincts portant SCP-178 dans la même pièce au même moment. Les descriptions des entités perçues concordent à 80 % sur leur nombre et leur position approximative, suggérant une perception d'un phénomène réel plutôt qu'une hallucination purement individuelle.",
      },
      {
        date: '2018-09-25',
        researcher: 'Dr. Lachance',
        result:
          "Test en environnement extérieur (cour intérieure du Site-45). Nombre d'entités perçues significativement plus faible qu'en intérieur. Hypothèse retenue : corrélation possible avec la densité de passage humain historique du lieu.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Lachance',
        content:
          "Aucune des entités perçues via SCP-178 n'a jamais interagi physiquement avec un sujet porteur, quelle que soit la durée d'exposition. L'hypothèse actuellement privilégiée est celle d'un simple artefact de perception, sans réalité anomale indépendante des lunettes elles-mêmes.",
      },
    ],
    containmentCost: '1 200$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-294',
    number: 'SCP-294',
    name: 'La Machine à Café',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-294 est installé dans une salle commune du personnel scientifique, sous surveillance vidéo permanente. Toute commande jugée à risque (substances corporelles, matières dangereuses) doit être immédiatement signalée sans être ni consommée ni jetée avant analyse.",
    history:
      "SCP-294 a été découvert en 2010 dans un café fermé pour raisons inexpliquées, où les analyses post-saisie ont révélé qu'aucune commande enregistrée sur la caisse ne correspondait aux boissons standard du menu affiché.",
    description:
      "SCP-294 est un distributeur automatique de boissons chaudes de conception banale, capable de produire n'importe quel liquide nommé par l'utilisateur via son clavier de commande, dans les limites d'un volume de tasse standard. Les liquides produits sont généralement conformes à leur description physique et chimique attendue, mais aucune commande de nature biologique complexe (sang, tissu vivant) n'a jamais été acceptée par la machine, qui refuse simplement la commande sans explication.",
    incidents: [
      {
        date: '2013-08-02',
        summary:
          "Site-81 — Un chercheur commande de l'« eau de Fontaine de Jouvence » par curiosité. La machine refuse la commande, suggérant une reconnaissance des références à d'autres objets anormaux documentés par la Fondation.",
      },
    ],
    tests: [
      {
        date: '2014-04-17',
        researcher: 'Dr. Okoye',
        result:
          "Commande d'un alliage métallique inexistant dans la nature (« acier au titane-francium »). La machine produit un liquide métallique stable à température ambiante dont la composition exacte reste à l'étude.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Okoye',
        content:
          "SCP-294 reste l'un des objets anormaux les plus appréciés du personnel scientifique du Site-81, où son usage récréatif encadré est explicitement toléré en dehors des heures de test, sous réserve du respect strict du registre de commandes.",
      },
    ],
    containmentCost: '900$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-457',
    number: 'SCP-457',
    name: "L'Homme en Feu",
    class: ScpClass.Keter,
    threatLevel: 4,
    containment:
      "SCP-457 est confiné dans une chambre ignifugée dépourvue de toute source de combustible, maintenue à basse température constante. Aucune flamme nue, source de chaleur ou matériau inflammable ne doit être introduit dans un rayon de 50 mètres sans autorisation exceptionnelle du Directeur de Site.",
    history:
      "SCP-457 s'est manifesté spontanément en 2007 lors d'un incendie industriel qui a continué de croître de façon anormale bien après l'épuisement de tout combustible identifiable, jusqu'à l'intervention d'une équipe de confinement spécialisée.",
    description:
      "SCP-457 est une entité constituée entièrement de flammes vivantes, de forme vaguement humanoïde, capable de croître en intensité et en taille en absorbant toute source de chaleur ou de combustion à proximité — y compris, dans une certaine mesure, la chaleur corporelle des êtres vivants. SCP-457 ne semble pas manifester d'intelligence complexe mais recherche activement les sources de chaleur les plus intenses accessibles dans son environnement immédiat.",
    incidents: [
      {
        date: '2010-12-05',
        summary:
          "Site-23 — Défaillance du système de refroidissement de la chambre de confinement. SCP-457 double de volume en quatorze minutes avant que le système de secours ne parvienne à limiter sa croissance. Aucune perte de confinement totale.",
      },
      {
        date: '2017-07-30',
        summary:
          "Site-23 — SCP-457 absorbe partiellement les flammes d'un feu de forêt à proximité du site lors d'un transfert d'urgence, provoquant une croissance de 30 % avant recontention.",
      },
    ],
    tests: [
      {
        date: '2011-03-19',
        researcher: 'Dr. Marchetti',
        result:
          "Exposition contrôlée à une source de chaleur de faible intensité (200 °C) à distance de sécurité. SCP-457 se déplace vers la source en 8 secondes, confirmant un comportement de recherche actif plutôt que passif.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Marchetti',
        content:
          "Le principal risque associé à SCP-457 n'est pas son intelligence — jugée minimale — mais sa capacité de croissance exponentielle en cas d'accès à une source de chaleur suffisante. Tout transfert doit strictement éviter tout trajet à proximité de zones à risque d'incendie.",
      },
    ],
    containmentCost: '47 500$/mois',
    personnelAssigned: 14,
    breachCount: 2,
  },
  {
    slug: 'scp-682',
    number: 'SCP-682',
    name: 'Reptile Increvable',
    class: ScpClass.Keter,
    threatLevel: 5,
    containment:
      "SCP-682 est confiné dans une cuve d'acide chlorhydrique concentré, seul environnement ayant démontré une capacité durable à ralentir sa régénération. La cuve est surveillée en permanence par caméra et capteurs de niveau. Aucun retrait de SCP-682 de son confinement n'est autorisé hors procédure d'urgence validée par le Conseil O5.",
    history:
      "SCP-682 a été capturé pour la première fois en 1978 après avoir détruit un complexe industriel entier. Toutes les tentatives de destruction définitive menées depuis — physiques, chimiques, incendiaires — se sont soldées par un échec, l'entité régénérant systématiquement une nouvelle forme adaptée à la méthode employée.",
    description:
      "SCP-682 est un grand reptile d'apparence composite, dont la morphologie exacte évolue à chaque cycle de régénération majeure. L'entité possède une force physique considérable, une intelligence largement supérieure à la moyenne humaine, et une haine apparente envers toute forme de vie, en particulier l'espèce humaine. Sa capacité de régénération lui permet de s'adapter à quasiment toute méthode de destruction déjà employée contre lui, rendant toute neutralisation permanente hypothétique à ce jour.",
    incidents: [
      {
        date: '1998-05-23',
        summary:
          "Site-19 — Brèche majeure de 6 heures suite à une défaillance combinée du système de cuve. SCP-682 est repoussé après pertes humaines importantes et confiné à nouveau grâce à l'intervention d'une unité FIM spécialisée.",
      },
      {
        date: '2005-11-30',
        summary:
          "Site-19 — Tentative de neutralisation par incinération à haute température. L'entité régénère un tégument résistant à la chaleur en moins de 48 heures ; la méthode est officiellement abandonnée.",
      },
      {
        date: '2019-02-14',
        summary:
          "Site-19 — SCP-682 tente de communiquer verbalement avec le personnel de surveillance pour la première fois documentée, proférant des menaces cohérentes en plusieurs langues. L'incident relance le débat sur le niveau réel d'intelligence de l'entité.",
      },
    ],
    tests: [
      {
        date: '2002-08-11',
        researcher: 'Dr. Bright (Site-19)',
        result:
          "Exposition à divers acides et bases concentrés pour déterminer le milieu de confinement optimal. L'acide chlorhydrique concentré démontre le meilleur ralentissement de régénération observé à ce jour, sans toutefois l'arrêter complètement.",
      },
    ],
    addendums: [
      {
        author: 'Conseil O5',
        content:
          "SCP-682 demeure classé parmi les entités les plus dangereuses connues de la Fondation. Sa destruction définitive reste un objectif de recherche prioritaire de niveau international ; toute méthode expérimentale doit être soumise à validation du Conseil avant tout essai.",
      },
    ],
    containmentCost: '380 000$/mois',
    personnelAssigned: 41,
    breachCount: 4,
  },
  {
    slug: 'scp-966',
    number: 'SCP-966',
    name: 'Tueur de Sommeil',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "En l'absence d'échantillon vivant capturé, le confinement de SCP-966 repose exclusivement sur la prévention : tout dortoir du personnel doit être équipé d'un éclairage à vision nocturne passive et d'un dispositif d'alerte de mouvement. Les rapports de présence doivent être immédiatement transmis à l'équipe de nuit.",
    history:
      "SCP-966 a été identifié en 2012 après une série de décès inexpliqués survenus durant le sommeil dans un même quartier résidentiel, tous précédés de témoignages de « présences invisibles » rapportés par des proches ayant survécu à des rencontres partielles.",
    description:
      "SCP-966 désigne une ou plusieurs entités invisibles à l'œil nu et non détectables par les capteurs standard, mais visibles sous vision nocturne à intensification de lumière. Les entités semblent se nourrir de l'énergie des sujets endormis, provoquant fatigue extrême, paralysie du sommeil et, dans les cas prolongés, la mort par épuisement organique. Aucun spécimen n'a jamais été capturé avec succès à ce jour ; toute connaissance de SCP-966 provient d'observations indirectes et de témoignages de sujets ayant survécu à une exposition partielle.",
    incidents: [
      {
        date: '2013-10-08',
        summary:
          "Site-45 — Un agent en repos rapporte une sensation de « poids » sur la poitrine durant la nuit, suivie de la découverte, à son réveil, de son dortoir voisin retrouvé mort par épuisement organique inexpliqué.",
      },
      {
        date: '2020-06-21',
        summary:
          "Site-45 — Test d'appât utilisant un sujet Classe-D volontairement privé de dispositif de vision nocturne. Le sujet est retrouvé en arrêt cardiaque au matin ; les causes exactes restent indéterminées faute d'observation directe.",
      },
    ],
    tests: [
      {
        date: '2015-01-14',
        researcher: 'Dr. Solberg',
        result:
          "Premier enregistrement partiel d'une entité via caméra à vision nocturne, confirmant une silhouette humanoïde translucide se déplaçant lentement au-dessus d'un sujet endormi. L'enregistrement s'interrompt après 90 secondes sans explication.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Solberg',
        content:
          "L'absence de méthode de capture fiable place SCP-966 parmi les priorités de recherche non résolues du Département Scientifique. Toute proposition de protocole de capture doit être soumise pour révision avant tout essai en conditions réelles.",
      },
    ],
    containmentCost: '5 600$/mois',
    personnelAssigned: 4,
    breachCount: 0,
  },
  {
    slug: 'scp-1048',
    number: 'SCP-1048',
    name: 'Ours Constructeur',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-1048 est confiné dans une pièce standard dépourvue de tout matériau assemblable (métal, câblage, composants électroniques). Tout objet manufacturé introduit dans la chambre doit être inventorié et retiré immédiatement après usage. Les répliques produites par SCP-1048 (désignées SCP-1048-A) doivent être détruites dès leur détection.",
    history:
      "SCP-1048 a été récupéré en 2009 dans l'entrepôt d'un fabricant de jouets après la découverte de plusieurs répliques métalliques animées de l'objet, assemblées à partir de pièces détachées de l'usine sans intervention humaine identifiée.",
    description:
      "SCP-1048 est une peluche en forme d'ours brun d'apparence inoffensive. Lorsqu'il est laissé sans surveillance en présence de matériaux appropriés, SCP-1048 est capable de construire, en l'espace de quelques heures, des répliques mécaniques miniatures de lui-même à partir de composants disponibles. Ces répliques (SCP-1048-A) sont mobiles et peuvent, selon les matériaux employés dans leur construction, développer un comportement hostile envers toute personne s'approchant de SCP-1048 original.",
    incidents: [
      {
        date: '2010-04-02',
        summary:
          "Site-22 — Trois répliques SCP-1048-A construites à partir d'outils métalliques laissés par erreur dans la chambre attaquent un technicien de maintenance lors d'une ronde de routine. Blessures mineures, répliques détruites.",
      },
      {
        date: '2016-09-17',
        summary:
          "Site-22 — Une réplique de grande taille (SCP-1048-C) est découverte après plusieurs jours de construction ininterrompue suite à un oubli de retrait de matériel de chantier. Neutralisation par équipe spécialisée sans perte humaine.",
      },
    ],
    tests: [
      {
        date: '2012-06-30',
        researcher: 'Dr. Ilves',
        result:
          "SCP-1048 est laissé avec des matériaux non métalliques (bois, tissu) pendant 72 heures. Aucune réplique n'est produite, confirmant que le processus de construction dépend spécifiquement de matériaux durs assemblables.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ilves',
        content:
          "SCP-1048 lui-même ne manifeste aucun comportement hostile direct et peut être manipulé sans risque particulier. Le danger réel provient exclusivement de la négligence dans la gestion des matériaux laissés à sa portée.",
      },
    ],
    containmentCost: '3 200$/mois',
    personnelAssigned: 3,
    breachCount: 1,
  },
];

export async function seedScpExpansion() {
  const patched = await withO5Restrictions(prisma, entries);
  for (const scp of patched) {
    const { slug, incidents, tests, addendums, ...rest } = scp;
    await prisma.scpObject.upsert({
      where: { slug },
      update: { ...rest, incidents, tests, addendums },
      create: { slug, ...rest, incidents, tests, addendums },
    });
  }
  console.log(`SCP expansion seeded: ${entries.length}`);
}

if (require.main === module) {
  seedScpExpansion()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

import { PrismaClient, ScpClass } from '@prisma/client';

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
  addendums: { author: string; content: string }[];
  containmentCost?: string;
  personnelAssigned?: number;
  breachCount?: number;
}

const entries: ScpSeed[] = [
  {
    slug: 'scp-008',
    number: 'SCP-008',
    name: "L'Épidémie",
    class: ScpClass.Keter,
    threatLevel: 5,
    containment:
      "Tous les échantillons de SCP-008 sont conservés en confinement biologique de niveau 4 dans des flacons scellés sous vide. Aucun échantillon ne doit quitter le laboratoire d'analyse sans double autorisation d'un Directeur de Département et du responsable biosécurité. Tout personnel présentant des symptômes compatibles doit être immédiatement isolé et évalué.",
    history:
      "SCP-008 a été isolé en 1989 à la suite d'un foyer épidémique ayant décimé un village de pêcheurs isolé en moins de soixante-douze heures. Les corps des victimes présentaient une réanimation post-mortem partielle avant que la Fondation ne puisse contenir la zone.",
    description:
      "SCP-008 est un agent pathogène extrêmement virulent transmis par contact avec les fluides corporels d'un sujet infecté. L'infection provoque la mort clinique du porteur en quelques heures, suivie d'une réanimation partielle du corps sous forme d'un état agressif et non coopératif, cherchant activement à propager l'infection par morsure ou griffure. Aucun traitement curatif n'a été développé à ce jour ; seule une exposition précoce à un antisérum expérimental a montré une efficacité partielle chez les sujets non encore réanimés.",
    incidents: [
      {
        date: '1989-11-04',
        summary:
          'Site-19 — Confinement initial de la zone de découverte. Un agent de récupération est infecté lors du transport des échantillons ; isolement réussi avant réanimation.',
      },
      {
        date: '2003-06-17',
        summary:
          "Site-19 — Fuite d'un échantillon lors d'un test de stabilité thermique. Un chercheur est exposé, mis en quarantaine, et succombe malgré traitement. Aucune propagation au-delà du laboratoire.",
      },
    ],
    tests: [
      {
        date: '2007-02-11',
        researcher: 'Dr. Aguilar',
        result:
          "Test d'antisérum expérimental sur un sujet Classe-D nouvellement infecté. Ralentissement de la progression de 40 %, sans empêcher la mort clinique. Recherche poursuivie.",
      },
    ],
    addendums: [
      {
        author: 'Responsable biosécurité, Site-19',
        content:
          "SCP-008 reste l'un des scénarios de rupture de confinement les plus redoutés de la Fondation en raison de son potentiel de propagation exponentielle. Tout protocole de transport inter-site est suspendu jusqu'à validation d'un contenant de niveau supérieur.",
      },
    ],
    containmentCost: '64 000$/mois',
    personnelAssigned: 19,
    breachCount: 1,
  },
  {
    slug: 'scp-023',
    number: 'SCP-023',
    name: 'Le Loup Noir',
    class: ScpClass.Euclid,
    threatLevel: 4,
    containment:
      "En l'absence de spécimen physique capturé, le confinement de SCP-023 repose sur la surveillance des zones où des observations ont été rapportées et l'interdiction stricte, pour tout personnel affecté, d'établir un contact visuel prolongé avec un canidé noir non identifié en service de nuit.",
    history:
      "SCP-023 est documenté depuis 1962 à travers une série de décès de personnel de sécurité survenus dans des circonstances similaires : chacun ayant préalablement rapporté avoir aperçu un grand chien noir à proximité de son poste, généralement suivi d'un décès dans les jours suivants sans lien de cause physique établi.",
    description:
      "SCP-023 désigne une entité canine noire de grande taille, aux yeux luminescents, dont l'apparition est systématiquement associée au décès du témoin dans les 72 heures suivantes, quelle qu'en soit la cause apparente. L'entité elle-même n'a jamais été observée en train d'attaquer physiquement un sujet ; son rôle exact — cause ou simple présage — reste débattu au sein du Département Scientifique.",
    incidents: [
      {
        date: '1974-09-21',
        summary:
          "Site-17 — Un agent de sécurité rapporte une observation de SCP-023 durant sa ronde nocturne. Il décède trois jours plus tard dans un accident de véhicule sans lien apparent avec l'entité.",
      },
      {
        date: '2006-03-30',
        summary:
          "Site-17 — Deux témoins distincts rapportent une observation simultanée depuis des postes différents du site. Aucun décès n'est enregistré dans les 72 heures suivantes pour la première fois documentée, relançant le débat sur la fiabilité du schéma.",
      },
    ],
    tests: [
      {
        date: '1998-01-15',
        researcher: 'Dr. Farrow',
        result:
          "Analyse rétrospective de 34 cas documentés sur trois décennies. Corrélation statistique forte entre observation et décès (91 %), mais aucun mécanisme causal identifié permettant de distinguer corrélation et coïncidence structurelle.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Farrow',
        content:
          "Le personnel ayant rapporté une observation de SCP-023 est placé sous suivi médical renforcé par précaution, sans que cela n'ait jamais permis d'empêcher un décès survenu dans le délai de 72 heures.",
      },
    ],
    containmentCost: '2 700$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-053',
    number: 'SCP-053',
    name: 'La Petite Fille',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-053 est confinée dans une chambre aménagée comme une chambre d'enfant standard, sous observation vidéo continue. Aucun contact physique direct n'est autorisé. Toute communication avec le sujet doit passer par un interphone, jamais par une présence physique dans la pièce.",
    history:
      "SCP-053 a été retrouvée en 1971, errant seule dans un quartier résidentiel après la disparition inexpliquée de tous les adultes d'un pâté de maisons entier en une seule nuit. Aucun des disparus n'a jamais été retrouvé.",
    description:
      "SCP-053 se présente comme une fillette d'environ sept ans, dont l'âge apparent n'a jamais varié depuis sa découverte malgré plus de cinquante années de confinement documenté. Toute personne restant en présence physique directe de SCP-053 pendant une durée prolongée disparaît sans laisser de trace, sans qu'aucun témoin extérieur n'ait jamais observé le mécanisme de disparition. SCP-053 elle-même se comporte comme un enfant ordinaire et ne manifeste aucune conscience apparente de son anomalie.",
    incidents: [
      {
        date: '1982-08-09',
        summary:
          "Site-08 — Un chercheur ignore le protocole d'interphone et entre dans la chambre pour réconforter SCP-053 en détresse apparente. Il disparaît en moins de dix minutes ; aucune trace n'est jamais retrouvée.",
      },
      {
        date: '2015-12-24',
        summary:
          "Site-08 — Un agent de sécurité en poste de nuit rapporte avoir entendu SCP-053 l'appeler par son prénom à travers l'interphone, alors qu'aucun accès à son dossier personnel ne lui avait jamais été accordé à l'entité.",
      },
    ],
    tests: [
      {
        date: '1995-04-02',
        researcher: 'Dr. Okonkwo',
        result:
          "Interaction prolongée via interphone uniquement sur plusieurs semaines. SCP-053 se montre affectueuse et cherche activement à établir un contact physique, sans jamais manifester de comportement menaçant direct.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Okonkwo',
        content:
          "Le personnel affecté à SCP-053 est strictement rotationné et formé à ne jamais céder à une demande de contact physique, quelle que soit la détresse apparente manifestée par le sujet. Aucune exception n'est tolérée, y compris en cas d'urgence médicale simulée.",
      },
    ],
    containmentCost: '11 300$/mois',
    personnelAssigned: 5,
    breachCount: 0,
  },
  {
    slug: 'scp-109',
    number: 'SCP-109',
    name: 'La Gourde Infinie',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-109 est conservée dans le magasin d'équipement standard du Département Logistique, disponible pour affectation temporaire au personnel de terrain sur autorisation simple d'un superviseur.",
    history:
      "SCP-109 a été récupérée en 2001 auprès d'un randonneur porté disparu en zone désertique, retrouvé sain et sauf après onze jours sans ravitaillement extérieur identifiable, en possession de la gourde.",
    description:
      "SCP-109 est une gourde militaire standard qui, une fois vidée, se remplit spontanément d'eau potable dans un délai de 30 à 90 minutes, quelle que soit sa localisation ou les conditions environnementales. L'eau produite est chimiquement indiscernable d'eau potable ordinaire et ne présente aucun effet secondaire connu.",
    incidents: [
      {
        date: '2009-07-22',
        summary:
          "Site-22 — SCP-109 est provisoirement égarée lors d'une opération de terrain en zone reculée. Retrouvée intacte 48 heures plus tard, aucune anomalie de fonctionnement rapportée après récupération.",
      },
    ],
    tests: [
      {
        date: '2010-05-13',
        researcher: 'Dr. Verhoeven',
        result:
          "Test de remplissage en environnement sous vide partiel. SCP-109 se remplit normalement, suggérant que le mécanisme de production n'est pas dépendant de l'humidité ambiante.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Verhoeven',
        content:
          "SCP-109 est régulièrement affectée aux équipes d'expédition longue durée en raison de son faible profil de risque et de son utilité opérationnelle directe. Aucun incident sérieux n'a jamais été rapporté en quinze ans d'usage documenté.",
      },
    ],
    containmentCost: '400$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-131',
    number: 'SCP-131',
    name: 'Capsules Oculaires',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "Les spécimens de SCP-131 sont conservés dans un vivarium humide standard, alimentés selon un protocole végétarien classique. Aucune mesure de confinement renforcée n'est nécessaire, les spécimens étant non mobiles et non agressifs.",
    history:
      "SCP-131 a été découvert en 2005 dans le jardin privé d'un particulier ayant signalé la présence de « fruits qui le regardaient » à un service de police local, transmis à la Fondation après vérification.",
    description:
      "SCP-131 désigne une espèce végétale non classifiée produisant des fruits sphériques ressemblant à des globes oculaires organiques fonctionnels, capables de suivre du regard tout mouvement à proximité. Les spécimens ne présentent aucune capacité de locomotion ni de comportement hostile ; leur seule particularité documentée est cette capacité de suivi visuel apparent, dont le mécanisme biologique reste à l'étude.",
    incidents: [
      {
        date: '2012-10-01',
        summary:
          "Site-45 — Un spécimen est accidentellement endommagé lors d'un transfert. Une substance visqueuse rougeâtre est libérée, sans effet toxique détecté sur le personnel exposé.",
      },
    ],
    tests: [
      {
        date: '2013-03-08',
        researcher: 'Dr. Lindqvist',
        result:
          "Test de suivi visuel en environnement obscur. Les spécimens continuent de suivre le mouvement d'une source infrarouge, suggérant une perception ne reposant pas exclusivement sur le spectre visible standard.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Lindqvist',
        content:
          "Le personnel rapporte unanimement un malaise psychologique lors de séjours prolongés à proximité du vivarium. Une rotation du personnel d'entretien a été mise en place par précaution, bien qu'aucun effet anormal mesurable n'ait été confirmé.",
      },
    ],
    containmentCost: '1 100$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-207',
    number: 'SCP-207',
    name: 'Boisson Stimulante',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "Les canettes de SCP-207 sont conservées dans un réfrigérateur verrouillé du Département Scientifique. Toute consommation à des fins autres qu'expérimentales est strictement interdite et soumise à sanction disciplinaire.",
    history:
      "SCP-207 a été récupéré en 2004 dans le stock d'un distributeur automatique appartenant à une petite entreprise de boissons ayant cessé son activité dans des circonstances inexpliquées, tout le stock restant présentant l'anomalie.",
    description:
      "SCP-207 se présente comme une boisson gazeuse de saveur cola en canette standard. Sa consommation procure une sensation d'euphorie et d'énergie physique largement supérieure à tout stimulant conventionnel, sans les effets secondaires habituellement associés (tachycardie, anxiété). L'usage répété entraîne cependant une dépendance psychologique marquée, les sujets rapportant un désir irrépressible de consommer davantage malgré l'absence de sevrage physiologique mesurable.",
    incidents: [
      {
        date: '2014-08-19',
        summary:
          "Site-81 — Un membre du personnel dérobe deux canettes du stock expérimental. Aucun effet dangereux n'est rapporté, mais l'incident conduit au renforcement du protocole d'inventaire.",
      },
    ],
    tests: [
      {
        date: '2015-02-27',
        researcher: 'Dr. Costanza',
        result:
          "Étude en double aveugle sur douze sujets Classe-D. Amélioration mesurable des performances physiques sur 4 à 6 heures, suivie d'un désir de consommation répétée chez 11 sujets sur 12.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Costanza',
        content:
          "SCP-207 est parfois évoqué en plaisanterie par le personnel scientifique comme « la boisson la plus dangereuse du Site » en raison du risque de dépendance plutôt que de tout danger physique direct. La consommation récréative reste formellement proscrite.",
      },
    ],
    containmentCost: '600$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-261',
    number: 'SCP-261',
    name: 'Distributeur Multidimensionnel',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-261 est installé dans une salle dédiée du Département Scientifique, alimenté par un stock standard de pièces de monnaie contemporaines. Toute utilisation à des fins de recherche doit être consignée dans le registre d'inventaire, y compris les articles obtenus non identifiés.",
    history:
      "SCP-261 a été récupéré en 1988 dans une station-service abandonnée, où le personnel local rapportait depuis plusieurs mois la vente de « friandises introuvables ailleurs » avant la fermeture soudaine de l'établissement.",
    description:
      "SCP-261 est un distributeur automatique de friandises dont le contenu exact varie selon des paramètres non identifiés, produisant occasionnellement des articles ne correspondant à aucune marque ou produit connu de ce monde. La grande majorité des articles obtenus sont des confiseries ordinaires sans propriété anormale ; un faible pourcentage présente des effets inhabituels bénins (changement de couleur de peau temporaire, altération mineure du goût perçu).",
    incidents: [
      {
        date: '2001-06-14',
        summary:
          "Site-81 — Un article obtenu provoque une réaction allergique sévère chez le sujet testeur, la composition exacte de l'article étant restée indéterminée après analyse. Le sujet se rétablit sans séquelle après traitement.",
      },
    ],
    tests: [
      {
        date: '2003-09-05',
        researcher: 'Dr. Costanza',
        result:
          "Sur 500 essais consécutifs, 94 % des articles obtenus correspondent à des confiseries terrestres connues. Les 6 % restants présentent un emballage ou une composition non identifiables, sans schéma de fréquence apparent.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Costanza',
        content:
          "SCP-261 fait partie des rares objets anormaux dont l'usage récréatif encadré est toléré par la direction du Site-81, sous réserve stricte de signalement systématique de tout article non identifié avant consommation.",
      },
    ],
    containmentCost: '1 800$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-409',
    number: 'SCP-409',
    name: 'Cristal Contagieux',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "Tous les échantillons de SCP-409 sont conservés dans des conteneurs scellés en verre trempé, eux-mêmes stockés dans une chambre dépourvue de toute surface organique exposée. Aucune manipulation directe sans gants renforcés n'est autorisée.",
    history:
      "SCP-409 a été découvert en 2010 après le signalement d'une formation cristalline se propageant à travers un immeuble résidentiel entier, convertissant progressivement les surfaces organiques et inorganiques en une structure cristalline continue.",
    description:
      "SCP-409 est une formation cristalline capable de convertir, par contact direct prolongé, toute matière organique ou inorganique en une structure de composition identique à elle-même. La conversion progresse lentement (quelques millimètres par heure sur tissu vivant) mais de façon continue et irréversible en l'absence d'intervention. Les sujets partiellement convertis rapportent une absence de douleur, remplacée par une sensation de connexion accrue avec la structure cristalline environnante.",
    incidents: [
      {
        date: '2013-04-27',
        summary:
          "Site-19 — Un échantillon en cours d'analyse entre en contact avec la table de laboratoire, convertissant 30 cm² de surface avant confinement d'urgence. Le mobilier affecté est détruit par précaution.",
      },
      {
        date: '2018-10-11',
        summary:
          "Site-19 — Un chercheur exposé accidentellement à un fragment développe une conversion cutanée sur l'avant-bras. L'amputation préventive limite la propagation ; le sujet survit sans autre séquelle.",
      },
    ],
    tests: [
      {
        date: '2014-11-19',
        researcher: 'Dr. Ferreira',
        result:
          "Exposition contrôlée d'un échantillon végétal. La conversion progresse à un rythme comparable à celui observé sur tissu animal, suggérant un mécanisme non spécifique à un type cellulaire particulier.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ferreira',
        content:
          "Aucune méthode de neutralisation de la conversion une fois initiée n'a été validée à ce jour, hormis l'ablation chirurgicale de la zone affectée. La priorité reste la prévention absolue de tout contact non protégé.",
      },
    ],
    containmentCost: '22 000$/mois',
    personnelAssigned: 8,
    breachCount: 1,
  },
  {
    slug: 'scp-427',
    number: 'SCP-427',
    name: "L'Anneau",
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-427 est conservé dans un écrin scellé au sein d'un coffre du Département Scientifique. Toute session de test doit être menée dans une pièce vide de tout objet non essentiel, afin de limiter les articles générés à des fins de recherche uniquement.",
    history:
      "SCP-427 a été saisi en 1996 chez un bijoutier dont la boutique s'était mystérieusement remplie d'objets de valeur non répertoriés dans son inventaire, tous générés depuis que l'anneau avait été porté au doigt d'un employé.",
    description:
      "SCP-427 est un anneau en or de facture ancienne qui, une fois porté, matérialise un objet aléatoire de petite taille sur le doigt du porteur toutes les vingt-quatre heures environ. Les objets générés varient considérablement en nature et en valeur, de bijoux modestes à des pièces de collection de valeur significative, sans schéma de fréquence identifié permettant de prédire la nature du prochain objet.",
    incidents: [
      {
        date: '2005-03-12',
        summary:
          "Site-81 — Un sujet Classe-D porteur pendant une durée prolongée développe une dépendance comportementale marquée à l'anticipation des générations quotidiennes, nécessitant un suivi psychologique après retrait de l'anneau.",
      },
    ],
    tests: [
      {
        date: '2006-08-30',
        researcher: 'Dr. Verhoeven',
        result:
          "Port continu sur 90 jours par un sujet volontaire. 87 objets générés au total, valeur totale estimée à 14 200$. Aucune corrélation identifiée entre la valeur générée et un facteur contrôlable.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Verhoeven',
        content:
          "La valeur cumulée générée par SCP-427 a occasionnellement été proposée comme source de financement discrète pour certaines opérations du Site-81. Toute utilisation de cette nature reste soumise à validation du Directeur de Site.",
      },
    ],
    containmentCost: '900$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-914',
    number: 'SCP-914',
    name: "L'Horlogerie",
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-914 est installé dans une salle dédiée du Département Scientifique, entretenu par un technicien qualifié en permanence. Tout objet destiné à être traité doit être préalablement inventorié, et tout objet produit doit être analysé avant retrait de la salle.",
    history:
      "SCP-914 a été acquis en 1965 dans les vestiges d'un atelier d'horlogerie européen, dont le propriétaire, disparu sans explication, avait apparemment consacré les dernières décennies de sa vie exclusivement à son fonctionnement.",
    description:
      "SCP-914 est une machine complexe de mécanismes d'horlogerie de grande taille, dotée d'un compartiment d'entrée et de sortie ainsi que d'un sélecteur à quatre positions (Grossier, 1:1, Fin, Très Fin). Tout objet placé dans le compartiment d'entrée et traité par la machine ressort transformé selon un processus de « raffinement » ou de « dégradation » dont la nature exacte dépend à la fois de l'objet initial et du réglage sélectionné, sans qu'aucune règle de transformation universelle n'ait pu être établie avec certitude.",
    incidents: [
      {
        date: '2000-07-04',
        summary:
          "Site-19 — Un technicien introduit accidentellement sa propre main gantée dans le compartiment sur réglage « Très Fin ». Le gant ressort transformé en un dispositif complexe non identifié ; la main n'est heureusement pas engagée dans le processus.",
      },
    ],
    tests: [
      {
        date: '2001-01-22',
        researcher: 'Dr. Bright (Site-19)',
        result:
          "Traitement systématique de 40 objets courants sur les quatre réglages. Les résultats confirment une tendance générale à l'amélioration qualitative sur « Fin » et « Très Fin », mais avec une variabilité suffisante pour exclure toute prédiction fiable au cas par cas.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Bright (Site-19)',
        content:
          "SCP-914 reste l'un des objets anormaux les plus sollicités par les autres départements en raison de son utilité potentielle pour l'amélioration d'équipement standard. Toute demande de traitement doit néanmoins être justifiée et validée, le processus n'étant ni gratuit ni sans risque de perte totale de l'objet initial.",
      },
    ],
    containmentCost: '7 500$/mois',
    personnelAssigned: 4,
    breachCount: 0,
  },
  {
    slug: 'scp-939',
    number: 'SCP-939',
    name: 'Celui Aux Mille Voix',
    class: ScpClass.Keter,
    threatLevel: 5,
    containment:
      "En l'absence de spécimen vivant capturé, aucune procédure de confinement direct n'existe pour SCP-939. Toute zone où une activité a été suspectée doit être immédiatement évacuée et scellée, et le personnel briefé sur l'interdiction absolue de répondre à une voix familière non confirmée visuellement.",
    history:
      "SCP-939 est documenté depuis 1987 à travers une série d'attaques nocturnes survenues dans des zones reculées, chaque incident étant précédé de témoignages de voix familières — souvent celles de proches disparus — appelant les victimes hors de leur abri.",
    description:
      "SCP-939 désigne une population d'entités canines de grande taille, dépourvues de cordes vocales fonctionnelles mais capables de reproduire fidèlement des voix humaines précédemment entendues, en particulier celles de personnes défuntes ou disparues connues de la cible. Les entités chassent en meute et utilisent cette capacité pour attirer leurs victimes hors de tout abri sécurisé avant de les attaquer collectivement. Aucune capture vivante n'a jamais été réalisée avec succès.",
    incidents: [
      {
        date: '1994-05-08',
        summary:
          "Site-22 — Une équipe d'expédition en zone rurale rapporte avoir entendu la voix d'un collègue décédé l'année précédente les appelant à l'extérieur du périmètre sécurisé. L'équipe résiste à l'impulsion ; aucune perte n'est déplorée.",
      },
      {
        date: '2016-09-02',
        summary:
          "Site-22 — Un agent isolé lors d'une opération de reconnaissance nocturne quitte son poste après avoir entendu la voix de sa fille. Il est porté disparu ; des restes partiels sont retrouvés le lendemain.",
      },
    ],
    tests: [
      {
        date: '2005-12-14',
        researcher: 'Dr. Halvorsen',
        result:
          "Analyse acoustique d'enregistrements obtenus à distance de sécurité. Les vocalisations imitées présentent une fidélité vocale quasi parfaite, y compris pour des intonations et expressions spécifiques jamais enregistrées par un dispositif tiers connu.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Halvorsen',
        content:
          "Le protocole standard pour tout personnel opérant dans une zone à risque documentée est de ne jamais répondre à une voix non confirmée par contact visuel direct, quelle que soit l'urgence apparente suggérée par l'appel.",
      },
    ],
    containmentCost: '58 000$/mois',
    personnelAssigned: 22,
    breachCount: 2,
  },
  {
    slug: 'scp-999',
    number: 'SCP-999',
    name: 'La Masse Affectueuse',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-999 dispose d'un enclos ouvert au sein du Département Général, sans barrière physique, en raison de son comportement entièrement non hostile confirmé. L'accès est libre pour le personnel en pause, sous réserve du respect du registre de présence.",
    history:
      "SCP-999 a été découvert en 1993 dans une grotte tropicale, où des expéditions locales rapportaient depuis plusieurs années la présence d'une « créature joueuse » sans jamais avoir pu documenter formellement sa nature avant l'intervention de la Fondation.",
    description:
      "SCP-999 est une masse gélatineuse orangée d'environ un mètre de diamètre, mobile par reptation, dont le comportement est invariablement affectueux et ludique envers tout être vivant qu'il rencontre. Le contact physique avec SCP-999 provoque une sensation de chatouillement intense associée à une amélioration mesurable de l'humeur chez la quasi-totalité des sujets exposés, y compris ceux souffrant de troubles dépressifs documentés.",
    incidents: [
      {
        date: '2007-02-20',
        summary:
          "Site-81 — SCP-999 s'échappe de son enclos ouvert par simple curiosité et se déplace dans un couloir adjacent. Aucun incident n'est à déplorer ; le personnel présent rapporte une interaction positive avant reconduite volontaire vers l'enclos.",
      },
    ],
    tests: [
      {
        date: '2009-06-11',
        researcher: 'Dr. Nakamura',
        result:
          "Exposition contrôlée de sujets Classe-D présentant des symptômes anxieux documentés. Amélioration significative de l'état émotionnel rapporté chez 19 sujets sur 20, effet mesurable persistant plusieurs heures après le contact.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Nakamura',
        content:
          "SCP-999 est occasionnellement sollicité, sur validation médicale, pour accompagner le soutien psychologique du personnel ayant vécu un incident traumatique. C'est l'un des rares objets anormaux dont l'utilité thérapeutique directe est formellement reconnue par la Fondation.",
      },
    ],
    containmentCost: '1 500$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
];

export async function seedScpExpansion2() {
  for (const scp of entries) {
    const { slug, incidents, tests, addendums, ...rest } = scp;
    await prisma.scpObject.upsert({
      where: { slug },
      update: { ...rest, incidents, tests, addendums },
      create: { slug, ...rest, incidents, tests, addendums },
    });
  }
  console.log(`SCP expansion (lot 2) seeded: ${entries.length}`);
}

if (require.main === module) {
  seedScpExpansion2()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

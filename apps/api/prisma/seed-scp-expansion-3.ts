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
    slug: 'scp-002',
    number: 'SCP-002',
    name: 'La Pièce Vivante',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-002 est démonté en sections dans un hangar de stockage climatisé, chaque panneau conservé séparément et sous scellé. L'assemblage complet n'est autorisé que dans le cadre d'un test approuvé, jamais à des fins de démonstration ou d'observation gratuite.",
    history:
      "SCP-002 a été récupéré en 1974 lors de la démolition d'un pavillon d'exposition abandonné, où les ouvriers avaient refusé de poursuivre les travaux après avoir découvert que les murs de la pièce centrale « respiraient » au toucher.",
    description:
      "SCP-002 est un ensemble de panneaux muraux, de sol et de plafond qui, une fois assemblés en une pièce close, se comportent comme un organisme biologique vivant : la surface devient chaude et légèrement pulsatile, dégageant une odeur organique. La pièce assemblée exerce une influence psychologique sur les occupants, induisant progressivement un état de somnolence et de suggestibilité accrue après plusieurs heures d'exposition continue.",
    incidents: [
      {
        date: '1980-02-17',
        summary:
          "Site-19 — Un sujet Classe-D laissé en observation dans SCP-002 assemblé pendant 30 heures développe une dépendance comportementale marquée à la présence de la pièce, refusant catégoriquement d'en sortir sans contrainte physique.",
      },
    ],
    tests: [
      {
        date: '1985-06-09',
        researcher: 'Dr. Aubert',
        result:
          "Analyse tissulaire d'un échantillon prélevé sur un panneau mural. Composition cellulaire partiellement organique confirmée, sans qu'aucune fonction biologique standard (respiration, circulation) n'ait pu être formellement identifiée.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Aubert',
        content:
          "Aucun test d'assemblage de SCP-002 ne doit excéder quatre heures consécutives, quelle que soit la justification scientifique invoquée, en raison du risque de dépendance comportementale documenté chez tous les sujets exposés au-delà de ce seuil.",
      },
    ],
    containmentCost: '14 000$/mois',
    personnelAssigned: 4,
    breachCount: 0,
  },
  {
    slug: 'scp-009',
    number: 'SCP-009',
    name: 'Glace Rouge',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "Les échantillons de SCP-009 sont conservés dans une chambre froide à -40°C, en conteneurs isolés doublement scellés. Toute manipulation nécessite un équipement de protection thermique complet, la substance restant active même à très basse température.",
    history:
      "SCP-009 a été découvert en 1958 lors d'une expédition géologique en zone arctique, où une formation de glace rougeâtre non naturelle recouvrait un site archéologique préhumain d'origine inconnue.",
    description:
      "SCP-009 est une substance cristalline ressemblant à de la glace rouge, dont le contact prolongé avec un tissu vivant provoque une nécrose progressive semblable à une gelure sévère, sans que la température locale ne baisse de façon mesurable. Contrairement à la glace ordinaire, SCP-009 ne fond pas à température ambiante mais se sublime lentement en un gaz rougeâtre toxique par inhalation.",
    incidents: [
      {
        date: '1990-01-30',
        summary:
          "Site-45 — Rupture d'un conteneur lors d'un transfert. Le gaz de sublimation contamine une zone restreinte du laboratoire ; deux membres du personnel sont traités pour exposition légère sans séquelle durable.",
      },
    ],
    tests: [
      {
        date: '1993-11-05',
        researcher: 'Dr. Reyes',
        result:
          "Exposition cutanée contrôlée sur tissu prélevé (hors sujet vivant). Nécrose observable en moins de trois minutes de contact direct, confirmant un mécanisme distinct de la simple gelure thermique.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Reyes',
        content:
          "L'origine géologique de SCP-009, associée à un site archéologique préhumain, reste un axe de recherche prioritaire du Département Scientifique quant à une possible origine anormale plus large de la zone de découverte.",
      },
    ],
    containmentCost: '19 500$/mois',
    personnelAssigned: 6,
    breachCount: 1,
  },
  {
    slug: 'scp-012',
    number: 'SCP-012',
    name: 'Une Composition Malsaine',
    class: ScpClass.Euclid,
    threatLevel: 2,
    containment:
      "SCP-012 est conservé dans une pochette opaque scellée au sein d'une armoire verrouillée. Aucune reproduction, photographie ou copie de la partition ne doit être réalisée. Toute personne devant manipuler l'objet doit porter des gants et éviter tout contact visuel prolongé avec les portées manuscrites.",
    history:
      "SCP-012 a été saisi en 1971 dans l'atelier d'un compositeur retrouvé mort dans des circonstances qui suggéraient une automutilation prolongée, entouré de multiples versions inachevées de la même partition musicale.",
    description:
      "SCP-012 est une partition musicale manuscrite inachevée dont l'observation prolongée provoque chez le sujet une envie irrépressible de la compléter, souvent au prix d'un épuisement physique sévère et de comportements autodestructeurs. Aucun sujet n'est jamais parvenu à terminer la composition ; les tentatives se soldent invariablement par un arrêt dû à l'épuisement ou à l'intervention du personnel de sécurité.",
    incidents: [
      {
        date: '1999-04-23',
        summary:
          "Site-17 — Un chercheur autorisé à consulter SCP-012 dans le cadre d'une analyse graphologique passe 26 heures consécutives à tenter de la compléter avant intervention forcée. Hospitalisation pour épuisement sévère.",
      },
    ],
    tests: [
      {
        date: '2002-10-14',
        researcher: 'Dr. Kessler',
        result:
          "Présentation d'une reproduction photographique plutôt que de l'original à un sujet Classe-D. Aucun effet compulsif observé, confirmant que l'anomalie est liée à l'objet physique lui-même et non à son contenu visuel reproductible.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Kessler',
        content:
          "Toute consultation de SCP-012 doit être strictement limitée à trente minutes sous supervision directe, avec retrait immédiat de l'objet dès le premier signe de comportement compulsif chez le sujet observateur.",
      },
    ],
    containmentCost: '2 900$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-063',
    number: 'SCP-063',
    name: 'La Meilleure Brosse à Dents au Monde',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-063 est conservé dans le magasin d'équipement standard, disponible pour usage encadré du personnel dans le cadre de tests d'hygiène comportementale. Aucune restriction particulière au-delà de la tenue d'un registre d'usage.",
    history:
      "SCP-063 a été signalé par un dentiste ayant remarqué qu'un patient utilisait un objet identique depuis plus de vingt ans sans aucune usure visible, avant d'accepter de le céder à la Fondation contre compensation.",
    description:
      "SCP-063 est une brosse à dents d'apparence banale qui ne s'use jamais, quelle que soit la fréquence ou l'intensité d'utilisation, et procure systématiquement un résultat de nettoyage dentaire optimal en une seule utilisation, quel que soit l'état initial de la dentition du sujet.",
    incidents: [],
    tests: [
      {
        date: '2011-07-02',
        researcher: 'Dr. Lachance',
        result:
          "Utilisation quotidienne sur un sujet Classe-D présentant une hygiène dentaire négligée depuis plusieurs années. Amélioration complète et immédiate constatée dès la première utilisation, sans effet secondaire relevé.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Lachance',
        content:
          "SCP-063 est régulièrement cité en exemple lors des formations internes sur objets anormaux à faible risque — utile, inoffensif, et sans aucune application stratégique évidente au-delà de son usage littéral.",
      },
    ],
    containmentCost: '150$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-066',
    number: 'SCP-066',
    name: "Le Jouet d'Eric",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-066 est conservé dans une vitrine scellée au sein du Département Scientifique. Tout enfant présent sur site (rare mais possible lors de visites autorisées) doit être maintenu à distance stricte de la zone de stockage.",
    history:
      "SCP-066 a été récupéré en 1988 après la disparition d'un enfant de huit ans, prénommé Eric, dont les parents rapportaient qu'il avait « suivi son jouet » lors d'un jeu dans le jardin familial. L'enfant n'a jamais été retrouvé.",
    description:
      "SCP-066 se présente comme une figurine articulée de conception simple, qui exerce une attraction anormale spécifiquement sur les enfants de moins de douze ans, les incitant à le suivre et jouer avec lui de façon compulsive. Une entité distincte (SCP-066-1), correspondant apparemment à l'enfant Eric transformé, est occasionnellement observée en lien avec l'objet, se manifestant comme une présence protectrice envers quiconque possède la figurine tout en étant hostile à toute tentative de séparation.",
    incidents: [
      {
        date: '2004-05-30',
        summary:
          "Site-08 — Lors d'un test avec un sujet Classe-D mineur (dérogation exceptionnelle validée), SCP-066-1 se manifeste et attaque le personnel tentant de retirer l'objet. Le test est immédiatement interrompu.",
      },
    ],
    tests: [
      {
        date: '2006-09-12',
        researcher: 'Dr. Okonkwo',
        result:
          "Présentation de SCP-066 à des sujets adultes uniquement. Aucune attraction compulsive observée, confirmant la spécificité de l'anomalie à la tranche d'âge enfantine.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Okonkwo',
        content:
          "Toute recherche impliquant des sujets mineurs reste soumise à un cadre éthique strict et exceptionnel au sein de la Fondation. Les protocoles concernant SCP-066 font l'objet d'une révision régulière par le comité d'éthique du Département Scientifique.",
      },
    ],
    containmentCost: '8 700$/mois',
    personnelAssigned: 3,
    breachCount: 0,
  },
  {
    slug: 'scp-092',
    number: 'SCP-092',
    name: 'Le Pendule du Souvenir',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-092 est suspendu dans un cadre de confinement dédié au sein du Département Scientifique, immobilisé sauf lors des sessions de test autorisées. Toute oscillation spontanée hors test doit être immédiatement rapportée.",
    history:
      "SCP-092 a été récupéré en 1996 dans le grenier d'une maison familiale, où plusieurs générations rapportaient avoir « revécu » des souvenirs de proches disparus en observant ses oscillations prolongées.",
    description:
      "SCP-092 est un pendule métallique ouvragé qui, lorsqu'il oscille librement, projette dans l'esprit de l'observateur des fragments de souvenirs appartenant à des personnes décédées ayant eu un lien affectif avec l'objet ou son propriétaire précédent. Les souvenirs projetés sont subjectivement vécus comme réels par le sujet le temps de l'exposition, sans qu'aucun risque physique direct n'ait été documenté.",
    incidents: [],
    tests: [
      {
        date: '2001-03-27',
        researcher: 'Dr. Ferreira',
        result:
          "Exposition de trois sujets Classe-D n'ayant aucun lien connu avec l'objet ou ses propriétaires antérieurs. Aucune projection de souvenir rapportée, suggérant que l'anomalie nécessite un lien affectif préexistant, non aléatoire.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ferreira',
        content:
          "SCP-092 a été proposé à plusieurs reprises comme outil d'enquête sur des objets anormaux d'origine familiale incertaine, sous réserve de disposer d'un sujet ayant un lien affectif documenté avec la source concernée.",
      },
    ],
    containmentCost: '3 400$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-111',
    number: 'SCP-111',
    name: 'Dragon-Escargots',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "Les spécimens de SCP-111 sont hébergés dans un vivarium tempéré divisé en compartiments selon leur morphologie (Blobworm, Glowdrake, Goowyvern, Gunkwyvern, Oozedrake, Slimybelly). La reproduction est autorisée sous contrôle strict afin d'éviter toute surpopulation, les œufs excédentaires étant détruits ou transférés sur autorisation.",
    history:
      "SCP-111 a été découvert en 2011 dans une grotte volcanique isolée, où une colonie entière de spécimens aux morphologies variées mais génétiquement apparentées vivait en semi-autarcie autour d'une source géothermique naturelle.",
    description:
      "SCP-111 désigne une espèce de petits reptiles gastéropodes non classifiée, présentant six morphologies distinctes issues d'un même patrimoine génétique de base, chacune associée à un environnement de développement spécifique (chaleur, humidité, luminosité). Les spécimens sont généralement dociles et peuvent être élevés en captivité sans danger particulier, bien que certaines morphologies (Gunkwyvern notamment) présentent une sécrétion légèrement corrosive en cas de stress.",
    incidents: [
      {
        date: '2013-01-19',
        summary:
          "Site-22 — Une éclosion massive non anticipée produit 40 spécimens supplémentaires en une nuit, dépassant temporairement la capacité du vivarium. Aucune fuite n'est à déplorer ; la capacité de confinement est renforcée depuis.",
      },
    ],
    tests: [
      {
        date: '2014-05-08',
        researcher: 'Dr. Ilves',
        result:
          "Élevage contrôlé d'œufs identiques dans six environnements distincts. Confirmation que la morphologie finale dépend entièrement des conditions de développement plutôt que d'une prédétermination génétique fixe.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ilves',
        content:
          "SCP-111 est l'un des rares objets anormaux dont l'élevage est activement encouragé à des fins d'étude comportementale et développementale, en raison de son faible profil de risque global.",
      },
    ],
    containmentCost: '4 800$/mois',
    personnelAssigned: 3,
    breachCount: 0,
  },
  {
    slug: 'scp-117',
    number: 'SCP-117',
    name: 'Le Miroir Sans Reflet',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-117 est confiné face contre un mur renforcé au sein d'une chambre verrouillée. Il ne doit jamais être positionné de façon à ce qu'un individu puisse s'y refléter sans autorisation expresse d'un protocole de test validé.",
    history:
      "SCP-117 a été saisi en 1983 dans une maison où le propriétaire avait recouvert tous ses miroirs de tissu après avoir affirmé que « son reflet ne le suivait plus » dans celui-ci depuis plusieurs semaines.",
    description:
      "SCP-117 est un miroir sur pied à cadre ouvragé dont la surface, lorsqu'un individu s'y observe pendant plus de dix secondes, cesse de refléter fidèlement ses mouvements pour afficher à la place un reflet légèrement décalé, effectuant des actions subtilement différentes de celles du sujet. Aucune interaction physique entre le reflet et le sujet n'a jamais été documentée au-delà de cette divergence comportementale.",
    incidents: [
      {
        date: '2007-08-04',
        summary:
          "Site-17 — Un sujet Classe-D observe son reflet effectuer un signe de la main qu'il n'a lui-même jamais réalisé. Le sujet interrompt le test de son propre chef, rapportant un malaise psychologique intense.",
      },
    ],
    tests: [
      {
        date: '2009-02-16',
        researcher: 'Dr. Marchetti',
        result:
          "Observation prolongée (45 minutes) sous caméra haute vitesse. Le décalage entre sujet et reflet augmente progressivement avec la durée d'exposition, sans jamais atteindre de rupture totale de synchronisation observée à ce jour.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Marchetti',
        content:
          "Aucune hypothèse actuellement retenue n'explique de façon satisfaisante la nature du reflet divergent observé dans SCP-117. La recherche reste ouverte quant à une éventuelle communication ou intention propre à l'entité reflétée.",
      },
    ],
    containmentCost: '4 200$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-127',
    number: 'SCP-127',
    name: 'La Radio des Absents',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-127 est conservé éteint dans une pièce insonorisée du Département Scientifique. Toute mise en marche doit être consignée et limitée à une durée de test définie à l'avance.",
    history:
      "SCP-127 a été récupéré en 1979 chez un radioamateur décédé, dont les voisins rapportaient entendre des voix « répondant à des questions jamais posées à voix haute » émanant de son domicile durant les mois précédant sa mort.",
    description:
      "SCP-127 est un poste de radio à lampes de fabrication ancienne qui, une fois allumé, diffuse des voix humaines répondant avec une précision troublante à des questions formulées mentalement par l'auditeur, sans qu'aucune parole ne soit prononcée à voix haute. Les réponses obtenues sont généralement vagues ou ambiguës, rarement directement exploitables, mais toujours cohérentes avec la question posée.",
    incidents: [],
    tests: [
      {
        date: '2003-12-01',
        researcher: 'Dr. Costanza',
        result:
          "Test en isolation acoustique totale avec questions purement mentales sur trente sujets. Taux de cohérence des réponses estimé à 78 %, largement supérieur au hasard statistique attendu pour des réponses génériques.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Costanza',
        content:
          "SCP-127 fait l'objet d'un intérêt particulier du Département Scientifique quant à son potentiel d'application en matière de renseignement, bien que la fiabilité insuffisante des réponses limite pour l'instant toute utilisation opérationnelle.",
      },
    ],
    containmentCost: '2 100$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-140',
    number: 'SCP-140',
    name: 'Chronique Incomplète',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-140 est conservé dans une pochette ignifugée au sein d'une armoire climatisée. Toute traduction ou reproduction du texte doit être immédiatement détruite après analyse, jamais conservée en dehors du dossier de recherche officiel.",
    history:
      "SCP-140 a été récupéré en 1962 dans les ruines d'un monastère isolé, entièrement calciné à l'exception du volume lui-même, retrouvé intact au centre des décombres.",
    description:
      "SCP-140 est un ouvrage relié à la main, rédigé dans une langue non identifiée mais partiellement traduisible, relatant l'histoire d'une civilisation ancienne détruite par une entité non nommée. Le texte semble s'actualiser périodiquement pour inclure des événements contemporains présentés sous une forme allégorique, souvent après leur survenue réelle mais parfois, de façon troublante, avant.",
    incidents: [
      {
        date: '1996-07-13',
        summary:
          "Site-19 — Une page nouvellement apparue décrit, sous forme allégorique, un incident de confinement survenu trois jours plus tard sur le même site. L'événement relance les débats sur la nature prédictive du texte.",
      },
    ],
    tests: [
      {
        date: '2000-04-22',
        researcher: 'Dr. Bright (Site-19)',
        result:
          "Comparaison systématique des passages nouvellement apparus avec les journaux d'incidents internes de la Fondation sur cinq ans. Corrélation significative confirmée sur 60 % des passages analysables, sans mécanisme causal identifié.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Bright (Site-19)',
        content:
          "SCP-140 reste l'un des objets textuels les plus surveillés de la Fondation en raison de son potentiel prédictif partiel. Toute nouvelle page détectée doit être immédiatement transmise au Conseil O5 pour analyse prioritaire.",
      },
    ],
    containmentCost: '6 000$/mois',
    personnelAssigned: 3,
    breachCount: 0,
  },
  {
    slug: 'scp-143',
    number: 'SCP-143',
    name: 'Le Bosquet de Bladewood',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-143 est cultivé dans une serre dédiée sur le périmètre extérieur sécurisé. Toute récolte de bois ou de feuilles à des fins de test ou de construction doit être approuvée par le Département Scientifique.",
    history:
      "SCP-143 a été localisé en 2009 lors du relevé botanique d'une forêt isolée, où une espèce d'arbres inconnue présentait un bois d'une résistance mécanique très supérieure à toute essence répertoriée.",
    description:
      "SCP-143 désigne une espèce d'arbres non classifiée dont le bois, une fois traité, présente une résistance structurelle et une durabilité largement supérieures aux matériaux de construction conventionnels équivalents. Aucune propriété dangereuse n'a été identifiée ; l'essence est activement exploitée par la Fondation pour la construction d'équipements et de mobilier renforcé sur plusieurs sites.",
    incidents: [],
    tests: [
      {
        date: '2010-08-17',
        researcher: 'Dr. Verhoeven',
        result:
          "Test de résistance à la compression comparé au chêne standard. Résistance mesurée environ quatre fois supérieure, sans variation significative de poids ou de densité apparente.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Verhoeven',
        content:
          "SCP-143 est désormais cultivé à échelle contrôlée sur plusieurs sites de la Fondation pour un usage matériel régulier, faisant de cette anomalie l'une des plus directement utiles au quotidien opérationnel.",
      },
    ],
    containmentCost: '3 000$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-148',
    number: 'SCP-148',
    name: 'Le Minerai de Telekill',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "Les gisements de SCP-148 identifiés sont exploités sous supervision directe du Département Scientifique. Le minerai raffiné est stocké dans le magasin sécurisé de l'armurerie, sa distribution étant réservée aux équipements de sécurité approuvés.",
    history:
      "SCP-148 a été identifié en 2015 lors d'un relevé géologique de routine, révélant un minerai à la structure cristalline atypique dans une zone auparavant considérée comme géologiquement banale.",
    description:
      "SCP-148 est un minerai métallique dont les propriétés exactes restent partiellement comprises, mais dont l'alliage résultant démontre une résistance mécanique et une durabilité significativement supérieures aux métaux conventionnels équivalents une fois forgé en équipement. Le minerai brut ne présente aucun danger de manipulation connu.",
    incidents: [],
    tests: [
      {
        date: '2016-11-03',
        researcher: 'Dr. Halvorsen',
        result:
          "Forge d'un équipement de test standard (outil et armure légère) à partir de l'alliage. Résistance à l'impact mesurée trois fois supérieure à l'acier trempé standard.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Halvorsen',
        content:
          "SCP-148 est activement exploité pour la fabrication d'équipement de sécurité renforcé destiné au personnel de terrain confronté à des entités anormales à haut risque physique.",
      },
    ],
    containmentCost: '5 500$/mois',
    personnelAssigned: 3,
    breachCount: 0,
  },
  {
    slug: 'scp-162',
    number: 'SCP-162',
    name: 'Le Registre des Dettes',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-162 est conservé fermé dans une armoire scellée. Toute ouverture doit être justifiée par un protocole de test formel, jamais par simple curiosité, en raison du risque associé à toute inscription involontaire.",
    history:
      "SCP-162 a été récupéré en 1991 dans les affaires d'un usurier retrouvé mort d'une cause indéterminée, le registre ouvert à une page vierge à côté de son corps.",
    description:
      "SCP-162 est un registre relié en cuir dont chaque page vierge, une fois qu'un nom y est inscrit accompagné d'une somme, engage la personne nommée à cette dette envers le porteur du registre, quelle que soit la connaissance ou le consentement de la personne concernée. Le non-remboursement dans le délai inscrit entraîne systématiquement un accident grave frappant le débiteur.",
    incidents: [
      {
        date: '1999-09-08',
        summary:
          "Site-08 — Un sujet Classe-D inscrit son propre nom par curiosité lors d'un test non autorisé. L'incident est interrompu avant l'échéance de la dette fictive ; le registre est immédiatement reconfisqué.",
      },
    ],
    tests: [
      {
        date: '2002-01-25',
        researcher: 'Dr. Okonkwo',
        result:
          "Inscription contrôlée du nom d'un sujet Classe-D consentant pour une somme symbolique remboursée dans les délais. Aucun incident ne survient, confirmant que le remboursement effectif neutralise l'anomalie.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Okonkwo',
        content:
          "SCP-162 ne doit en aucun cas être utilisé à des fins coercitives par le personnel de la Fondation, quelle que soit la situation. Toute violation de cette règle est passible de sanction disciplinaire immédiate.",
      },
    ],
    containmentCost: '3 800$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-198',
    number: 'SCP-198',
    name: 'La Boussole Sans Nord',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-198 est conservé dans une boîte de rangement standard au sein du Département Scientifique. Son usage est autorisé pour tout protocole de test approuvé sans restriction particulière supplémentaire.",
    history:
      "SCP-198 a été signalé par un explorateur amateur ayant remarqué que l'instrument ne pointait jamais le nord magnétique, mais semblait systématiquement indiquer la direction de l'anomalie active la plus proche.",
    description:
      "SCP-198 est une boussole de conception standard dont l'aiguille, au lieu d'indiquer le nord magnétique, s'oriente systématiquement vers la source anormale la plus proche dans un rayon d'environ dix kilomètres, sans distinction de nature ou de dangerosité de l'anomalie détectée.",
    incidents: [],
    tests: [
      {
        date: '2017-03-14',
        researcher: 'Dr. Nakamura',
        result:
          "Test comparatif en présence simultanée de plusieurs objets anormaux connus du site. L'aiguille s'oriente vers l'objet le plus proche géographiquement plutôt que le plus significatif anormalement, confirmant un mécanisme purement spatial.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Nakamura',
        content:
          "SCP-198 est parfois emprunté par les équipes de terrain lors d'opérations de reconnaissance en zone suspecte, bien que son incapacité à distinguer le niveau de danger limite son utilité opérationnelle directe.",
      },
    ],
    containmentCost: '500$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-248',
    number: 'SCP-248',
    name: "Les Gants de l'Ouvrier",
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-248 est conservé dans le magasin d'équipement du Département Maintenance, disponible pour affectation encadrée lors de travaux nécessitant une force physique accrue.",
    history:
      "SCP-248 a été récupéré en 2003 auprès d'un ouvrier du bâtiment ayant développé une réputation locale de « force surhumaine » depuis l'achat des gants dans une brocante, avant que des blessures répétées ne le conduisent à s'en séparer.",
    description:
      "SCP-248 est une paire de gants de travail en cuir renforcé qui, une fois portés, multiplient significativement la force physique brute du porteur, sans amélioration correspondante de la coordination motrice fine ni de la résistance osseuse et musculaire du porteur, entraînant un risque élevé d'auto-blessure en cas d'usage non maîtrisé.",
    incidents: [
      {
        date: '2010-06-21',
        summary:
          "Site-22 — Un sujet Classe-D portant SCP-248 lors d'un test de manutention se fracture le poignet en sous-estimant la force appliquée à un objet standard. Le protocole de test est révisé pour inclure un entraînement progressif.",
      },
    ],
    tests: [
      {
        date: '2011-02-08',
        researcher: 'Dr. Farrow',
        result:
          "Mesure de la force de préhension avec dynamomètre. Augmentation d'environ 600 % par rapport à la valeur de référence du sujet, confirmant l'ampleur de l'anomalie.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Farrow',
        content:
          "SCP-248 est parfois affecté à des tâches de manutention lourde sur autorisation exceptionnelle du Département Maintenance, sous réserve d'un entraînement préalable obligatoire du porteur désigné.",
      },
    ],
    containmentCost: '1 900$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-280',
    number: 'SCP-280',
    name: "Yeux dans l'Obscurité",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-280 ne peut être physiquement confiné, son existence n'étant documentée qu'en conditions de faible ou d'absence de lumière. Toute zone sous surveillance de personnel affecté à des tâches nocturnes doit disposer d'un éclairage de secours fonctionnel en permanence.",
    history:
      "SCP-280 est documenté depuis 2008 à travers des témoignages répétés de personnel de sécurité en poste de nuit, rapportant la sensation constante d'être observés par de multiples paires d'yeux dans les zones mal éclairées du site.",
    description:
      "SCP-280 désigne un phénomène récurrent consistant en l'apparition de paires d'yeux luminescents dans l'obscurité, sans corps ni forme identifiable associée. Le phénomène n'a jamais été associé à une attaque physique directe, mais son observation prolongée provoque une détresse psychologique significative chez la majorité des témoins, avec des cas documentés de trouble anxieux durable.",
    incidents: [
      {
        date: '2012-11-11',
        summary:
          "Site-45 — Un agent de sécurité en ronde nocturne rapporte avoir compté plus de vingt paires d'yeux distinctes dans un couloir normalement désert. L'incident déclenche un renforcement temporaire de l'éclairage du secteur concerné.",
      },
    ],
    tests: [
      {
        date: '2013-05-29',
        researcher: 'Dr. Lindqvist',
        result:
          "Installation de caméras à vision nocturne dans une zone à activité rapportée élevée. Aucune source lumineuse correspondant au phénomène n'est captée par l'équipement, malgré des témoignages simultanés du personnel présent.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Lindqvist',
        content:
          "L'absence de toute trace mesurable par équipement standard place SCP-280 parmi les phénomènes les plus difficiles à étudier scientifiquement. Le suivi psychologique du personnel exposé reste la seule mesure de gestion actuellement disponible.",
      },
    ],
    containmentCost: '2 400$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-348',
    number: 'SCP-348',
    name: 'La Vitrine aux Secrets',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-348 est installé dans une salle dédiée du Département Scientifique. Toute consultation doit être consignée nominativement et limitée à une question par session, afin d'éviter toute dépendance comportementale du personnel.",
    history:
      "SCP-348 a été récupéré en 1994 dans une brocante après que plusieurs clients ont rapporté avoir « vu la réponse » à des questions personnelles simplement en s'approchant de l'objet exposé en vitrine.",
    description:
      "SCP-348 est une vitrine en bois et verre qui, lorsqu'une question précise est formulée mentalement par un individu à proximité, affiche à l'intérieur un objet ou un symbole représentant symboliquement la réponse à cette question. L'interprétation du symbole reste à la charge du sujet, la vitrine ne fournissant jamais de réponse littérale ou verbale.",
    incidents: [],
    tests: [
      {
        date: '2005-10-19',
        researcher: 'Dr. Kessler',
        result:
          "Série de 50 questions test à réponse vérifiable posées par des sujets Classe-D. Taux d'interprétation correcte du symbole affiché estimé à 65 % après analyse a posteriori, suggérant une réelle valeur informative bien qu'imparfaite.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Kessler',
        content:
          "SCP-348 fait l'objet d'un encadrement strict de son usage en raison du risque de dépendance psychologique observé chez plusieurs membres du personnel scientifique ayant consulté l'objet de façon répétée sans autorisation.",
      },
    ],
    containmentCost: '3 100$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-445',
    number: 'SCP-445',
    name: "L'Encre Vivante",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "Les échantillons de SCP-445 sont conservés dans des flacons hermétiques doublement scellés au sein d'une chambre froide. Aucun contact avec un support absorbant (papier, tissu, peau) n'est autorisé hors protocole de test strictement encadré.",
    history:
      "SCP-445 a été découvert en 2001 dans l'atelier d'un artiste-peintre disparu, dont les dernières œuvres exposées présentaient des figures peintes signalées comme « changeant subtilement de position » entre deux visites du public.",
    description:
      "SCP-445 est une substance semblable à de l'encre noire, présentant un comportement de propagation actif : une fois appliquée sur un support, la substance continue de se déplacer lentement pour former des motifs organiques complexes, indépendamment de toute intention de l'utilisateur initial. Un contact cutané prolongé provoque une absorption progressive de la substance dans le derme, sans effet toxique direct mais avec apparition de motifs similaires sous la peau du sujet.",
    incidents: [
      {
        date: '2006-08-22',
        summary:
          "Site-19 — Un échantillon appliqué sur un support de test continue de se propager au-delà de la zone contrôlée, atteignant la table de laboratoire adjacente en 4 heures. Le matériel affecté est détruit par précaution.",
      },
    ],
    tests: [
      {
        date: '2008-01-30',
        researcher: 'Dr. Bright (Site-19)',
        result:
          "Application sur un support vivant (tissu animal prélevé). La propagation ralentit significativement sur support vivant comparé à un support inerte, sans qu'une explication mécanistique n'ait pu être établie.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Bright (Site-19)',
        content:
          "Le contact cutané direct avec SCP-445 reste strictement proscrit en dehors d'un protocole de test explicitement validé, en raison du risque d'absorption dermique documenté et des effets à long terme encore mal compris.",
      },
    ],
    containmentCost: '9 800$/mois',
    personnelAssigned: 4,
    breachCount: 1,
  },
  {
    slug: 'scp-458',
    number: 'SCP-458',
    name: 'La Boîte à Pizza Sans Fin',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-458 est conservé dans le réfectoire du personnel scientifique, sous surveillance vidéo standard. Son usage récréatif encadré est toléré en dehors des sessions de test formelles.",
    history:
      "SCP-458 a été récupéré en 2016 dans une pizzeria fermée pour raisons administratives inexpliquées, où l'établissement continuait apparemment de produire des commandes bien après la coupure de tout approvisionnement.",
    description:
      "SCP-458 est une boîte à pizza en carton standard qui, une fois ouverte, contient systématiquement une part de pizza fraîche et chaude, quelle que soit la fréquence d'ouverture. La garniture varie selon des paramètres non identifiés mais correspond toujours à une combinaison culinairement cohérente.",
    incidents: [],
    tests: [
      {
        date: '2017-04-05',
        researcher: 'Dr. Ilves',
        result:
          "Ouverture répétée toutes les cinq minutes sur une durée de douze heures continues. Production constante sans dégradation qualitative ni interruption observée, confirmant l'absence de limite de fréquence identifiable.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ilves',
        content:
          "SCP-458 est unanimement apprécié du personnel du Site où il est stationné et constitue, à ce jour, l'un des objets anormaux au profil de risque le plus faible jamais documenté par la Fondation.",
      },
    ],
    containmentCost: '300$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-472',
    number: 'SCP-472',
    name: 'La Pierre de Sang',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-472 est conservé dans un conteneur biologique scellé, isolé de tout contact avec du sang ou des tissus organiques hors protocole de test. Toute rupture de scellé doit déclencher une décontamination immédiate de la zone.",
    history:
      "SCP-472 a été découvert en 2007 sur un site de fouilles archéologiques, retrouvé au centre d'une formation rocheuse présentant des traces de sang séché appartenant à au moins onze individus distincts non identifiés.",
    description:
      "SCP-472 est une pierre poreuse de couleur rougeâtre qui, au contact du sang, absorbe le liquide et se met à croître de façon organique, développant progressivement des structures ressemblant à des veines et capillaires. La croissance s'arrête une fois toute source de sang à proximité épuisée, la pierre entrant alors dans un état de dormance apparente.",
    incidents: [
      {
        date: '2009-03-15',
        summary:
          "Site-19 — Un échantillon de sang testé en quantité supérieure au protocole standard provoque une croissance accélérée non anticipée, nécessitant l'incinération d'urgence de la structure formée avant qu'elle n'atteigne une taille critique.",
      },
    ],
    tests: [
      {
        date: '2010-09-27',
        researcher: 'Dr. Ferreira',
        result:
          "Exposition contrôlée à différents types sanguins. Aucune différence significative de vitesse de croissance observée entre les groupes sanguins testés, suggérant une réaction non spécifique au plasma ou aux composants cellulaires du sang.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ferreira',
        content:
          "Toute manipulation de SCP-472 impliquant du sang doit être strictement limitée en volume selon le protocole en vigueur, l'incident de 2009 ayant démontré le risque de croissance rapide en cas de non-respect des quantités autorisées.",
      },
    ],
    containmentCost: '7 200$/mois',
    personnelAssigned: 3,
    breachCount: 1,
  },
  {
    slug: 'scp-513',
    number: 'SCP-513',
    name: 'La Cloche Rouillée',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-513 est conservé dans un étui matelassé insonorisé au sein d'une armoire verrouillée. Toute manipulation susceptible de la faire sonner accidentellement doit être évitée ; le transport se fait exclusivement en étui rembourré.",
    history:
      "SCP-513 a été récupéré en 1985 dans une ferme abandonnée après une série de décès de bétail attribués localement à une malédiction associée au son de la cloche, retrouvée accrochée au cou d'un animal mort.",
    description:
      "SCP-513 est une cloche à vache en métal rouillé qui, lorsqu'elle sonne, provoque chez toute personne l'entendant une vision fugace mais intense d'un événement traumatique qu'elle-même vivra dans un futur proche. Une entité humanoïde (SCP-513-1) est occasionnellement rapportée par les sujets exposés, perçue comme observant la scène visionnée sans intervenir.",
    incidents: [
      {
        date: '1997-06-11',
        summary:
          "Site-08 — Un technicien fait accidentellement sonner SCP-513 lors d'un transfert. Il rapporte une vision d'un accident de laboratoire qui se produit effectivement onze jours plus tard, sans qu'aucune mesure préventive n'ait pu empêcher totalement l'événement.",
      },
    ],
    tests: [
      {
        date: '2001-12-19',
        researcher: 'Dr. Whitfield',
        result:
          "Exposition contrôlée d'un sujet Classe-D volontaire. La vision rapportée se réalise partiellement sous une forme différente dans les jours suivants, suggérant une nature symbolique plutôt que littéralement prédictive de l'anomalie.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Whitfield',
        content:
          "L'usage de SCP-513 à des fins de prévention d'incidents reste débattu au sein du Département Scientifique, les visions obtenues s'étant révélées jusqu'ici trop symboliques pour permettre une action préventive fiable.",
      },
    ],
    containmentCost: '4 600$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-538',
    number: 'SCP-538',
    name: "Araignée de l'Ombre",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "En l'absence de spécimen capturé, le confinement de SCP-538 repose sur la surveillance des zones à forte activité rapportée et le maintien d'un éclairage constant dans tout secteur sensible du site.",
    history:
      "SCP-538 est documenté depuis 2014 à travers plusieurs témoignages de personnel rapportant l'observation d'une silhouette arachnéenne se déplaçant exclusivement dans les zones d'ombre projetée, disparaissant instantanément dès qu'exposée à la lumière directe.",
    description:
      "SCP-538 désigne une entité arachnéenne de grande taille se déplaçant exclusivement à travers les ombres projetées par des objets ou des personnes, sans jamais être visible dans un espace pleinement éclairé. L'entité a été associée à plusieurs disparitions dans des zones faiblement éclairées, bien qu'aucune attaque n'ait jamais été directement observée par un témoin survivant.",
    incidents: [
      {
        date: '2015-09-30',
        summary:
          "Site-22 — Un agent de maintenance disparaît dans une zone de stockage faiblement éclairée. Son ombre est rapportée comme ayant « bougé indépendamment » par un collègue présent quelques instants avant l'incident.",
      },
    ],
    tests: [
      {
        date: '2016-11-22',
        researcher: 'Dr. Solberg',
        result:
          "Installation d'un éclairage à 360 degrés sans zone d'ombre résiduelle dans un secteur à activité élevée rapportée. Aucune manifestation de SCP-538 n'est rapportée durant toute la période de test, appuyant l'hypothèse d'une dépendance stricte à la présence d'ombres exploitables.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Solberg',
        content:
          "Le renforcement de l'éclairage dans les zones à risque reste la seule mesure préventive efficace identifiée à ce jour contre SCP-538, en l'absence de toute méthode de capture ou de neutralisation directe.",
      },
    ],
    containmentCost: '3 600$/mois',
    personnelAssigned: 2,
    breachCount: 1,
  },
  {
    slug: 'scp-714',
    number: 'SCP-714',
    name: "L'Anneau de Jade",
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-714 est conservé dans un écrin scellé au sein du Département Scientifique. Le port est réservé aux protocoles de test approuvés impliquant une exposition anticipée à une entité anormale hostile.",
    history:
      "SCP-714 a été acquis en 1975 auprès d'un collectionneur d'antiquités ayant survécu, selon ses dires, à trois rencontres distinctes avec des entités anormales hostiles sans blessure grave depuis qu'il portait l'anneau.",
    description:
      "SCP-714 est un anneau en jade sculpté qui, une fois porté, confère à son porteur une résistance physique significativement accrue face aux attaques d'entités anormales de nature organique ou surnaturelle, sans effet mesurable contre les menaces conventionnelles ou mécaniques.",
    incidents: [],
    tests: [
      {
        date: '2003-06-08',
        researcher: 'Dr. Marchetti',
        result:
          "Exposition contrôlée d'un porteur à une entité anormale hostile de faible dangerosité documentée. Réduction significative des dégâts subis comparée à un sujet témoin non porteur, confirmant l'effet protecteur spécifique.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Marchetti',
        content:
          "SCP-714 est occasionnellement affecté aux équipes d'intervention devant opérer face à des entités anormales hostiles connues, sous réserve de disponibilité et de validation préalable du Département Scientifique.",
      },
    ],
    containmentCost: '2 200$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-751',
    number: 'SCP-751',
    name: 'La Carte Sans Territoire',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "SCP-751 est conservée dépliée dans une salle de consultation dédiée du Département Scientifique. Toute consultation doit être consignée avec la question géographique précise posée.",
    history:
      "SCP-751 a été récupérée en 1990 dans les archives d'une société de cartographie dissoute, où elle était classée comme « carte défectueuse » en raison de son contenu changeant selon les rapports internes de l'époque.",
    description:
      "SCP-751 est une carte géographique de grand format dont le contenu affiché se modifie pour représenter la localisation précise de tout lieu recherché mentalement par la personne la consultant, y compris des lieux non répertoriés ou anormaux, avec un niveau de détail variable selon la nature du lieu recherché.",
    incidents: [],
    tests: [
      {
        date: '1998-10-05',
        researcher: 'Dr. Aguilar',
        result:
          "Recherche test de la localisation d'un site anormal connu du Département mais non communiqué à l'opérateur. La carte affiche une localisation correcte à moins de 500 mètres près, confirmant une précision opérationnellement exploitable.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Aguilar',
        content:
          "SCP-751 est régulièrement sollicitée par les équipes de récupération d'objets anormaux lors des phases préliminaires de localisation, sous réserve de validation croisée avec d'autres sources avant tout déploiement opérationnel.",
      },
    ],
    containmentCost: '2 000$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-790',
    number: 'SCP-790',
    name: 'Le Métronome Muet',
    class: ScpClass.Euclid,
    threatLevel: 2,
    containment:
      "SCP-790 est conservé à l'arrêt dans une vitrine scellée au sein du Département Scientifique. Tout déclenchement du mécanisme doit se faire sous supervision directe et jamais en présence de personnel non essentiel.",
    history:
      "SCP-790 a été récupéré en 1988 dans l'atelier d'un horloger ayant développé une désorientation temporelle sévère, incapable de percevoir correctement l'écoulement du temps depuis plusieurs mois précédant son hospitalisation.",
    description:
      "SCP-790 est un métronome mécanique dont le balancier, une fois activé, ne produit aucun son perceptible mais provoque chez toute personne à portée de vue une distorsion progressive de la perception du temps, les sujets rapportant une impression tantôt d'accélération, tantôt de ralentissement extrême des événements environnants sans que leur comportement objectif n'en soit affecté.",
    incidents: [
      {
        date: '2004-02-27',
        summary:
          "Site-45 — Un technicien laisse SCP-790 activé pendant plus de deux heures par inadvertance lors d'un test. Il rapporte une désorientation temporelle sévère nécessitant plusieurs jours de repos avant rétablissement complet.",
      },
    ],
    tests: [
      {
        date: '2005-07-14',
        researcher: 'Dr. Reyes',
        result:
          "Exposition contrôlée limitée à cinq minutes sur un sujet Classe-D. Distorsion temporelle subjective rapportée sans effet mesurable sur les fonctions cognitives ou motrices objectives du sujet après la session.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Reyes',
        content:
          "Toute session de test impliquant SCP-790 doit être strictement limitée à cinq minutes maximum, l'incident de 2004 ayant démontré le risque de désorientation prolongée en cas de dépassement de ce seuil.",
      },
    ],
    containmentCost: '3 300$/mois',
    personnelAssigned: 2,
    breachCount: 0,
  },
  {
    slug: 'scp-822',
    number: 'SCP-822',
    name: 'Cactus Terrestres',
    class: ScpClass.Safe,
    threatLevel: 2,
    containment:
      "Les spécimens de SCP-822 sont cultivés dans un enclos extérieur clôturé et clairement balisé, à distance de toute zone de passage régulier du personnel.",
    history:
      "SCP-822 a été découvert en 2013 dans une zone désertique après le signalement d'explosions de faible intensité inexpliquées, tracées jusqu'à une colonie de cactus à la morphologie inhabituelle.",
    description:
      "SCP-822 désigne une espèce de cactus non classifiée qui, en réponse à un contact physique ou une vibration suffisante à proximité de sa base, libère une explosion de faible intensité projetant ses épines à haute vélocité sur plusieurs mètres, sans dommage significatif pour le spécimen lui-même qui régénère la zone affectée en quelques semaines.",
    incidents: [
      {
        date: '2014-06-02',
        summary:
          "Site-22 — Un agent de sécurité déclenche accidentellement un spécimen en s'approchant trop près lors d'une ronde. Blessures superficielles multiples par projection d'épines, sans gravité. Le périmètre de sécurité est étendu depuis.",
      },
    ],
    tests: [
      {
        date: '2015-01-11',
        researcher: 'Dr. Novak',
        result:
          "Mesure de la vélocité de projection des épines à l'aide de capteurs à distance. Vitesse mesurée suffisante pour perforer un tissu léger à moins de trois mètres, confirmant le classement en objet à risque modéré.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Novak',
        content:
          "Le périmètre de sécurité autour de l'enclos de SCP-822 a été porté à cinq mètres minimum suite à l'incident de 2014, avec signalétique renforcée pour tout personnel non familier de l'anomalie.",
      },
    ],
    containmentCost: '1 400$/mois',
    personnelAssigned: 1,
    breachCount: 1,
  },
  {
    slug: 'scp-860',
    number: 'SCP-860',
    name: 'La Forêt de Vanqar',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "L'accès à la zone de manifestation de SCP-860 est restreint par une clôture périmétrique et une porte verrouillée à accès contrôlé par carte magnétique. Aucune expédition n'est autorisée sans équipe minimale de deux agents équipés de balises de repérage.",
    history:
      "SCP-860 a été découvert en 2017 lorsqu'une porte anodine, initialement destinée à un local technique, s'est révélée ouvrir sur un espace boisé de dimensions largement supérieures au volume physique disponible derrière elle.",
    description:
      "SCP-860 est un espace non-euclidien accessible par une porte standard, se présentant comme une forêt dense de dimensions apparemment illimitées, peuplée d'une flore non répertoriée (dont l'espèce d'arbres dite « Vanqar ») et d'une faune mineure non hostile documentée à ce jour. La durée écoulée à l'intérieur de SCP-860 ne correspond pas toujours à la durée perçue à l'extérieur, avec des écarts pouvant atteindre plusieurs heures pour quelques minutes de présence rapportées par les sujets.",
    incidents: [
      {
        date: '2018-04-19',
        summary:
          "Site-22 — Une équipe d'exploration de deux agents perd le contact radio pendant 6 heures alors que leur propre estimation du temps écoulé était de 40 minutes. Les deux agents sont retrouvés sains et saufs près de la porte d'entrée.",
      },
    ],
    tests: [
      {
        date: '2019-08-02',
        researcher: 'Dr. Nakamura',
        result:
          "Déploiement d'une balise GPS autonome sur 24 heures internes estimées. Le signal reste stable mais la position rapportée ne correspond à aucune coordonnée terrestre cohérente, confirmant la nature non-euclidienne de l'espace.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Nakamura',
        content:
          "SCP-860 reste l'un des espaces anormaux les moins hostiles mais les plus déroutants documentés par le Site, en raison de la divergence temporelle systématique entre l'intérieur et l'extérieur de la zone de manifestation.",
      },
    ],
    containmentCost: '13 500$/mois',
    personnelAssigned: 6,
    breachCount: 0,
  },
  {
    slug: 'scp-940',
    number: 'SCP-940',
    name: 'La Meute Silencieuse',
    class: ScpClass.Keter,
    threatLevel: 4,
    containment:
      "En l'absence de spécimen capturé, le confinement de SCP-940 repose sur la cartographie des zones d'activité rapportée et l'interdiction de tout déplacement isolé du personnel dans ces secteurs après la tombée de la nuit.",
    history:
      "SCP-940 est documenté depuis 2016 à travers une série d'attaques nocturnes coordonnées dans des zones rurales isolées, les survivants rapportant unanimement n'avoir entendu absolument aucun bruit avant l'attaque elle-même.",
    description:
      "SCP-940 désigne une population d'entités canines de taille moyenne, dépourvues de toute capacité à produire un son perceptible — ni aboiement, ni bruit de pas, ni respiration audible — leur permettant d'approcher leurs cibles sans aucun signal d'alerte auditif. Les entités chassent en groupe coordonné et se retirent systématiquement dès qu'une source lumineuse intense est dirigée vers elles.",
    incidents: [
      {
        date: '2017-10-30',
        summary:
          "Site-45 — Une patrouille de nuit est attaquée sans avertissement par un groupe estimé à six entités. Un agent est grièvement blessé avant que l'utilisation de fusées éclairantes ne disperse le groupe.",
      },
    ],
    tests: [
      {
        date: '2018-06-15',
        researcher: 'Dr. Halvorsen',
        result:
          "Installation de capteurs acoustiques ultra-sensibles dans une zone à activité confirmée. Aucun signal, y compris infrasonore ou ultrasonore, n'est détecté lors du passage confirmé d'un groupe par caméra thermique.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Halvorsen',
        content:
          "Le port systématique de dispositifs d'éclairage d'urgence est désormais obligatoire pour tout personnel affecté à une ronde nocturne dans un secteur à risque documenté pour SCP-940.",
      },
    ],
    containmentCost: '41 000$/mois',
    personnelAssigned: 15,
    breachCount: 1,
  },
  {
    slug: 'scp-1000',
    number: 'SCP-1000',
    name: "L'Homme des Bois",
    class: ScpClass.Euclid,
    threatLevel: 2,
    containment:
      "En l'absence de spécimen capturé, le confinement de SCP-1000 repose sur la préservation discrète des habitats forestiers reculés connus pour abriter des populations actives et la gestion des témoignages civils par désinformation contrôlée.",
    history:
      "SCP-1000 fait l'objet de témoignages documentés depuis des décennies bien avant l'intervention de la Fondation, sous des désignations populaires variées selon les régions du monde concernées.",
    description:
      "SCP-1000 désigne une espèce d'hominidés non classifiée, de grande taille, discrète et généralement non hostile envers l'humanité sauf provocation directe. Les populations connues vivent en petits groupes familiaux dans des zones forestières reculées et évitent activement tout contact prolongé avec des établissements humains.",
    incidents: [
      {
        date: '2005-07-08',
        summary:
          "Site-81 — Un randonneur civil capture une photographie partielle d'un spécimen, largement diffusée avant que la Fondation ne puisse intervenir. L'incident est géré par une campagne de désinformation classique.",
      },
    ],
    tests: [
      {
        date: '2008-03-21',
        researcher: 'Dr. Costanza',
        result:
          "Observation à distance d'un groupe familial sur plusieurs semaines sans intervention directe. Comportement social structuré confirmé, incluant des comportements d'entraide et de soin envers les jeunes, cohérents avec une intelligence significative.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Costanza',
        content:
          "La politique actuelle de la Fondation envers SCP-1000 privilégie la non-intervention et la préservation discrète de l'espèce plutôt que la capture, sauf en cas de risque de divulgation publique majeure.",
      },
    ],
    containmentCost: '6 200$/mois',
    personnelAssigned: 4,
    breachCount: 0,
  },
  {
    slug: 'scp-1025',
    number: 'SCP-1025',
    name: "L'Encyclopédie des Maladies",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-1025 est conservé fermé dans une pochette scellée au sein d'une armoire verrouillée. Toute consultation nécessite un masque de protection standard et doit être immédiatement suivie d'une décontamination du sujet consultant.",
    history:
      "SCP-1025 a été récupéré en 2000 dans une bibliothèque médicale universitaire après que plusieurs étudiants consécutifs consultant le même ouvrage ont développé des symptômes correspondant exactement à la pathologie qu'ils étaient en train de lire.",
    description:
      "SCP-1025 est un ouvrage encyclopédique répertoriant un grand nombre de maladies, réelles et fictives. Toute personne lisant l'entrée consacrée à une maladie développe, dans les heures suivantes, les symptômes décrits — y compris pour des affections purement fictives inventées pour les besoins de test, suggérant que l'anomalie génère elle-même la pathologie plutôt que de simplement la documenter.",
    incidents: [
      {
        date: '2003-05-06',
        summary:
          "Site-19 — Un chercheur lit accidentellement une entrée non testée lors d'un inventaire de routine et développe des symptômes graves nécessitant une hospitalisation d'urgence. L'entrée est immédiatement classée à haut risque.",
      },
    ],
    tests: [
      {
        date: '2004-12-02',
        researcher: 'Dr. Bright (Site-19)',
        result:
          "Rédaction d'une entrée fictive décrivant une affection inventée sans base médicale réelle, lue par un sujet Classe-D consentant. Le sujet développe les symptômes exacts décrits en moins de six heures, confirmant la génération active de la pathologie par l'objet.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Bright (Site-19)',
        content:
          "SCP-1025 représente un risque biologique classé au même niveau que les agents pathogènes physiques en raison de sa capacité à générer des affections graves à partir d'un simple texte. Sa consultation reste strictement encadrée en conséquence.",
      },
    ],
    containmentCost: '10 700$/mois',
    personnelAssigned: 5,
    breachCount: 1,
  },
  {
    slug: 'scp-1079',
    number: 'SCP-1079',
    name: 'Le Cadran Muet',
    class: ScpClass.Safe,
    threatLevel: 1,
    containment:
      "SCP-1079 est conservé dans une vitrine standard au sein du Département Scientifique, sans mesure de confinement renforcée particulière, son profil de risque étant jugé minimal.",
    history:
      "SCP-1079 a été récupéré en 2012 chez un horloger amateur ayant remarqué que l'objet indiquait systématiquement l'heure exacte quel que soit son état mécanique, y compris après démontage complet de son mécanisme interne.",
    description:
      "SCP-1079 est une montre de gousset dont le cadran affiche en permanence l'heure exacte du fuseau horaire local, indépendamment de tout mécanisme interne fonctionnel — l'objet continue d'indiquer l'heure correcte même vidé de tous ses composants mécaniques.",
    incidents: [],
    tests: [
      {
        date: '2013-02-19',
        researcher: 'Dr. Aubert',
        result:
          "Démontage complet du mécanisme interne suivi d'une observation sur 72 heures. Le cadran continue d'indiquer l'heure exacte sans aucun composant fonctionnel restant à l'intérieur du boîtier.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Aubert',
        content:
          "SCP-1079 est occasionnellement cité comme exemple pédagogique lors des formations internes sur les objets anormaux à très faible risque et à intérêt scientifique principalement théorique.",
      },
    ],
    containmentCost: '200$/mois',
    personnelAssigned: 1,
    breachCount: 0,
  },
  {
    slug: 'scp-1162',
    number: 'SCP-1162',
    name: 'Le Trou dans le Mur',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "La zone de manifestation de SCP-1162 est isolée par une structure de confinement dédiée. Aucun accès n'est autorisé sans équipe minimale de deux agents et un dispositif d'éclairage autonome, le phénomène se manifestant en environnement obscur.",
    history:
      "SCP-1162 a été découvert en 2015 dans un tunnel de service désaffecté, où une ouverture de forme irrégulière dans la paroi rocheuse s'est révélée mener à un espace intérieur sans lien géométrique cohérent avec l'environnement extérieur.",
    description:
      "SCP-1162 est une ouverture de forme irrégulière donnant sur un espace intérieur non-euclidien de dimensions variables selon les expéditions, dont la configuration interne semble se réorganiser entre chaque visite. Aucune faune ou entité hostile n'a été formellement documentée à l'intérieur, mais plusieurs expéditions rapportent une désorientation sévère rendant le retour vers la sortie difficile sans balisage continu.",
    incidents: [
      {
        date: '2016-07-03',
        summary:
          "Site-22 — Une équipe d'exploration perd le fil de balisage lors d'une reconfiguration spontanée de l'espace intérieur. Récupération après 14 heures grâce à un signal radio de secours ; aucune perte humaine.",
      },
    ],
    tests: [
      {
        date: '2017-04-28',
        researcher: 'Dr. Ferreira',
        result:
          "Cartographie photographique systématique sur cinq expéditions consécutives. Aucune configuration interne identique n'est observée d'une expédition à l'autre, confirmant une réorganisation active de l'espace entre chaque accès.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Ferreira',
        content:
          "Toute expédition dans SCP-1162 doit impérativement maintenir un balisage physique continu jusqu'à la sortie, le protocole radio seul s'étant révélé insuffisant lors de l'incident de 2016.",
      },
    ],
    containmentCost: '9 100$/mois',
    personnelAssigned: 4,
    breachCount: 0,
  },
  {
    slug: 'scp-1437',
    number: 'SCP-1437',
    name: "Le Portail d'Ailleurs",
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-1437 est confiné derrière une structure métallique verrouillée empêchant tout accès non autorisé. Toute activation nécessite la présence simultanée de deux membres du personnel habilités et l'enregistrement préalable de la destination visée si celle-ci est connue.",
    history:
      "SCP-1437 a été découvert en 2019 dans une cave résidentielle, où le propriétaire rapportait la disparition récurrente d'objets domestiques réapparaissant ensuite dans des lieux géographiquement éloignés sans explication.",
    description:
      "SCP-1437 est une ouverture de forme circulaire fixée à une paroi, dont l'extrémité de sortie se déplace de façon semi-aléatoire vers différents lieux à travers le monde, réels et vérifiés lors des tests effectués. Tout objet ou individu traversant SCP-1437 émerge à l'emplacement de sortie actuel, sans possibilité de contrôler la destination avec certitude.",
    incidents: [
      {
        date: '2020-01-17',
        summary:
          "Site-08 — Un sujet Classe-D traverse SCP-1437 lors d'un test de routine et émerge dans un lieu public non sécurisé à l'étranger. L'équipe de récupération parvient à l'intercepter avant tout témoin extérieur significatif.",
      },
    ],
    tests: [
      {
        date: '2020-08-04',
        researcher: 'Dr. Whitfield',
        result:
          "Envoi de trente objets marqués sur deux mois. Les points de sortie enregistrés couvrent quatorze pays distincts sans schéma géographique ou temporel identifiable permettant de prédire la prochaine destination.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Whitfield',
        content:
          "En raison du risque de sortie en zone publique non sécurisée, tout passage humain à travers SCP-1437 reste soumis à autorisation exceptionnelle du Directeur de Site et nécessite une équipe de récupération en attente.",
      },
    ],
    containmentCost: '16 000$/mois',
    personnelAssigned: 7,
    breachCount: 1,
  },
  {
    slug: 'scp-3020',
    number: 'SCP-3020',
    name: 'Le Costume Vide',
    class: ScpClass.Euclid,
    threatLevel: 3,
    containment:
      "SCP-3020 est conservé sur un mannequin de présentation au sein d'une chambre verrouillée dépourvue de miroir. Toute session de test doit être menée avec un sujet Classe-D volontaire uniquement, jamais avec du personnel permanent.",
    history:
      "SCP-3020 a été récupéré en 2020 dans le vestiaire d'un théâtre après la disparition d'un acteur ayant revêtu le costume lors d'une répétition, son rôle ayant été repris sans explication par une doublure ne se souvenant pas avoir été engagée.",
    description:
      "SCP-3020 est un costume de scène complet qui, une fois porté, remplace progressivement l'identité perçue du porteur dans la mémoire de son entourage par un personnage fictif cohérent, tandis que le sujet original devient introuvable — non pas disparu physiquement, mais simplement absent de toute mémoire ou trace administrative le concernant.",
    incidents: [
      {
        date: '2021-03-09',
        summary:
          "Site-17 — Un sujet Classe-D porte SCP-3020 lors d'un test de quinze minutes. À l'issue du test, aucun membre de l'équipe présente ne se souvient avoir supervisé de sujet ce jour-là, bien que les enregistrements vidéo confirment sa présence initiale.",
      },
    ],
    tests: [
      {
        date: '2021-09-14',
        researcher: 'Dr. Solberg',
        result:
          "Test avec enregistrement vidéo continu et dossier physique séparé conservé hors site avant le test. Le dossier physique reste intact après l'incident, mais toute référence numérique et toute mémoire du personnel présent sont altérées.",
      },
    ],
    addendums: [
      {
        author: 'Dr. Solberg',
        content:
          "SCP-3020 constitue l'un des rares objets anormaux capables d'altérer directement la mémoire collective d'une équipe entière. Tout protocole de test doit désormais inclure un dossier physique conservé hors site avant toute session.",
      },
    ],
    containmentCost: '12 800$/mois',
    personnelAssigned: 5,
    breachCount: 1,
  },
];

export async function seedScpExpansion3() {
  const patched = await withO5Restrictions(prisma, entries);
  for (const scp of patched) {
    const { slug, incidents, tests, addendums, ...rest } = scp;
    await prisma.scpObject.upsert({
      where: { slug },
      update: { ...rest, incidents, tests, addendums },
      create: { slug, ...rest, incidents, tests, addendums },
    });
  }
  console.log(`SCP expansion (lot 3, final) seeded: ${entries.length}`);
}

if (require.main === module) {
  seedScpExpansion3()
    .catch((err) => {
      console.error(err);
      process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
}

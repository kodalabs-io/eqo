import type { Translations } from "./types.js";

const frFR: Translations = {
  themes: {
    1: "Images",
    2: "Cadres",
    3: "Couleurs",
    4: "Multimédia",
    5: "Tableaux",
    6: "Liens",
    7: "Scripts",
    8: "Éléments obligatoires",
    9: "Structuration de l'information",
    10: "Présentation de l'information",
    11: "Formulaires",
    12: "Navigation",
    13: "Consultation",
  },

  criteria: {
    "1.1": "Chaque image porteuse d'information a-t-elle une alternative textuelle ?",
    "1.2":
      "Chaque image de décoration est-elle correctement ignorée par les technologies d'assistance ?",
    "1.3":
      "Pour chaque image porteuse d'information ayant une alternative textuelle, cette alternative est-elle pertinente (hors cas particuliers) ?",
    "1.4":
      "Pour chaque image utilisée comme CAPTCHA ou comme image-test, ayant une alternative textuelle, cette alternative décrit-elle la nature et la fonction de l'image ?",
    "1.5":
      "Pour chaque image utilisée comme CAPTCHA, une solution d'accès alternatif au contenu ou à la fonction du CAPTCHA est-elle disponible ?",
    "1.6":
      "Chaque image porteuse d'information a-t-elle, si nécessaire, une description détaillée ?",
    "1.7":
      "Pour chaque image porteuse d'information ayant une description détaillée, cette description est-elle pertinente ?",
    "1.8":
      "Chaque image texte porteuse d'information, en l'absence d'un mécanisme de remplacement, doit-elle être remplacée par du texte stylé ?",
    "1.9":
      "Chaque légende d'image est-elle, si nécessaire, correctement reliée à l'image correspondante ?",
    "2.1": "Chaque cadre a-t-il un titre de cadre ?",
    "2.2": "Pour chaque cadre ayant un titre de cadre, ce titre de cadre est-il pertinent ?",
    "3.1":
      "Dans chaque page web, l'information ne doit pas être donnée uniquement par la couleur. Cette règle est-elle respectée ?",
    "3.2":
      "Dans chaque page web, le contraste entre la couleur du texte et la couleur de son arrière-plan est-il suffisamment élevé ?",
    "3.3":
      "Dans chaque page web, les couleurs utilisées dans les composants d'interface ou les éléments graphiques porteurs d'informations sont-elles suffisamment contrastées ?",
    "4.1":
      "Chaque média temporel pré-enregistré a-t-il, si nécessaire, une transcription textuelle ou une audiodescription ?",
    "4.2":
      "Pour chaque média temporel pré-enregistré ayant une transcription textuelle ou une audiodescription, celles-ci sont-elles pertinentes ?",
    "4.3":
      "Chaque média temporel synchronisé pré-enregistré a-t-il, si nécessaire, des sous-titres synchronisés ?",
    "4.4":
      "Pour chaque média temporel synchronisé pré-enregistré ayant des sous-titres synchronisés, ces sous-titres sont-ils pertinents ?",
    "4.5": "Chaque média temporel pré-enregistré a-t-il, si nécessaire, une audiodescription ?",
    "4.6":
      "Pour chaque média temporel pré-enregistré ayant une audiodescription, celle-ci est-elle pertinente ?",
    "4.7": "Chaque média temporel est-il clairement identifiable (hors cas particuliers) ?",
    "4.8":
      "Chaque média non temporel a-t-il, si nécessaire, une alternative (hors cas particuliers) ?",
    "4.9":
      "Pour chaque média non temporel ayant une alternative, cette alternative est-elle pertinente ?",
    "4.10": "Chaque son déclenché automatiquement est-il contrôlable par l'utilisateur ?",
    "4.11":
      "La consultation de chaque média temporel est-elle, si nécessaire, contrôlable par le clavier et tout dispositif de pointage ?",
    "4.12":
      "La consultation de chaque média non temporel est-elle contrôlable par le clavier et tout dispositif de pointage ?",
    "4.13":
      "Chaque média temporel et non temporel est-il compatible avec les technologies d'assistance ?",
    "5.1": "Chaque tableau de données complexe a-t-il un résumé ?",
    "5.2": "Pour chaque tableau de données complexe ayant un résumé, celui-ci est-il pertinent ?",
    "5.3": "Pour chaque tableau de mise en forme, le contenu linéarisé reste-t-il compréhensible ?",
    "5.4":
      "Pour chaque tableau de données ayant un titre, le titre est-il correctement associé au tableau de données ?",
    "5.5": "Pour chaque tableau de données ayant un titre, celui-ci est-il pertinent ?",
    "5.6":
      "Pour chaque tableau de données, chaque en-tête de colonne et chaque en-tête de ligne sont-ils correctement déclarés ?",
    "5.7":
      "Pour chaque tableau de données, la technique appropriée permettant d'associer chaque cellule à ses en-têtes est-elle utilisée ?",
    "5.8":
      "Chaque tableau de mise en forme ne doit pas utiliser d'éléments propres aux tableaux de données.",
    "6.1": "Chaque lien est-il explicite (hors cas particuliers) ?",
    "6.2": "Dans chaque page web, chaque lien a-t-il un intitulé ?",
    "7.1": "Chaque script est-il, si nécessaire, compatible avec les technologies d'assistance ?",
    "7.2": "Pour chaque script ayant une alternative, cette alternative est-elle pertinente ?",
    "7.3": "Chaque script est-il contrôlable par le clavier et par tout dispositif de pointage ?",
    "7.4": "Pour chaque script qui initie un changement de contexte, l'utilisateur est-il averti ?",
    "7.5":
      "Dans chaque page web, les messages de statut sont-ils correctement restitués par les technologies d'assistance ?",
    "8.1": "Chaque page web est-elle définie par un type de document ?",
    "8.2":
      "Pour chaque page web, le code source généré est-il valide selon le type de document spécifié ?",
    "8.3": "Dans chaque page web, la langue par défaut est-elle présente ?",
    "8.4": "Pour chaque page web ayant une langue par défaut, le code de langue est-il pertinent ?",
    "8.5": "Chaque page web a-t-elle un titre de page ?",
    "8.6": "Pour chaque page web ayant un titre de page, ce titre est-il pertinent ?",
    "8.7":
      "Dans chaque page web, chaque changement de langue est-il indiqué dans le code source (hors cas particuliers) ?",
    "8.8":
      "Dans chaque page web, le code de langue de chaque changement de langue est-il valide et pertinent ?",
    "8.9":
      "Dans chaque page web, les balises ne doivent pas être utilisées uniquement à des fins de présentation.",
    "8.10": "Dans chaque page web, les changements du sens de lecture sont-ils signalés ?",
    "9.1":
      "Dans chaque page web, l'information est-elle structurée par l'utilisation appropriée de titres ?",
    "9.2":
      "Dans chaque page web, la structure du document est-elle cohérente (hors cas particuliers) ?",
    "9.3": "Dans chaque page web, chaque liste est-elle correctement structurée ?",
    "9.4": "Dans chaque page web, chaque citation est-elle correctement indiquée ?",
    "10.1":
      "Dans le site web, des feuilles de styles sont-elles utilisées pour contrôler la présentation de l'information ?",
    "10.2":
      "Dans chaque page web, le contenu visible porteur d'information reste-t-il présent lorsque les feuilles de styles sont désactivées ?",
    "10.3":
      "Dans chaque page web, l'information reste-t-elle compréhensible lorsque les feuilles de styles sont désactivées ?",
    "10.4":
      "Dans chaque page web, le texte reste-t-il lisible lorsque la taille des caractères est augmentée jusqu'à 200% ?",
    "10.5":
      "Dans chaque page web, les déclarations CSS de couleurs de fond d'élément et de police sont-elles faites conjointement ?",
    "10.6":
      "Dans chaque page web, chaque lien dont la nature n'est pas évidente est-il visible par rapport au texte environnant ?",
    "10.7":
      "Dans chaque page web, pour chaque élément recevant le focus, la prise de focus est-elle visible ?",
    "10.8":
      "Pour chaque page web, les contenus cachés ont-ils vocation à être ignorés par les technologies d'assistance ?",
    "10.9":
      "Dans chaque page web, l'information ne doit pas être donnée uniquement par la forme, la taille ou la position.",
    "10.10":
      "Dans chaque page web, l'information ne doit pas être donnée par la forme, la taille ou la position uniquement.",
    "10.11":
      "Pour chaque page web, les contenus peuvent-ils être présentés sans perte d'information ou de fonctionnalité et sans défilement horizontal ?",
    "10.12":
      "Dans chaque page web, les propriétés d'espacement du texte peuvent-elles être redéfinies par l'utilisateur sans perte de contenu ou de fonctionnalité ?",
    "10.13":
      "Dans chaque page web, les contenus additionnels apparaissant à la prise de focus ou au survol d'un composant d'interface sont-ils contrôlables par l'utilisateur ?",
    "10.14":
      "Dans chaque page web, les contenus additionnels apparaissant via les styles CSS peuvent-ils être rendus visibles au clavier et par tout dispositif de pointage ?",
    "11.1": "Chaque champ de formulaire a-t-il une étiquette ?",
    "11.2":
      "Chaque étiquette associée à un champ de formulaire est-elle pertinente (hors cas particuliers) ?",
    "11.3":
      "Dans chaque formulaire, chaque étiquette associée à un champ de formulaire ayant la même fonction et répétée plusieurs fois dans une même page ou dans un ensemble de pages est-elle cohérente ?",
    "11.4":
      "Dans chaque formulaire, chaque étiquette de champ et son champ associé sont-ils accolés ?",
    "11.5": "Dans chaque formulaire, les champs de même nature sont-ils regroupés, si nécessaire ?",
    "11.6":
      "Dans chaque formulaire, chaque regroupement de champs de même nature a-t-il une légende ?",
    "11.7":
      "Dans chaque formulaire, chaque légende associée à un regroupement de champs est-elle pertinente ?",
    "11.8":
      "Dans chaque formulaire, les items de même nature d'une liste de choix sont-ils regroupés de manière pertinente ?",
    "11.9":
      "Dans chaque formulaire, l'intitulé de chaque bouton est-il pertinent (hors cas particuliers) ?",
    "11.10": "Dans chaque formulaire, le contrôle de saisie est-il utilisé de manière pertinente ?",
    "11.11":
      "Dans chaque formulaire, le contrôle de saisie est-il accompagné, si nécessaire, de suggestions facilitant la correction des erreurs de saisie ?",
    "11.12":
      "Pour chaque formulaire qui modifie ou supprime des données, ou qui transmet des réponses à un test ou à un examen, ou dont la validation a des conséquences financières ou juridiques, les données saisies peuvent-elles être modifiées, mises à jour ou récupérées par l'utilisateur ?",
    "11.13":
      "La finalité d'un champ de saisie peut-elle être déduite pour faciliter le remplissage automatique des champs avec les données de l'utilisateur ?",
    "12.1": "Chaque ensemble de pages dispose-t-il de deux systèmes de navigation au moins ?",
    "12.2":
      "Dans chaque ensemble de pages, le menu et les barres de navigation sont-ils toujours à la même place ?",
    "12.3": "La page « plan du site » est-elle pertinente ?",
    "12.4":
      "Dans chaque ensemble de pages, la page « plan du site » est-elle accessible à partir de n'importe quelle page ?",
    "12.5":
      "Dans chaque ensemble de pages, le moteur de recherche est-il atteignable de n'importe quelle page ?",
    "12.6":
      "Les zones de regroupement de contenus présentes dans plusieurs pages web sont-elles identifiables par l'utilisateur ?",
    "12.7":
      "Dans chaque page web, un lien d'évitement ou d'accès rapide à la zone de contenu principale est-il présent ?",
    "12.8": "Dans chaque page web, l'ordre de tabulation est-il cohérent ?",
    "12.9": "Dans chaque page web, la navigation ne doit pas contenir de piège au clavier.",
    "12.10":
      "Dans chaque page web, les raccourcis clavier n'utilisant qu'une seule touche (lettre majuscule ou minuscule, ponctuation, chiffre ou symbole) sont-ils contrôlables par l'utilisateur ?",
    "12.11":
      "Dans chaque page web, les contenus additionnels apparaissant au survol, à la prise de focus ou à l'activation d'un composant d'interface sont-ils si nécessaire atteignables au clavier ?",
    "13.1":
      "Pour chaque page web, l'utilisateur a-t-il le contrôle de chaque limite de temps modifiant le contenu ?",
    "13.2":
      "Dans chaque page web, l'ouverture d'une nouvelle fenêtre ne doit pas être déclenchée sans que l'utilisateur en soit averti.",
    "13.3":
      "Dans chaque page web, chaque document bureautique en téléchargement possède-t-il, si nécessaire, une version accessible ?",
    "13.4":
      "Pour chaque document bureautique ayant une version accessible, cette version offre-t-elle la même information ?",
    "13.5":
      "Dans chaque page web, chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) a-t-il une alternative ?",
    "13.6":
      "Dans chaque page web, pour chaque contenu cryptique (art ASCII, émoticône, syntaxe cryptique) ayant une alternative, cette alternative est-elle correctement restituée par les technologies d'assistance ?",
    "13.7":
      "Dans chaque page web, les changements brusques de luminosité ou les effets de flash sont-ils correctement utilisés ?",
    "13.8":
      "Dans chaque page web, chaque contenu en mouvement ou clignotant est-il contrôlable par l'utilisateur ?",
    "13.9":
      "Dans chaque page web, le contenu proposé est-il consultable quelle que soit l'orientation de l'affichage ?",
    "13.10":
      "Dans chaque page web, les fonctionnalités utilisables ou disponibles au moyen d'un geste complexe peuvent-elles être également disponibles au moyen d'un geste simple ?",
    "13.11":
      "Dans chaque page web, les actions déclenchées au moyen d'un dispositif de pointage sur un point unique de l'écran peuvent-elles faire l'objet d'une annulation ?",
    "13.12":
      "Dans chaque page web, les fonctionnalités qui impliquent un mouvement de l'appareil ou vers l'appareil peuvent-elles être satisfaites de manière alternative ?",
  },

  tests: {
    "1.1.1":
      'Chaque <img> ou élément avec role="img" porteur d\'information a une alternative textuelle',
    "1.1.2": "Chaque zone <area> porteuse d'information a une alternative textuelle",
    "1.1.3": 'Chaque <input type="image"> a une alternative textuelle',
    "1.1.5": 'Chaque <svg role="img"> porteur d\'information a un nom accessible',
    "2.1.1": "Chaque <iframe> possède un attribut title",
    "2.2.1": "Le title de chaque <iframe> est non vide et pertinent",
    "5.4.1": "Le titre de chaque tableau de données est associé via <caption> ou aria-labelledby",
    "5.6.1": "Chaque en-tête de colonne utilise <th> ou un rôle approprié",
    "6.2.1": "Chaque lien a un intitulé accessible non vide",
    "8.1.1": "Chaque page a une déclaration DOCTYPE",
    "8.2.1": "Aucun attribut id en doublon sur la même page",
    "8.3.1": "L'élément <html> possède un attribut lang",
    "8.4.1": "La valeur de l'attribut lang est un code de langue BCP 47 valide",
    "8.5.1": "Chaque page possède un élément <title>",
    "8.6.1": "Le <title> de chaque page est non vide",
    "8.9.1":
      "Les balises de présentation (b, i, u, blink, marquee) ne sont pas utilisées à des fins purement stylistiques",
    "9.1.1": "Des titres sont présents sur la page",
    "9.1.2": "Les niveaux de titre ne sautent pas de niveau",
    "9.1.3": "Un seul <h1> est présent sur la page",
    "9.3.1": "Les <ul>, <ol> et <dl> sont correctement structurés",
    "11.1.1": "Chaque <input> a un <label> ou une étiquette ARIA associée",
    "11.1.2": "Chaque <textarea> a un <label> ou une étiquette ARIA associée",
    "11.1.3": "Chaque <select> a un <label> ou une étiquette ARIA associée",
    "11.6.1": "Chaque <fieldset> a un <legend>",
    "11.6.2":
      'Chaque groupe avec role="group" ou role="radiogroup" a aria-labelledby ou aria-label',
    "11.9.1": "Chaque <button> a un nom accessible non vide",
    "11.13.1":
      "Les champs de formulaire collectant des données personnelles ont un attribut autocomplete approprié",
    "12.6.1":
      "Les zones de contenu utilisent <header>, <nav>, <main>, <footer> ou des équivalents ARIA",
    "12.7.1": "Un lien d'évitement vers le contenu principal est présent et fonctionnel",
    "12.9.1": "La navigation au clavier ne crée pas de piège au clavier",
  },

  issues: {
    "img.missing-alt": "L'image est dépourvue d'alternative textuelle (attribut alt manquant)",
    "img.missing-alt-on-role-img":
      'L\'élément avec role="img" est dépourvu de nom accessible (aria-label ou aria-labelledby)',
    "img.empty-alt-missing": "L'image porteuse d'information n'a pas d'alternative textuelle",
    "img.input-image-missing-alt":
      '<input type="image"> est dépourvu d\'alternative textuelle (attribut alt manquant)',
    "img.svg-missing-accessible-name": '<svg role="img"> est dépourvu de nom accessible',
    "img.decorative-has-alt":
      'L\'image de décoration devrait avoir alt="" et aucune autre alternative textuelle',
    "img.decorative-svg-not-hidden": 'Le <svg> décoratif doit avoir aria-hidden="true"',
    "img.figcaption-not-in-figure": "<figcaption> doit être un enfant direct de <figure>",
    "img.figure-missing-img": "<figure> contenant un <figcaption> devrait aussi contenir une image",
    "frame.missing-title": "<iframe> est dépourvu d'attribut title",
    "frame.empty-title": "<iframe> a un attribut title vide",
    "table.missing-caption": "Le tableau de données est dépourvu de <caption> ou de nom accessible",
    "table.th-missing-scope": "<th> est dépourvu d'attribut scope",
    "table.layout-has-th":
      'Le tableau de mise en forme (role="presentation") contient un élément <th>',
    "table.layout-has-caption":
      'Le tableau de mise en forme (role="presentation") contient un élément <caption>',
    "link.missing-label":
      "Le lien n'a pas de nom accessible (pas de contenu texte, aria-label, ni aria-labelledby)",
    "link.empty-label": "Le lien a un nom accessible vide",
    "html.missing-lang": "L'élément <html> est dépourvu d'attribut lang",
    "html.empty-lang": "L'élément <html> a un attribut lang vide",
    "html.invalid-lang": "Code de langue invalide sur l'élément <html> : {lang}",
    "html.missing-title": "La page est dépourvue d'élément <title>",
    "html.empty-title": "Le <title> de la page est vide",
    "html.presentational-tag": "<{tag}> utilisé à des fins purement présentationnelles",
    "html.duplicate-id": 'id="{id}" en doublon sur la page',
    "heading.skipped-level": "Saut de niveau de titre : <h{from}> suivi de <h{to}>",
    "heading.multiple-h1": "Plusieurs éléments <h1> trouvés sur la même page",
    "heading.no-headings": "Aucun titre trouvé sur la page",
    "list.invalid-child":
      "<{parent}> contient un enfant direct invalide <{child}> (attendu : <li>)",
    "list.item-outside-list": "<li> n'est pas un enfant de <ul> ou <ol>",
    "form.missing-label":
      "<{tag}> est dépourvu d'étiquette accessible (pas de <label>, aria-label ni aria-labelledby)",
    "form.fieldset-missing-legend": "<fieldset> est dépourvu d'élément <legend>",
    "form.group-missing-label": 'L\'élément avec role="{role}" est dépourvu de nom accessible',
    "form.button-missing-label": "<button> est dépourvu de nom accessible",
    "form.submit-empty-value": '<input type="{type}"> est dépourvu d\'attribut value',
    "form.missing-autocomplete":
      "Le champ collectant des données « {purpose} » est dépourvu d'attribut autocomplete",
    "a11y.color-contrast": "Contraste de couleur insuffisant : {ratio} (requis : {required})",
    "a11y.focus-not-visible": "L'élément n'a pas d'indicateur de focus visible",
    "a11y.keyboard-trap": "Le focus clavier est piégé à l'intérieur de cet élément",
    "a11y.missing-skip-link": "Aucun lien d'évitement de navigation trouvé",
    "a11y.missing-landmark":
      'La page est dépourvue de zone de contenu principale (<main> ou role="main")',
    "a11y.status-message-missing-role":
      'Le conteneur de message de statut est dépourvu de aria-live ou role="status"',
  },

  remediation: {
    "img.missing-alt": 'Ajouter alt="Description de l\'image" ou alt="" si l\'image est décorative',
    "img.missing-alt-on-role-img":
      'Ajouter aria-label="Description" ou aria-labelledby pointant vers un élément texte visible',
    "img.input-image-missing-alt":
      'Ajouter alt="Description de l\'action du bouton" pour décrire la fonction du bouton',
    "img.svg-missing-accessible-name":
      "Ajouter <title> à l'intérieur du SVG ou aria-label sur l'élément",
    "img.decorative-has-alt":
      'Définir alt="" et supprimer les attributs title, aria-label et aria-labelledby',
    "img.decorative-svg-not-hidden": 'Ajouter aria-hidden="true" sur l\'élément <svg>',
    "frame.missing-title": 'Ajouter un attribut title : <iframe title="Description du cadre">',
    "frame.empty-title": "Fournir un titre significatif et non vide décrivant le contenu du cadre",
    "table.missing-caption":
      "Ajouter <caption>Titre du tableau</caption> comme premier enfant du <table>",
    "table.th-missing-scope":
      'Ajouter scope="col" pour les en-têtes de colonne ou scope="row" pour les en-têtes de ligne',
    "table.layout-has-th":
      'Remplacer <th> par <td> dans les tableaux de mise en forme, ou supprimer role="presentation"',
    "link.missing-label":
      "Ajouter du contenu texte visible, un attribut aria-label ou utiliser aria-labelledby",
    "html.missing-lang": '<html lang="fr"> (ou le code de langue de votre page)',
    "html.invalid-lang": "Utiliser un code de langue BCP 47 valide (ex : fr, en, fr-FR, en-US)",
    "html.missing-title": "Ajouter <title>Titre de la page — Nom du site</title> dans le <head>",
    "html.empty-title": "Fournir un titre de page descriptif",
    "html.presentational-tag":
      "Utiliser CSS pour la mise en forme plutôt que des éléments HTML présentationnels",
    "html.duplicate-id": "S'assurer que chaque attribut id est unique dans la page",
    "heading.skipped-level": "Maintenir une hiérarchie de titres logique sans sauter de niveaux",
    "heading.multiple-h1": "N'utiliser qu'un seul <h1> par page pour identifier le sujet principal",
    "heading.no-headings": "Ajouter des titres pour structurer le contenu de la page",
    "list.invalid-child": "N'utiliser que des <li> comme enfants directs de <ul> et <ol>",
    "form.missing-label":
      'Utiliser <label for="idDuChamp"> ou ajouter aria-label / aria-labelledby au champ',
    "form.fieldset-missing-legend":
      "Ajouter <legend>Titre du groupe</legend> comme premier enfant du <fieldset>",
    "form.button-missing-label": "Ajouter du contenu texte ou un aria-label au bouton",
    "form.missing-autocomplete":
      'Ajouter autocomplete="{purpose}" pour aider les utilisateurs à saisir leurs données personnelles',
    "a11y.color-contrast":
      "Ajuster la couleur du texte ou de l'arrière-plan pour atteindre un ratio de contraste minimum de 4,5:1 (3:1 pour le grand texte)",
    "a11y.focus-not-visible":
      "S'assurer que les styles :focus ne sont pas supprimés (outline: none est interdit sans indicateur personnalisé)",
    "a11y.missing-skip-link":
      'Ajouter <a href="#contenu-principal" class="sr-only focus:not-sr-only">Aller au contenu</a>',
    "a11y.missing-landmark":
      'Encadrer le contenu principal dans un élément <main> ou ajouter role="main"',
  },

  automationLevel: {
    full: "Entièrement automatisé",
    partial: "Partiellement automatisé",
    manual: "Nécessite une vérification manuelle",
  },

  criterionStatus: {
    validated: "Conforme",
    invalidated: "Non conforme",
    "not-applicable": "Non applicable",
    "needs-review": "À vérifier manuellement",
  },

  severity: {
    error: "Erreur",
    warning: "Avertissement",
    notice: "Information",
  },

  report: {
    title: "Rapport d'accessibilité RGAA v4.1.2",
    generated: "Généré le",
    project: "Projet",
    pages: "Pages analysées",
    summary: "Résumé",
    totalCriteria: "Total critères",
    applicable: "Applicables",
    validated: "Conformes",
    invalidated: "Non conformes",
    notApplicable: "Non applicables",
    needsReview: "À vérifier",
    complianceRate: "Taux de conformité",
    themes: "Thématiques",
    issues: "Problèmes",
    noIssues: "Aucun problème trouvé",
    file: "Fichier",
    line: "Ligne",
    element: "Élément",
    page: "Page",
    criterion: "Critère",
    test: "Test",
    severity: "Gravité",
    remediation: "Comment corriger",
    automationDisclaimer:
      "Note : Ce rapport couvre uniquement les critères vérifiables automatiquement. " +
      "Les critères marqués « À vérifier » nécessitent une inspection manuelle. " +
      "Le taux de conformité reflète uniquement les vérifications automatisées.",
  },

  cli: {
    analyzing: "Analyse de la conformité RGAA v4.1.2…",
    staticPhase: "Analyse statique (fichiers source)",
    runtimePhase: "Analyse dynamique (pages rendues)",
    reportWritten: "Rapport écrit dans {path}",
    done: "Analyse terminée",
    failed: "Échec de l'analyse",
    thresholdExceeded:
      "Le taux de conformité {rate}% est inférieur au seuil requis de {threshold}%",
    noConfig: "Aucun fichier de configuration trouvé. Exécutez `eqo init` pour en créer un.",
    configCreated: "Fichier de configuration créé dans {path}",
  },
};

export default frFR;

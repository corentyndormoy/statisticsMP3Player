# Lecteur MP3 avec Statistiques

L'application permet de sauvegarder votre temps de lecture pour chaque musique.


## Ce qu'offre l'application
Avec ce lecteur MP3, vous pouvez écouter les sons déposés côté serveur.
L'application se charge d'enregistrer votre temps de lecture.
Vous pouvez récupérer ces informations dans un fichier .csv lisible par le Historical Ranking Data Visualization pour savoir quelle est votre musique préférée.


## Comment l'utiliser
Le lecteur MP3 vous propose:
- Lancer ou mettre en pause vos musiques;
- Avancer la progression de la musique en cours;
- Changer le volume;
- Lancer la musique précédente;
- Lancer la musique suivante;
- Afficher/cacher les musiques (il se peut que la liste nécessite de cacher puis d'afficher à nouveau la liste pour qu'elle soit apparante);
- Changer de musique en cliquant directement sur un titre dans la liste des musiques.

Un bouton permet de télécharger un fichier CSV de vos temps de lecture.
Ce fichier peut être lu par le Historical Ranking Data Visualization.

Les musiques doivent se trouver dans js/media (pour des soucis de lecture, l'application ne détecte pas le dossier media s'il se trouve dans un autre dossier que js, html ou css. Trouver une solition).


## Technologies
Application JS qui tourne avec Node JS.
Node JS: https://nodejs.org/

Utilisation de Vue JS pour la communication serveur-client.
Vue.js: https://vuejs.org/

La bibliothéque utilisée pour le lecteur MP3 est SoundManager2.
SoundManager2: http://www.schillmania.com/projects/soundmanager2/

Bar UI provenant de SoundManager2.
Bar UI: http://www.schillmania.com/projects/soundmanager2/demo/bar-ui/

Tableur CSV lisible par le Historical Ranking Data Visualization.
Historical Ranking Data Visualization: https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js
(README anglais: https://github.com/Jannchie/Historical-ranking-data-visualization-based-on-d3.js/blob/master/readme-en.md)


## Futures fonctionnalités
1. Ajouter une fonction de lecture aléatoire.
2. Ajouter une fonction de lecture bouclée.
3. Obtenir des statistiques par clique (+1 par lecture).
4. Obtenir des statistiques par pourcentage d'écoute.
5. Ajouter une option "tendance" qui diminue le score d'une lecture au travers du temps (statistiques).
6. Enregistrer la dernière lecture lors de l'arrêt de l'application.
7. Enregistrer les pauses en base de données.
8. Proposer d'arrêter la lecture ou l'application après un certain temps ou après un certain nombre de lecture définie par l'utilisateur.


## Améliorations
1. La liste des musiques nécessite d'être caché puis affiché de nouveau pour être apparante. Il faut pouvoir l'afficher dès son chargement.
2. Il faut ajouter une animation sur le bouton d'enregistrement pour que l'utilisateur comprenne que l'application est en cours de traitement.
3. Lorsque l'utilisateur enregistre les statistiques, le fichier est seulement stocké dans le serveur, mais n'est pas téléchargé par l'utilisateur. L'utilisatoir doit pouvoir télécharger son fichier CSV.
4. Les fichiers CSV sont enregistrés à la racine. Les enregistrer dans un dossier précis.
5. Le dossier de "media" se trouve dans le dossier "js" car n'est pas trouvé par l'application s'il se trouve à la racine. Ranger les dossiers de manière cohérente.
6. Soigner l'interface (CSS).
7. Déplacer des fonctions propres aux requêtes côté serveur.
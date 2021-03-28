const app = new Vue({
    el: "#app",
    // --------------------------- DONNES
    data: {
        mediaMusic: [],     //fichiers musiques stockés sur le serveur
        dbMusics: [],       //les objets musiques enregistrés dans la base de données
        newMusicStat: { },  //nouvel objet musique à enregistrer dans la base de données
        read: { },          //objet lecture à enregistrer dans la base de données
        dbReads: [],        //array des lectures enregistrées dans la base de données
        pause: {},          //objet pause à enregistrer dans la base de données
        pauses: [],         //array, comprend les différents objets pause de la lecture
        pauseTime: 0,       //int, temps de pause en secondes
        pauseStartingDate: new Date(),  //datetime, date de début de pause
        first: true,        //boolean qui détermine s'il s'agit de la première écoute
        onRead: true,       //boolean - toggle, qui permet de déterminer si la musique est en lecture ou en pause
    },
    // --------------------------- METHODES
    methods: {
        /**
         * Récupère tous les titres enregistrés dans la base de données et les enregistre dans l'attribut dbMusics
         * 
         * @return void
         */
        setDbMusic: async function() {
            await this.ajax("/saved-musics-names").then(function(response) {
                this.dbMusics = response.body
            })
        },

        /**
         * Récupère l'id d'une musique enregistrée dans la base de données en fonction d'un titre
         * @todo: faire la requête côté serveur
         * 
         * @param string title 
         * @returns string|null
         */
        findIdByTitle: function(title) {
            let musicId = null;
            this.dbMusics.forEach(function(music){
                if (music.name == title) {
                    musicId = music._id;
                }
            });

            return musicId;
        },

        /**
         * Récupère le titres de toutes les musiques enregistrées dans la base de données (depuis l'attribut dbMusics)
         * @todo: faire la requête côté serveur
         * 
         * @returns array
         */
        findTitles: function() {
            let musicNames = [];
            this.dbMusics.forEach(function(music){
                musicNames.push(music.name);
            });

            return musicNames;
        },

        /**
         * Récupère l'id d'une lecture en fonction d'une date de fin
         * @todo: faire la requête côté serveur
         * 
         * @param string endingDate 
         * @returns string|null
         */
        findReadIdByEndingDate: function(endingDate) {
            let readId = null;
            this.ajax("reads").then(function(response) {
                this.dbReads = response.body
            });

            this.dbReads.forEach(function(read){
                if (read.ending_date == endingDate) {
                    readId = read._id;
                }
            });

            return readId;
        },

        /**
         * Procédure lors d'un changement de musique.
         * Se produit lorsque l'utilisateur clique sur 'Suivant', 'Précédent' ou sur une autre musique.
         * Enregistre une lecture et une musique si celle-ci n'existe pas en base de données.
         * 
         * @todo: ranger les musiques dans le bon dossier
         * 
         * @return void
         */
        changeMusic: async function() {
            if (!this.first) {

                //Récupère le titre lu
                let currentTitle = document.querySelector("#currentTitle");
                if (currentTitle === null) {
                    //Si le titre est trop long et qu'il défile, alors il n'est plus dans le même élément
                    currentTitle = document.querySelector("marquee").textContent;
                } else {
                    currentTitle = currentTitle.innerText;
                }

                this.newMusicStat = {
                    name: currentTitle
                };

                let musicNames = this.findTitles();

                //Enregistre le titre s'il n'est pas déjà présent dans la base de données
                if (!musicNames.includes(currentTitle)) {
                    await this.ajax("/music-stat/add", this.newMusicStat).then(function() {
                        this.dbMusics.push(this.newMusicStat);
                    });

                    await this.setDbMusic();
                }

                let musicId = this.findIdByTitle(currentTitle);

                //Calcul du temps de pause
                let pauseTime = 0;
                this.pauses.forEach(function(pause){
                    pauseTime += pause.time_in_seconds;
                });
                this.pauses = [];

                //Si l'état de la lecture est en pause lors du changement de musique, alors on considère que la date de fin de lecture est la date de début de la dernière pause
                let endingDate = this.pauseStartingDate;
                if (this.onRead) {
                    endingDate = this.getNow();
                }
                
                //Enregistre une lecture
                this.read.ending_date = endingDate;
                this.read.music_id = musicId;
                this.read.time_in_seconds = this.getSecondsDifference(this.read.starting_date, endingDate);
                this.read.time_with_pauses_in_seconds = this.read.time_in_seconds - this.pauseTime;
                this.read.date_at = this.getToday();

                this.pauseTime = 0;

                await this.ajax("/read/add", this.read)

            } else {
                this.first = false;
            }

            this.initReadForm();
            this.onRead = true;
        },

        /**
         * Gère le temps de pause d'une lecture
         * 
         * @update: enregistrer les pauses dans la base de données
         */
        managePause: function() {
            if (this.first) {
                this.changeMusic();
            } else {
                if (this.onRead) {
                    this.onRead = false;
                    this.pauseStartingDate = this.getNow();
                } else {
                    this.onRead = true;
                    this.pauseTime += this.getSecondsDifference(this.pauseStartingDate, this.getNow());
                }
            }
        },
        
        /**
         * Initialise une lecture
         * 
         * @return void
         */
        initReadForm: function() {
            this.read = {
                starting_date: this.getNow()
            }
        },

        downloadFile: function() {
            this.ajax("/csv")
        },

        /**
         * Retourne la date d'aujourd'hui au format YYYY-MM-DD HH:ii:SS
         * @returns string
         */
        getNow: function() {
            const d = new Date()
            const date = d.toISOString().split('T')[0];
            const time = d.toTimeString().split(' ')[0];

            return `${date} ${time}`;
        },

        /**
         * Retourne la date d'aujourd'hui au format YYYY-MM-DD
         * @returns string
         */
        getToday: function() {
            const d = new Date()
            const date = d.toISOString().split('T')[0];

            return `${date}`;
        },

        /**
         * Calcul la différence de temps entre deux dates, et formate le résultat en secondes
         * 
         * @param string dateOne 
         * @param string dateTwo 
         * @returns int
         */
        getSecondsDifference: function(dateOne, dateTwo) {
            t1 = new Date(dateOne);
            t2 = new Date(dateTwo);
            let dif = t1.getTime() - t2.getTime();
            let Seconds_from_T1_to_T2 = dif / 1000;

            return Math.abs(Seconds_from_T1_to_T2);
        },

        /**
         * Fait une requête AJAX
         * 
         * @param string url 
         * @param collection? params 
         * @returns 
         */
        ajax: function(url, params = { } ) {
            let s = url+"?";
            for(let key in params) {
                s += key + "=" + encodeURIComponent(params[key]) +"&"
            }

            return this.$http.get(s);
        },
    },
    // --------------------------- VALEURS CALCULEES
    computed: {
        /**
         * Retourne les musiques enregistrées sur le serveur ({name: , path:})
         * 
         * @returns mediaMusic
         */
        getMediaMusic: function() {
            return this.mediaMusic;
        }
    },
    // --------------------------- PRINCIPAL
	mounted: async function() {
		await this.ajax("list").then(function(response) {
			this.mediaMusic = response.body
		});

        this.setDbMusic();
        this.initReadForm();
	}
})

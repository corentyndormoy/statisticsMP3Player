const express = require("express")
const app = express()


//-----------------------------------------CONNEXION BD
let MongoClient = require("mongodb").MongoClient;
const client = new MongoClient("mongodb://localhost:27017", 
    { useNewUrlParser: true, useUnifiedTopology: true });

var ObjectId = require('mongodb').ObjectID;

let db = null;
client.connect(err => {
    db = client.db("musics")
})

//-----------------------------------------------------------ROUTES STATIQUES
 
app.use("/css", express.static(__dirname + "/css"))
app.use("/js", express.static(__dirname + "/js"))


//-------------------------------------------------------ROUTE UNIQUE DE FRONT

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/html/index.html")
})

//musiques dans le dossier
//@todo: changer les fichiers de places (chemins non trouvés)
app.get("/list", (req, res) => {
    const mediaFoler = 'js/media';
    const fs = require('fs');

    let musics = [];

    fs.readdirSync(mediaFoler).forEach(file => {
        filename = file.substr(0, file.lastIndexOf("."));
        musics.push({name: filename, path: "../js/media/" + file});
    });

    res.json(musics)
})

//musiques dans la bdd
app.get("/saved-musics-names", (req, res) => {
    db.collection("musics").find({ }).toArray((err, docs) => {
        res.json(docs);
    })
})

//lectures dans la bdd
app.get("/reads", (req, res) => {
    db.collection("read").find({ }).toArray((err, docs) => {
        res.json(docs);
    })
})

//--------------------------------------------------------ROUTE SERVICE (REST)

//ajoute un titre dans la base de données
app.get("/music-stat/add", (req, res) => {
    let music = req.query;
    db.collection("musics").insertOne(music, (err, docs) => {
        res.json(docs.ops);
    })
})

//Ajoute une lecture dans la base de données
app.get("/read/add", (req, res) => {
    let read = req.query;
    db.collection("read").insertOne(read, (err, docs) => {
        res.json(docs.ops);
    })
})

app.get("/dl", (req, res) => {
    const file = `${__dirname}/` + "1616953646861" + `.csv`;
    res.download(file);
})

app.get("/csv", (req, res) => {
    let dataToWrite = "name,type,value,date\n";

    db.collection("read").find({}).sort({date_at: 1}).limit(1).toArray(function(err, minimumDateRead) {
        let processDate = minimumDateRead[0].date_at;

        db.collection("musics").find({}).toArray(function(err, musics) {
            if (err) throw err;
    
            musics.forEach((music) => {
                processDate = new Date(minimumDateRead[0].date_at);

                let score = 0;
                let first = true;
                let displayDate = new Date(minimumDateRead[0].date_at)

                while (processDate <= new Date(getToday())) {
                    //Pour chaque lecture d'une musique à une date
                    db.collection("read").find({
                        music_id: (music._id).toString(),
                        date_at: dateToYYYYMMDD(processDate)
                    }).toArray(function(err, reads) {

                        reads.forEach((read) => {
                            score += Number(read.time_with_pauses_in_seconds);
                        })

                        if (first) {
                            first = false;
                        } else {
                            displayDate = addOneDay(displayDate);
                        }                       


                        dataToWrite += music.name + ",," + score + "," + dateToYYYYMMDD(displayDate) + "\n";
                    })

                    processDate = addOneDay(processDate);
                }
            })
        })
    })

    //@todo: await les fonctions précédentes
    //@todo: meilleur nom de fichier
    setTimeout(function(){
        const fs = require('fs');
        const fileName = new Date().getTime();
        fs.writeFile(fileName + '.csv', dataToWrite, 'utf8', function (err) {
            if (err) {
                console.log('Some error occured - file either not saved or corrupted file saved.');
            } else{
                console.log('It\'s saved!');
            }
        });

        const file = `${__dirname}/` + fileName + `.csv`;
        res.download(file);

        res.sendFile(__dirname + "/html/index.html")
    }, 1000);
})

/**
 * Ajoute 24h et non 1 jour, car ajouter 1 jour n'ajoute que 23h pour certains jours (notamment le 28/03)(heure d'été?)
 * @param {string|Date} date 
 * @returns 
 */
function addOneDay(date) {
    return new Date(new Date(date).getTime() + 60 * 60 * 24 * 1000);
}

/**
 * Retourne la date au format YYYY-MM-DD
 * @returns string
 */
function dateToYYYYMMDD(date) {
    const d = new Date(date)
    const convertDate = d.toISOString().split('T')[0];

    return `${convertDate}`;
}

/**
 * Retourne la date d'aujourd'hui au format YYYY-MM-DD
 * @returns string
 */
    function getToday() {
    const d = new Date()
    const date = d.toISOString().split('T')[0];

    return `${date}`;
}

app.listen(1337)

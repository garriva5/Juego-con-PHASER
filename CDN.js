import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    GoogleAuthProvider,
    FacebookAuthProvider,
    TwitterAuthProvider,
    signInWithPopup,
    GithubAuthProvider,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    setDoc,
    getDocs,
    doc,
    deleteDoc,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-firestore.js";

function playgame() {
    var config = {
        type: Phaser.AUTO,
        width: 860,
        height: 1100,
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 600 },
                debug: false
            }
        },
        scene: {
            preload: preload,
            create: create,
            update: update
        }
    };
    
    var player;
    var stars;
    var bombs;
    var platforms;
    var cursors;
    var score = 0;
    var gameOver = false;
    var scoreText;
    
    var game = new Phaser.Game(config);
    
    function preload ()
    {
        this.load.image('sky', 'assets/fondog.png');
        this.load.image('ground', 'assets/pisoa.png');
        this.load.image('star', 'assets/emi-2.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.spritesheet('dude', 'assets/mono.png', { frameWidth: 32, frameHeight: 48 });
    }
    
    function create ()
    {
        //  A simple background for our game
        this.add.image(400, 300, 'sky').setScale(.9);
    
        //  The platforms group contains the ground and the 2 ledges we can jump on
        platforms = this.physics.add.staticGroup();
    
        //  Here we create the ground.
        //  Scale it to fit the width of the game (the original sprite is 400x32 in size)
        platforms.create(100, 700, 'ground').setScale(50, .5).refreshBody();
    
        //  Now let's create some ledges
        platforms.create(700, 650, 'ground');
        platforms.create(260, 550, 'ground');
        platforms.create(500, 600, 'ground');
        platforms.create(60, 500, 'ground');
        platforms.create(260, 450, 'ground');
        platforms.create(550, 700, 'ground');
        platforms.create(670, 330, 'ground');
        platforms.create(400, 100, 'ground');
        platforms.create(500, 400, 'ground');
        

    
        // The player and its settings
        player = this.physics.add.sprite(100, 450, 'dude');
    
        //  Player physics properties. Give the little guy a slight bounce.
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
    
        //  Our player animations, turning, walking left and walking right.
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
    
        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });
    
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    
        //  Input Events
        cursors = this.input.keyboard.createCursorKeys();
    
        //  Some stars to collect, 12 in total, evenly spaced 70 pixels apart along the x axis
        stars = this.physics.add.group({
            key: 'star',
            setXY: { x: 100, y: 50, stepX: 1000 }
        });
    
        stars.children.iterate(function (child) {
    
            //  Give each star a slightly different bounce
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
        });
    
        bombs = this.physics.add.group();
    
        //  The score
        scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    
        //  Collide the player and the stars with the platforms
        this.physics.add.collider(player, platforms);
        this.physics.add.collider(stars, platforms);
        this.physics.add.collider(bombs, platforms);
    
        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.physics.add.overlap(player, stars, collectStar, null, this);
    
        this.physics.add.collider(player, bombs, hitBomb, null, this);
    }
    
    function update ()
    {
        if (gameOver)
        {
            return;
        }
    
        if (cursors.left.isDown)
        {
            player.setVelocityX(-160);
    
            player.anims.play('left', true);
        }
        else if (cursors.right.isDown)
        {
            player.setVelocityX(160);
    
            player.anims.play('right', true);
        }
        else
        {
            player.setVelocityX(0);
    
            player.anims.play('turn');
        }
    
        if (cursors.up.isDown && player.body.touching.down)
        {
            player.setVelocityY(-330);
        }
    }
    
    function collectStar (player, star)
    {
        star.disableBody(true, true);
    
        //  Add and update the score
        score += 10;
        scoreText.setText('Score: ' + score);
    
        if (stars.countActive(true) === 0)
        {
            //  A new batch of stars to collect
            stars.children.iterate(function (child) {
    
                child.enableBody(true, child.x, 0, true, true);
    
            });
    
            var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
            bomb.allowGravity = false;
    
        }
    }
    
    function hitBomb (player, bomb)
    {
        this.physics.pause();
    
        player.setTint(0xff0000);
    
        player.anims.play('turn');
    
        gameOver = true;
    }
}

const firebaseConfig = {
    apiKey: "AIzaSyBcKoDCCMIBZY8KetZ6jQNTGbtiRfNWKh4",
    authDomain: "pruebas-cf6a8.firebaseapp.com",
    projectId: "pruebas-cf6a8",
    storageBucket: "pruebas-cf6a8.appspot.com",
    messagingSenderId: "33204426779",
    appId: "1:33204426779:web:f7626f4f72efe4708b40be",
    measurementId: "G-GEGVTFQ576",
};

const providergoogle = new GoogleAuthProvider();
const providerfacebook = new FacebookAuthProvider();
const providertwitter = new TwitterAuthProvider();
const providergithub = new GithubAuthProvider();

/*inicializa firebase*/
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Initialize Cloud Firestore and get a reference to the service

//reguistro -------------
const log = document.getElementById("log");
const email = document.getElementById("email");
const pass = document.getElementById("pass");
const registros = document.getElementById("registros");

//reguistro con apps
const gog = document.getElementById("google");
const face = document.getElementById("facebook");
const twitter = document.getElementById("twitter");
const github = document.getElementById("github");
//CRUD------------
//creat---------
const nombre = document.getElementById("nom");
const apellido = document.getElementById("apell");
const edad = document.getElementById("edad");
const crear = document.getElementById("crear");
const guardar = document.getElementById("Guardar");
const cerrar = document.getElementById("cerrar");
//mostrar o leer
const leer = document.getElementById("leer");
const tabla = document.getElementById("tabla");
const inputId = document.getElementById("id");
//update--------
const actualizar = document.getElementById("actualizar");
const buscarAct = document.getElementById("BuscarAct");
const inputActid = document.getElementById("id-ac");
const inputActname = document.getElementById("nombre-ac");
const inputActlast = document.getElementById("apellido-ac");
const inputActedad = document.getElementById("edad-ac");
//delete borrar--------
const borrar = document.getElementById("borrar");

//nesesarios
const header = document.getElementById("header");
const div = document.getElementById("inicio");
const divOcultar = document.getElementById("ocultar");
const cuentasocultas = document.getElementById("cuentas");
const play = document.getElementById("play");
const a = document.getElementById("1");
const regresar = document.getElementById("back");
const juego = document.getElementById("jugar");

//-----mapa------
const showmap = document.getElementById("mostrarmap");
const mapa = document.getElementById("map");
const cerrarmapa = document.getElementById("cerrarmapa");

// const actualizar = document.getElementById("actualizar");
// const borrar = document.getElementById("borrar");

//crear un usuario nuevo
crear.addEventListener("click", function () {
    createUserWithEmailAndPassword(auth, email.value, pass.value)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            alert("Tu cuenta ha sido creada correctamente");
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode + " + " + errorMessage);
            // ..
        });
});

//loguearse como usuario ya existente
log.addEventListener("click", function () {
    signInWithEmailAndPassword(auth, email.value, pass.value)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            alert("inicio de sesion correcta ");
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(errorCode + " + " + errorMessage);
        });
});

registros.addEventListener('click', function ( ) {
    cuentasocultas.classList.remove("hide");
    div.classList.add("hide");
    

});

cerrar.addEventListener("click", function () {
    signOut(auth)
        .then(() => {
            // Sign-out successful.
            div.classList.remove("hide");
            divOcultar.classList.add("hide");
        })
        .catch((error) => {
            // An error happened.
            alert("Error");
            console.log(error);
        });
});

gog.addEventListener("click", function () {
    signInWithPopup(auth, providergoogle)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
});

face.addEventListener("click", function () {
    signInWithPopup(auth, providerfacebook)
        .then((result) => {
            // The signed-in user info.
            const user = result.user;

            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            const credential =
                FacebookAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;

            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = FacebookAuthProvider.credentialFromError(error);
            // ...
        });
});

twitter.addEventListener("click", function () {
    signInWithPopup(auth, providertwitter)
        .then((result) => {
            // This gives you a the Twitter OAuth 1.0 Access Token and Secret.
            // You can use these server side with your app's credentials to access the Twitter API.
            const credential = TwitterAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const secret = credential.secret;

            // The signed-in user info.
            const user = result.user;
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = TwitterAuthProvider.credentialFromError(error);
            // ...
        });
});

github.addEventListener("click", function () {
    signInWithPopup(auth, providergithub)
        .then((result) => {
            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            // The signed-in user info.
            const user = result.user;
            // IdP data available using getAdditionalUserInfo(result)
            // ...
        })
        .catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GithubAuthProvider.credentialFromError(error);
            // ...
        });
});

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log(user.email);
        header.innerHTML = user.email;
        div.classList.add("hide");
        divOcultar.classList.remove("hide");

        // ...
    } else {
        console.log("no user");
        header.innerHTML = "Registrate o inicia sesion";
        // User is signed out
        // ...
    }
});


// --------------------CRUD------------------------
guardar.addEventListener("click", async () => {
    try {
        await setDoc(doc(db, "users", nombre.value), {
            Nombre: nombre.value,
            Region: region.value,
        });
        alert(`Tu Nickname ${nombre.value} se ha creado correctamente!`);
    } catch (error) {
        alert("No has completado todos los datos correspondientes");
        console.error("Error adding document: ", e);
    }
});

leer.addEventListener("click", async () => {
    tabla.innerHTML = `<tr>
        <td> |---Id---| </td>
        <td> |---Nickname---| </td>
        <td> |---Region---| </td>
        <td> |---Score---| </td>
    </tr>`;

    const querySnapshot = await getDocs(collection(db, "users"));
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        tabla.innerHTML += `<tr>
            <td>${doc.id}</td>
            <td>${doc.data().Nombre}</td>
            <td>${doc.data().Region}</td>
        </tr>`;
    });
});

play.addEventListener('click', function(){
    a.classList.remove("hide");
    divOcultar.classList.add("hide")
});

regresar.addEventListener('click', function(){
    a.classList.add("hide");
    divOcultar.classList.remove("hide")
});

borrar.addEventListener("click", async () => {
    await deleteDoc(doc(db, "users", nombre.value));

    alert("Se ha borrado el usuario "  +  nombre.value  + ' junto con sus datos');
});

//-----------------mapbox-----------------
mapboxgl.accessToken =
    "pk.eyJ1IjoiZ2Fycml2YTUiLCJhIjoiY2xkdnY5MzY3MDFhbTQwanFsZHY3ZzR4cCJ9.sq4e3JWrU8ZPE8u84dPRbA";
const map = new mapboxgl.Map({
    container: "map", // container ID
    // Choose from Mapbox's core styles, or make your own style with Mapbox Studio
    style: "mapbox://styles/mapbox/streets-v12", // style URL
    center: [-103.50784, 25.59504], // starting position [lng, lat]
    zoom: 10, // starting zoom
});

const marker1 = new mapboxgl.Marker()
    .setLngLat([-103.50784, 25.59504])
    .addTo(map);

map.addControl(
    new MapboxDirections({
        accessToken: mapboxgl.accessToken,
    })
);

showmap.addEventListener("click", function () {
    mapa.classList.remove("hide");
    showmap.classList.add("hide");
    cerrarmapa.classList.remove("hide");
    a.classList.add("hide");
    
});

cerrarmapa.addEventListener("click", function () {
    mapa.classList.add("hide");
    showmap.classList.remove("hide");
    cerrarmapa.classList.add("hide");
    a.classList.remove("hide");
});

// -----------------------phaser------------
juego.addEventListener("click", function () {
    a.classList.add("hide");
    playgame ()
});






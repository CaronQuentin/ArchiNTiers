let isCriticalPhase = false;

async function handleSignal(signal) {
    if (isCriticalPhase) {
        console.log(`Signal ${signal} reçu. Arrêt impossible pour le moment.`);
        return;
    }

    console.log(`Signal ${signal} reçu.`);
    console.log("Nettoyage en cours...");

    setTimeout(() => {
        console.log("Le processus se termine.");
        process.exit(0);
    }, 5000);
}

process.on("SIGINT", () => handleSignal("SIGINT"));

console.log("Application en cours d'exécution.");
console.log("Appuyez sur CTRL+C pour envoyer un signal.");

setInterval(() => {
    isCriticalPhase = !isCriticalPhase;

    if (isCriticalPhase) {
        console.log("Le processus est en phase critique. Arrêt impossible.");
    } else {
        console.log("Le processus est en phase normale. Arrêt possible.");
    }
}, 5000);

setInterval(() => {
    console.log("Le processus est toujours actif...");
}, 5000);
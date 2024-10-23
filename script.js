// Liste der Halloween-Wörter
const words = ["kuerbis", "geisterhaus", "fledermaus", "spinne", "werwolf", "gruft", "vampir", "herzstichmesser", "totengeist", "menschenfleisch", "folterinstrument", "horrorfilm", "inquisition", "daemon", "kreidebleich", "todsicher", "blutsauger", "herzflimmern", "leichenhaus", "scheintod", "blutstropfen", "transsilvanien", "galgenhumor", "friedhof", "gespenstisch", "sargmodell", "scheiterhaufen", "hinrichtung", "frankenstein", "scharfrichter", "folterkammer", "allerheiligen", "reformationstag", "uebernatuerlich"];

// Globale Variablen
let selectedWord;
let displayedWord;
let wrongGuesses;
let attemptsLeft;
let teamName;

// Bilder für den Galgen
const gallowsImages = [
  "galgen0.png", // leeres Gerüst
  "galgen1.png", // Kopf
  "galgen2.png", // Körper
  "galgen3.png", // ein Arm
  "galgen4.png", // zwei Arme
  "galgen5.png", // ein Bein
  "galgen6.png"  // zwei Beine = Hängen
];

// Starte das Spiel
function startGame() {
  teamName = document.getElementById("teamname").value;
  if (!teamName) {
    alert("Bitte gib deinen Teamnamen ein!");
    return;
  }
  
  // Wähle ein zufälliges Wort
  selectedWord = words[Math.floor(Math.random() * words.length)];
  displayedWord = "_ ".repeat(selectedWord.length);
  wrongGuesses = [];
  attemptsLeft = 6;

  // Aktualisiere die Anzeige
  document.getElementById("word-display").textContent = displayedWord;
  document.getElementById("wrong-letters").textContent = wrongGuesses.join(", ");
  document.getElementById("attempts-left").textContent = attemptsLeft;
  document.getElementById("gallows-image").src = gallowsImages[0];
  
  // Zeige das Spiel und verstecke den Teamnamen-Teil
  document.getElementById("gallows-section").classList.remove("hidden");
  document.getElementById("team-section").classList.add("hidden");
}

// Rate einen Buchstaben
function guessLetter() {
  const input = document.getElementById("letter-input");
  const letter = input.value.toLowerCase();
  input.value = ""; // Leere das Eingabefeld

  if (!letter || wrongGuesses.includes(letter) || displayedWord.includes(letter)) {
    return; // Buchstabe wurde schon versucht oder ist ungültig
  }

  if (selectedWord.includes(letter)) {
    // Wenn der Buchstabe richtig ist, aktualisiere das angezeigte Wort
    let newDisplay = "";
    for (let i = 0; i < selectedWord.length; i++) {
      newDisplay += selectedWord[i] === letter ? letter + " " : displayedWord[i * 2] + " ";
    }
    displayedWord = newDisplay;
    document.getElementById("word-display").textContent = displayedWord;
    
    // Prüfe, ob das Wort vollständig erraten wurde
    if (!displayedWord.includes("_")) {
      endGame("gewonnen");
    }
  } else {
    // Falscher Buchstabe
    wrongGuesses.push(letter);
    attemptsLeft--;
    document.getElementById("wrong-letters").textContent = wrongGuesses.join(", ");
    document.getElementById("attempts-left").textContent = attemptsLeft;
    document.getElementById("gallows-image").src = gallowsImages[6 - attemptsLeft];
    
    if (attemptsLeft === 0) {
      endGame("gehängt");
    }
  }
}

// Beende das Spiel
function endGame(result) {
  const table = document.getElementById("results-table");
  const row = table.insertRow();
  row.insertCell(0).textContent = teamName;
  row.insertCell(1).textContent = result;
  row.insertCell(2).textContent = 6 - attemptsLeft;

  document.getElementById("results-section").classList.remove("hidden");
  document.getElementById("letter-input").disabled = true;
  document.getElementById("message").textContent = result === "gewonnen" ? "Du hast es geschafft!" : `Du wurdest gehängt! Das Wort war: ${selectedWord}`;
}

// Spiel zurücksetzen
function resetGame() {
  document.getElementById("letter-input").disabled = false;
  document.getElementById("message").textContent = "";
  document.getElementById("gallows-section").classList.add("hidden");
  document.getElementById("team-section").classList.remove("hidden");
  document.getElementById("results-section").classList.add("hidden");
}

// Funktion zum Senden der Spielergebnisse an Google Sheets über SheetDB
function sendResultsToSheet(teamName, result, attempts) {
  const data = {
    "data": [
      {
        "Teamname": teamName,
        "Ergebnis": result,
        "Versuche": attempts
      }
    ]
  };

  // SheetDB API-URL, die du von SheetDB erhältst
  const apiUrl = "https://sheetdb.io/api/v1/m9xyqpyrkxqlz";  // Ersetzt durch meine SheetDB-URL

  // Sende Daten mit einem HTTP POST Request
  fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(json => {
    console.log("Ergebnis erfolgreich an Google Sheet gesendet", json);
  })
  .catch(error => {
    console.error("Fehler beim Senden der Daten:", error);
  });
}

// Beispiel: Funktion, die am Ende des Spiels aufgerufen wird
function endGame(result) {
  const teamName = document.getElementById("teamname").value;
  const attemptsLeft = 6 - attemptsLeft;  // Ersetze mit der tatsächlichen Anzahl der Versuche
  
  // Rufe die sendResultsToSheet-Funktion auf
  sendResultsToSheet(teamName, result, attemptsLeft);
}

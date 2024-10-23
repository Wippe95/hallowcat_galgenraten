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
      endGame("verloren");
    }
  }
}
// Funktion zum Senden der Ergebnisse an Google Sheets über SheetDB
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

  // SheetDB API-URL (ersetze YOUR_SHEETDB_API_KEY durch deine API-URL)
  const apiUrl = "https://sheetdb.io/api/v1/m9xyqpyrkxqlz";

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

// Funktion, die am Ende des Spiels aufgerufen wird
function endGame(result) {
  const attemptsUsed = 6 - attemptsLeft;  // Berechnete Anzahl der Versuche
  document.getElementById("message").textContent = result === "gewonnen" ? "Du hast es geschafft!" : `Du wurdest gehängt! Das Wort war: ${selectedWord}`;

  // Ergebnisse an Google Sheet senden
  sendResultsToSheet(teamName, result, attemptsUsed);
}

// Funktion zum Abrufen der Ergebnisse aus Google Sheets über SheetDB
function fetchResults() {
  const apiUrl = "https://sheetdb.io/api/v1/m9xyqpyrkxqlz";

  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const resultsTable = document.getElementById("results-table");
      data.forEach(entry => {
        const row = resultsTable.insertRow();
        row.insertCell(0).textContent = entry.Teamname;
        row.insertCell(1).textContent = entry.Ergebnis;
        row.insertCell(2).textContent = entry.Versuche;
      });
    })
    .catch(error => console.error("Fehler beim Abrufen der Daten:", error));
}

// Ergebnisse beim Laden der Seite anzeigen
window.onload = function() {
  fetchResults();
};



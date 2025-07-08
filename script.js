let discesaCount = 0;
let scaricoInCorso = false;
let pausaInCorso = false;
let turnoInCorso = false;
let log = [];
let currentDiscesa = null;
let startTime = null;

// Inizializzazione esplicita dei contatori per i tipi di raccolta.
const raccoltaCounts = {
  'Sacchetto/Bidoncino': 0,
  '120lt': 0,
  '240lt': 0,
  '360lt': 0,
  '1100lt': 0
};

// Contatori per le segnalazioni (non visibili sui badge)
const segnalazioniCounts = {
  'BidoneDaSostituire': 0,
  'FondoSconnesso': 0,
  'ManovraPericolosa': 0,
  'AbbandonoMezzo': 0,
  'AltraSegnalazione': 0
};

// Funzione helper per sanificare nomi per ID HTML
function getSanitizedId(tipo) {
  return tipo.replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Aggiorna il testo di un badge. Il badge è sempre visibile.
 * @param {string} badgeId L'ID dell'elemento badge (es. 'count-SacchettoBidoncino')
 * @param {number} value Il valore del contatore
 */
function updateBadge(badgeId, value) {
  const el = document.getElementById(badgeId);
  if (el) {
    el.textContent = value;
  }
}

// Inizializza i contatori dei badge a 0 al caricamento della pagina
document.addEventListener('DOMContentLoaded', () => {
  for (const tipo in raccoltaCounts) {
    updateBadge(`count-${getSanitizedId(tipo)}`, raccoltaCounts[tipo]);
  }
});

function updateLogDisplay() {
  const logDiv = document.getElementById('log');
  logDiv.innerHTML = '<h3>Attività registrate</h3>' + log.map((r, i) =>
    `[${r.timestamp}] ${r.azione}${r.dettagli ? ' - ' + r.dettagli : ''} (Discesa: ${r.discesa ?? '-'})`
  ).join('<br>');
  logDiv.scrollTop = logDiv.scrollHeight;
}

function timestamp() {
  return new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' });
}

function toggleTurno() {
  turnoInCorso = !turnoInCorso;
  const azione = turnoInCorso ? "Inizio Turno" : "Fine Turno";
  log.push({
    timestamp: timestamp(),
    azione: azione,
    dettagli: "-",
    discesa: "-"
  });
  updateLogDisplay();
}

function togglePausa() {
  pausaInCorso = !pausaInCorso;
  const azione = pausaInCorso ? "Inizio Pausa" : "Fine Pausa";
  log.push({
    timestamp: timestamp(),
    azione: azione,
    dettagli: "-",
    discesa: "-"
  });
  updateLogDisplay();
}

function startDiscesa() {
  if (currentDiscesa !== null) {
    const dettagliRaccolta = Object.entries(raccoltaCounts).map(([k, v]) => `${k}=${v}`).filter(([k,v])=>v>0).join(", ");
    if (dettagliRaccolta) {
      log.push({
        timestamp: timestamp(),
        azione: "Conteggio Raccolta Finale",
        dettagli: dettagliRaccolta,
        discesa: currentDiscesa
      });
    }

    const dettagliSegnalazioni = Object.entries(segnalazioniCounts).map(([k, v]) => `${k}=${v}`).filter(([k,v])=>v>0).join(", ");
    if (dettagliSegnalazioni) {
      log.push({
        timestamp: timestamp(),
        azione: "Conteggio Segnalazioni Finale",
        dettagli: dettagliSegnalazioni,
        discesa: currentDiscesa
      });
    }

    log.push({
      timestamp: timestamp(),
      azione: "Fine Discesa",
      dettagli: "-",
      discesa: currentDiscesa
    });

    for (const tipo in raccoltaCounts) {
      if (raccoltaCounts.hasOwnProperty(tipo)) {
          raccoltaCounts[tipo] = 0;
          updateBadge(`count-${getSanitizedId(tipo)}`, raccoltaCounts[tipo]);
      }
    }
    for (const tipo in segnalazioniCounts) {
      if (segnalazioniCounts.hasOwnProperty(tipo)) {
          segnalazioniCounts[tipo] = 0;
      }
    }
  }

  discesaCount++;
  currentDiscesa = discesaCount;
  startTime = new Date();

  log.push({
    timestamp: timestamp(),
    azione: "Discesa",
    dettagli: "-",
    discesa: currentDiscesa
  });

  updateLogDisplay();
}


function toggleScarico() {
  scaricoInCorso = !scaricoInCorso;
  const azione = scaricoInCorso ? "Inizio Scarico" : "Fine Scarico";

  if (!scaricoInCorso && currentDiscesa !== null) {
    const dettagliRaccolta = Object.entries(raccoltaCounts).map(([k, v]) => `${k}=${v}`).filter(([k,v])=>v>0).join(", ");
    if (dettagliRaccolta) {
      log.push({
        timestamp: timestamp(),
        azione: "Conteggio Raccolta Finale",
        dettagli: dettagliRaccolta,
        discesa: currentDiscesa
      });
    }

    const dettagliSegnalazioni = Object.entries(segnalazioniCounts).map(([k, v]) => `${k}=${v}`).filter(([k,v])=>v>0).join(", ");
    if (dettagliSegnalazioni) {
      log.push({
        timestamp: timestamp(),
        azione: "Conteggio Segnalazioni Finale",
        dettagli: dettagliSegnalazioni,
        discesa: currentDiscesa
      });
    }

    log.push({
      timestamp: timestamp(),
      azione: "Fine Discesa",
      dettagli: "-",
      discesa: currentDiscesa
    });

    for (const tipo in raccoltaCounts) {
      if (raccoltaCounts.hasOwnProperty(tipo)) {
          raccoltaCounts[tipo] = 0;
          updateBadge(`count-${getSanitizedId(tipo)}`, raccoltaCounts[tipo]);
      }
    }
    for (const tipo in segnalazioniCounts) {
      if (segnalazioniCounts.hasOwnProperty(tipo)) {
          segnalazioniCounts[tipo] = 0;
      }
    }
    currentDiscesa = null;
  }

  log.push({
    timestamp: timestamp(),
    azione: azione,
    dettagli: "-",
    discesa: currentDiscesa ?? "-"
  });
  updateLogDisplay();
}

function addRaccolta(tipo) {
  if (!currentDiscesa) {
    alert("Inizia una 'Nuova Discesa' prima di registrare la raccolta.");
    return;
  }

  const sanitizedId = getSanitizedId(tipo);

  raccoltaCounts[tipo] = (raccoltaCounts[tipo] || 0) + 1;
  updateBadge(`count-${sanitizedId}`, raccoltaCounts[tipo]);

  log.push({
    timestamp: timestamp(),
    azione: "Raccolta",
    dettagli: tipo,
    discesa: currentDiscesa
  });

  updateLogDisplay();
}

function addSegnalazione(tipo) {
  log.push({
    timestamp: timestamp(),
    azione: "Segnalazione",
    dettagli: tipo,
    discesa: currentDiscesa ?? "-"
  });

  segnalazioniCounts[tipo] = (segnalazioniCounts[tipo] || 0) + 1;

  updateLogDisplay();
}

function annullaUltima() {
  const ultima = log.pop();
  if (!ultima) return;

  if (ultima.azione === "Raccolta") {
    const tipo = ultima.dettagli;
    if (raccoltaCounts.hasOwnProperty(tipo)) {
      raccoltaCounts[tipo]--;
      if (raccoltaCounts[tipo] < 0) raccoltaCounts[tipo] = 0;
      const sanitizedId = getSanitizedId(tipo);
      updateBadge(`count-${sanitizedId}`, raccoltaCounts[tipo]);
    }
  } else if (ultima.azione === "Segnalazione") {
    const tipo = ultima.dettagli;
    if (segnalazioniCounts.hasOwnProperty(tipo)) {
      segnalazioniCounts[tipo]--;
      if (segnalazioniCounts[tipo] < 0) segnalazioniCounts[tipo] = 0;
    }
  } else if (ultima.azione === "Discesa") {
    discesaCount--;
    currentDiscesa = discesaCount > 0 ? discesaCount : null;
  } else if (ultima.azione === "Inizio Scarico") {
    scaricoInCorso = true;
  } else if (ultima.azione === "Fine Scarico") {
    scaricoInCorso = false;
  } else if (ultima.azione === "Inizio Pausa") {
    pausaInCorso = true;
  } else if (ultima.azione === "Fine Pausa") {
    pausaInCorso = false;
  } else if (ultima.azione === "Inizio Turno") {
    turnoInCorso = true;
  } else if (ultima.azione === "Fine Turno") {
    turnoInCorso = false;
  }

  updateLogDisplay();
}

function resetDati() {
  if (confirm("Sei sicuro di voler cancellare tutti i dati? Questa azione è irreversibile.")) {
    log = [];
    discesaCount = 0;
    currentDiscesa = null;
    startTime = null;
    scaricoInCorso = false;
    pausaInCorso = false;
    turnoInCorso = false;

    for (const tipo in raccoltaCounts) {
      if (raccoltaCounts.hasOwnProperty(tipo)) {
          raccoltaCounts[tipo] = 0;
          updateBadge(`count-${getSanitizedId(tipo)}`, raccoltaCounts[tipo]);
      }
    }
    for (const tipo in segnalazioniCounts) {
      if (segnalazioniCounts.hasOwnProperty(tipo)) {
          segnalazioniCounts[tipo] = 0;
      }
    }

    updateLogDisplay();
  }
}

function exportExcel() {
  const nomeFile = document.getElementById("filename").value;
  if (!nomeFile) {
    alert("Inserisci un nome per il file!");
    return;
  }

  const intestazione = ["Ora", "Azione", "Dettagli", "Discesa"];
  const righe = [intestazione];

  log.forEach(entry => {
    const [datePart, timePart] = entry.timestamp.split(', ');
    const ora = timePart;
    righe.push([ora, entry.azione, entry.dettagli || '', entry.discesa || '-']);
  });

  const csv = righe.map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeFile + ".csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// PWA: Codice per la registrazione del Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}

let rifornimentoInCorso = false;

function toggleRifornimento() {
  rifornimentoInCorso = !rifornimentoInCorso;
  const azione = rifornimentoInCorso ? "Inizio Rifornimento" : "Fine Rifornimento";
  log.push({
    timestamp: timestamp(),
    azione: azione,
    dettagli: "-",
    discesa: currentDiscesa ?? "-"
  });
  updateLogDisplay();
}

function aggiungiAzione(nome) {
  log.push({
    timestamp: timestamp(),
    azione: nome,
    dettagli: "-",
    discesa: currentDiscesa ?? "-"
  });
  updateLogDisplay();
}

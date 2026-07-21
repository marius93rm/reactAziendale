module.exports = "lign: 'center' });
  addNotes(slide, 'Chiudere collegando i tre livelli. La struttura del repository guida il team. Tipo, posizione e key guidano React nel conservare lo state. Setup e cleanup guidano i processi esterni. In tutti i casi cerchiamo confini espliciti e cambiamenti locali. Questo metodo prepara i moduli successivi su state management, performance, form e testing.');
}

// Write next to this generator unless OUTPUT_PATH is provided.
const path = require('path');
const outputPath = process.env.OUTPUT_PATH || path.join(__dirname, 'Modulo_1_Esempi_Commentati_Codice.pptx');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
pptx.writeFile({ fileName: outputPath, compression: true });
";

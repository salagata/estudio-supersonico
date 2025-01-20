const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const express = require("express");
const app = express();
const PORT = 8080;
var questions = []

app.use(express.json());
// Extrae el .json del examen
function extractJSON(exam) {
  return /```json([\s\S]*?)```/.exec(exam)[1];
}

app.get("/", (req, res) => {
  res.header("Content-Type", "text/html");
  res.status(200);
  fs.readFile("index.html", "utf8", (err, data) => {
    if (err) {
      res.send("Error al cargar el archivo");
    } else {
      res.send(data);
    }
  });
});
// app.get("/exam", (req, res) => {
//   res.header("Content-Type", "text/html");
//   res.status(200)
//   res.send("Recibido :D");
// });
app.post("/exam", (req, res) => {

  const questions = req.body.questions;
  const extras = req.body.extras;

  fs.readFile("api-key.txt", "utf8", (err, data) => {
    const API = data;


    const temario = "Temario: " + questions + "\n Al crear el examen tome en cuenta: " + extras;
    const genAI = new GoogleGenerativeAI(API);
    async function run() {
      // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    
      const prompt = `Eres una api que hace examenes, de prompt recibes un temario, y de salida devuelves UNICAMENTE un array de objetos JSON siguiendo el siguiente formato:
      {
        "type":"[D(Desarrollo)|C(Complete)|S(Seleccione)]",
        "name":"[Nombre del Enunciado]",
        "questions":[ // Las preguntas, las preguntas seguiran siempre el mismo formato que el que se haya escojido en type
          Si es de Desarrollo:
          {
            "question":"[La pregunta]"
          }
          Si es de Complete
          {
            "question":"[La pregunta, el espacio o los espacios a completar se representan con este caracter [_] ]",
            "answer":[ // La respuesta al espacio a completar o las respuestas, las respuestas deben ser strings, si hay mas de un espacio a completar, el orden en el que aparecen los espacios a completar debe ser el mismo que el orden de las respuestas
            ]
          }
          Si es de Seleccione:
          {
            "question":"La pregunta",
            "options":[// Las opciones, siempre debe de haber UNA UNICA opcion correcta, las opciones deben de ser un string
            ]
            "correct":[El indice de la respuesta correcta en options]
          }
          ]
        }
        Prompt:${temario}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const exam = response.text();
      res.send(extractJSON(exam));
    
      res.status(200)

    }
    
    run();


    }
  );
});

app.listen(PORT,() => {
  console.log(`Server is running on port ${PORT}`);
})
// Access your API key as an environment variable (see "Set up your API key" above)
// const API = ""
// 



console.log()
import readline from "readline";
import http from "http";
import { WebSocketServer } from "ws";

let state = 0;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});
rl.on("line", (input) => {
  if (input === "inc") state++;
  if (input === "dec") state--;
  console.log(`state: ${state}`);
});

const httpSrv = http.createServer((req, res) => {
  let data;
  if (req.method === "POST" && ["/inc", "/dec"].includes(req.url ?? "/")) {
    if (req.url === "/inc") state++;
    if (req.url === "/dec") state--;
    data = JSON.stringify({ state });
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.statusCode = data ? 200 : 400;
  res.end(data);
});
httpSrv.listen(parseInt(process.env.HTTP_PORT || "3000"), "127.0.0.1", () =>
  console.log("Server is up")
);

const wsServer = new WebSocketServer({
  port: parseInt(process.env.WS_PORT || "8080"),
});
wsServer.on("connection", (ws) => {
  ws.on("error", console.error);
  ws.on("message", (data) => {
    const str = data.toString();
    if (str === "inc") state++;
    if (str === "dec") state--;
    ws.send(JSON.stringify({ state }));
  });
  ws.send(JSON.stringify({ state }));
});

const HTTP = require("http");
const PUG = require("pug");
const FS = require("fs");
const PATH = require("path");

const PORT = process.env.PORT || 3000;

let data = [];

function reqResListener(req, res) {
  const url = req.url;
  const method = req.method;
  const filePath = PATH.join(__dirname, url);

  if (url.endsWith(".css") && method === "GET") {
    FS.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(`<h1>404 Not Found Page</h1>`);
      } else {
        res.writeHead(200, { "content-type": "text/css" });
        res.end(data);
      }
    });

    return;
  }

  if (url === "/new-task" && method === "POST") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const query = new URLSearchParams(body);
      const inputValue = query.get("newTask");

      if (inputValue) {
        data.push({ id: data.length + 1, task: inputValue });
      }

      res.writeHead(302, { location: "/" });
      res.end();
    });
    return;
  }

  if (url.startsWith("/update-task") && method === "POST") {
    const searchParams = new URL(url, `http://${req.headers.host}`)
      .searchParams;
    const id = Number(searchParams.get("id"));
    let body = "";

    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const query = new URLSearchParams(body);
      const inputValue = query.get("updateTask");

      const taskFounded = data.find((task) => task.id === id);
      if (taskFounded && inputValue) {
        taskFounded.task = inputValue;
      }

      res.writeHead(302, { location: "/" });
      res.end();
    });

    return;
  }

  if (url.startsWith("/delete-task") && method === "POST") {
    const searchParams = new URL(url, `http://${req.headers.host}`)
      .searchParams;
    const id = Number(searchParams.get("id"));

    if (id !== undefined) {
      data = data.filter((task) => task.id !== id);
    }

    res.writeHead(302, { location: "/" });
    res.end();
    return;
  }

  if (method === "GET" && url === "/") {
    const html = PUG.renderFile("./index.pug", { data });
    res.writeHead(200, { "content-type": "text/html" });
    res.end(html);
  }
}

const server = HTTP.createServer(reqResListener);

server.listen(PORT, () => {
  console.info(`Server running at http://localhost/${PORT}`);
});

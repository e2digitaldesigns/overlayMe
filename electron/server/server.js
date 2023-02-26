const cors = require("cors");
const storage = require("electron-json-storage");
const SETTINGS = require("../settings/system.json");
const express = require("express");
const path = require("path");

const Datastore = require("nedb");
const dbPath = storage.getDataPath();

const db = new Datastore({
  filename: dbPath + "/" + SETTINGS.APPLICATION.DATABASE
});

const service = mainWindow => {
  const app = require("express")();
  const server = require("http").createServer(app);
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
      methods: ["DELETE", "GET", "POST", "PUT"]
    }
  });

  app.use((req, res, next) => {
    req.io = io;
    return next();
  });

  app.use("/overlays", express.static(path.join(__dirname, "public")));
  app.use("/admin", express.static(path.join(__dirname, "cms")));

  app.use(cors());
  app.set("socketio", "io");
  app.set("neDb", db);
  app.set("mainWindow", mainWindow);
  require("./routes")(app);

  app.get("/", (req, res) => {
    io.emit("mgOverlayActions", { test: true });
    res.send("Overlay API server is running...");
  });

  //Set Services
  io.on("connection", socket => {
    socket.on("mgOverlayActions", data => {
      socket.broadcast.emit("mgOverlayActions", data);
      io.emit("mgOverlayActions", data);
    });

    socket.on("mgVoting", data => {
      io.emit("mgVoting", data);
    });
  });

  app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, "cms", "index.html"));
  });

  /////////////////////////////////////
  /////////////////////////////////////
  /////////////////////////////////////

  server.listen(SETTINGS.DEFAULT_PORT);
};

module.exports = service;

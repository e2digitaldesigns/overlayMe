const express = require("express");
const fileUpload = require("./fileUpload/fileUpload");
const socket = require("./socket/socket");

const show = require("./show/show");

const episodes = require("./episodes/episodes");
const hosts = require("./hosts/hosts");
const socials = require("./socials/socials");
const templates = require("./templates/templates");

module.exports = app => {
  const prefix = "/api/v1/";

  app.use(express.json());
  app.use(`${prefix}upload`, fileUpload);
  app.use(`${prefix}socket`, socket);
  app.use(`${prefix}show`, show);

  app.use(`${prefix}episodes`, episodes);
  app.use(`${prefix}hosts`, hosts);
  app.use(`${prefix}socials`, socials);
  app.use(`${prefix}templates`, templates);
};

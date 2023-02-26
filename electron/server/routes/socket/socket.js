const express = require("express");
const router = express.Router();

const _map = require("lodash/map");
const _replace = require("lodash/replace");
const _split = require("lodash/split");
const _slice = require("lodash/slice");

const parseParams = (url, type) => {
  const nodeSendArray = {};

  let rawParams = _replace(url, "?", "&");
  rawParams = _split(rawParams, "&");
  rawParams = _slice(rawParams, 1);

  _map(rawParams, m => {
    let pair = _split(m, "=");
    nodeSendArray[pair[0]] = decodeURIComponent(pair[1]);
  });

  return {
    action: type === "vote" ? "mgVoting" : "mgOverlayActions",
    nodeSendArray
  };
};

router.get("/", (req, res) => {
  console.log("a", req.io.emit);
  res.send("Socket Manual");
});

router.get("/manual/:type", function (req, res) {
  const { action, nodeSendArray } = parseParams(req.url, req.params.type);
  res.send(nodeSendArray);
  req.io.emit(action, nodeSendArray);
});

module.exports = router;

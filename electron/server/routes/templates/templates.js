const express = require("express");
const router = express.Router();
const storage = require("electron-json-storage");
const _map = require("lodash/map");
const _pick = require("lodash/pick");
const { v4: uuidv4 } = require("uuid");
const templatesJson = require("../../../json/template.json");

router.get("/", async (req, res) => {
  try {
    const templateList = [];

    _map(templatesJson, template => {
      const data = _pick(template, ["_id", "name"]);
      return templateList.push(data);
    });

    res.send(templateList);
  } catch (error) {
    res.send(error);
  }
});

router.get("/:_id", async (req, res) => {
  try {
    const template = templatesJson.find(
      template => req.params._id === template._id
    );

    res.send(template);
  } catch (error) {
    res.send(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const templateJson = storage.getSync(templatesDB);
    const _id = uuidv4();
    const template = {
      _id,
      name: req.body.name,
      maxHosts: 1,
      tickerType: 1,
      topicType: 1,
      hasSponsor: false,
      hasContentBox: false,
      images: {
        contentBox: { amount: 3, width: 200, height: 200 },
        logo: { amount: 1, width: 200, height: 200 },
        sponsors: { amount: 5, width: 120, height: 10 },
        topic: { amount: 0, width: 0, height: 0 }
      }
    };

    templateJson.push(template);

    storage.set(templatesDB, templateJson, error => {
      if (error) throw error;
      console.log("db updated successfully");
    });

    res.send({ _id });
  } catch (error) {
    res.send(error);
  }
});

router.put("/:_id", async (req, res) => {
  try {
    const templatesJson = storage.getSync(templatesDB);

    const index = templatesJson.findIndex(f => f._id === req.params._id);
    templatesJson[index] = req.body;

    storage.set(templatesDB, templatesJson, error => {
      if (error) throw error;
      console.log("db updated successfully");
    });

    res.send("ppp");
  } catch (error) {
    res.send(error);
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    const templatesJson = storage.getSync(templatesDB);
    const newData = templatesJson.filter(f => f._id !== req.params._id);

    storage.set(templatesDB, newData, error => {
      if (error) throw error;
      console.log("db updated successfully");
    });

    res.send({ success: 1 });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;

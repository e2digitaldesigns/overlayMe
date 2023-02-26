const express = require("express");
const router = express.Router();
const templatesJson = require("../../../json/template.json");
const moment = require("moment");

const _map = require("lodash/map");
const _pick = require("lodash/pick");
const { v4 } = require("uuid");

const table = { _table: "episodes" };

router.get("/", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();
    req.app.get("neDb").find(table, function (err, docs) {
      if (err) {
        throw error;
      } else {
        const list = [];

        _map(docs, episode => {
          const template = templatesJson.find(
            temp => temp._id === episode.templateId
          );

          const data = _pick(episode, [
            "_id",
            "active",
            "name",
            "current",
            "airDate"
          ]);
          return list.push({
            ...data,
            templateName: template?.name || ""
          });
        });

        res.send(list);
      }
    });
  } catch (error) {
    res.send({ error: true });
  }
});

router.get("/:_id", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();
    req.app.get("neDb").findOne({ _id: req.params._id }, function (err, docs) {
      if (err) {
        throw error;
      } else {
        res.send(docs);
      }
    });
  } catch (error) {
    res.send({ error: true });
  }
});

router.post("/", async (req, res) => {
  // 2023-02-10
  try {
    req.app.get("neDb").loadDatabase();
    const episode = {
      ...table,
      name: req.body.name,
      active: false,
      airDate: moment(new Date()).format("YYYY-MM-DD"),
      current: false,
      hosts: [],
      number: "1",
      socialNetworks: [],
      templateId: req.body.templateId,
      ticker: [],
      topics: [
        {
          _id: v4(),
          order: 1,
          name: "New Topic",
          desc: "",
          timer: 0,
          isParent: false,
          isChild: false,
          parentId: "",
          img: ""
        }
      ],
      contentBoxes: [],
      sponsorBoxes: []
    };

    req.app.get("neDb").insert(episode, function (err, newDoc) {
      if (!err) {
        res.send({ _id: newDoc._id });
      } else {
        throw error;
      }
    });
  } catch (error) {
    res.send({ error: true });
  }
});

router.put("/:_id", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();

    const { body } = req;
    // delete body._id;

    req.app
      .get("neDb")
      .update(
        { _id: req.params._id },
        { $set: { ...body } },
        {},
        function (err, numReplaced) {
          if (!err) {
            if (body.current === true) {
              req.app.get("neDb").update(
                {
                  _id: { $ne: req.params._id },
                  _table: "episodes",
                  templateId: body.templateId,
                  current: true
                },
                { $set: { current: false } },
                { multi: true },
                function (err, numReplaced) {
                  if (!err) {
                    res.send({ success: 1 });
                  } else {
                    throw err;
                  }
                }
              );
            } else {
              res.send({ success: 1 });
            }
          } else {
            throw err;
          }
        }
      );
  } catch (error) {
    res.send({ error: true });
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    req.app
      .get("neDb")
      .remove({ _id: req.params._id }, {}, function (err, numRemoved) {
        if (!err) {
          res.send({ success: 1 });
        } else {
          throw error;
        }
      });
  } catch (error) {
    res.send({ error: true });
  }
});

module.exports = router;

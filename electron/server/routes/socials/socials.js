const express = require("express");
const router = express.Router();

const table = { _table: "socials" };

router.get("/", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();
    req.app.get("neDb").find(table, function (err, docs) {
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
  try {
    req.app.get("neDb").loadDatabase();
    req.app
      .get("neDb")
      .insert({ ...table, ...req.body }, function (err, newDoc) {
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
    req.app
      .get("neDb")
      .update(
        { _id: req.params._id },
        { ...req.body, ...table },
        {},
        function (err, numReplaced) {}
      );

    res.send({ success: 1 });
  } catch (error) {
    res.send({ error: true });
  }
});

router.delete("/:_id", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();
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

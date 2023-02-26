const express = require("express");
const router = express.Router();

const _map = require("lodash/map");
const _sortBy = require("lodash/sortBy");

router.get("/", (req, res) => {
  res.send("Show Time");
});

router.get("/template/:templateId", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();

    const searchEpisode = {
      _table: "episodes",
      templateId: req.params.templateId,
      current: true
    };
    const searchHosts = { _table: "hosts" };
    const searchSocials = { _table: "socials" };

    req.app
      .get("neDb")
      .find(
        { $or: [searchEpisode, searchHosts, searchSocials] },
        (error, docs) => {
          if (error) throw error;

          const episode = docs.find(f => f._table === "episodes");

          const dataObj = episode
            ? {
                ...episode,
                socialNetworks: episode.socialNetworks.length
                  ? socialParser(
                      docs.filter(f => f._table === "socials"),
                      episode.socialNetworks
                    )
                  : [],
                hosts: episode.hosts
                  ? hostParser(
                      docs.filter(f => f._table === "hosts"),
                      episode.hosts
                    )
                  : [],
                topics:
                  episode.topics.length > 1
                    ? sortTopics(episode.topics)
                    : episode.topics
              }
            : { error: true };

          res.send(dataObj);
        }
      );
  } catch (error) {
    res.send({ error: true });
  }
});

router.get("/template/:templateId/_archive", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();

    const searchEp = {
      _table: "episodes",
      templateId: req.params.templateId,
      current: true
    };
    const searchHosts = { _table: "hosts" };
    const searchSocials = { _table: "socials" };

    req.app
      .get("neDb")
      .find(
        { $or: [searchEp, searchHosts, searchSocials] },
        function (err, docs) {
          if (err) throw err;

          const episode = docs.find(f => f._table === "episodes");

          res.json({
            ...episode,
            socialNetworks: episode.socialNetworks
              ? socialParser(
                  docs.filter(f => f._table === "socials"),
                  episode.socialNetworks
                )
              : [],

            hosts: episode.hosts
              ? hostParser(
                  docs.filter(f => f._table === "hosts"),
                  episode.hosts
                )
              : [],
            topics:
              episode.topics.length > 1
                ? sortTopics(episode.topics)
                : episode.topics
          });
        }
      );
  } catch (error) {
    res.send({ error: true });
  }
});

router.get("/episode/:templateId/:episodeId", async (req, res) => {
  try {
    req.app.get("neDb").loadDatabase();

    const searchEp = {
      _table: "episodes",
      _id: req.params.episodeId
    };
    const searchHosts = { _table: "hosts" };
    const searchSocials = { _table: "socials" };

    req.app
      .get("neDb")
      .find(
        { $or: [searchEp, searchHosts, searchSocials] },
        function (err, docs) {
          if (err) throw err;

          const episode = docs.find(f => f._table === "episodes");

          res.json({
            ...episode,
            socialNetworks: socialParser(
              docs.filter(f => f._table === "socials"),
              episode.socialNetworks
            ),
            hosts: hostParser(
              docs.filter(f => f._table === "hosts"),
              episode.hosts
            ),
            topics: sortTopics(episode.topics)
          });
        }
      );
  } catch (error) {
    res.send({ error: true });
  }
});

module.exports = router;

const hostParser = (databaseHost, episodeHost) => {
  const searchHost = [];

  _map(episodeHost, m => {
    const host = databaseHost.find(f => f._id === m._id);

    if (host) {
      searchHost.push({
        seatNum: m.seatNum,
        likes: 0,
        disLikes: 0,
        name: host.name,
        socials: host.socials
      });
    }
  });

  return searchHost;
};
const socialParser = (databaseSocials, episodeSocials) => {
  const searchSocials = [];

  _map(episodeSocials, m => {
    const social = databaseSocials.find(f => f._id === m._id);

    if (social) {
      searchSocials.push({
        order: m.order,
        site: social.site,
        username: social.username
      });
    }
  });

  return [searchSocials];
};

const sortTopics = topics => {
  const initSort = _sortBy(topics, "order");
  let finalSort = [];

  for (let i = 0; i < initSort.length; i++) {
    if (finalSort.includes(initSort[i])) {
    } else if (initSort[i].isParent === true) {
      finalSort.push(initSort[i]);
      let children = initSort.filter(
        f => f.isChild === true && f.parentId === initSort[i]._id
      );

      finalSort = finalSort.concat(children);
    } else {
      finalSort.push(initSort[i]);
    }
  }

  return finalSort;
};

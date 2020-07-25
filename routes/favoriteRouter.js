const express = require("express");
const bodyParser = require("body-parser");
const Favorite = require("../models/favorite");
const User = require("../models/user");
const { response } = require("express");
const authenticate = require("../authenticate");
const cors = require("./cors");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .then((favorites) => {
        let correctUserDocument = null;
        favorites.forEach((favorite) => {
          if (req.user._id.toString() == favorite.user.toString()) {
            correctUserDocument = favorite;
          }
        });

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(correctUserDocument == null ? [] : correctUserDocument);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .then((favorites) => {
        let correctUserDocument = null;
        favorites.forEach((favorite) => {
          if (req.user._id.toString() == favorite.user.toString()) {
            correctUserDocument = favorite;
          }
        });

        if (correctUserDocument != null) {
          let success = false;
          req.body.forEach((newCampsite) => {
            if (
              correctUserDocument.campsites != null &&
              !correctUserDocument.campsites.includes(
                newCampsite._id.toString()
              )
            ) {
              correctUserDocument.campsites.push(newCampsite);
              correctUserDocument.save();
              success = true;
            }
          });

          if (success) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(correctUserDocument);
          } else if (!success) {
            res.statusCode = 403;
            res.end("Favorite already exists!");
          }
        } else {
          let favorite = { user: req.user._id, campsites: req.body };
          Favorite.create(favorite)
            .then((favorite) => {
              console.log("Favorite Created ", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .then((favorites) => {
        let correctUserDocument = null;
        favorites.forEach((favorite) => {
          if (req.user._id.toString() == favorite.user.toString()) {
            correctUserDocument = favorite;
          }
        });

        if (correctUserDocument != null) {
          Favorite.findByIdAndDelete(correctUserDocument._id)
            .then((response) => {
              console.log("Favorites deleted");
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `GET operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .then((favorites) => {
        let correctUserDocument = null;
        favorites.forEach((favorite) => {
          if (req.user._id.toString() == favorite.user.toString()) {
            correctUserDocument = favorite;
          }
        });

        if (correctUserDocument != null) {
          let success = false;
          let newCampsite = req.params.campsiteId;
          if (
            correctUserDocument.campsites != null &&
            !correctUserDocument.campsites.includes(newCampsite.toString())
          ) {
            correctUserDocument.campsites.push(newCampsite);
            correctUserDocument.save();
            success = true;
          }

          if (success) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(correctUserDocument);
          } else if (!success) {
            res.statusCode = 403;
            res.end("Favorite already exists!");
          }
        } else {
          let favorite = {
            user: req.user._id,
            campsites: [req.params.campsiteId],
          };
          Favorite.create(favorite)
            .then((favorite) => {
              console.log("Favorite Created ", favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.statusCode = 403;
    res.end(
      `PUT operation not supported on /favorites/${req.params.campsiteId}`
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.find()
      .then((favorites) => {
        let correctUserDocument = null;
        favorites.forEach((favorite) => {
          if (req.user._id.toString() == favorite.user.toString()) {
            correctUserDocument = favorite;
          }
        });

        if (correctUserDocument != null) {
          let newCampsite = req.params.campsiteId;
          if (
            correctUserDocument.campsites != null &&
            correctUserDocument.campsites.includes(newCampsite.toString())
          ) {
            let index = correctUserDocument.campsites.indexOf(newCampsite);
            correctUserDocument.campsites.splice(index, 1);
            correctUserDocument.save().then((response) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(response);
            });
          }
        } else {
          err = new Error(`Campsite ${req.params.campsiteId} not found`);
          err.status = 404;
          return next(err);
        }
      })
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;

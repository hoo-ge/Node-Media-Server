// @ts-check
//
//  Created by Chen Mingliang on 23/12/01.
//  illuspas@msn.com
//  Copyright (c) 2023 Nodemedia. All rights reserved.
//

const fs = require("fs");
const http = require("http");
const http2 = require("http2");
const express = require("express");
const logger = require("../core/logger.js");
const Context = require("../core/context.js");
const http2Express = require("http2-express");
const FlvSession = require("../session/flv_session.js");

class NodeHttpServer {
  constructor(config) {
    this.config = config;
    const app = http2Express(express);

    app.all("*", (req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      req.method === "OPTIONS" ? res.sendStatus(200) : next();
    });

    app.all("/:app/:name.flv", this.handleFlv);

    if (this.config.http?.port) {
      this.httpServer = http.createServer(app);
    }
    if (this.config.https?.port) {
      const opt = {
        key: fs.readFileSync(this.config.https.key),
        cert: fs.readFileSync(this.config.https.cert),
        allowHTTP1: true
      };
      this.httpsServer = http2.createSecureServer(opt, app);
    }

  }

  run = () => {
    this.httpServer?.listen(this.config.http.port, this.config.bind, () => {
      logger.info(`HTTP server listening on port ${this.config.bind}:${this.config.http.port}`);
    });
    this.httpsServer?.listen(this.config.https.port, this.config.bind, () => {
      logger.info(`HTTPS server listening on port ${this.config.bind}:${this.config.https.port}`);
    });
  };

  /**
   * @param {express.Request} req
   * @param {express.Response} res
   */
  handleFlv = (req, res) => {
    const session = new FlvSession( req, res);
    session.run();
  };
}

module.exports = NodeHttpServer;

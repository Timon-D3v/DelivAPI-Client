/*!
 * DelivAPI-Client
 * Copyright(c) 2025 Timon Fiedler
 * MIT Licensed
 */

"use strict";

const { delivApiUpload, createRawData } = require("./dist/index.js");

module.exports = {
    default: delivApiUpload,
    delivApiUpload,
    createRawData
};
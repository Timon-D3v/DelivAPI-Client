/*!
 * DelivAPI-Client
 * Copyright(c) 2025-2026 Timon Fiedler
 * MIT Licensed
 */

"use strict";

const { delivApiUpload, delivApiUpdateFile, delivApiDeleteFile } = require("./dist/index.js");

module.exports = {
    default: delivApiUpload,
    delivApiUpload,
    delivApiUpdateFile,
    delivApiDeleteFile
};
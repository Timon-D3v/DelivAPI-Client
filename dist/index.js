"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRawData = createRawData;
exports.delivApiUpload = delivApiUpload;
const tslib_1 = require("tslib");
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const mime_types_1 = require("mime-types");
async function createRawData(blob, user, mimeType, fileExtension, timestamp) {
    let buffer;
    if (blob instanceof Blob && !Buffer.isBuffer(blob)) {
        const arrayBuffer = await blob.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    }
    else {
        buffer = blob;
    }
    const hex = buffer.toString("hex");
    return `${hex}${user}${mimeType}${fileExtension}${timestamp}`;
}
async function delivApiUpload(user, apiKey, blob, mimeType, endpoint = "api.timondev.com/api/upload") {
    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);
        blob = new Blob([uInt8Array], { type: mimeType });
    }
    const fileExtension = (0, mime_types_1.extension)(mimeType) || "";
    const currentTime = Date.now().toString();
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("user", user);
    formData.append("mimeType", mimeType);
    formData.append("fileExtension", fileExtension);
    const raw = await createRawData(blob, user, mimeType, fileExtension, currentTime);
    const signature = crypto_1.default.createHmac("sha256", apiKey).update(raw).digest("hex");
    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
            "X-Signature": signature,
            "X-Timestamp": currentTime,
        },
    });
    return response;
}
exports.default = delivApiUpload;
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRawData = createRawData;
exports.delivApiUpload = delivApiUpload;
exports.delivApiUpdateFile = delivApiUpdateFile;
const tslib_1 = require("tslib");
const node_crypto_1 = tslib_1.__importDefault(require("node:crypto"));
/**
 * Converts a given Blob or Buffer into a hexadecimal string, concatenates it with user information,
 * MIME type, file extension, and a timestamp, and returns the resulting string.
 *
 * @param {Buffer | Blob} blob - The input data as a Blob (browser) or Buffer (Node.js).
 * @param {string} user - The identifier for the user associated with the data.
 * @param {string} mimeType - The MIME type of the data (e.g., "image/png").
 * @param {string} timestamp - A string representing the timestamp to associate with the data.
 *
 * @returns {Promise<string>} - A promise that resolves to a concatenated string containing the hex representation of the data and the provided metadata.
 */
async function createRawData(blob, user, mimeType, timestamp) {
    let buffer;
    if (blob instanceof Blob && !Buffer.isBuffer(blob)) {
        const arrayBuffer = await blob.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    }
    else {
        buffer = blob;
    }
    const hex = buffer.toString("hex");
    return `${hex}${user}${mimeType}${timestamp}`;
}
/**
 * Uploads a file (as a Blob or Buffer) to the DelivAPI server.
 *
 * Converts a Node.js Buffer to a Blob if necessary, appends required metadata to a FormData object,
 * generates a signature for authentication, and sends a POST request to the specified endpoint.
 *
 * @param {string} user - The username or user identifier for the upload.
 * @param {string} apiKey - The API key used to sign the request.
 * @param {Blob | Buffer} blob - The file data to upload, as a Blob or Buffer.
 * @param {string} mimeType - The MIME type of the file being uploaded.
 * @param {string} [endpoint="https://api.timondev.com/api/upload"] - The API endpoint to upload the file to. Defaults to "https://api.timondev.com/api/upload".
 *
 * @returns {Promise<DelivApiResponse>} - A promise that resolves to a `DelivApiResponse` object containing the server's response.
 *
 * @throws {Error} - Will throw an error if the upload fails (i.e., response status is not 200).
 */
async function delivApiUpload(user, apiKey, blob, mimeType, endpoint = "https://api.timondev.com/api/upload") {
    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);
        blob = new Blob([uInt8Array], { type: mimeType });
    }
    const currentTime = Date.now().toString();
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("user", user);
    formData.append("mimeType", mimeType);
    const raw = await createRawData(blob, user, mimeType, currentTime);
    const signature = node_crypto_1.default.createHmac("sha256", apiKey).update(raw).digest("hex");
    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
            "X-Signature": signature,
            "X-Timestamp": currentTime,
        },
    });
    if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();
    return responseData;
}
/**
 * Replaces a file (uploaded as a Blob or Buffer) on the DelivAPI server.
 *
 * Converts a Node.js Buffer to a Blob if necessary, appends required metadata to a FormData object,
 * generates a signature for authentication, and sends a POST request to the specified endpoint.
 *
 * @param {string} user - The username or user identifier for the upload.
 * @param {string} apiKey - The API key used to sign the request.
 * @param {string} filename - The filename of the file to be updated.
 * @param {Blob | Buffer} blob - The file data to upload, as a Blob or Buffer.
 * @param {string} mimeType - The MIME type of the file being uploaded.
 * @param {string} [endpoint="https://api.timondev.com/api/update"] - The API endpoint to upload the file to. Defaults to "https://api.timondev.com/api/update".
 *
 * @returns {Promise<DelivApiResponse>} - A promise that resolves to a `DelivApiResponse` object containing the server's response.
 *
 * @throws {Error} - Will throw an error if the upload fails (i.e., response status is not 200).
 */
async function delivApiUpdateFile(user, apiKey, filename, blob, mimeType, endpoint = "https://api.timondev.com/api/update") {
    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);
        blob = new Blob([uInt8Array], { type: mimeType });
    }
    const currentTime = Date.now().toString();
    const formData = new FormData();
    formData.append("file", blob);
    formData.append("user", user);
    formData.append("mimeType", mimeType);
    formData.append("filename", filename);
    const raw = await createRawData(blob, user, mimeType, currentTime);
    const signature = node_crypto_1.default.createHmac("sha256", apiKey).update(raw).digest("hex");
    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
            "X-Signature": signature,
            "X-Timestamp": currentTime,
        },
    });
    if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }
    const responseData = await response.json();
    return responseData;
}
exports.default = delivApiUpload;
//# sourceMappingURL=index.js.map
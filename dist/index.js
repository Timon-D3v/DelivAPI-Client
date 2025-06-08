"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRawData = createRawData;
exports.delivApiUpload = delivApiUpload;
const crypto_1 = __importDefault(require("crypto"));
const file_type_1 = require("file-type");
const mime_types_1 = require("mime-types");
async function createRawData(blob, user, mimeType, fileExtension, timestamp) {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hex = buffer.toString("hex");
    return `${hex}${user}${mimeType}${fileExtension}${timestamp}`;
}
async function delivApiUpload(user, apiKey, blob, endpoint = "api.timondev.com/api/upload") {
    const blobType = await (0, file_type_1.fileTypeFromBlob)(blob);
    let mimeType = blobType?.mime || blob.type;
    let fileExtension = blobType?.ext || "";
    if (fileExtension === "" && (0, mime_types_1.extension)(mimeType) !== false) {
        fileExtension = (0, mime_types_1.extension)(mimeType) || "";
    }
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
const fs_1 = __importDefault(require("fs"));
const buffer = fs_1.default.readFileSync("C:/Users/fiedl/Nextcloud/Programmieren/website/public/me.png");
const blob = new Blob([buffer], { type: "image/jpeg" });
delivApiUpload("timon", "4dbc2ff2cb26982484674576c41a26c3c1edfd0ebb85ffa941c9726fb036cb021825d843f83d68262519aef7f5db0f652c8c328236c1bf490791bd38e56a1fef", blob, "http://localhost:8080/api/upload")
    .then((res) => console.log(res))
    .catch((err) => console.error(err));
exports.default = delivApiUpload;
//# sourceMappingURL=index.js.map
import crypto from "crypto";
import { fileTypeFromBlob, fileTypeFromBuffer } from "file-type";
import { extension } from "mime-types";
import type { DelivApiResponse } from "./index.d";

async function createRawData(blob: Blob | Buffer, user: string, mimeType: string, fileExtension: string, timestamp: string): Promise<string> {
    let buffer: Buffer | undefined;

    if (blob instanceof Blob && !Buffer.isBuffer(blob)) {
        const arrayBuffer = await blob.arrayBuffer();
        buffer = Buffer.from(arrayBuffer);
    } else {
        buffer = blob as Buffer;
    }

    const hex = buffer.toString("hex");

    return `${hex}${user}${mimeType}${fileExtension}${timestamp}`;
}

async function delivApiUpload(user: string, apiKey: string, blob: Blob | Buffer, endpoint: string = "api.timondev.com/api/upload"): Promise<DelivApiResponse> {
    let blobType: { mime?: string; ext?: string } | undefined;

    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);

        blobType = await fileTypeFromBuffer(uInt8Array);

        blob = new Blob([uInt8Array], { type: blobType?.mime || "application/octet-stream" });
    } else {
        blobType = await fileTypeFromBlob(blob);
    }

    let mimeType: string = blobType?.mime || blob?.type || "application/octet-stream";
    let fileExtension: string = blobType?.ext || "";

    if (fileExtension === "" && extension(mimeType) !== false) {
        fileExtension = extension(mimeType) || "";
    }

    const currentTime = Date.now().toString();

    const formData = new FormData();

    formData.append("file", blob);
    formData.append("user", user);
    formData.append("mimeType", mimeType);
    formData.append("fileExtension", fileExtension);

    const raw = await createRawData(blob, user, mimeType, fileExtension, currentTime);

    const signature = crypto.createHmac("sha256", apiKey).update(raw).digest("hex");

    const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: {
            "X-Signature": signature,
            "X-Timestamp": currentTime,
        },
    });

    return response as unknown as DelivApiResponse;
}

export { createRawData, delivApiUpload };

export default delivApiUpload;

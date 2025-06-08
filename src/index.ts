import crypto from "crypto";
import { fileTypeFromBlob } from "file-type";
import { extension } from "mime-types";
import type { DelivApiResponse } from "./index.d";
import { Blob as BufferBlob } from "buffer";

async function createRawData(blob: Blob | BufferBlob, user: string, mimeType: string, fileExtension: string, timestamp: string): Promise<string> {
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const hex = buffer.toString("hex");

    return `${hex}${user}${mimeType}${fileExtension}${timestamp}`;
}

async function delivApiUpload(user: string, apiKey: string, blob: Blob, endpoint: string = "api.timondev.com/api/upload"): Promise<DelivApiResponse> {
    const blobType = await fileTypeFromBlob(blob);
    let mimeType: string = blobType?.mime || blob.type;
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

import crypto from "crypto";
import { extension } from "mime-types";
import type { DelivApiResponse } from "./index.d";

/**
 * Converts a given Blob or Buffer into a hexadecimal string, concatenates it with user information,
 * MIME type, file extension, and a timestamp, and returns the resulting string.
 *
 * @param {Buffer | Blob} blob - The input data as a Blob (browser) or Buffer (Node.js).
 * @param {string} user - The identifier for the user associated with the data.
 * @param {string} mimeType - The MIME type of the data (e.g., "image/png").
 * @param {string} fileExtension - The file extension of the data (e.g., ".png").
 * @param {string} timestamp - A string representing the timestamp to associate with the data.
 *
 * @returns {Promise<string>} - A promise that resolves to a concatenated string containing the hex representation of the data and the provided metadata.
 */
async function createRawData(blob: Buffer | Blob, user: string, mimeType: string, fileExtension: string, timestamp: string): Promise<string> {
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
 * @param {string} [endpoint="api.timondev.com/api/upload"] - The API endpoint to upload the file to. Defaults to "api.timondev.com/api/upload".
 *
 * @returns {Promise<DelivApiResponse>} - A promise that resolves to a `DelivApiResponse` object containing the server's response.
 *
 * @throws {Error} - Will throw an error if the upload fails (i.e., response status is not 200).
 */
async function delivApiUpload(user: string, apiKey: string, blob: Blob | Buffer, mimeType: string, endpoint: string = "api.timondev.com/api/upload"): Promise<DelivApiResponse> {
    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);

        blob = new Blob([uInt8Array], { type: mimeType });
    }

    const fileExtension = extension(mimeType) || "";

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

    if (response.status !== 200) {
        throw new Error(`Upload failed with status ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();

    return responseData as unknown as DelivApiResponse;
}

export { createRawData, delivApiUpload };

export default delivApiUpload;

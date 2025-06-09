declare module "delivapi-client";

export type DelivApiResponse = {
    error: boolean;
    message: string;
    url?: string;
};

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
declare function createRawData(blob: Blob | Buffer, user: string, mimeType: string, fileExtension: string, timestamp: string): Promise<string>;

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
declare function delivApiUpload(user: string, apiKey: string, blob: Blob | Buffer, mimeType: string, endpoint: string = "api.timondev.com/api/upload"): Promise<DelivApiResponse>;

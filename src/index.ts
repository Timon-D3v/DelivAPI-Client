import crypto from "node:crypto";
import process from "node:process";
import { fileTypeFromBuffer } from "file-type";
import type { DelivApiResponse, DelivApiUpdateInitialChunkResponse, DelivApiUpdateResponse, DelivApiUploadChunkResponse, DelivApiUploadInitialChunkResponse, DelivApiUploadResponse } from "./index.d";

const MAX_CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Uploads a file (as a Blob or Buffer) to the DelivAPI server. Converts a Node.js Buffer to a Blob if necessary, appends required metadata to a FormData object, generates a signature for authentication, and sends a POST request to the specified endpoint. If the file size exceeds the maximum chunk size of 10 MB, it will be uploaded in chunks using the `delivApiUploadLargeFile` function. The function will retry the upload up to a specified number of times if it fails, and returns a `DelivApiUploadResponse` object containing the server's response.
 *
 *
 * @export
 *
 * @async
 *
 * @param {(Blob | Buffer)} blob - The file data to upload, as a Blob or Buffer.
 * @param {{ user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }} [options] - Optional configuration options for the upload.
 * @param {string} [options.user] - The username or user identifier for the upload. If not provided, it will be read from the `DELIVAPI_USER` environment variable.
 * @param {string} [options.apiKey] - The API key used to sign the request. If not provided, it will be read from the `DELIVAPI_SECRET` or `DELIVAPI_KEY` environment variables.
 * @param {string} [options.endpoint="https://api.timondev.com"] - The API endpoint to upload the file to. If not provided, it will be read from the `DELIVAPI_URL` or `DELIVAPI_ENDPOINT` environment variables, or default to "https://api.timondev.com".
 * @param {number} [options.maxRetries=3] - The maximum number of times to retry the upload if it fails.
 *
 * @returns {Promise<DelivApiUploadResponse>} - A promise that resolves to a `DelivApiUploadResponse` object containing the server's response.
 */
export async function delivApiUpload(blob: Blob | Buffer, options?: { user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }): Promise<DelivApiUploadResponse> {
    const user = options?.user ?? process?.env?.["DELIVAPI_USER"] ?? "";
    const apiKey = options?.apiKey ?? process?.env?.["DELIVAPI_SECRET"] ?? process?.env?.["DELIVAPI_KEY"] ?? "";
    const endpoint = options?.endpoint ?? process?.env?.["DELIVAPI_URL"] ?? process?.env?.["DELIVAPI_ENDPOINT"] ?? "https://api.timondev.com";
    const maxRetries = options?.maxRetries ?? 3;

    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);

        const fileTypeResult = await fileTypeFromBuffer(blob);

        const mimeType = fileTypeResult?.mime ?? "application/octet-stream";

        blob = new Blob([uInt8Array], {
            type: mimeType,
        });
    }

    if (blob.size > MAX_CHUNK_SIZE) {
        console.warn("File size exceeds maximum chunk size. Uploading in chunks.");
        return delivApiUploadLargeFile(blob, { user, apiKey, endpoint, maxRetries });
    }

    const signature = crypto
        .createHmac("sha256", apiKey)
        .update(user)
        .update(await blob.bytes())
        .digest("hex");

    const formData = new FormData();

    formData.append("file", blob);
    formData.append("user", user);

    try {
        const response = await fetch(`${endpoint}/api/upload`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        console.info(`DelivAPI Upload Response: ${response.status} ${response.statusText}`);

        try {
            const responseData = await response.json();

            if (responseData.error && maxRetries > 0) {
                return await delivApiUpload(blob, { user, apiKey, endpoint, maxRetries: maxRetries - 1 });
            }

            return responseData as unknown as DelivApiUploadResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
                url: null,
            };
        }
    } catch (error) {
        console.error("Failed to send upload request", error);

        return {
            error: true,
            message: "Failed to send upload request",
            url: null,
        };
    }
}

/**
 * Updates a file (as a Blob or Buffer) on the DelivAPI server. A filename must be provided to identify which file to update. A new file will be uploaded and replace the existing file with the same filename. Converts a Node.js Buffer to a Blob if necessary, appends required metadata to a FormData object, generates a signature for authentication, and sends a POST request to the specified endpoint. If the file size exceeds the maximum chunk size of 10 MB, it will be uploaded in chunks using the `delivApiUploadLargeFile` function. The function will retry the upload up to a specified number of times if it fails, and returns a `DelivApiUpdateResponse` object containing the server's response.
 *
 * @export
 *
 * @async
 *
 * @param {string} filename - The name of the file to update.
 * @param {(Blob | Buffer)} blob - The new file data, as a Blob or Buffer.
 * @param {{ user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }} [options] - Optional configuration options for the update.
 * @param {string} [options.user] - The username or user identifier for the update. If not provided, it will be read from the `DELIVAPI_USER` environment variable.
 * @param {string} [options.apiKey] - The API key used to sign the request. If not provided, it will be read from the `DELIVAPI_SECRET` or `DELIVAPI_KEY` environment variables.
 * @param {string} [options.endpoint="https://api.timondev.com"] - The API endpoint to update the file on. If not provided, it will be read from the `DELIVAPI_URL` or `DELIVAPI_ENDPOINT` environment variables, or default to "https://api.timondev.com".
 * @param {number} [options.maxRetries=3] - The maximum number of times to retry the update if it fails.
 *
 * @returns {Promise<DelivApiUpdateResponse>} - A promise that resolves to a `DelivApiUpdateResponse` object containing the server's response.
 */
export async function delivApiUpdateFile(filename: string, blob: Blob | Buffer, options?: { user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }): Promise<DelivApiUpdateResponse> {
    const user = options?.user ?? process?.env?.["DELIVAPI_USER"] ?? "";
    const apiKey = options?.apiKey ?? process?.env?.["DELIVAPI_SECRET"] ?? process?.env?.["DELIVAPI_KEY"] ?? "";
    const endpoint = options?.endpoint ?? process?.env?.["DELIVAPI_URL"] ?? process?.env?.["DELIVAPI_ENDPOINT"] ?? "https://api.timondev.com";
    const maxRetries = options?.maxRetries ?? 3;

    if (typeof blob !== "undefined" && Buffer.isBuffer(blob)) {
        const uInt8Array = new Uint8Array(blob);

        const fileTypeResult = await fileTypeFromBuffer(blob);

        const mimeType = fileTypeResult?.mime ?? "application/octet-stream";

        blob = new Blob([uInt8Array], {
            type: mimeType,
        });
    }

    if (blob.size > MAX_CHUNK_SIZE) {
        console.warn("File size exceeds maximum chunk size. Uploading in chunks.");
        return delivApiUploadLargeFile(blob, { user, apiKey, endpoint, filename, maxRetries });
    }

    const signature = crypto
        .createHmac("sha256", apiKey)
        .update(user)
        .update(await blob.bytes())
        .digest("hex");

    const formData = new FormData();

    formData.append("filename", filename);
    formData.append("file", blob);
    formData.append("user", user);

    try {
        const response = await fetch(`${endpoint}/api/update`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        console.info(`DelivAPI Update Response: ${response.status} ${response.statusText}`);

        try {
            const responseData = await response.json();

            if (responseData.error && maxRetries > 0) {
                return await delivApiUpdateFile(filename, blob, { user, apiKey, endpoint, maxRetries: maxRetries - 1 });
            }

            return responseData as unknown as DelivApiUpdateResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
                url: null,
            };
        }
    } catch (error) {
        console.error("Failed to send update request", error);

        return {
            error: true,
            message: "Failed to send update request",
            url: null,
        };
    }
}

/**
 * The wrapper function to upload or update large files on the DelivAPI server. It is called by the `delivApiUpload` and `delivApiUpdateFile` functions when the file size exceeds the maximum chunk size. It splits the file into chunks, uploads the first chunk to initialize the upload session and get the filename, and then uploads the remaining chunks sequentially. If any chunk upload fails, it will retry up to a specified number of times before giving up and returning an error response.
 *
 * @async
 *
 * @param {Blob} blob - The file data to upload or update.
 * @param {{ user: string; apiKey: string; endpoint: string; maxRetries: number; filename?: string }} options - Configuration options for the upload or update.
 * @param {string} options.user - The username or user identifier for the upload or update.
 * @param {string} options.apiKey - The API key used to sign the request.
 * @param {string} options.endpoint - The API endpoint to upload or update the file on.
 * @param {number} options.maxRetries - The maximum number of times to retry the upload or update if it fails.
 * @param {string} [options.filename] - The name of the file to update. If not provided, a new file will be uploaded.
 *
 * @returns {Promise<DelivApiUploadResponse | DelivApiUpdateResponse>} - A promise that resolves to a `DelivApiUploadResponse` or `DelivApiUpdateResponse` object containing the server's response. If a filename is provided in the options, it will attempt to update the file with that name and return a `DelivApiUpdateResponse`. If no filename is provided, it will upload a new file and return a `DelivApiUploadResponse`.
 */
async function delivApiUploadLargeFile(
    blob: Blob,
    options: { user: string; apiKey: string; endpoint: string; maxRetries: number; filename?: string },
): Promise<DelivApiUploadResponse | DelivApiUpdateResponse> {
    // Split the file into chunks
    const chunks: Blob[] = [];

    for (let i = 0; i < blob.size; i += MAX_CHUNK_SIZE) {
        chunks.push(blob.slice(i, i + MAX_CHUNK_SIZE));
    }

    console.info(`File split into ${chunks.length} chunks.`);

    // Upload the first chunk to get the filename and initialize the upload session

    const initialResponse: DelivApiUploadInitialChunkResponse =
        typeof options?.filename === "string"
            ? await delivApiUpdateInitialChunk(options.filename!, chunks[0], chunks.length, { user: options.user, apiKey: options.apiKey, endpoint: options.endpoint, maxRetries: options.maxRetries })
            : await delivApiUploadInitialChunk(chunks[0], chunks.length, { user: options.user, apiKey: options.apiKey, endpoint: options.endpoint, maxRetries: options.maxRetries });

    if (initialResponse.error) {
        console.error("Initial chunk upload failed", initialResponse);
        return initialResponse;
    }

    const filename = initialResponse.url.split("/").pop();

    if (!filename) {
        console.error("Failed to extract filename from URL", initialResponse.url);
        return {
            error: true,
            message: `Failed to extract filename from URL: ${initialResponse.url}`,
            url: null,
        };
    }

    console.info(`Initial chunk uploaded successfully. Filename: ${filename}`);

    // Upload the remaining chunks
    for (let i = 1; i < chunks.length; i++) {
        console.info(`Uploading chunk ${i + 1} of ${chunks.length}...`);

        const response = await delivApiUploadChunk(i, filename, chunks[i], {
            user: options.user,
            apiKey: options.apiKey,
            endpoint: options.endpoint,
            maxRetries: options.maxRetries,
        });

        if (response.error) {
            console.error(`Chunk ${i + 1} upload failed`, response);
            return {
                error: true,
                message: `Chunk ${i + 1} upload failed: ${response.message}`,
                url: null,
            };
        }

        console.info(`Chunk ${i + 1} uploaded successfully.`);
    }

    console.info("All chunks uploaded successfully.");

    return initialResponse;
}

/**
 * Uploads the initial chunk of a large file to the DelivAPI server to initialize the upload session and get the filename. This function is called by the `delivApiUploadLargeFile` function when the file size exceeds the maximum chunk size. It sends a POST request with the first chunk of the file and required metadata, and returns the server's response which includes the URL of the file the uploaded chunk belongs to.
 *
 * @async
 *
 * @param {Blob} blob - The chunk data to upload.
 * @param {number} chunkCount - The total number of chunks the file is divided into.
 * @param {{ user: string; apiKey: string; endpoint: string; maxRetries: number }} options - Configuration options for the upload of the initial chunk.
 * @param {string} options.user - The username or user identifier for the upload.
 * @param {string} options.apiKey - The API key used to sign the request.
 * @param {string} options.endpoint - The API endpoint to upload the chunk on.
 * @param {number} options.maxRetries - The maximum number of times to retry the upload if it fails.
 *
 * @returns {Promise<DelivApiUploadInitialChunkResponse>} - A promise that resolves to a `DelivApiUploadInitialChunkResponse` object containing the server's response.
 */
async function delivApiUploadInitialChunk(
    blob: Blob,
    chunkCount: number,
    options: { user: string; apiKey: string; endpoint: string; maxRetries: number },
): Promise<DelivApiUploadInitialChunkResponse> {
    const signature = crypto
        .createHmac("sha256", options.apiKey)
        .update(options.user)
        .update(await blob.bytes())
        .digest("hex");

    const formData = new FormData();

    formData.append("chunk", blob);
    formData.append("chunkCount", chunkCount.toString());
    formData.append("user", options.user);

    try {
        const response = await fetch(`${options.endpoint}/api/uploadInitialChunk`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        console.info(`DelivAPI Initial Chunk Upload Response: ${response.status} ${response.statusText}`);

        try {
            const responseData = await response.json();

            if (responseData.error && options.maxRetries > 0) {
                return await delivApiUploadInitialChunk(blob, chunkCount, { user: options.user, apiKey: options.apiKey, endpoint: options.endpoint, maxRetries: options.maxRetries - 1 });
            }

            return responseData as unknown as DelivApiUploadInitialChunkResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
                url: null,
            };
        }
    } catch (error) {
        console.error("Failed to send initial chunk upload request", error);

        return {
            error: true,
            message: "Failed to send initial chunk upload request",
            url: null,
        };
    }
}

/**
 * Uploads the initial chunk of a large file to the DelivAPI server to initialize the update session and get the filename. This function is called by the `delivApiUploadLargeFile` function when the file size exceeds the maximum chunk size and a filename is provided. It sends a POST request with the first chunk of the file and required metadata, and returns the server's response which includes the URL of the file the uploaded chunk belongs to.
 *
 * @async
 *
 * @param {string} filename - The name of the file to update.
 * @param {Blob} blob - The chunk data to upload.
 * @param {number} chunkCount - The total number of chunks the file is divided into.
 * @param {{ user: string; apiKey: string; endpoint: string; maxRetries: number }} options - Configuration options for the upload of the initial chunk.
 * @param {string} options.user - The username or user identifier for the upload.
 * @param {string} options.apiKey - The API key used to sign the request.
 * @param {string} options.endpoint - The API endpoint to upload the chunk on.
 * @param {number} options.maxRetries - The maximum number of times to retry the upload if it fails.
 *
 * @returns {Promise<DelivApiUpdateInitialChunkResponse>} - A promise that resolves to a `DelivApiUpdateInitialChunkResponse` object containing the server's response.
 */
async function delivApiUpdateInitialChunk(
    filename: string,
    blob: Blob,
    chunkCount: number,
    options: { user: string; apiKey: string; endpoint: string; maxRetries: number },
): Promise<DelivApiUpdateInitialChunkResponse> {
    const signature = crypto
        .createHmac("sha256", options.apiKey)
        .update(options.user)
        .update(await blob.bytes())
        .digest("hex");

    const formData = new FormData();

    formData.append("filename", filename);
    formData.append("chunk", blob);
    formData.append("chunkCount", chunkCount.toString());
    formData.append("user", options.user);

    try {
        const response = await fetch(`${options.endpoint}/api/updateInitialChunk`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        console.info(`DelivAPI Initial Chunk Update Response: ${response.status} ${response.statusText}`);

        try {
            const responseData = await response.json();

            if (responseData.error && options.maxRetries > 0) {
                return await delivApiUpdateInitialChunk(filename, blob, chunkCount, { user: options.user, apiKey: options.apiKey, endpoint: options.endpoint, maxRetries: options.maxRetries - 1 });
            }

            return responseData as unknown as DelivApiUpdateInitialChunkResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
                url: null,
            };
        }
    } catch (error) {
        console.error("Failed to send initial chunk update request", error);

        return {
            error: true,
            message: "Failed to send initial chunk update request",
            url: null,
        };
    }
}

/**
 * Uploads a chunk of a large file to the DelivAPI server. This function is called by the `delivApiUploadLargeFile` function for each chunk of the file after the initial chunk has been uploaded. It sends a POST request with the chunk data and required metadata, and returns the server's response which indicates whether the chunk upload was successful or if it failed and needs to be retried.
 *
 * @async
 *
 * @param {number} chunkIndex - The index of the chunk to upload.
 * @param {string} filename - The name of the file to upload the chunk to.
 * @param {Blob} blob - The chunk data to upload.
 * @param {{ user: string; apiKey: string; endpoint: string; maxRetries: number }} options - Configuration options for the upload of the initial chunk.
 * @param {string} options.user - The username or user identifier for the upload.
 * @param {string} options.apiKey - The API key used to sign the request.
 * @param {string} options.endpoint - The API endpoint to upload the chunk on.
 * @param {number} options.maxRetries - The maximum number of times to retry the upload if it fails.
 *
 * @returns {Promise<DelivApiUploadChunkResponse>} - A promise that resolves to a `DelivApiUploadChunkResponse` object containing the server's response.
 */
async function delivApiUploadChunk(
    chunkIndex: number,
    filename: string,
    blob: Blob,
    options: { user: string; apiKey: string; endpoint: string; maxRetries: number },
): Promise<DelivApiUploadChunkResponse> {
    const signature = crypto
        .createHmac("sha256", options.apiKey)
        .update(options.user)
        .update(await blob.bytes())
        .digest("hex");

    const formData = new FormData();

    formData.append("chunkIndex", chunkIndex.toString());
    formData.append("filename", filename);
    formData.append("chunk", blob);
    formData.append("user", options.user);

    try {
        const response = await fetch(`${options.endpoint}/api/uploadChunk`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        try {
            const responseData = await response.json();

            if (responseData.error && options.maxRetries > 0) {
                console.warn(`Chunk upload failed, retrying... (${options.maxRetries} retries left)`, responseData);

                return await delivApiUploadChunk(chunkIndex, filename, blob, { user: options.user, apiKey: options.apiKey, endpoint: options.endpoint, maxRetries: options.maxRetries - 1 });
            }

            return responseData as unknown as DelivApiUploadChunkResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
            };
        }
    } catch (error) {
        console.error("Failed to send chunk upload request", error);

        return {
            error: true,
            message: "Failed to send chunk upload request",
        };
    }
}

export async function delivApiDeleteFile(filename: string, options?: { user?: string; apiKey?: string; endpoint?: string }): Promise<DelivApiResponse> {
    const user = options?.user ?? process?.env?.["DELIVAPI_USER"] ?? "";
    const apiKey = options?.apiKey ?? process?.env?.["DELIVAPI_SECRET"] ?? process?.env?.["DELIVAPI_KEY"] ?? "";
    const endpoint = options?.endpoint ?? process?.env?.["DELIVAPI_URL"] ?? process?.env?.["DELIVAPI_ENDPOINT"] ?? "https://api.timondev.com";

    const signature = crypto.createHmac("sha256", apiKey).update(user).update(filename).digest("hex");

    const formData = new FormData();

    formData.append("filename", filename);
    formData.append("user", user);

    try {
        const response = await fetch(`${endpoint}/api/deleteFile`, {
            method: "POST",
            headers: {
                "x-signature": signature,
            },
            body: formData,
        });

        console.info(`DelivAPI Delete File Response: ${response.status} ${response.statusText}`);

        try {
            const responseData = await response.json();

            return responseData as unknown as DelivApiResponse;
        } catch (error) {
            console.error("Failed to parse response body as JSON", error);

            return {
                error: true,
                message: "Failed to parse response body as JSON",
            };
        }
    } catch (error) {
        console.error("Failed to send delete file request", error);

        return {
            error: true,
            message: "Failed to send delete file request",
        };
    }
}

export default delivApiUpload;

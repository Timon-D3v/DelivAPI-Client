declare module "delivapi-client";

export type DelivApiResponse = {
    error: boolean;
    message: string;
};

export type DelivApiUploadResponse =
    | (Omit<DelivApiResponse, "error"> & {
          error: true;
          url: null;
      })
    | (Omit<DelivApiResponse, "error"> & {
          error: false;
          url: string;
      });

export type DelivApiUpdateResponse =
    | (Omit<DelivApiResponse, "error"> & {
          error: true;
          url: null;
      })
    | (Omit<DelivApiResponse, "error"> & {
          error: false;
          url: string;
      });

export type DelivApiUploadInitialChunkResponse =
    | (Omit<DelivApiResponse, "error"> & {
          error: true;
          url: null;
      })
    | (Omit<DelivApiResponse, "error"> & {
          error: false;
          url: string;
      });

export type DelivApiUpdateInitialChunkResponse = DelivApiUploadInitialChunkResponse;

export type DelivApiUploadChunkResponse = DelivApiResponse;

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
declare function delivApiUpload(blob: Blob | Buffer, options?: { user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }): Promise<DelivApiUploadResponse>;

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
declare function delivApiUpdateFile(filename: string, blob: Blob | Buffer, options?: { user?: string; apiKey?: string; endpoint?: string; maxRetries?: number }): Promise<DelivApiUpdateResponse>;

/**
 * Deletes a file from the DelivAPI server. It sends a POST request with the filename for deletion, and returns the server's response which indicates whether the file was successfully deleted or if it failed. The request will not be retried.
 *
 *
 * @export
 *
 * @async
 *
 * @param {string} filename - The name of the file to delete.
 * @param {{ user: string; apiKey: string; endpoint: string; maxRetries: number }} options - Configuration options for the deletion.
 * @param {string} options.user - The username or user identifier for the deletion.
 * @param {string} options.apiKey - The API key used to sign the request.
 * @param {string} options.endpoint - The API endpoint to delete the file from.
 *
 * @returns {Promise<DelivApiResponse>} - A promise that resolves to a `DelivApiResponse` object containing the server's response.
 */
declare function delivApiDeleteFile(filename: string, options?: { user?: string; apiKey?: string; endpoint?: string }): Promise<DelivApiResponse>;

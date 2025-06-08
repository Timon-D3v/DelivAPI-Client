declare module "delivapi-client";

export type DelivApiResponse = {
    error: boolean;
    message: string;
    url?: string;
};

declare function createRawData(blob: Blob, mimeType: string, fileExtension: string, timestamp: string): Promise<string>;
declare function delivApiUpload(endpoint: string, apiKey: string, file: Blob): Promise<DelivApiResponse>;

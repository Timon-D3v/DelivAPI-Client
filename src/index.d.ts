declare module "delivapi-client";

export type DelivApiResponse = {
    error: boolean;
    message: string;
    url?: string;
};

declare function createRawData(blob: Blob | Buffer, user: string, mimeType: string, fileExtension: string, timestamp: string): Promise<string>;
declare function delivApiUpload(user: string, apiKey: string, blob: Blob | Buffer, mimeType: string, endpoint: string = "api.timondev.com/api/upload"): Promise<DelivApiResponse>;

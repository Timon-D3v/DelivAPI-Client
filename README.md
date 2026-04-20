# delivapi-client

TypeScript/JavaScript client for **DelivAPI** — my personal CDN/WebAPI for uploading (and later pulling) images and other files.

- NPM: `delivapi-client`
- Client repo: https://github.com/Timon-D3v/DelivAPI-Client
- Server repo: https://github.com/Timon-D3v/DelivAPI
- Version: **2.0.0** (improved database structure, new chunked uploads, more specific types)

---

## Features

- Upload files as **`Blob`** (web/Node) or **`Buffer`** (Node)
- Automatic MIME detection for `Buffer` uploads via [`file-type`](https://www.npmjs.com/package/file-type)
- HMAC signing (`x-signature` header)
- **Chunked uploads for files > 10 MB** (default chunk size: 10MB)
- Typed responses (`DelivApiUploadResponse`, `DelivApiUpdateResponse`, etc.)

---

## Install

```bash
npm install delivapi-client
```

> Note: This package uses `fetch`, `FormData`, and `Blob`. For Node.js usage, you typically want Node **18+** (or provide compatible polyfills).

---

## Quick start (Upload)

### Node.js (Buffer)

```ts
import { readFile } from "node:fs/promises";
import delivApiUpload from "delivapi-client";

const data = await readFile("./image.png");

const res = await delivApiUpload(data, {
  user: process.env.DELIVAPI_USER,
  apiKey: process.env.DELIVAPI_SECRET,
  endpoint: "https://api.timondev.com",
});

if (res.error) {
  console.error("Upload failed:", res.message);
} else {
  console.log("Uploaded:", res.url);
}
```

### Browser / Web (Blob / File)

```ts
import delivApiUpload from "delivapi-client";

const input = document.querySelector<HTMLInputElement>("#file")!;
const file = input.files?.[0];
if (!file) throw new Error("No file selected");

const res = await delivApiUpload(file, {
  user: "YOUR_USER",
  apiKey: "YOUR_API_KEY",
  endpoint: "https://api.timondev.com",
});

if (!res.error) {
  console.log("Uploaded:", res.url);
}
```
> Warning: It is not recommended to use this package in the browser since this would expose your api key!

---

## Update an existing file

Use `delivApiUpdateFile(filename, blob)` to replace/update an existing file identified by `filename`.

```ts
import { delivApiUpdateFile } from "delivapi-client";
import { readFile } from "node:fs/promises";

const data = await readFile("./new-image.png");

const res = await delivApiUpdateFile("existing-file.png", data, {
  user: process.env.DELIVAPI_USER,
  apiKey: process.env.DELIVAPI_SECRET,
  endpoint: process.env.DELIVAPI_URL, // optional
});

if (res.error) {
  console.error("Update failed:", res.message);
} else {
  console.log("Updated:", res.url);
}
```

---

## Configuration

You can pass options directly, or use environment variables:

### Options

| Option | Type | Default | Description |
|---|---|---:|---|
| `user` | `string` | `""` | DelivAPI user identifier |
| `apiKey` | `string` | `""` | HMAC signing secret / API key |
| `endpoint` | `string` | `https://api.timondev.com` | DelivAPI server base URL |
| `maxRetries` | `number` | `3` | Number of retries when an API response indicates an error |

### Environment variables

| Variable | Purpose |
|---|---|
| `DELIVAPI_USER` | Default `user` |
| `DELIVAPI_SECRET` or `DELIVAPI_KEY` | Default `apiKey` |
| `DELIVAPI_URL` or `DELIVAPI_ENDPOINT` | Default `endpoint` |

---

## Chunked uploads

- Files larger than **10 MB** are uploaded in chunks automatically.
- Chunk size: **10 MB** (hardcoded in the current client)
- Chunked upload uses these server endpoints:
  - `POST /api/uploadInitialChunk`
  - `POST /api/uploadChunk`
  - `POST /api/updateInitialChunk`

---

## API

### Default export

```ts
import delivApiUpload from "delivapi-client";
```

### Named exports

```ts
import { delivApiUpdateFile } from "delivapi-client";
```

---

## Types

This package ships TypeScript types.

### Response types

```ts
export type DelivApiResponse = {
  error: boolean;
  message: string;
};

export type DelivApiUploadResponse =
  | { error: true; message: string; url: null }
  | { error: false; message: string; url: string };

export type DelivApiUpdateResponse =
  | { error: true; message: string; url: null }
  | { error: false; message: string; url: string };

export type DelivApiUploadInitialChunkResponse =
  | { error: true; message: string; url: null }
  | { error: false; message: string; url: string };

export type DelivApiUploadChunkResponse = DelivApiResponse;
```

---

## Endpoints & authentication (overview)

The client sends a `POST` request with `FormData` and a request signature:

- Header: `x-signature: <hex-hmac>`
- The signature is an HMAC-SHA256 computed from:
  - `user`
  - file/chunk bytes

---

## Troubleshooting

### `fetch` / `FormData` / `Blob` not found (Node.js)
Make sure you are running Node **18+**.  
If you must support older Node versions, you may need to polyfill `fetch`/`FormData`/`Blob` (e.g. via `undici`).

### Upload returns `{ error: true, ... }`
- Confirm `DELIVAPI_USER` and `DELIVAPI_SECRET` (or `DELIVAPI_KEY`) are set correctly
- Confirm `endpoint` points to your DelivAPI server
- Check server logs in the DelivAPI repo

---

## License

MIT © Timon Fiedler (@Timon-D3v)
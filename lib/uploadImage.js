import { fileTypeFromBuffer } from 'file-type';
import FormData from 'form-data';
import fetch from 'node-fetch';

/**
 * Upload via RyzenCDN
 * @param {Buffer} content File Buffer
 * @return {Promise<string>}
 */
const uploadPomf = async (content) => {
  try {
    if (!Buffer.isBuffer(content)) throw new Error('content must be a Buffer');

    const type = await fileTypeFromBuffer(content);
    if (!type) throw new Error('Unsupported or unknown file type');

    const form = new FormData();
    form.append('file', content, {
      filename: `upload.${type.ext}`,
      contentType: type.mime,
    });

    const res = await fetch(`${APIs.ryzumi}/api/uploader/ryzencdn`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...form.getHeaders(),
      },
      body: form,
    });

    const json = await res.json();

    // Common response shapes fallback
    if (json?.success === true && json?.data?.url) return json.data.url;
    if (json?.success === true && json?.url) return json.url;
    if (Array.isArray(json) && json[0]?.url) return json[0].url;

    throw new Error(json?.message || 'Upload failed');
  } catch (error) {
    console.error('RyzenCDN upload failed:', error?.message || error);
    throw error;
  }
};

export { uploadPomf };

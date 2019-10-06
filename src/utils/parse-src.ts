/**
 * Parse a resource into a JSON object or a URL string
 */
export function parseSrc(src: string | object): string | object {
    if (typeof src === 'object') {
        return src;
    }

    try {
        return JSON.parse(src);
    } catch (e) {
        // Try construct an absolute URL from the src URL
        const srcUrl: URL = new URL(src, window.location.href);

        return srcUrl.toString();
    }
}

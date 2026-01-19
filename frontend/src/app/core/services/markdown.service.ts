import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SafeMarkdownService {

  // Escape all HTML except allowed tags
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  parse(content: string, verbos: boolean, media: any[] = []): string {
    let safe = this.escapeHtml(content);

    // Replace internal media URLs with presigned ones if available
    if (media && media.length > 0) {
      media.forEach(m => {
        if (m.mediaUrl && m.mediaUrl.startsWith('http')) {
          // Create a safe pattern to match the filename/path part
          // Assuming the markdown link is something like /media/bucket/filename
          // We try to match the filename in the text with the filename in the mediaUrl
          // But a safer bet is replacing the exact path if we knew it. 
          // From the JSON, content has "/media/videos/UUID-Filename.ext"
          // mediaUrl has "http://localhost:9000/videos/UUID-Filename.ext?..."
          // The internal part /media/bucket/filename seems to match the bucket/filename structure
          // Let's extract the filename from the ID or mediaUrl.
          // Actually, let's just use the media URL logic. 
          // If the SafeMarkdownService sees a link that ENDS with the filename of a media item, replace it?
          // No, that's risky.

          // Better approach: The backend `PostService` was supposed to replace {{MEDIA_INDEX}} with the permalink.
          // The permalink is `/media/bucket/filename`. 
          // The media item has `mediaUrl` which is the presigned URL.
          // We can reconstruct the permalink from the media item if we know the bucket.
          // `mediaType` is VIDEOS -> bucket 'videos'.
          // So permalink is `/media/${m.mediaType.toLowerCase()}/${extractFilename(m.mediaUrl)}`?
          // Or the `id`?
          // Let's look at the example: 
          // Content: `/media/videos/497e...webm`
          // MediaUrl: `.../videos/497e...webm?...`
          // So if we find the substring `/media/videos/FILENAME` in content, replace with `MediaUrl`.

          // Let's try to match by filename.
          try {
            const urlObj = new URL(m.mediaUrl);
            const pathname = urlObj.pathname; // /videos/filename
            const filename = pathname.split('/').pop();
            if (filename) {
              // Replace /media/bucket/filename OR just /bucket/filename if that's what is in there
              // The user showed "/media/videos/..."
              const bucket = m.mediaType.toLowerCase();
              const permalink = `/media/${bucket}/${filename}`;
              // encoded permalink might be in the text? The text has non-encoded spaces usually or encoded.
              // The user example has spaces: "...-Screencast from ..." 
              // So we should try to replace the string literal.

              // Global replace of the permalink with the mediaUrl
              // We escape the permalink for regex usage
              const escapedPermalink = permalink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
              const regex = new RegExp(escapedPermalink, 'g');
              safe = safe.replace(regex, m.mediaUrl);

              // Also try encoded version just in case
              const encodedPermalink = encodeURI(permalink);
              if (encodedPermalink !== permalink) {
                const escapedEncoded = encodedPermalink.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regexEncoded = new RegExp(escapedEncoded, 'g');
                safe = safe.replace(regexEncoded, m.mediaUrl);
              }
            }
          } catch (e) {
            // ignore invalid urls
          }
        }
      });
    }

    // Headings
    safe = safe.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    safe = safe.replace(/^# (.*)$/gm, "<h1>$1</h1>");

    // Bold & Italic
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/_(.*?)_/g, "<em>$1</em>");

    // Bullet lists
    safe = safe.replace(/^- (.*)$/gm, "<li>$1</li>");
    // Wrap consecutive <li> in <ul>
    safe = safe.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");



    // Videos: <video src="url" ...> or detect <video> tags safely
    if (!verbos) {
      // Images/Videos: ![alt](url)
      safe = safe.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => {
        const safeUrl = this.sanitizeUrl(url);
        const encodedUrl = encodeURI(safeUrl).replace(/%25/g, '%'); // Avoid double encoding if already encoded
        if (encodedUrl.match(/\.(mp4|webm|ogg)$/i)) {
          return `<video src="${encodedUrl}" controls style="max-width:100%; margin:5px 0;"></video>`;
        }
        return `<img src="${encodedUrl}" alt="${alt}" style="max-width:100%; margin:5px 0;" />`;
      });
      safe = safe.replace(/&lt;video src=&quot;(.*?)&quot;.*?&gt;&lt;\/video&gt;/g, (_match, url) => {
        const safeUrl = this.sanitizeUrl(url);
        return `<video src="${safeUrl}" controls style="max-width:100%; margin:5px 0;"></video>`;
      });
    }

    // Line breaks
    safe = safe.replace(/\n/g, "<br>");

    return safe;
  }

  // Allow only http(s) or data URLs
  private sanitizeUrl(url: string): string {
    if (/^(\/|https?:|data:)/.test(url)) return url;
    return "";
  }
}

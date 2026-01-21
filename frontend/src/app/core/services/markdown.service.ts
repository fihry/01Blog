import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class MarkdownService {
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  parse(content: string, verbose: boolean, media: any[] = []): string {
    let safe = this.escapeHtml(content);
    if (media?.length > 0) {
      safe = this.replaceMediaUrls(safe, media);
    }

    // Code blocks first (to protect their content)
    safe = safe.replace(/```([\s\S]*?)```/g, "<pre><code>$1</code></pre>");

    // Inline code
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Headings (all levels, order matters - longest first)
    safe = safe.replace(/^###### (.*)$/gm, "<h6>$1</h6>");
    safe = safe.replace(/^##### (.*)$/gm, "<h5>$1</h5>");
    safe = safe.replace(/^#### (.*)$/gm, "<h4>$1</h4>");
    safe = safe.replace(/^### (.*)$/gm, "<h3>$1</h3>");
    safe = safe.replace(/^## (.*)$/gm, "<h2>$1</h2>");
    safe = safe.replace(/^# (.*)$/gm, "<h1>$1</h1>");

    // Bold & Italic (process *** before ** before *)
    safe = safe.replace(/\*\*\*(.*?)\*\*\*/g, "<strong><em>$1</em></strong>");
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*(.*?)\*/g, "<em>$1</em>");
    safe = safe.replace(/__(.*?)__/g, "<strong>$1</strong>");
    safe = safe.replace(/_(.*?)_/g, "<em>$1</em>");

    // Strikethrough
    safe = safe.replace(/~~(.*?)~~/g, "<del>$1</del>");

    // Horizontal rule
    safe = safe.replace(/^---$/gm, "<hr>");
    safe = safe.replace(/^\*\*\*$/gm, "<hr>");

    // Blockquotes
    safe = safe.replace(/^> (.*)$/gm, "<blockquote>$1</blockquote>");

    // Images and Videos
    if (!verbose) {
      safe = this.processMediaTags(safe);
    }

    // Links
    safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
      const safeUrl = this.sanitizeUrl(url);
      return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });

    // Numbered lists
    safe = safe.replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>");
    safe = this.wrapConsecutiveTags(safe, "li", "ol");

    // Bullet lists
    safe = safe.replace(/^[-*]\s+(.*)$/gm, "<li>$1</li>");
    safe = this.wrapConsecutiveTags(safe, "li", "ul");

    // Paragraphs (wrap text blocks that aren't already wrapped)
    safe = safe.replace(/^(?!<[^>]+>)(.+)$/gm, "<p>$1</p>");
    return safe;
  }

  private replaceMediaUrls(content: string, media: any[]): string {
    media.forEach(m => {
      if (m.mediaUrl?.startsWith('http')) {
        try {
          const urlObj = new URL(m.mediaUrl);
          const filename = urlObj.pathname.split('/').pop();

          if (filename) {
            const bucket = m.mediaType.toLowerCase();
            const permalink = `/media/${bucket}/${filename}`;

            // Replace both encoded and non-encoded versions
            const escapedPermalink = this.escapeRegex(permalink);
            // content = content.replace(new RegExp(escapedPermalink, 'g'), m.mediaUrl);

            const encodedPermalink = encodeURI(permalink);
            if (encodedPermalink !== permalink) {
              const escapedEncoded = this.escapeRegex(encodedPermalink);
              content = content.replace(new RegExp(escapedEncoded, 'g'), m.mediaUrl);
            }
          }
        } catch (e) {
          console.warn('Invalid media URL:', m.mediaUrl);
        }
      }
    });
    return content;
  }

  private processMediaTags(content: string): string {
    // Process ![alt](url) syntax
    content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, url) => {
      const safeUrl = this.sanitizeUrl(url);
      const encodedUrl = this.encodeUrlSafely(safeUrl);

      if (this.isVideoUrl(encodedUrl)) {
        return `<video src="${encodedUrl}" controls></video>`;
      }
      return `<img src="${encodedUrl}" alt="${alt}" />`;
    });

    // Process escaped <video> tags
    content = content.replace(
      /&lt;video src=&quot;(.*?)&quot;.*?&gt;&lt;\/video&gt;/g,
      (match, url) => {
        const safeUrl = this.sanitizeUrl(url);
        return `<video src="${safeUrl}" controls></video>`;
      }
    );

    return content;
  }

  private wrapConsecutiveTags(content: string, innerTag: string, wrapperTag: string): string {
    const pattern = new RegExp(`(<${innerTag}>.*?<\/${innerTag}>\\s*)+`, 'gs');
    return content.replace(pattern, match => `<${wrapperTag}>${match}</${wrapperTag}>`);
  }

  private isVideoUrl(url: string): boolean {
    return /\.(mp4|webm|ogg)$/i.test(url);
  }

  private encodeUrlSafely(url: string): string {
    // Avoid double encoding
    return encodeURI(url).replace(/%25/g, '%');
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private sanitizeUrl(url: string): string {
    // Allow only http(s), data URLs, or relative paths
    if (/^(\/|https?:|data:|blob:)/.test(url)) return url;
    return "";
  }
}
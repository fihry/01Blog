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

  parse(content: string, verbos: boolean): string {
    let safe = this.escapeHtml(content);

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
      // Images: ![alt](url)
      safe = safe.replace(/!\[(.*?)\]\((.*?)\)/g, (_match, alt, url) => {
        const safeUrl = this.sanitizeUrl(url);
        return `<img src="${safeUrl}" alt="${alt}" style="max-width:100%; margin:5px 0;" />`;
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
    if (/^(https?:|data:)/.test(url)) return url;
    return "";
  }
}

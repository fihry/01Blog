
import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class SafeMarkdownService {

  // 1. Escape all HTML (CRITICAL for XSS safety)
  private escapeHtml(text: string): string {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;")
  }

  // 2. Parse limited, safe markdown
  parse(content: string): string {
    let safe = this.escapeHtml(content)

    // Headings
    safe = safe.replace(/^## (.*)$/gm, "<h2>$1</h2>")
    safe = safe.replace(/^# (.*)$/gm, "<h1>$1</h1>")

    // Bold & Italic
    safe = safe.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    safe = safe.replace(/_(.*?)_/g, "<em>$1</em>")

    // Bullet lists (group them later with CSS)
    safe = safe.replace(/^- (.*)$/gm, "<li>$1</li>")

    // Line breaks
    safe = safe.replace(/\n/g, "<br>")

    return safe
  }
}

declare module "html-to-text" {
  export type HtmlToTextSelector = {
    selector: string;
    format?: "skip" | string;
    options?: Record<string, unknown>;
  };

  export type HtmlToTextOptions = {
    wordwrap?: number | false;
    preserveNewlines?: boolean;
    selectors?: HtmlToTextSelector[];
  };

  export function convert(html: string, options?: HtmlToTextOptions): string;
}

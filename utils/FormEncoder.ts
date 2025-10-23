export class FormEncoder {
    static encode(data: Record<string, string>): string {
      return Object.entries(data)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    }
  }
  
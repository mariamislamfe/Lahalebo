export interface Branch {
  id: string;
  name: string;
  area?: string;
  address?: string;
  /** Free text, e.g. "يوميًا ١٢ الظهر – ٢ بالليل". Leave undefined until verified. */
  hours?: string;
  phone?: string;
  mapUrl?: string;
  /** Marks demo entries so the UI can flag them. Remove once real data is in. */
  isPlaceholder?: boolean;
}

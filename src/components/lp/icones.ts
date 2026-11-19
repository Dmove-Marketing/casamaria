// Ícones (SVG inline, traço) das grades de tipos de evento das páginas vindas do WordPress.
// Substituem os ícones de fonte do Elementor: zero requisição extra.
const p = (d: string) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

export const icones: Record<string, string> = {
  alianca: p('<circle cx="12" cy="14" r="6"/><path d="M9 4h6l-1.5 3h-3z"/>'),
  miniWedding: p('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>'),
  civil: p('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 16c1-1.5 2-1.5 3 0s2 1.5 3 0"/>'),
  brinde: p('<path d="M8 3h4l-.5 6a2.5 2.5 0 0 1-3 0z"/><path d="M10 11v8M7.5 19h5"/><path d="M14 5h4l-.5 6a2.5 2.5 0 0 1-3 0z"/><path d="M16 13v6M13.5 19h5"/>'),
  casal: p('<circle cx="8" cy="7" r="3"/><circle cx="16" cy="7" r="3"/><path d="M3 20a5 5 0 0 1 10 0M11 20a5 5 0 0 1 10 0"/>'),
  camera: p('<path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13.5" r="3.5"/>'),
  taca: p('<path d="M7 3h10l-1 6a4 4 0 0 1-8 0z"/><path d="M12 13v7M8.5 20h7"/>'),
  aviao: p('<path d="M10.5 13.5 3 11l1.5-1.5 8 1 4-4a2 2 0 0 1 3 3l-4 4 1 8L16 23l-2.5-7.5"/>'),
  quadro: p('<rect x="3" y="4" width="18" height="12" rx="1"/><path d="M8 20l4-4 4 4M7 9h6M7 12h9"/>'),
  ideia: p('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>'),
  microfone: p('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'),
  foguete: p('<path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2"/><path d="M14 4c3-1 6-1 6-1s0 3-1 6l-6 6-5-5z"/><circle cx="15" cy="9" r="1.5"/>'),
  filmadora: p('<rect x="3" y="7" width="13" height="10" rx="1.5"/><path d="m16 11 5-3v8l-5-3"/>'),
  pin: p('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
};

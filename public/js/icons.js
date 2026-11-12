(function(){
const P={
'arrow':'<path d="M5 12h14M12 5l7 7-7 7"/>',
'check':'<path d="M20 6 9 17l-5-5"/>',
'shield':'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
'qr':'<path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3z"/><path d="M14 14h3v3h-3zM20 14v3M14 20h3M20 20h1"/>',
'truck':'<path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
'store':'<path d="M4 4h16l1 5H3z"/><path d="M5 9v11h14V9M10 20v-6h4v6"/>',
'building':'<path d="M4 21V4h10v17M14 9h6v12M3 21h18M8 8h2M8 12h2M8 16h2"/>',
'users':'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
'leaf':'<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
'package':'<path d="M16.5 9.4 7.5 4.21M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/>',
'flask':'<path d="M10 2v7.31M14 9.3V1.99M8.5 2h7M14 9.3a6.5 6.5 0 1 1-4 0M5.52 16h12.96"/>',
'drop':'<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
'heart':'<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"/>',
'home':'<path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
'cup':'<path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v2M10 2v2M14 2v2"/>',
'utensils':'<path d="M3 2v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2M7 2v20M21 15V2a5 5 0 0 0-5 5v6a2 2 0 0 0 2 2h3zm0 0v7"/>',
'spark':'<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
'pin':'<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
'phone':'<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>',
'mail':'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
'clock':'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
'down':'<path d="m6 9 6 6 6-6"/>',
'globe':'<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z"/>',
'layers':'<path d="M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
'thermo':'<path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0z"/>',
'share':'<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98"/>',
'menu':'<path d="M3 12h18M3 6h18M3 18h18"/>',
'x':'<path d="M18 6 6 18M6 6l12 12"/>',
'award':'<circle cx="12" cy="8" r="6"/><path d="M15.48 12.89 17 22l-5-3-5 3 1.52-9.11"/>',
'nav':'<path d="m3 11 19-9-9 19-2-8z"/>',
'factory':'<path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4H2z"/>',
'clip':'<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M9 14l2 2 4-4"/>',
'scan':'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
'trend':'<path d="M22 7l-8.5 8.5-5-5L2 17M16 7h6v6"/>'
};
let s='<svg xmlns="http://www.w3.org/2000/svg" style="display:none">';
for(const k in P)s+=`<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[k]}</symbol>`;
s+='</svg>';
document.body.insertAdjacentHTML('afterbegin',s);
window.ic=(n,c='')=>`<svg class="i ${c}" aria-hidden="true"><use href="#i-${n}"/></svg>`;
document.querySelectorAll('[data-i]').forEach(e=>e.insertAdjacentHTML('afterbegin',ic(e.dataset.i)));
})();

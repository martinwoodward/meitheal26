import PptxGenJS from 'pptxgenjs';
import fs from 'fs';
import JSZip from 'jszip';

const OUT = process.argv[2] || 'out/deck.pptx';
const F = 'Avenir Next', MONO = 'Menlo';
const BG = 'EEF1F1', TEAL = '073B49', MUTED = '526B72', BORDER = 'D3E0E1', ACC = 'DCE8E9', SKY = '099DD5',
  COP = 'B45F2E', GREEN = '1F8A5B', RED = 'C0392B', WHITE = 'FFFFFF', LIGHT = 'CFE3E6', DARK2 = '0C1416';
const img = n => `img/${n}.png`;
const b64 = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Martin Woodward';
pptx.company = 'martin@woodwardweb.com';
pptx.title = 'Digital wallets & delegated authority — Digital Meitheal 2026';
pptx.theme = {headFontFace: F, bodyFontFace: F};

let n = 0;
const videos = []; // {slide, file, ms}
const FOOT = 'Digital Meitheal 2026 · Day 2 · Draft for discussion · Martin Woodward';

function footer(s, dark) {
  s.addText(FOOT, {x: 0.6, y: 7.0, w: 9, h: 0.3, fontFace: F, fontSize: 9, color: dark ? '7FA3AB' : MUTED});
  s.addText(String(n), {x: 12.2, y: 7.0, w: 0.55, h: 0.3, fontFace: F, fontSize: 9, color: dark ? '7FA3AB' : MUTED, align: 'right'});
}
function base(kicker, title, opts = {}) {
  n++;
  const s = pptx.addSlide();
  s.background = {color: BG};
  s.addText(kicker.toUpperCase(), {x: 0.6, y: 0.32, w: 10, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
  s.addText(title, {x: 0.6, y: 0.6, w: opts.tw || 11.6, h: 0.7, fontFace: F, fontSize: opts.ts || 28, bold: true, color: TEAL, margin: 0, valign: 'top'});
  if (opts.draft) tag(s, 'DRAFT PROPOSAL', 11.0, 0.34);
  footer(s);
  return s;
}
function tag(s, text, x, y, color = COP) {
  s.addText(text, {x, y, w: Math.max(1.75, text.length * 0.11 + 0.4), h: 0.32, fontFace: F, fontSize: 9.5, bold: true, color, charSpacing: 2, align: 'center',
    shape: pptx.ShapeType.roundRect, rectRadius: 0.06, line: {color, width: 1.25}, fill: {color: WHITE}, margin: 0});
}
function card(s, x, y, w, h, o = {}) {
  s.addShape(pptx.ShapeType.roundRect, {x, y, w, h, rectRadius: 0.12, fill: {color: o.fill || WHITE},
    line: {color: o.line || BORDER, width: o.lw || 1}, shadow: o.noShadow ? undefined : {type: 'outer', blur: 6, offset: 1.5, angle: 90, color: '073B49', opacity: 0.08}});
}
function tile(s, icon, color, x, y, size = 0.6, bg = ACC) {
  s.addShape(pptx.ShapeType.roundRect, {x, y, w: size, h: size, rectRadius: 0.1, fill: {color: bg}, line: {color: bg}});
  const p = size * 0.18;
  s.addImage({path: img(`${icon}-${color}`), x: x + p, y: y + p, w: size - 2 * p, h: size - 2 * p});
}
const bullets = (arr, o = {}) => arr.map((t, i) => {
  const runs = Array.isArray(t) ? t : [{text: t}];
  return runs.map((r, j) => ({text: r.text, options: {fontFace: F, fontSize: o.fs || 14, color: r.color || o.color || TEAL, bold: r.bold,
    hyperlink: r.url ? {url: r.url} : undefined,
    ...(j === 0 ? {bullet: o.nobullet ? false : {code: '25CF'}, indentLevel: 0, paraSpaceAfter: o.gap ?? 6} : {}),
    ...(j === runs.length - 1 && i < arr.length - 1 ? {breakLine: true} : {})}}));
}).flat();

function section(num, title, sub, opts = {}) {
  n++;
  const s = pptx.addSlide();
  s.background = {color: TEAL};
  s.addShape(pptx.ShapeType.rect, {x: 0, y: 0, w: 0.18, h: 7.5, fill: {color: COP}, line: {color: COP}});
  s.addText(num, {x: 0.9, y: 1.6, w: 4, h: 1.2, fontFace: F, fontSize: 80, bold: true, color: COP, margin: 0});
  s.addText(title, {x: 0.9, y: 2.9, w: 11.8, h: 1.2, fontFace: F, fontSize: title.length > 32 ? 38 : 44, bold: true, color: WHITE, margin: 0});
  s.addText(sub, {x: 0.9, y: 4.15, w: 10.5, h: 1.0, fontFace: F, fontSize: 20, color: LIGHT, margin: 0, valign: 'top'});
  if (opts.draft) tag(s, 'DRAFT PROPOSAL', 0.9, 5.4);
  footer(s, true);
  return s;
}
function video(kicker, title, id, frames, notes, opts = {}) {
  const s = base(kicker, title, opts);
  const W = 12.0, H = W * 880 / 1920, x = (13.333 - W) / 2, y = 1.42;
  s.addShape(pptx.ShapeType.roundRect, {x: x - 0.03, y: y - 0.03, w: W + 0.06, h: H + 0.06, rectRadius: 0.1, fill: {color: WHITE}, line: {color: BORDER}});
  s.addMedia({type: 'video', path: `out/${id}.mp4`, x, y, w: W, h: H, cover: b64(`out/${id}-poster.png`)});
  videos.push({slide: n, ms: Math.round(frames / 30 * 1000)});
  s.addNotes(notes);
  return s;
}

/* ---------- 1. Title ---------- */
n++;
{
  const s = pptx.addSlide();
  s.background = {color: BG};
  s.addShape(pptx.ShapeType.rect, {x: 8.6, y: 0, w: 4.733, h: 7.5, fill: {color: TEAL}, line: {color: TEAL}});
  s.addShape(pptx.ShapeType.rect, {x: 8.6, y: 0, w: 0.12, h: 7.5, fill: {color: COP}, line: {color: COP}});
  s.addText('DIGITAL MEITHEAL 2026 · DAY 2 · 20 NOVEMBER · DROGHEDA', {x: 0.7, y: 0.8, w: 7.7, h: 0.35, fontFace: F, fontSize: 12, bold: true, color: COP, charSpacing: 2, margin: 0});
  s.addText('Digital wallets & delegated authority', {x: 0.7, y: 1.3, w: 7.6, h: 1.9, fontFace: F, fontSize: 44, bold: true, color: TEAL, margin: 0, valign: 'top'});
  s.addText('How government credentials reach your phone, and how we could let you act for a parent, a child, or someone in care',
    {x: 0.7, y: 3.25, w: 7.4, h: 1.1, fontFace: F, fontSize: 18, color: MUTED, margin: 0, valign: 'top'});
  tag(s, 'DRAFT FOR DISCUSSION', 0.7, 4.5);
  s.addText([
    {text: 'Prepared by Martin Woodward', options: {bold: true, color: TEAL, breakLine: true}},
    {text: 'martin@woodwardweb.com', options: {color: SKY, hyperlink: {url: 'mailto:martin@woodwardweb.com'}}},
  ], {x: 0.7, y: 5.05, w: 6, h: 0.75, fontFace: F, fontSize: 15, margin: 0});
  s.addImage({path: img('eu2026'), x: 0.6, y: 6.0, w: 2.6, h: 2.6 * 1276 / 2787});
  // right panel: wallet motif
  tile(s, 'wallet', 'white', 9.85, 1.4, 2.3, '0E5466');
  const chips = [['car', 'Driving licence'], ['id', 'PPS number'], ['heart', 'Health identifiers'], ['users', 'Acting for others']];
  chips.forEach(([ic, t], i) => {
    const y = 4.15 + i * 0.62;
    s.addShape(pptx.ShapeType.roundRect, {x: 9.35, y, w: 3.3, h: 0.5, rectRadius: 0.25, fill: {color: '0E5466'}, line: {color: i === 3 ? 'E3875A' : '1C6A7C'}});
    s.addImage({path: img(`${ic}-${i === 3 ? 'copper' : 'sky'}`), x: 9.5, y: y + 0.1, w: 0.3, h: 0.3});
    s.addText(t, {x: 9.9, y, w: 2.7, h: 0.5, fontFace: F, fontSize: 14, color: WHITE, margin: 0, valign: 'middle'});
  });
  s.addText('Connect. Share. Build. Accelerate.', {x: 8.9, y: 6.85, w: 4.2, h: 0.35, fontFace: F, fontSize: 11, color: '7FA3AB', align: 'center'});
  s.addNotes('Talk for Digital Meitheal 2026, day 2. Draft for discussion: none of the delegation proposals are Government policy. Prepared by Martin Woodward (martin@woodwardweb.com).');
}

/* ---------- 2. Agenda ---------- */
{
  const s = base('Agenda', 'Where we are going');
  const items = [
    ['01', 'How digital wallets work', 'Issuers, holders, verifiers, and sharing only what is needed', 'wallet'],
    ['02', "Ireland's Government Digital Wallet", 'What has been announced and what is still open', 'flag'],
    ['03', 'Government credentials', 'Driving licence, PPS number, health identifiers, signing in', 'id'],
    ['04', 'Delegation: adults', 'Acting for an elderly parent: lessons from Estonia, Latvia, Australia', 'handshake'],
    ['05', 'Delegation: children', 'Guardianship, care orders, migrants: options A–E (draft)', 'baby'],
    ['06', 'Gaps, prototype & discussion', 'Standards changes, a Paradym Wallet prototype, your views', 'message'],
  ];
  items.forEach(([num, t, d, ic], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.65 + Math.floor(i / 3) * 2.6;
    card(s, x, y, 3.85, 2.3);
    tile(s, ic, i === 4 ? 'copper' : 'sky', x + 0.3, y + 0.3, 0.7);
    s.addText(num, {x: x + 2.6, y: y + 0.3, w: 1, h: 0.5, fontFace: F, fontSize: 24, bold: true, color: i === 4 ? COP : 'B9CDD1', align: 'right', margin: 0});
    s.addText(t, {x: x + 0.3, y: y + 1.12, w: 3.4, h: 0.45, fontFace: F, fontSize: 15, bold: true, color: TEAL, margin: 0});
    s.addText(d, {x: x + 0.3, y: y + 1.62, w: 3.3, h: 0.6, fontFace: F, fontSize: 12, color: MUTED, margin: 0, valign: 'top'});
  });
}

/* ---------- 01 How wallets work ---------- */
section('01', 'How digital wallets work', 'Three parties, cryptographic signatures, and you in control of what is shared.');
video('How wallets work', 'Three parties, one trust framework', 'Trust', 400,
  'The issuer signs a credential and it is stored in the wallet on your phone. When a verifier asks for something, you approve and the wallet sends only what is needed. The verifier checks the signature against the EU trusted lists. The issuer is never contacted, so it does not learn where you used the credential.');
video('How wallets work', 'Selective disclosure: prove only what is needed', 'Disclosure', 360,
  'With SD-JWT (RFC 9901) and ISO mdoc, every claim is hashed separately. The wallet reveals only the claims the verifier needs, here age_over_18. The other claims stay as unreadable hashes. Device binding means a copy or screenshot will not verify.');
{
  const s = base('How wallets work', 'The standards underneath');
  const cards = [
    ['download', 'Issuance', 'OpenID4VCI 1.0', 'The issuer sends credentials to the wallet; the wallet proves it holds the device key.', 'https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html'],
    ['qr', 'Presentation', 'OpenID4VP 1.0 · W3C Digital Credentials API', 'The verifier asks for specific claims (DCQL); the browser or OS hands the request to the wallet.', 'https://openid.net/specs/openid-4-verifiable-presentations-1_0.html'],
    ['phone', 'In person', 'ISO/IEC 18013-5 · 18013-7', 'mdoc/mDL over NFC or QR at a counter, which can work offline.', 'https://www.iso.org/standard/69084.html'],
    ['file', 'Formats', 'SD-JWT VC (RFC 9901) · ISO mdoc', 'The EU PID is issued in both formats (CIR 2024/2977). Claims are hashed so each can be disclosed on its own.', 'https://www.rfc-editor.org/rfc/rfc9901.html'],
    ['refresh', 'Status', 'IETF Token Status List', 'A compressed list of bits published by the issuer. Verifiers check revocation without telling the issuer where you are.', 'https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/'],
    ['shield', 'Trust', 'eIDAS 2 · ARF · trusted lists', 'Registers of approved issuers, and relying parties registered for what they may ask (Art. 5b).', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
  ];
  cards.forEach(([ic, k, t, d, url], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.55 + Math.floor(i / 3) * 2.7;
    card(s, x, y, 3.85, 2.45);
    tile(s, ic === 'download' ? 'key' : ic, 'sky', x + 0.28, y + 0.28, 0.6);
    s.addText(k.toUpperCase(), {x: x + 1.05, y: y + 0.3, w: 2.6, h: 0.25, fontFace: F, fontSize: 10, bold: true, color: COP, charSpacing: 2, margin: 0});
    s.addText(t, {x: x + 1.05, y: y + 0.55, w: 2.7, h: 0.4, fontFace: F, fontSize: 13, valign: 'top', bold: true, color: TEAL, margin: 0, hyperlink: {url}});
    s.addText(d, {x: x + 0.28, y: y + 1.25, w: 3.3, h: 1.1, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0, valign: 'top'});
  });
  s.addNotes('These are open standards from the OpenID Foundation, IETF, ISO and W3C, profiled for Europe by the Architecture and Reference Framework (ARF) and the eIDAS 2 implementing acts. The same building blocks are used elsewhere, for example in mDL programmes in the US and Australia.');
}
{
  const s = base('How wallets work', 'The EU timeline');
  const ms = [
    ['20 May 2024', 'eIDAS 2 in force', 'Regulation (EU) 2024/1183', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
    ['Nov 2024', 'First implementing acts', 'Incl. PID & attestations (CIR 2024/2977)', 'https://eur-lex.europa.eu/eli/reg_impl/2024/2977/oj'],
    ['Dec 2026', 'Wallets available', 'Every member state offers at least one (Art. 5a)', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
    ['End 2027', 'Private sector must accept', 'Regulated services & very large platforms (Art. 5f)', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
    ['c. 2030', 'Digital driving licence by default', 'Directive (EU) 2025/2205', 'https://eur-lex.europa.eu/eli/dir/2025/2205/oj/eng'],
  ];
  const y0 = 3.15;
  s.addShape(pptx.ShapeType.line, {x: 1.55, y: y0, w: 10.24, h: 0, line: {color: SKY, width: 3}});
  ms.forEach(([d, t, sub, url], i) => {
    const x = 1.55 + i * 2.56;
    s.addShape(pptx.ShapeType.ellipse, {x: x - 0.14, y: y0 - 0.14, w: 0.28, h: 0.28, fill: {color: i === 2 ? COP : SKY}, line: {color: WHITE, width: 2}});
    s.addText(d, {x: x - 1.2, y: y0 - 0.85, w: 2.4, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: i === 2 ? COP : TEAL, align: 'center', margin: 0});
    card(s, x - 1.2, y0 + 0.45, 2.4, 1.75);
    s.addText(t, {x: x - 1.1, y: y0 + 0.6, w: 2.2, h: 0.6, fontFace: F, fontSize: 14, bold: true, color: TEAL, align: 'center', margin: 0, valign: 'top'});
    s.addText(sub, {x: x - 1.1, y: y0 + 1.25, w: 2.2, h: 0.8, fontFace: F, fontSize: 11, color: MUTED, align: 'center', margin: 0, valign: 'top', hyperlink: {url}});
  });
  card(s, 0.6, 5.85, 12.13, 0.85, {fill: 'FBF3EE', line: 'E8C9B5', noShadow: true});
  s.addText([
    {text: 'Also relevant to delegation: ', options: {bold: true, color: COP}},
    {text: 'on 19 Nov 2026 the Council adopted new EU rules protecting vulnerable adults, including a European certificate of representation. ', options: {color: TEAL}},
    {text: 'Council press release', options: {color: SKY, hyperlink: {url: 'https://www.consilium.europa.eu/en/press/press-releases/2026/11/19/council-greenlights-new-eu-rules-to-protect-vulnerable-adults/'}}},
  ], {x: 0.85, y: 5.9, w: 11.7, h: 0.75, fontFace: F, fontSize: 13, margin: 0, valign: 'middle'});
  s.addNotes('Dates for Art. 5a and 5f run from the implementing acts, so they are approximate. The driving licence directive makes the mobile licence, issued as an EUDI Wallet attestation, the default format later this decade.');
}

/* ---------- 02 Ireland ---------- */
section('02', "Ireland's Government Digital Wallet", 'Consultation and testing launched April 2026. Wider rollout planned later in 2026.');
{
  const s = base('Ireland', 'What we know so far');
  card(s, 0.6, 1.5, 7.1, 5.2);
  tile(s, 'flag', 'sky', 0.85, 1.72, 0.55);
  s.addText('Announced', {x: 1.55, y: 1.72, w: 5, h: 0.55, fontFace: F, fontSize: 18, bold: true, color: TEAL, margin: 0, valign: 'middle'});
  s.addText(bullets([
    [{text: '3 Apr 2026: ', bold: true}, {text: 'Minister Jack Chambers and Minister of State Frank Feighan launch a public consultation and testing phase (consultation closed 24 Jun 2026)'}],
    [{text: 'Phased: ', bold: true}, {text: 'pilot with about 1,000 civil servants, then an invitation-only beta, then a wider launch planned later in 2026'}],
    [{text: 'Identity: ', bold: true}, {text: 'built on MyGovID verified identity (in-person verification to SAFE 2)'}],
    [{text: 'First credentials: ', bold: true}, {text: 'birth certificate, driving licence, European Health Insurance Card, and age verification for the Online Safety Code'}],
    [{text: 'Privacy: ', bold: true}, {text: 'selective disclosure and explicit consent each time you share'}],
  ], {fs: 13.5, gap: 9}), {x: 0.85, y: 2.45, w: 6.6, h: 3.6, margin: 0, valign: 'top'});
  s.addText([
    {text: 'Sources: ', options: {color: MUTED}},
    {text: 'gov.ie press release', options: {color: SKY, hyperlink: {url: 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/press-releases/minister-chambers-launches-public-consultation-and-testing-phase-for-irelands-new-government-digital-wallet/'}}},
    {text: ' · ', options: {color: MUTED}},
    {text: 'gov.ie FAQ', options: {color: SKY, hyperlink: {url: 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/government-digital-wallet-your-questions-answered/'}}},
    {text: ' · ', options: {color: MUTED}},
    {text: 'MyGovID', options: {color: SKY, hyperlink: {url: 'https://www.mygovid.ie/'}}},
    {text: ' · ', options: {color: MUTED}},
    {text: 'Online Safety Code', options: {color: SKY, hyperlink: {url: 'https://www.cnam.ie/online-safety-code/'}}},
  ], {x: 0.85, y: 6.15, w: 6.7, h: 0.4, fontFace: F, fontSize: 11, margin: 0});

  card(s, 7.95, 1.5, 4.78, 5.2, {fill: 'FBF3EE', line: 'E8C9B5'});
  tile(s, 'search', 'copper', 8.2, 1.72, 0.55, 'F3DED1');
  s.addText('Still open', {x: 8.9, y: 1.72, w: 3.5, h: 0.55, fontFace: F, fontSize: 18, bold: true, color: COP, margin: 0, valign: 'middle'});
  s.addText(bullets([
    'Enabling legislation: an eIDAS omnibus bill is reported to be at Heads stage',
    'Which bodies may ask for a PPS number through the wallet',
    'Acting for someone else (parents, carers, attorneys) has not been publicly addressed',
    'Private-sector relying parties ahead of Art. 5f (end 2027)',
    'Inclusion: people without a smartphone (MyGovID remains)',
  ], {fs: 13, gap: 9}), {x: 8.2, y: 2.45, w: 4.3, h: 4.1, margin: 0, valign: 'top'});
  s.addNotes('Using the wallet is voluntary under eIDAS 2 (Art. 5a(15)). The legislation status comes from third-party reporting (myid.ie), so treat it as reported rather than confirmed.');
}
{
  const s = base('Ireland', 'The likely ecosystem');
  tag(s, 'ILLUSTRATIVE', 11.0, 0.34, SKY);
  const iss = [['bank', 'DSP', 'PPS number · Child Benefit link'], ['car', 'RSA / NDLS', 'Driving licence'], ['heart', 'HSE', 'IHI · EHIC · medical card'], ['stamp', 'GRO', 'Birth certificate'], ['gavel', 'Courts · Tusla · DSS', 'Representation (future)']];
  const ver = [['building', 'gov.ie services', 'MyWelfare · Revenue · Passports'], ['car', 'Car hire & insurers', 'Entitlement · full details'], ['pill', 'GPs & pharmacies', 'Eligibility · identity'], ['briefcase', 'Banks & employers', 'KYC · PPSN for payroll'], ['globe', 'Online platforms', 'Age checks (Online Safety Code)']];
  s.addText('ISSUERS', {x: 0.6, y: 1.45, w: 3.8, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
  s.addText('RELYING PARTIES', {x: 8.93, y: 1.45, w: 3.8, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
  const row = (arr, x, last) => arr.forEach(([ic, t, d], i) => {
    const y = 1.85 + i * 0.98;
    card(s, x, y, 3.8, 0.82, last && i === 4 ? {line: 'E8C9B5', fill: 'FBF3EE'} : {});
    tile(s, ic, last && i === 4 ? 'copper' : 'sky', x + 0.15, y + 0.13, 0.56);
    s.addText(t, {x: x + 0.85, y: y + 0.1, w: 2.85, h: 0.33, fontFace: F, fontSize: 13.5, bold: true, color: TEAL, margin: 0});
    s.addText(d, {x: x + 0.85, y: y + 0.42, w: 2.85, h: 0.3, fontFace: F, fontSize: 11, color: MUTED, margin: 0});
  });
  row(iss, 0.6, true); row(ver, 8.93);
  // centre wallet
  s.addShape(pptx.ShapeType.roundRect, {x: 5.42, y: 2.0, w: 2.5, h: 4.4, rectRadius: 0.35, fill: {color: TEAL}, line: {color: TEAL}});
  s.addShape(pptx.ShapeType.roundRect, {x: 5.55, y: 2.15, w: 2.24, h: 4.1, rectRadius: 0.25, fill: {color: WHITE}, line: {color: WHITE}});
  s.addImage({path: img('wallet-sky'), x: 6.35, y: 2.4, w: 0.65, h: 0.65});
  s.addText('Government Digital Wallet', {x: 5.6, y: 3.1, w: 2.14, h: 0.6, fontFace: F, fontSize: 12.5, bold: true, color: TEAL, align: 'center', margin: 0});
  ['PID (identity)', 'Driving licence', 'PPS number', 'EHIC', 'Mandates'].forEach((t, i) => {
    s.addText(t, {x: 5.75, y: 3.8 + i * 0.45, w: 1.84, h: 0.36, fontFace: F, fontSize: 10.5, bold: true, color: i === 4 ? COP : TEAL, align: 'center', margin: 0,
      shape: pptx.ShapeType.roundRect, rectRadius: 0.08, fill: {color: i === 4 ? 'FBF3EE' : ACC}, line: {color: i === 4 ? 'E8C9B5' : ACC}});
  });
  s.addShape(pptx.ShapeType.line, {x: 4.5, y: 4.2, w: 0.85, h: 0, line: {color: SKY, width: 2.5, endArrowType: 'triangle', dashType: 'dash'}});
  s.addShape(pptx.ShapeType.line, {x: 8.0, y: 4.2, w: 0.85, h: 0, line: {color: GREEN, width: 2.5, endArrowType: 'triangle', dashType: 'dash'}});
  s.addText('issue', {x: 4.45, y: 3.85, w: 0.95, h: 0.3, fontFace: F, fontSize: 10, color: SKY, align: 'center', margin: 0});
  s.addText('present', {x: 7.95, y: 3.85, w: 0.95, h: 0.3, fontFace: F, fontSize: 10, color: GREEN, align: 'center', margin: 0});
  s.addNotes('Illustrative only. Which bodies issue which credentials is a Government decision. The representation issuer in copper is the subject of the second half of this talk.');
}

/* ---------- 03 Credentials ---------- */
section('03', 'Government credentials in your wallet', 'Driving licence, PPS number, health identifiers, and signing in to government services.');
video('Government credentials', 'Getting your driving licence into the wallet', 'Issue', 360,
  'Illustrative flow. You sign in with MyGovID, the RSA/NDLS issuer makes a credential offer (OpenID4VCI), and the wallet creates a new key in the phone\'s secure hardware. The licence is issued in both EU formats and bound to that key.', {});
video('Government credentials', 'Checking you can drive a car: Category B', 'CatB', 380,
  'The car hire desk is a registered relying party. It asks for photo, Category B entitlement, validity and issuing authority, but not the address or date of birth. The answer is effectively a yes/no on entitlement: no photocopy, and NDLS is not told which desk you visited.');
video('Government credentials', 'Same licence, full details, when justified', 'FullDetails', 400,
  'A loyalty app that registered only for name and email asks for the full licence. The wallet compares the request with its registration (eIDAS Art. 5b) and flags it. A motor insurer registered for quotations can lawfully ask for the full mDL data set, and the user approves.');
{
  const s = base('Government credentials', 'Two requests, one credential');
  const code1 = `{ "id": "dl",
  "format": "dc+sd-jwt",
  "meta": { "vct_values": ["…/ie/mdl"] },
  "claims": [
    { "path": ["portrait"] },
    { "path": ["driving_privileges", null,
               "vehicle_category_code"],
      "values": ["B"] },
    { "path": ["expiry_date"] },
    { "path": ["issuing_authority"] } ] }`;
  const code2 = `{ "id": "mdl",
  "format": "mso_mdoc",
  "meta": { "doctype_value":
            "org.iso.18013.5.1.mDL" },
  "claims": [ family_name, given_name,
    birth_date, resident_address,
    document_number, issue_date,
    expiry_date, driving_privileges,
    portrait  ] }`;
  [[0.6, 'Car hire: may I drive a car?', 'Entitlement check', code1, 'Photo + Category B + validity. Address, date of birth and other categories stay on the phone.', GREEN],
   [6.77, 'Insurer: quote for motor insurance', 'Full details', code2, 'Registered purpose justifies the full mDL data set. The user still sees and approves every field.', SKY]].forEach(([x, t, k, code, d, col]) => {
    card(s, x, 1.5, 5.96, 4.55);
    s.addText(k.toUpperCase(), {x: x + 0.3, y: 1.68, w: 5, h: 0.25, fontFace: F, fontSize: 10, bold: true, color: col, charSpacing: 2, margin: 0});
    s.addText(t, {x: x + 0.3, y: 1.93, w: 5.4, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: TEAL, margin: 0});
    s.addText(code, {x: x + 0.3, y: 2.45, w: 5.36, h: 2.65, fontFace: MONO, fontSize: 10.5, color: 'D7E7EA', fill: {color: TEAL}, margin: 0.14, valign: 'top',
      shape: pptx.ShapeType.roundRect, rectRadius: 0.08});
    s.addText(d, {x: x + 0.3, y: 5.2, w: 5.4, h: 0.7, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0, valign: 'top'});
  });
  s.addText([
    {text: 'Design point for an Irish mDL profile: ', options: {bold: true, color: COP}},
    {text: 'in ISO mdoc, driving_privileges is one element, so an in-person check reveals every category. SD-JWT VC can disclose each array element separately (RFC 9901), so a true per-category check needs SD-JWT VC or a derived claim. Illustrative DCQL (OpenID4VP 1.0).', options: {color: TEAL}},
  ], {x: 0.6, y: 6.15, w: 12.13, h: 0.75, fontFace: F, fontSize: 11.5, margin: 0, valign: 'top'});
  s.addNotes('Left: a minimal DCQL query for the Category B check. Right: the full mDL request an insurer might make. Both are illustrative. Directive (EU) 2025/2205 makes the mobile licence an EUDI Wallet attestation.');
}
{
  const s = base('Government credentials', 'PPS number: share it only where the law allows');
  // credential card mock
  s.addShape(pptx.ShapeType.roundRect, {x: 0.8, y: 1.75, w: 4.6, h: 2.8, rectRadius: 0.2, fill: {color: TEAL}, line: {color: TEAL}, shadow: {type: 'outer', blur: 10, offset: 3, angle: 90, color: '073B49', opacity: 0.25}});
  s.addText('DEPARTMENT OF SOCIAL PROTECTION', {x: 1.1, y: 1.98, w: 4, h: 0.25, fontFace: F, fontSize: 9.5, bold: true, color: '7FC8E3', charSpacing: 2, margin: 0});
  s.addText('Personal Public Service Number', {x: 1.1, y: 2.25, w: 4, h: 0.4, fontFace: F, fontSize: 16, bold: true, color: WHITE, margin: 0});
  s.addText('1234567FA', {x: 1.1, y: 2.9, w: 4, h: 0.6, fontFace: MONO, fontSize: 28, bold: true, color: WHITE, margin: 0, charSpacing: 3});
  s.addText('Bound to your PID · illustrative number', {x: 1.1, y: 3.75, w: 4, h: 0.3, fontFace: F, fontSize: 11, color: LIGHT, margin: 0});
  s.addImage({path: img('id-white'), x: 4.6, y: 1.95, w: 0.5, h: 0.5});
  s.addText(bullets([
    'Replaces photocopies of the PSC, P60s and letters',
    'Employer onboarding (for Revenue), MyWelfare, SUSI, HSE',
  ], {fs: 13.5}), {x: 0.8, y: 4.85, w: 4.7, h: 1.2, margin: 0, valign: 'top'});

  card(s, 5.9, 1.5, 6.83, 5.2);
  const pts = [
    ['scale', 'The law limits who may use it', 'Social Welfare Consolidation Act 2005, s.262: only specified bodies may use a PPSN, and others must not ask for it.', 'https://www.irishstatutebook.ie/eli/2005/act/26/section/262/enacted/en/html'],
    ['list', 'The wallet can enforce it', 'Relying-party registration (eIDAS Art. 5b) records which attributes each service may request. A request for a PPSN from an unregistered body is flagged or blocked.', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
    ['eye', 'Visible to the citizen', 'Every PPSN disclosure appears in the wallet history and can be reported to the Data Protection Commission.', null],
  ];
  pts.forEach(([ic, t, d, url], i) => {
    const y = 1.75 + i * 1.6;
    tile(s, ic, 'sky', 6.15, y, 0.6);
    s.addText(t, {x: 6.95, y, w: 5.5, h: 0.35, fontFace: F, fontSize: 15, bold: true, color: TEAL, margin: 0, hyperlink: url ? {url} : undefined});
    s.addText(d, {x: 6.95, y: y + 0.38, w: 5.55, h: 1.05, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0, valign: 'top'});
  });
  s.addNotes('The PPSN is the obvious "government data in your wallet" credential, but it has a strict legal regime. The wallet\'s relying-party registration is a natural way to enforce s.262 technically.');
}
{
  const s = base('Government credentials', 'Health identifiers');
  const cs = [
    ['heart', 'Individual Health Identifier', 'HSE · Health Identifiers Act 2014', 'Matches you to your records across care providers. The Act restricts who may process it, so only registered health relying parties could request it.', 'https://www.irishstatutebook.ie/eli/2014/act/15/enacted/en/html'],
    ['plane', 'European Health Insurance Card', 'HSE · in the first wave of credentials', 'Proves entitlement to state healthcare while in another EU/EEA country. Wallet-native and cross-border from day one.', 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/government-digital-wallet-your-questions-answered/'],
    ['pill', 'Medical card · GP visit card', 'HSE · candidate credential', 'Shows eligibility at the pharmacy or GP without carrying plastic, and can show the current status instantly.', null],
  ];
  cs.forEach(([ic, t, sub, d, url], i) => {
    const x = 0.6 + i * 4.1;
    card(s, x, 1.55, 3.85, 3.9);
    tile(s, ic, 'sky', x + 0.3, y0(), 0.75);
    function y0() { return 1.85; }
    s.addText(t, {x: x + 0.3, y: 2.8, w: 3.3, h: 0.7, fontFace: F, fontSize: 17, bold: true, color: TEAL, margin: 0, valign: 'top', hyperlink: url ? {url} : undefined});
    s.addText(sub, {x: x + 0.3, y: 3.5, w: 3.3, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, margin: 0});
    s.addText(d, {x: x + 0.3, y: 3.85, w: 3.3, h: 1.5, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0, valign: 'top'});
  });
  card(s, 0.6, 5.7, 12.13, 1.0, {fill: 'FBF3EE', line: 'E8C9B5', noShadow: true});
  s.addText([
    {text: 'Why delegation matters here: ', options: {bold: true, color: COP}},
    {text: 'health is where people most often act for someone else, such as collecting a parent\'s prescription or consenting for a child. The European Health Data Space (Regulation (EU) 2025/327) also expects patients and their representatives to have digital access.', options: {color: TEAL}},
  ], {x: 0.85, y: 5.75, w: 11.7, h: 0.9, fontFace: F, fontSize: 12.5, margin: 0, valign: 'middle'});
  s.addNotes('The EHIC is confirmed as a planned credential. The IHI and medical card are candidates and are shown to prompt discussion.');
}
video('Government credentials', 'Signing in to government services', 'SignIn', 400,
  'On a laptop you scan a QR code; on the same phone the W3C Digital Credentials API hands the request straight to the wallet. MyWelfare (DSP) asks for PID name and date of birth plus PPSN. You approve with Face ID and are signed in at high assurance with no password. MyGovID remains for people without a smartphone.');

/* ---------- 04 Adults ---------- */
section('04', 'Delegation: adults', 'Acting for an elderly parent or someone who needs support, without sharing their phone or PIN.');
{
  const s = base('Delegation: adults', 'Today: everyone shares passwords');
  const cs = [
    ['IE', 'Ireland', [
      'Enduring powers of attorney and co-decision registered with the Decision Support Service (ADMCA 2015)',
      'Each agency runs its own agent scheme (Revenue, DSP)',
      'No single digital mandate a service can check']],
    ['EE', 'Estonia', [
      'Pääsuke: national authorisations register (RIA), used through eesti.ee and GovSSO',
      'Mandates have roles and validity periods; they can be withdrawn, or the agent can step down',
      'Legal representatives of minors come from the population register']],
    ['LV', 'Latvia', [
      'Authorisations for some e-services on Latvija.gov.lv',
      'Limited, service-by-service',
      'Basic EUDI wallet due by Dec 2026']],
    ['AU', 'Australia', [
      'Per-agency nominee arrangements through myGov (Centrelink, ATO)',
      'Digital ID Act 2024; myID from age 15',
      'RAM covers businesses only, not one person acting for another']],
  ];
  cs.forEach(([code, t, b], i) => {
    const x = 0.6 + i * 3.08;
    card(s, x, 1.5, 2.9, 4.2, i === 1 ? {line: SKY, lw: 1.75} : {});
    s.addText(code, {x: x + 0.25, y: 1.72, w: 0.7, h: 0.5, fontFace: F, fontSize: 14, bold: true, color: WHITE, align: 'center', margin: 0,
      shape: pptx.ShapeType.roundRect, rectRadius: 0.08, fill: {color: i === 1 ? SKY : TEAL}});
    s.addText(t, {x: x + 1.05, y: 1.72, w: 1.8, h: 0.5, fontFace: F, fontSize: 18, bold: true, color: TEAL, margin: 0, valign: 'middle'});
    s.addText(bullets(b, {fs: 12, gap: 8}), {x: x + 0.25, y: 2.45, w: 2.5, h: 3.1, margin: 0, valign: 'top'});
  });
  card(s, 0.6, 5.9, 12.13, 0.85, {fill: 'FBF3EE', line: 'E8C9B5', noShadow: true});
  s.addText([
    {text: 'EU: ', options: {bold: true, color: COP}},
    {text: 'eIDAS 2 Annex VI lists "powers and mandates to represent" as an attestable attribute, and ', options: {color: TEAL}},
    {text: 'ARF Discussion Topic I', options: {color: SKY, hyperlink: {url: 'https://eudi.dev/latest/discussion-topics/i-natural-person-representing-another-natural-person/'}}},
    {text: ' explores one person representing another. There is no rulebook yet.', options: {color: TEAL}},
  ], {x: 0.85, y: 5.95, w: 11.7, h: 0.75, fontFace: F, fontSize: 13, margin: 0, valign: 'middle'});
  s.addNotes('Estonia is the most complete model: a central register with X-Road services, mandates with validity periods, withdrawal by the principal and waiver by the agent. See ria.ee Pääsuke and the e-gov/PH specification on GitHub.');
}
video('Delegation: adults', 'Proposal: a mandate credential in the wallet', 'Adult', 500,
  'Mary, 82, has an enduring power of attorney registered with the Decision Support Service. A proposed representation attestation provider issues Seán a mandate credential, scoped to pensions and bound to his own PID. Services always see that he is acting as a representative and for what (ARF Topic I). Mary can withdraw it, or Seán can step down, and status lists stop it everywhere.', {draft: true});
{
  const s = base('Delegation: adults', 'Designing the mandate credential', {draft: true});
  card(s, 0.6, 1.5, 5.95, 5.2);
  s.addText("WHAT'S INSIDE", {x: 0.9, y: 1.72, w: 5, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
  const fields = [['representative', "bound to the representative's own PID"], ['principal', 'minimal claims about the person represented'], ['scope', 'pensions · health · banking · tax · all'], ['legal_basis', 'EPA · co-decision · consent · court'], ['source_authority', 'DSS, Courts, or the principal'], ['status', 'Token Status List entry']];
  fields.forEach(([k, v], i) => {
    const y = 2.15 + i * 0.72;
    s.addText(k, {x: 0.9, y, w: 2.1, h: 0.52, fontFace: MONO, fontSize: 12, color: TEAL, bold: true, margin: 0.08, valign: 'middle', shape: pptx.ShapeType.roundRect, rectRadius: 0.06, fill: {color: ACC}});
    s.addText(v, {x: 3.15, y, w: 3.25, h: 0.52, fontFace: F, fontSize: 12.5, color: MUTED, margin: 0, valign: 'middle'});
  });
  card(s, 6.78, 1.5, 5.95, 5.2);
  s.addText('LIFECYCLE RULES', {x: 7.08, y: 1.72, w: 5, h: 0.3, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
  const rules = [
    ['clock', 'Legal validity ≠ technical expiry', 'An EPA can run for years (Estonian mandates can be open-ended). The credential expires in 30 days or less and refreshes silently while the mandate stands.'],
    ['ban', 'Anyone with a stake can end it', 'The principal withdraws, the representative steps down (as in Pääsuke), or the DSS or a court revokes it.'],
    ['eye', 'Representation is never hidden', 'The service sees the person is acting for someone else and for what (ARF Topic I).'],
    ['list', 'An activity log for the principal', 'Mary can see what was done in her name.'],
  ];
  rules.forEach(([ic, t, d], i) => {
    const y = 2.15 + i * 1.12;
    tile(s, ic, 'sky', 7.08, y, 0.5);
    s.addText(t, {x: 7.75, y: y - 0.02, w: 4.8, h: 0.32, fontFace: F, fontSize: 13.5, bold: true, color: TEAL, margin: 0});
    s.addText(d, {x: 7.75, y: y + 0.3, w: 4.8, h: 0.75, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0, valign: 'top'});
  });
  s.addNotes('Short technical lifetimes keep revocation fast and limit the damage from a stolen phone. The legal mandate is separate and can be open-ended, which is how Estonia handles long-running authorisations.');
}

video('Delegation: adults', 'Self-granted: Bob lets Alice manage his prescriptions', 'SelfGrant', 660,
  'Not every delegation needs a court or the DSS. Bob, 74, has full capacity and simply wants his daughter Alice to help. In his own wallet he picks Alice, who has verified with her own PID, and ticks what she may do: view his prescriptions and medicines, order repeats and collect them. GP notes, test results and everything outside health stay excluded. His explicit consent is the legal basis (GDPR Art. 9(2)(a) for health data). This is the same pattern as an Estonian Pääsuke authorisation a person grants for themselves. Alice signs in to the HSE service as herself, shown as acting for Bob. The pharmacy checks her mandate when she collects. Bob sees an activity log and can withdraw at any time.', {draft: true});
{
  const s = base('Delegation: adults', "What Bob's grant contains", {draft: true});
  const code = `{ "vct": "…/ie/representation",
  "representative": { "pid_ref": "Alice Murphy" },
  "principal": { "name": "Bob Murphy",
                 "ihi": "•••• 4821" },
  "legal_basis": "principal_consent",
  "source_authority": "principal",
  "scope": [
    "health.prescriptions:read",
    "health.repeat_prescription:order",
    "health.repeat_prescription:collect" ],
  "excluded": [ "health.record:read",
    "health.treatment:consent",
    "profile:update" ],
  "mandate_valid_until": "2027-11-20",
  "exp": "≤ 30 days, auto-refresh",
  "status": { "status_list": { "idx": 9184 } } }`;
  card(s, 0.6, 1.5, 6.3, 5.2);
  s.addText('ILLUSTRATIVE MANDATE ATTESTATION', {x: 0.9, y: 1.7, w: 5.8, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: COP, charSpacing: 2, margin: 0});
  s.addText(code, {x: 0.9, y: 2.08, w: 5.7, h: 4.4, fontFace: MONO, fontSize: 10.5, color: 'D7E7EA', fill: {color: TEAL}, margin: 0.14, valign: 'top', shape: pptx.ShapeType.roundRect, rectRadius: 0.08});
  card(s, 7.1, 1.5, 5.63, 3.25);
  s.addText('WHAT EACH PARTY SEES', {x: 7.4, y: 1.7, w: 5, h: 0.28, fontFace: F, fontSize: 10, bold: true, color: COP, charSpacing: 2, margin: 0});
  [['heart', 'HSE service', 'Alice, acting for Bob. Medicines list read-only. Can order repeats.'],
   ['pill', 'Pharmacy', "Alice's PID plus the mandate, scope repeat prescriptions. Logs who collected."],
   ['list', 'Bob', 'Every view, order and collection, with a one-tap withdraw.']].forEach(([ic, t, d], i) => {
    const y = 2.12 + i * 0.85;
    tile(s, ic, 'sky', 7.4, y, 0.48);
    s.addText([{text: t + '  ', options: {bold: true, color: TEAL}}, {text: d, options: {color: MUTED}}], {x: 8.03, y: y - 0.06, w: 4.5, h: 0.7, fontFace: F, fontSize: 12, margin: 0, valign: 'top'});
  });
  card(s, 7.1, 4.95, 5.63, 1.75, {fill: 'FBF3EE', line: 'E8C9B5'});
  tile(s, 'alert', 'copper', 7.4, 5.15, 0.48, 'F3DED1');
  s.addText('Consent depends on capacity', {x: 8.03, y: 5.12, w: 4.5, h: 0.32, fontFace: F, fontSize: 13.5, bold: true, color: COP, margin: 0});
  s.addText('If Bob loses capacity, a consent-based mandate should lapse. He would then need an enduring power of attorney registered with the DSS (ADMCA 2015). Bob could set that up now, alongside this grant.', {x: 8.03, y: 5.45, w: 4.55, h: 1.15, fontFace: F, fontSize: 11.5, color: MUTED, margin: 0, valign: 'top'});
  s.addNotes('Illustrative only: no Irish schema exists. The design keeps the long legal mandate (12 months, renewable) separate from a short technical credential lifetime, and lists excluded actions explicitly so relying parties do not have to infer them. Each HSE or pharmacy system enforces the scopes. The capacity caveat matters: a voluntary mandate is not a substitute for an EPA under the Assisted Decision-Making (Capacity) Act 2015.');
}

/* ---------- 05 Children ---------- */
section('05', 'Delegation: children', 'Options for discussion, using Ireland as the worked example. This is not Government policy.', {draft: true});
{
  const s = base('Delegation: children', 'Parentage is not guardianship', {draft: true});
  card(s, 0.6, 1.5, 4.6, 5.2, {fill: 'FBF3EE', line: 'E8C9B5'});
  tile(s, 'alert', 'copper', 0.85, 1.75, 0.6, 'F3DED1');
  s.addText('The hard part', {x: 1.6, y: 1.75, w: 3.4, h: 0.6, fontFace: F, fontSize: 18, bold: true, color: COP, margin: 0, valign: 'middle'});
  s.addText(bullets([
    [{text: 'GRO registers births, marriages and adoptions, but '}, {text: 'not guardianship', bold: true}],
    [{text: 'An unmarried father on the birth certificate is '}, {text: 'not automatically a guardian', bold: true}, {text: ' (CFRA 2015 s.49)', url: 'https://www.irishstatutebook.ie/eli/2015/act/9/section/49'}],
    'Statutory declarations and cohabitation-based guardianship are not centrally registered',
    [{text: 'Under a care order '}, {text: '(CCA 1991 s.18)', url: 'https://www.irishstatutebook.ie/eli/1991/act/17/section/18/enacted/en/html'}, {text: ' Tusla makes most decisions, and parents\u2019 powers are restricted, not removed'}],
  ], {fs: 13, gap: 10}), {x: 0.85, y: 2.55, w: 4.15, h: 4.0, margin: 0, valign: 'top'});

  const rows = [
    ['Birth · married parents / mother', 'GRO', 'Issue to each guardian until 18'],
    ['Statutory declaration · cohabitation', 'Not registered today', 'Needs a new registration step'],
    ['Adoption order', 'AAI → GRO', "Revoke birth parents'; issue to adopters"],
    ['Guardianship / custody order', 'Courts Service', 'Issue, restrict or revoke'],
    ['Emergency / interim care order', 'District Court → Tusla', 'Short-lived Tusla authority'],
    ['Care order (s.18)', 'District Court → Tusla', 'Tusla authority; parents restricted'],
    ['Foster care · s.43A order', 'Tusla · District Court', 'Day-to-day scope for carer'],
    ['18th birthday', 'GRO', 'Everything expires'],
  ];
  const hdr = ['Legal event', 'Source', 'Effect on credentials'].map(t => ({text: t, options: {bold: true, color: WHITE, fill: {color: TEAL}}}));
  s.addTable([hdr, ...rows.map((r, i) => r.map(t => ({text: t, options: {fill: {color: i % 2 ? 'F6F9F9' : WHITE}}})))], {
    x: 5.45, y: 1.5, w: 7.28, colW: [2.75, 2.03, 2.5], fontFace: F, fontSize: 11.5, color: TEAL, border: {type: 'solid', color: BORDER, pt: 0.75},
    rowH: 0.55, margin: [0.04, 0.1, 0.04, 0.1], valign: 'middle'});
  s.addNotes('Any design must represent several layers at once: baseline guardianship, court orders, and care status that restricts rather than removes parental authority.');
}
{
  const s = base('Delegation: children', 'Five options for issuing guardianship credentials', {draft: true});
  const rows = [
    ['A', 'GRO issues at the life event', 'Simple; covers most children from day one', 'Misses unmarried fathers, court orders and care. (A+: register statutory declarations with GRO)'],
    ['B', 'New central guardianship register', 'One answer to "who can act now"; clean revocation', 'New law, data sharing, and the largest build'],
    ['C', 'Each authority issues its own', 'No new register; each body issues only what it is responsible for', 'Services must reconcile conflicting credentials; hard for parents to see where they stand'],
    ['D', 'Hybrid: GRO baseline + Courts/Tusla overlays', 'Incremental and legally accurate; restricts rather than revokes', 'Needs a shared restrictions model and data sharing'],
    ['E', 'Evidence-based route for migrants (OpenID DA Framework)', 'Covers foreign-born children; uses a common data model', 'Caseworker verification; provisional assurance at first'],
  ];
  const hdr = ['', 'Who issues', 'Strengths', 'Weaknesses'].map(t => ({text: t, options: {bold: true, color: WHITE, fill: {color: TEAL}}}));
  const body = rows.map(r => r.map((t, j) => ({text: t, options: {
    fill: {color: r[0] === 'D' ? 'FBF3EE' : WHITE}, bold: j === 0 || (r[0] === 'D' && j === 1), color: j === 0 ? COP : TEAL,
    fontSize: j === 0 ? 18 : 12, align: j === 0 ? 'center' : 'left'}})));
  s.addTable([hdr, ...body], {x: 0.6, y: 1.5, w: 12.13, colW: [0.6, 3.4, 3.9, 4.23], fontFace: F, fontSize: 12, color: TEAL,
    border: {type: 'solid', color: BORDER, pt: 0.75}, rowH: [0.45, 0.85, 0.75, 0.85, 0.85, 0.85], margin: [0.05, 0.12, 0.05, 0.12], valign: 'middle'});
  s.addText([
    {text: 'Suggested for the prototype: D', options: {bold: true, color: COP}},
    {text: ', with E as an add-on because Ireland has no population register.', options: {color: TEAL}},
  ], {x: 0.6, y: 6.35, w: 12, h: 0.4, fontFace: F, fontSize: 14, margin: 0});
  s.addNotes('Option E: lawful migrants appear only in separate systems (ISD, which does not require under-16s to register; DSP; GRO for births in Ireland). None of them records guardianship. Evidence such as apostilled foreign orders, other member states\' wallets, or Hague 1996 measures can be verified by a caseworker and issued at lower assurance until confirmed.');
}
video('Delegation: children', 'Option D in action: birth to 18', 'Child', 560,
  'GRO issues a baseline guardian credential at birth. The unmarried father gets one only after a statutory declaration or court order. If a care order is made, Tusla gets authority and the parents\' credentials are restricted, not revoked, and the foster carer gets day-to-day scope. The school sees an authorised carer, but never the placement address or the care order. At 16 the young person can see who holds authority over them; at 18 everything expires and they hold their own credentials.', {draft: true});
{
  const s = base('Delegation: children', 'Safeguarding and edge cases', {draft: true});
  const cs = [
    ['list', 'Scope tiers', 'guardian_full · day_to_day_care · medical_consent · passport_consent · education. Foster carers usually get day-to-day care.'],
    ['eyeoff', 'Minimal disclosure', "Where there is a child-protection concern, a parent's credential never reveals the placement, school or address."],
    ['clock', 'Short-lived by default', 'Emergency (8 days) and interim (up to 29 days) care orders get matching credential lifetimes and expire automatically.'],
    ['building', 'Tusla is a legal person', 'It delegates to named social workers and foster carers, which links to the legal-person mandate work (WeBUILD PoA).'],
    ['message', "The child's voice", 'From 16 (medical consent age) the young person could be notified of, or see, who holds authority over them.'],
    ['plane', 'Migrant & foreign-born children', 'No population register, and ISD does not register under-16s. Option E gives an evidence-based route at provisional assurance.'],
  ];
  cs.forEach(([ic, t, d], i) => {
    const x = 0.6 + (i % 3) * 4.1, y = 1.5 + Math.floor(i / 3) * 2.65;
    card(s, x, y, 3.85, 2.4);
    tile(s, ic, 'copper', x + 0.28, y + 0.28, 0.6, 'F3DED1');
    s.addText(t, {x: x + 1.05, y: y + 0.28, w: 2.65, h: 0.6, fontFace: F, fontSize: 15, bold: true, color: TEAL, margin: 0, valign: 'middle'});
    s.addText(d, {x: x + 0.28, y: y + 1.05, w: 3.3, h: 1.25, fontFace: F, fontSize: 12, color: MUTED, margin: 0, valign: 'top'});
  });
  s.addNotes('Issuing at birth before a wallet exists: issue on demand. GRO sends a notification (for example via MyGovID), and the guardian collects the credential by presenting their PID.');
}

/* ---------- 06 Gaps, prototype, discussion ---------- */
section('06', 'Gaps, prototype & discussion', 'What the standards still need, how we could test this, and what we would like your views on.');
{
  const s = base('Standards gaps', 'Proposed feedback to the OpenID DA Framework', {ts: 26});
  tag(s, 'EARLY DRAFTS', 11.0, 0.34);
  const items = [
    ['EUDI / ARF binding profile', 'SD-JWT VC + mdoc, OpenID4VCI/VP, Token Status List'],
    ['Reconcile with ARF Topic I', 'R2/R3 hide role and legal basis; ARF expects representation to be visible'],
    ['"statutory" grant method', 'Authority by law, and parentage ≠ guardianship'],
    ['"restricted" status + scoped constraints', 'Narrow a parent under a care order without revoking'],
    ['Provisional → confirmed assurance', 'Upgrade with successor_rel_jti (migrant evidence)'],
    ['Every party who can end it', 'Including the representative stepping down (Pääsuke DELETE_WAIVE)'],
    ['Legal validity ≠ exp', 'Open-ended mandates; short technical lifetimes'],
    ['Constitutive vs informative', 'Is the credential the authority, or evidence of it?'],
    ['Privacy between co-holders', 'Parents, Tusla and carers, plus notifying the child at 16'],
    ['EU adults regulation (§11.8)', 'European certificate of representation (Council, 19 Nov 2026)'],
  ];
  items.forEach(([t, d], i) => {
    const col = Math.floor(i / 5), r = i % 5, x = 0.6 + col * 6.17, y = 1.5 + r * 1.0;
    card(s, x, y, 5.96, 0.86, {noShadow: true});
    s.addText(String(i + 1), {x: x + 0.15, y: y + 0.18, w: 0.5, h: 0.5, fontFace: F, fontSize: 14, bold: true, color: WHITE, align: 'center', margin: 0,
      shape: pptx.ShapeType.ellipse, fill: {color: i < 2 ? COP : SKY}});
    s.addText(t, {x: x + 0.8, y: y + 0.08, w: 5.0, h: 0.35, fontFace: F, fontSize: 13.5, bold: true, color: TEAL, margin: 0});
    s.addText(d, {x: x + 0.8, y: y + 0.43, w: 5.05, h: 0.35, fontFace: F, fontSize: 11, color: MUTED, margin: 0});
  });
  s.addText([
    {text: 'Caveat: ', options: {bold: true, color: COP}},
    {text: 'the ', options: {color: TEAL}},
    {text: 'DA Framework', options: {color: SKY, hyperlink: {url: 'https://github.com/openid/eKYC-IDA-Authority/tree/main/DA%20Framework'}}},
    {text: ' is an early working draft (Reference Architecture v4.2, drafted with AI assistance, JWT-based). ARF Topic I is a discussion paper. Treat both as design references.', options: {color: TEAL}},
  ], {x: 0.6, y: 6.5, w: 12.13, h: 0.45, fontFace: F, fontSize: 11.5, margin: 0, valign: 'middle'});
  s.addNotes('These ten points came out of the analysis. Items 1 and 2 are the most important: a binding profile for the EUDI stack, and resolving the conflict between the privacy-preserving profile and the ARF expectation that representation is visible.');
}
{
  const s = base('Looking ahead', 'Delegated authority and AI agents', {draft: true});
  const cols = [
    ['users', 'sky', 'WALLET TO WALLET', 'Delegated authority', 'For people and organisations that hold a wallet and can be legally accountable.', [
      'Mandate bound to the representative\'s PID', 'A legal basis: consent, EPA, court', 'Revocable through the status list']],
    ['list', 'copper', 'REUSE', 'Familiar for the user', 'Granting access to an agent should feel like granting it to Alice.', [
      'Choose who, tick scopes, list exclusions', 'Time limit, and withdraw at any time', 'Activity log, with "acting for you" always shown']],
    ['sparkles', 'sky', 'DIFFERENT PLUMBING', 'Your AI agents', 'An agent is not a legal person: it gets no PID or mandate, and you stay accountable.', [
      'Grant bound to the agent instance\'s key', 'Limits on rate and value; step-up to you', 'Sub-delegation depth; human-only actions']],
  ];
  cols.forEach(([ic, col, k, t, d, pts], i) => {
    const x = 0.6 + i * 4.12, mid = i === 1;
    card(s, x, 1.5, 3.89, 3.75, mid ? {fill: 'FBF3EE', line: 'E8C9B5'} : {});
    tile(s, ic, col, x + 0.3, 1.75, 0.6, mid ? 'F3DED1' : ACC);
    s.addText(k, {x: x + 1.05, y: 1.75, w: 2.7, h: 0.25, fontFace: F, fontSize: 10, bold: true, color: mid ? COP : SKY, charSpacing: 2, margin: 0});
    s.addText(t, {x: x + 1.05, y: 2.0, w: 2.75, h: 0.4, fontFace: F, fontSize: 15, bold: true, color: TEAL, margin: 0, fit: 'shrink'});
    s.addText(d, {x: x + 0.3, y: 2.6, w: 3.35, h: 0.75, fontFace: F, fontSize: 12, color: MUTED, margin: 0, valign: 'top'});
    s.addText(pts.map((p, j) => ({text: p, options: {bullet: {code: '25CF', indent: 15}, breakLine: j < pts.length - 1, paraSpaceAfter: 6}})),
      {x: x + 0.3, y: 3.45, w: 3.4, h: 1.85, fontFace: F, fontSize: 12.5, color: TEAL, margin: 0, valign: 'top'});
  });
  s.addText([
    {text: 'Build agent grants on: ', options: {bold: true, color: COP}},
    {text: 'RFC 8693 token exchange ("act")', options: {color: SKY, hyperlink: {url: 'https://www.rfc-editor.org/rfc/rfc8693.html'}}},
    {text: ' · ', options: {color: MUTED}},
    {text: 'RFC 9396 rich authorization', options: {color: SKY, hyperlink: {url: 'https://www.rfc-editor.org/rfc/rfc9396.html'}}},
    {text: ' · ', options: {color: MUTED}},
    {text: 'OpenID CIBA', options: {color: SKY, hyperlink: {url: 'https://openid.net/specs/openid-client-initiated-backchannel-authentication-core-1_0.html'}}},
    {text: ' for step-up · ', options: {color: MUTED}},
    {text: 'MCP authorization', options: {color: SKY, hyperlink: {url: 'https://modelcontextprotocol.io/specification/latest/basic/authorization'}}},
  ], {x: 0.6, y: 6.45, w: 12.13, h: 0.4, fontFace: F, fontSize: 12, margin: 0, valign: 'middle'});
  s.addShape(pptx.ShapeType.roundRect, {x: 0.6, y: 5.5, w: 12.13, h: 0.6, rectRadius: 0.08, fill: {color: ACC}, line: {color: ACC}});
  s.addText([{text: 'Wallet mandates are for legal entities. ', options: {bold: true, color: TEAL}}, {text: 'Agents get standard OAuth grants, behind the same grant, scope and withdraw screens.', options: {color: TEAL}}], {x: 0.85, y: 5.5, w: 11.7, h: 0.6, fontFace: F, fontSize: 14, margin: 0, valign: 'middle'});
  s.addNotes('Delegated authority in the wallet is for legal entities that hold a wallet: people and organisations who can accept a mandate and be accountable for it. AI agents are different. They are tools acting for you, not legal representatives, so they should not receive a PID-bound mandate and liability stays with the person. The implementation should use OAuth-family standards: token exchange with an act claim, rich authorization requests for detailed scopes, CIBA to send high-risk actions back to the user for approval, and OAuth 2.1 as used by MCP. But the user experience should be the same one people learn for granting access to Alice: choose who, tick what they can and cannot do, set a time limit, see an activity log, withdraw at any time. Agents also need extra controls: rate and value limits, a maximum depth if they hand work to other agents, and actions that only a human can take, such as voting or consent to treatment.');
}

{
  const s = base('Prototype', 'Testing it: a Paradym Wallet prototype', {draft: true});
  const ph = [['0', 'Setup', 1], ['1', 'Rulebook draft', 1], ['2', 'Representation issuer', 2], ['3', 'Wallet: receive & show', 2], ['4', 'Verifier & present', 2], ['5', 'Lifecycle & revoke', 1], ['6', 'Minors & care', 2], ['7', 'Evaluate & publish', 1.5]];
  const vw = w => Math.max(w, 1.5), total = ph.reduce((a, p) => a + vw(p[2]), 0), W = 12.13;
  let x = 0.6;
  ph.forEach(([k, t, w], i) => {
    const ww = W * vw(w) / total - 0.06;
    const col = i === 6 ? COP : (i % 2 ? '0E5466' : TEAL);
    s.addText([{text: `${k} `, options: {bold: true, color: i === 6 ? 'FFE3D2' : '7FC8E3'}}, {text: t, options: {bold: true, color: WHITE}}],
      {x, y: 1.6, w: ww, h: 0.95, fontFace: F, fontSize: 11.5, margin: 0.08, align: 'center', valign: 'middle', shape: pptx.ShapeType.roundRect, rectRadius: 0.08, fill: {color: col}});
    s.addText(`${w} wk`, {x, y: 2.6, w: ww, h: 0.3, fontFace: F, fontSize: 10, color: MUTED, align: 'center', margin: 0});
    x += ww + 0.06;
  });
  s.addText('≈ 11–13 weeks · 2–3 engineers', {x: 0.6, y: 2.95, w: 6, h: 0.35, fontFace: F, fontSize: 13, bold: true, color: COP, margin: 0});
  const cs = [
    ['phone', 'Wallet', [[{text: 'Fork of '}, {text: 'animo/paradym-wallet', url: 'https://github.com/animo/paradym-wallet'}, {text: ' (Apache-2.0)'}], 'Representation card, "acting on behalf of" flow, status display, activity log']],
    ['server', 'Issuer & verifier', ['Credo-based OpenID4VCI issuer with PID during issuance, a mandate registry, and a Token Status List', 'Demo relying party using DCQL credential sets']],
    ['users', 'Mock authorities', ['DSS, GRO, Courts, Tusla, and a foreign-evidence caseworker (Option E)', 'Restrictions service for Option D overlays']],
    ['check', 'Outputs', [[{text: 'Usability tests (incl. older users), a threat model, and a demo'}], [{text: 'Feedback to '}, {text: 'ARF discussion #495', url: 'https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/495'}, {text: ' and a draft rulebook'}]]],
  ];
  cs.forEach(([ic, t, b], i) => {
    const xx = 0.6 + i * 3.08;
    card(s, xx, 3.5, 2.9, 3.25);
    tile(s, ic, 'sky', xx + 0.22, 3.72, 0.55);
    s.addText(t, {x: xx + 0.9, y: 3.72, w: 1.9, h: 0.55, fontFace: F, fontSize: 15, bold: true, color: TEAL, margin: 0, valign: 'middle'});
    s.addText(bullets(b, {fs: 11.5, gap: 6}), {x: xx + 0.22, y: 4.45, w: 2.55, h: 2.2, margin: 0, valign: 'top'});
  });
  s.addNotes('Paradym Wallet by Animo is open source under Apache 2.0 and built on Credo, which already supports OpenID4VCI, OpenID4VP, SD-JWT VC and mdoc. That makes it a good base for a representation prototype.');
}
{
  const s = base('Discussion', 'Questions for the room');
  const qs = [
    'Who should be the authoritative source for children\'s guardianship in Ireland: GRO, a new register, or a hybrid?',
    'Should statutory declarations of guardianship be registered (Option A+)?',
    'How should Tusla and the Courts restrict, rather than revoke, a parent\'s authority?',
    'What should a 16-year-old be able to see about who can act for them?',
    'How do we include migrant and foreign-born children without a population register?',
    'Should Ireland push for a common EU representation rulebook, linked to the European certificate of representation?',
  ];
  qs.forEach((q, i) => {
    const x = 0.6 + (i % 2) * 6.17, y = 1.5 + Math.floor(i / 2) * 1.75;
    card(s, x, y, 5.96, 1.55);
    s.addText('?', {x: x + 0.25, y: y + 0.4, w: 0.75, h: 0.75, fontFace: F, fontSize: 26, bold: true, color: WHITE, align: 'center', margin: 0,
      shape: pptx.ShapeType.ellipse, fill: {color: i % 3 === 0 ? COP : SKY}});
    s.addText(q, {x: x + 1.2, y: y + 0.15, w: 4.55, h: 1.25, fontFace: F, fontSize: 14, color: TEAL, margin: 0, valign: 'middle'});
  });
}
function refs(title, groups) {
  const s = base('References', title);
  groups.forEach(([g, items], gi) => {
    const col = gi < Math.ceil(groups.length / 2) ? 0 : 1;
    groups._y = groups._y || [1.45, 1.45];
    const x = 0.6 + col * 6.2;
    let y = groups._y[col];
    s.addText(g.toUpperCase(), {x, y, w: 5.9, h: 0.28, fontFace: F, fontSize: 11, bold: true, color: COP, charSpacing: 2, margin: 0});
    y += 0.3;
    const runs = items.map(([t, url], i) => ({text: t, options: {fontFace: F, fontSize: 12.5, color: url ? SKY : TEAL, hyperlink: url ? {url} : undefined, bullet: {code: '25CF'}, paraSpaceAfter: 2, breakLine: i < items.length - 1}}));
    const h = items.length * 0.3 + 0.05;
    s.addText(runs, {x, y, w: 5.95, h, margin: 0, valign: 'top'});
    groups._y[col] = y + h + 0.15;
  });
  return s;
}
refs('Legislation and standards', [
  ['EU legislation', [
    ['Regulation (EU) 2024/1183 (eIDAS 2): Art. 5a, 5b, 5f; Annex VI', 'https://eur-lex.europa.eu/eli/reg/2024/1183/oj'],
    ['Implementing Regulation (EU) 2024/2977: PID & attestations', 'https://eur-lex.europa.eu/eli/reg_impl/2024/2977/oj'],
    ['Directive (EU) 2025/2205: driving licences (mobile DL)', 'https://eur-lex.europa.eu/eli/dir/2025/2205/oj/eng'],
    ['Regulation (EU) 2025/327: European Health Data Space', 'https://eur-lex.europa.eu/eli/reg/2025/327/oj'],
    ['Council press release, 19 Nov 2026: protection of adults', 'https://www.consilium.europa.eu/en/press/press-releases/2026/11/19/council-greenlights-new-eu-rules-to-protect-vulnerable-adults/'],
  ]],
  ['Irish legislation', [
    ['Assisted Decision-Making (Capacity) Act 2015', 'https://www.irishstatutebook.ie/eli/2015/act/64/enacted/en/html'],
    ['Social Welfare Consolidation Act 2005, s.262 (PPSN)', 'https://www.irishstatutebook.ie/eli/2005/act/26/section/262/enacted/en/html'],
    ['Health Identifiers Act 2014', 'https://www.irishstatutebook.ie/eli/2014/act/15/enacted/en/html'],
    ['Children and Family Relationships Act 2015, s.49', 'https://www.irishstatutebook.ie/eli/2015/act/9/section/49'],
    ['Child Care Act 1991, s.18', 'https://www.irishstatutebook.ie/eli/1991/act/17/section/18/enacted/en/html'],
  ]],
  ['Standards', [
    ['OpenID4VCI 1.0', 'https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html'],
    ['OpenID4VP 1.0', 'https://openid.net/specs/openid-4-verifiable-presentations-1_0.html'],
    ['RFC 9901: Selective Disclosure for JWTs (SD-JWT)', 'https://www.rfc-editor.org/rfc/rfc9901.html'],
    ['SD-JWT VC (IETF draft)', 'https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/'],
    ['Token Status List (IETF draft)', 'https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/'],
    ['ISO/IEC 18013-5: mobile driving licence', 'https://www.iso.org/standard/69084.html'],
    ['W3C Digital Credentials API', 'https://www.w3.org/TR/digital-credentials/'],
  ]],
  ['Architecture', [
    ['ARF Discussion Topic I: person representing another', 'https://eudi.dev/latest/discussion-topics/i-natural-person-representing-another-natural-person/'],
    ['ARF discussion #495', 'https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/495'],
    ['EUDI attestation rulebooks catalogue', 'https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog'],
    ['WeBUILD power-of-attorney rulebook', 'https://github.com/webuild-consortium/webuild-attestation-rulebooks-catalog/tree/main/rulebooks/rb-poa-pox'],
  ]],
]);
refs('Working systems and proposals', [
  ['Ireland', [
    ['gov.ie: Government Digital Wallet consultation launch', 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/press-releases/minister-chambers-launches-public-consultation-and-testing-phase-for-irelands-new-government-digital-wallet/'],
    ['gov.ie: Government Digital Wallet FAQ', 'https://www.gov.ie/en/department-of-public-expenditure-infrastructure-public-service-reform-and-digitalisation/publications/government-digital-wallet-your-questions-answered/'],
    ['MyGovID', 'https://www.mygovid.ie/'],
    ['Decision Support Service', 'https://decisionsupportservice.ie/'],
    ['Coimisiún na Meán: Online Safety Code', 'https://www.cnam.ie/online-safety-code/'],
    ['ISD: registration requirements for minors', 'https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-register-your-immigration-permission-for-the-first-time/registration-requirements-for-minors/'],
  ]],
  ['Estonia', [
    ['RIA: Authorisations management (Pääsuke)', 'https://www.ria.ee/en/state-information-system/personal-services/authorisations-management-paasuke'],
    ['eesti.ee: Authorisations', 'https://www.eesti.ee/eraisik/en/volitused'],
    ['Pääsuke X-Road services specification', 'https://github.com/e-gov/PH/blob/main/spec/P%C3%A4%C3%A4suke-xroad-services-spec-v1.0.3.pdf'],
    ['GovSSO: representee list', 'https://e-gov.github.io/GOVSSO/Representee'],
  ]],
  ['Elsewhere', [
    ['Australia: Digital ID Act 2024', 'https://www.legislation.gov.au/C2024A00025/latest/text'],
    ['HCCH 1996 Child Protection Convention', 'https://www.hcch.net/en/instruments/conventions/full-text/?cid=70'],
  ]],
  ['Delegated authority & code', [
    ['OpenID DA Framework (eKYC & IDA WG)', 'https://github.com/openid/eKYC-IDA-Authority/tree/main/DA%20Framework'],
    ['DA Reference Architecture', 'https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/reference_architecture.md'],
    ['DA Privacy-Preserving Profile', 'https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/privacy_preserving_profile.md'],
    ['DA child guardianship stress test', 'https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/stress_test_child_guardianship.md'],
    ['animo/paradym-wallet (Apache-2.0)', 'https://github.com/animo/paradym-wallet'],
  ]],
]);

/* ---------- Thank you ---------- */
n++;
{
  const s = pptx.addSlide();
  s.background = {color: TEAL};
  s.addShape(pptx.ShapeType.rect, {x: 0, y: 0, w: 0.18, h: 7.5, fill: {color: COP}, line: {color: COP}});
  s.addText('Go raibh maith agaibh', {x: 0.9, y: 1.7, w: 11, h: 1.0, fontFace: F, fontSize: 44, bold: true, color: WHITE, margin: 0});
  s.addText('Thank you. Questions, challenges and corrections are very welcome.', {x: 0.9, y: 2.75, w: 11, h: 0.6, fontFace: F, fontSize: 20, color: LIGHT, margin: 0});
  s.addText([
    {text: 'Martin Woodward', options: {bold: true, color: WHITE, breakLine: true}},
    {text: 'martin@woodwardweb.com', options: {color: '40BCEB', hyperlink: {url: 'mailto:martin@woodwardweb.com'}}},
  ], {x: 0.9, y: 3.9, w: 6, h: 0.9, fontFace: F, fontSize: 18, margin: 0});
  tag(s, 'DRAFT FOR DISCUSSION', 0.9, 5.1);
  s.addShape(pptx.ShapeType.roundRect, {x: 9.6, y: 5.55, w: 3.15, h: 1.35, rectRadius: 0.12, fill: {color: WHITE}, line: {color: WHITE}});
  s.addImage({path: img('eu2026'), x: 9.75, y: 5.62, w: 2.85, h: 2.85 * 1276 / 2787});
  footer(s, true);
}

/* ---------- write + post-process ---------- */
await pptx.writeFile({fileName: OUT});
if (process.env.RAW) { console.log("raw"); process.exit(0); }
const zip = await JSZip.loadAsync(fs.readFileSync(OUT));
const FADE = '<p:transition spd="med"><p:fade/></p:transition>';
for (let i = 1; i <= n; i++) {
  const p = `ppt/slides/slide${i}.xml`;
  let x = await zip.file(p).async('string');
  let add = process.env.NOFADE ? "" : FADE;
  const v = videos.find(v => v.slide === i);
  if (v && !process.env.NOTIME) {
    const m = x.match(/<p:pic>\s*<p:nvPicPr>\s*<p:cNvPr id="(\d+)"[^>]*>\s*<a:hlinkClick r:id="" action="ppaction:\/\/media"\/>/) ||
      x.match(/<p:cNvPr id="(\d+)"[^>]*>(?:(?!<\/p:nvPicPr>).)*?<a:videoFile/s);
    if (!m) throw new Error('no video shape on slide ' + i);
    // pptxgenjs reuses a low id for media; give the video a unique id
    const id = String(Math.max(...[...x.matchAll(/<p:cNvPr id="(\d+)"/g)].map(a => +a[1])) + 1);
    x = x.replace(/<p:cNvPr id="\d+" name="Media 0">/, `<p:cNvPr id="${id}" name="Video">`);
    add += `<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst><p:seq concurrent="1" nextAc="seek"><p:cTn id="2" dur="indefinite" nodeType="mainSeq"><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0"><p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="4" fill="hold"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:par><p:cTn id="5" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" nodeType="afterEffect"><p:stCondLst><p:cond delay="0"/></p:stCondLst><p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="6" dur="${v.ms}" fill="hold"/><p:tgtEl><p:spTgt spid="${id}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn></p:par></p:childTnLst></p:cTn><p:prevCondLst><p:cond evt="onPrev" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:prevCondLst><p:nextCondLst><p:cond evt="onNext" delay="0"><p:tgtEl><p:sldTgt/></p:tgtEl></p:cond></p:nextCondLst></p:seq><p:video><p:cMediaNode vol="80000" mute="1"><p:cTn id="7" fill="freeze" display="1"><p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn><p:tgtEl><p:spTgt spid="${id}"/></p:tgtEl></p:cMediaNode></p:video></p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>`;
  }
  x = x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + add);
  zip.file(p, x);
}
fs.writeFileSync(OUT, await zip.generateAsync({type: 'nodebuffer', compression: 'DEFLATE'}));
console.log('slides', n, 'videos', videos.length, '->', OUT);

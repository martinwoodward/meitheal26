import React from 'react';
import {useCurrentFrame, interpolate} from 'remotion';
import {
  Stage, Actor, Packet, Connector, Badge, Tick, Pulse, Captions, Phone, ScrTitle, ScrRow, ScrBtn, ScrNote,
  CredCard, C, HEAD, ease, usePop, Icon, P,
} from './lib';

/* 1. Trust triangle */
export const Trust: React.FC = () => {
  const iss: P = [330, 260], wal: P = [960, 260], ver: P = [1590, 260], tl: P = [960, 590];
  return (
    <Stage>
      <Connector from={[iss[0] + 60, iss[1] + 90]} to={[tl[0] - 160, tl[1] - 20]} start={45} />
      <Badge p={[560, 470]} at={60} text="publishes signing keys" icon="key" />
      <Actor p={iss} icon="bank" label="Issuer" sub="e.g. RSA/NDLS · DSP · HSE" at={4} />
      <Actor p={wal} icon="wallet" label="Your wallet" sub="holder · on your phone" at={12} />
      <Actor p={ver} icon="shield" label="Verifier" sub="service / relying party" at={20} />
      <Actor p={tl} icon="list" label="EU trusted lists" sub="issuers & relying-party registers" at={28} w={340} />
      <Packet from={iss} to={wal} start={85} label="Signed credential" icon="file" curve={-60} />
      <Badge p={[960, 420]} at={130} text="Driving licence stored" color={C.green} icon="check" />
      <Packet from={ver} to={wal} start={160} label="Request: over 18?" color={C.copper} curve={-60} />
      <Pulse p={wal} at={205} />
      <Badge p={[960, 105]} at={212} text="You approve (Face ID / PIN)" icon="fingerprint" />
      <Packet from={wal} to={ver} start={245} label="age_over_18 = true" color={C.green} curve={60} />
      <Connector from={[ver[0] - 60, ver[1] + 95]} to={[tl[0] + 175, tl[1] - 20]} start={300} color={C.green} />
      <Badge p={[1360, 470]} at={315} text="signature & status valid" color={C.green} icon="check" />
      <Tick p={[ver[0] + 130, ver[1] - 90]} at={330} />
      <Captions items={[
        {at: 0, text: 'Three roles — issuer, holder (your wallet), verifier — anchored to EU trusted lists'},
        {at: 85, text: 'The issuer signs a credential and sends it to your wallet  ·  OpenID4VCI'},
        {at: 160, text: 'A service asks only for what it needs  ·  OpenID4VP'},
        {at: 245, text: 'You decide what to share — name and date of birth stay on your phone'},
        {at: 300, text: 'Verifier checks the signature against trusted lists — the issuer never learns where you went'},
      ]} />
    </Stage>
  );
};

/* 2. Selective disclosure */
const rows: [string, string, string][] = [
  ['Name', 'Aoife Byrne', '#3f9a…c21'],
  ['Date of birth', '14-03-1990', '#b17e…0aa'],
  ['Address', '12 Main St, Drogheda', '#7c40…e19'],
  ['Licence number', '123456789', '#e2d1…48b'],
  ['Categories', 'AM · B · W', '#55af…9d3'],
  ['Valid until', '09-04-2031', '#0c6e…b72'],
  ['age_over_18', 'true', '#a8f3…61c'],
];
export const Disclosure: React.FC = () => {
  const f = useCurrentFrame();
  const card = usePop(0);
  const ver: P = [1560, 230], shared: P = [1560, 560];
  return (
    <Stage>
      <div style={{position: 'absolute', left: 110, top: 50, width: 760, opacity: card, transform: `scale(${0.9 + 0.1 * card})`,
        background: '#fff', borderRadius: 26, boxShadow: '0 16px 40px rgba(7,59,73,0.18)', overflow: 'hidden', border: `2px solid ${C.border}`}}>
        <div style={{background: C.teal, color: '#fff', padding: '18px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <div style={{fontSize: 15, letterSpacing: 2, opacity: 0.8}}>MOBILE DRIVING LICENCE · IE</div>
            <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 30}}>Signed by issuer</div>
          </div>
          <Icon name="car" color="light" size={56} />
        </div>
        <div style={{padding: '12px 28px 18px'}}>
          {rows.map(([k, v, h], i) => {
            const hashT = ease(f, 95 + i * 6, 110 + i * 6);
            const isAge = k === 'age_over_18';
            const reveal = isAge ? ease(f, 205, 220) : 0;
            const hl = isAge && f > 205;
            return (
              <div key={k} style={{display: 'flex', justifyContent: 'space-between', padding: '9px 14px', marginBottom: 4, borderRadius: 12,
                background: hl ? '#e3f5ec' : i % 2 ? '#f6f9f9' : '#fff', border: hl ? `2px solid ${C.green}` : '2px solid transparent', fontSize: 23}}>
                <span style={{color: C.muted}}>{k}</span>
                <span style={{position: 'relative', fontWeight: 600, minWidth: 300, textAlign: 'right'}}>
                  <span style={{opacity: Math.max(1 - hashT, reveal)}}>{v}</span>
                  <span style={{position: 'absolute', right: 0, opacity: hashT * (1 - reveal), fontFamily: 'Menlo, monospace', color: '#8aa0a6', fontWeight: 400}}>{h}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <Badge p={[490, 640]} at={265} text="Bound to a key in your phone's secure chip — copies won't verify" icon="key" color={C.copper} />
      <Actor p={ver} icon="laptop" label="Online platform" sub="age check · Online Safety Code" at={140} />
      <Packet from={ver} to={[860, 560]} start={160} label="Request: age_over_18" color={C.copper} curve={-40} />
      <Packet from={[820, 560]} to={shared} start={225} label="age_over_18 = true ✓" color={C.green} />
      <div style={{position: 'absolute', left: shared[0], top: shared[1], transform: `translate(-50%,-50%) scale(${usePop(262)})`,
        background: '#fff', border: `3px solid ${C.green}`, borderRadius: 20, padding: '18px 26px', width: 420, boxShadow: '0 10px 30px rgba(7,59,73,0.12)'}}>
        <div style={{fontSize: 16, letterSpacing: 2, color: C.green, fontWeight: 600}}>VERIFIER RECEIVES</div>
        <div style={{fontFamily: HEAD, fontSize: 30, fontWeight: 700, marginTop: 4}}>age_over_18 = true</div>
        <div style={{fontSize: 17, color: C.muted, marginTop: 6}}>+ issuer signature · validity · device proof</div>
        <div style={{fontSize: 17, color: C.copper, marginTop: 6, fontWeight: 600}}>6 other claims never leave the phone</div>
      </div>
      <Captions items={[
        {at: 0, text: 'A credential is a bundle of claims, signed by the issuer'},
        {at: 95, text: 'Each claim is salted & hashed separately  ·  SD-JWT (RFC 9901) / ISO mdoc'},
        {at: 160, text: 'A platform needs to know “over 18?” — not who you are'},
        {at: 225, text: 'Only the approved claim is revealed — it still verifies against the signature'},
        {at: 265, text: 'Device binding: the presentation is signed by your phone, so a screenshot or copy is useless'},
      ]} />
    </Stage>
  );
};

/* 3. Issuance via MyGovID */
export const Issue: React.FC = () => {
  const ph: P = [520, 400], mg: P = [1130, 230], nd: P = [1640, 230];
  return (
    <Stage tag="ILLUSTRATIVE FLOW">
      <Phone p={ph} screens={[
        {at: 0, node: <>
          <ScrTitle sub="Government Digital Wallet">Add a credential</ScrTitle>
          <ScrRow text="Driving licence" hl />
          <ScrRow text="PPS number" />
          <ScrRow text="European Health Insurance Card" />
          <ScrRow text="Birth certificate" />
          <ScrNote>Available credentials depend on the issuer.</ScrNote>
        </>},
        {at: 65, node: <>
          <ScrTitle sub="Verified identity · SAFE 2">Sign in with MyGovID</ScrTitle>
          <div style={{background: C.bg, borderRadius: 14, padding: 14, fontSize: 15}}>aoife.byrne@example.ie<br /><span style={{color: C.muted}}>••••••••••</span></div>
          <ScrNote>Your identity was verified in person, so the issuer can trust who is asking.</ScrNote>
          <ScrBtn text="Continue" color={C.green} />
        </>},
        {at: 160, node: <>
          <ScrTitle sub="Road Safety Authority · NDLS ✓">Add your driving licence?</ScrTitle>
          <ScrRow text="Personal details" on />
          <ScrRow text="Photo" on />
          <ScrRow text="Categories & codes" on />
          <ScrRow text="Validity & status" on />
          <ScrNote>A new key is created in your phone's secure hardware.</ScrNote>
          <ScrBtn text="Add to wallet" />
        </>},
        {at: 290, node: <>
          <ScrTitle sub="Government Digital Wallet">My credentials</ScrTitle>
          <CredCard title="Driving licence" sub="RSA · NDLS" status="Valid" />
          <CredCard title="Identity (PID)" sub="Ireland" color="#0b5a6e" small />
          <div style={{border: `2px dashed ${C.border}`, borderRadius: 16, padding: 14, color: C.muted, fontSize: 15}}>+ Add PPS number</div>
        </>},
      ]} />
      <Actor p={mg} icon="fingerprint" label="MyGovID" sub="authentication" at={20} />
      <Actor p={nd} icon="car" label="RSA / NDLS" sub="credential issuer" at={28} />
      <Packet from={[690, 300]} to={mg} start={75} label="Sign in" color={C.sky} curve={-40} />
      <Packet from={mg} to={nd} start={120} label="Verified identity" color={C.sky} curve={-40} />
      <Packet from={nd} to={[700, 380]} start={175} label="Credential offer" color={C.copper} curve={60} />
      <Packet from={nd} to={[700, 420]} start={235} label="Licence · mdoc + SD-JWT VC" icon="file" curve={80} />
      <Tick p={[650, 140]} at={295} />
      <Badge p={[1390, 560]} at={240} text="Signed by RSA · bound to your device key" icon="key" color={C.teal} />
      <Captions items={[
        {at: 0, text: 'Open the wallet and choose a credential to add'},
        {at: 65, text: 'Sign in once with MyGovID — identity already verified in person (SAFE 2)'},
        {at: 160, text: 'The issuer makes a credential offer  ·  OpenID4VCI'},
        {at: 235, text: 'Licence issued in both EU formats, bound to a key in your phone'},
      ]} />
    </Stage>
  );
};

/* 4. Category B check */
export const CatB: React.FC = () => {
  const f = useCurrentFrame();
  const ver: P = [300, 250], ph: P = [880, 400], res: P = [1520, 390];
  const rp = usePop(215);
  return (
    <Stage>
      <Actor p={ver} icon="car" label="Car hire desk" sub="registered relying party" at={0} />
      <Badge p={[300, 430]} at={30} text="QR at the desk · OpenID4VP" icon="qr" />
      <Phone p={ph} at={6} screens={[
        {at: 0, node: <>
          <ScrTitle sub="Hold near the reader">Ready to share</ScrTitle>
          <CredCard title="Driving licence" sub="RSA · NDLS" status="Valid" />
        </>},
        {at: 100, node: <>
          <ScrTitle sub="Car Hire Ltd · verified ✓">Share for: rental check</ScrTitle>
          <ScrRow text="Photo" on />
          <ScrRow text="Category B entitlement" on />
          <ScrRow text="Valid until" on />
          <ScrRow text="Issuing authority" on />
          <ScrNote>Not shared</ScrNote>
          <ScrRow text="Address" off />
          <ScrRow text="Date of birth" off />
          <ScrRow text="Other categories" off />
          <ScrBtn text="Share with Face ID" />
        </>},
        {at: 190, node: <>
          <ScrTitle sub="Car Hire Ltd">Shared ✓</ScrTitle>
          <ScrNote>4 items shared · logged in your wallet history</ScrNote>
        </>},
      ]} />
      <Packet from={[440, 250]} to={[720, 300]} start={45} label="Photo · Cat B · validity?" color={C.copper} curve={-30} />
      <Pulse p={ph} at={160} r={220} />
      <Packet from={[1040, 380]} to={[1260, 380]} start={175} label="4 signed claims" color={C.green} />
      <div style={{position: 'absolute', left: res[0], top: res[1], width: 520, transform: `translate(-50%,-50%) scale(${0.9 + 0.1 * rp})`, opacity: rp,
        background: '#fff', borderRadius: 24, border: `2px solid ${C.border}`, boxShadow: '0 16px 40px rgba(7,59,73,0.18)', overflow: 'hidden'}}>
        <div style={{background: C.green, color: '#fff', padding: '16px 24px', fontFamily: HEAD, fontWeight: 800, fontSize: 32}}>✓ OK to drive · Category B</div>
        <div style={{display: 'flex', gap: 20, padding: 22}}>
          <div style={{width: 120, height: 150, borderRadius: 14, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Icon name="user" color="teal" size={80} />
          </div>
          <div style={{fontSize: 20, lineHeight: 1.7}}>
            {['B valid until 09-04-2031', 'Issuer signature (IE · RSA)', 'Not suspended / revoked', 'Presented by the holder\'s device'].map((t, i) => (
              <div key={t} style={{opacity: ease(f, 225 + i * 12, 235 + i * 12)}}><span style={{color: C.green, fontWeight: 700}}>✓ </span>{t}</div>
            ))}
          </div>
        </div>
      </div>
      <Captions items={[
        {at: 0, text: '“Can this person drive a car?” — in person, tap or scan  ·  ISO/IEC 18013-5'},
        {at: 100, text: 'The wallet shows who is asking and exactly what — you approve'},
        {at: 215, text: 'Signature, revocation status and device binding checked in under a second'},
        {at: 300, text: 'A yes/no on entitlement — no photocopy, and NDLS isn\'t told which desk you visited'},
      ]} />
    </Stage>
  );
};

/* 5. Full details + registration check */
export const FullDetails: React.FC = () => {
  const cof: P = [300, 210], ins: P = [300, 560], ph: P = [920, 400], reg: P = [1530, 380];
  const r1 = usePop(70), r2 = usePop(200);
  const f = useCurrentFrame();
  const showIns = f >= 195;
  return (
    <Stage>
      <Actor p={cof} icon="briefcase" label="Loyalty app" sub="asks for your full licence" at={0} compact w={340} dimAt={180} />
      <Actor p={ins} icon="shield" label="Motor insurer" sub="needs it for a quote" at={8} compact w={340} />
      <Phone p={ph} at={4} screens={[
        {at: 0, node: <><ScrTitle sub="Government Digital Wallet">Waiting…</ScrTitle><CredCard title="Driving licence" sub="RSA · NDLS" status="Valid" /></>},
        {at: 100, node: <>
          <ScrTitle sub="Loyalty app · registered for: name, email">Unexpected request</ScrTitle>
          <ScrRow text="Address — not registered" warn />
          <ScrRow text="Date of birth — not registered" warn />
          <ScrRow text="Licence number — not registered" warn />
          <ScrRow text="Categories — not registered" warn />
          <ScrNote color={C.red}>This service is asking for more than it registered to collect. You can report it.</ScrNote>
          <ScrBtn text="Report request" color={C.red} second="Don't share" />
        </>},
        {at: 230, node: <>
          <ScrTitle sub="InsureCo · registered for motor quotes ✓">Share full licence?</ScrTitle>
          <ScrRow text="Name & date of birth" on />
          <ScrRow text="Address" on />
          <ScrRow text="Licence number" on />
          <ScrRow text="Issue & expiry dates" on />
          <ScrRow text="All categories & codes" on />
          <ScrRow text="Photo" on />
          <ScrBtn text="Share with Face ID" />
        </>},
      ]} />
      <Packet from={[470, 210]} to={[760, 300]} start={40} label="Full licence please" color={C.copper} curve={-30} />
      <Tick p={[480, 160]} at={140} ok={false} />
      <Packet from={[470, 560]} to={[760, 470]} start={195} label="Full licence + purpose" color={C.copper} curve={30} />
      <Packet from={[1090, 470]} to={[470, 600]} start={300} label="Full licence (signed)" color={C.green} curve={70} />
      <Tick p={[480, 510]} at={345} />
      <div style={{position: 'absolute', left: reg[0], top: reg[1], width: 500, transform: `translate(-50%,-50%)`, opacity: showIns ? r2 : r1,
        background: '#fff', borderRadius: 22, border: `2px solid ${showIns ? C.green : C.red}`, padding: '20px 26px', boxShadow: '0 12px 30px rgba(7,59,73,0.14)'}}>
        <div style={{fontSize: 15, letterSpacing: 2, fontWeight: 600, color: C.muted}}>RELYING-PARTY REGISTRATION · eIDAS ART. 5b</div>
        <div style={{fontFamily: HEAD, fontWeight: 700, fontSize: 28, margin: '6px 0 10px'}}>{showIns ? 'InsureCo Ltd' : 'Loyalty app'}</div>
        <div style={{fontSize: 18, color: C.muted}}>Registered purpose</div>
        <div style={{fontSize: 21, fontWeight: 600, marginBottom: 10}}>{showIns ? 'Motor insurance quotation' : 'Customer loyalty'}</div>
        <div style={{fontSize: 18, color: C.muted}}>May request</div>
        <div style={{fontSize: 20, fontWeight: 600, color: showIns ? C.green : C.red}}>
          {showIns ? 'Full mDL data set ✓' : 'Name, email only ✕'}
        </div>
      </div>
      <Captions items={[
        {at: 0, text: 'Every relying party registers what it will ask for, and why  ·  eIDAS Art. 5b'},
        {at: 100, text: 'Over-asking gets flagged: the wallet compares the request with the registration'},
        {at: 230, text: 'A justified full request: every field listed, purpose shown — you still decide'},
        {at: 300, text: 'Same credential, different disclosures: minimal by default, full when justified'},
      ]} />
    </Stage>
  );
};

/* 6. Government sign-in */
export const SignIn: React.FC = () => {
  const f = useCurrentFrame();
  const lap = usePop(0);
  const qr = usePop(60);
  const done = ease(f, 300, 312);
  const ph: P = [1290, 420], be: P = [1700, 190];
  return (
    <Stage>
      <div style={{position: 'absolute', left: 90, top: 60, width: 860, height: 600, opacity: lap, background: '#fff', borderRadius: 22,
        border: `2px solid ${C.border}`, boxShadow: '0 16px 40px rgba(7,59,73,0.16)', overflow: 'hidden'}}>
        <div style={{background: C.accent, padding: '12px 18px', display: 'flex', gap: 10, alignItems: 'center'}}>
          {['#e0675a', '#e3b341', '#4dbb6b'].map(c => <div key={c} style={{width: 14, height: 14, borderRadius: 14, background: c}} />)}
          <div style={{marginLeft: 16, background: '#fff', borderRadius: 10, padding: '6px 16px', fontSize: 17, color: C.muted, flex: 1}}>🔒 services.gov.ie/mywelfare</div>
        </div>
        <div style={{position: 'relative', padding: 34}}>
          <div style={{opacity: 1 - done}}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40}}>Sign in to MyWelfare</div>
            <div style={{display: 'flex', gap: 30, marginTop: 26}}>
              <div style={{flex: 1}}>
                <div style={{border: `2px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', fontSize: 21, fontWeight: 600, color: C.muted, marginBottom: 14}}>Sign in with MyGovID</div>
                <div style={{background: C.teal, color: '#fff', borderRadius: 14, padding: '16px 20px', fontSize: 21, fontWeight: 600}}>Use your EU Digital Identity Wallet</div>
                <div style={{fontSize: 17, color: C.muted, marginTop: 18, lineHeight: 1.4}}>On this phone? The browser opens your wallet directly.</div>
              </div>
              <div style={{width: 260, height: 300, opacity: qr, transform: `scale(${qr})`, background: C.bg, borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <Icon name="qr" color="teal" size={190} />
                <div style={{fontSize: 16, color: C.muted}}>Scan with your wallet</div>
              </div>
            </div>
          </div>
          <div style={{position: 'absolute', inset: 34, opacity: done}}>
            <div style={{fontFamily: HEAD, fontWeight: 800, fontSize: 40}}>Welcome back, Aoife</div>
            <div style={{fontSize: 18, color: C.green, fontWeight: 600, marginTop: 6}}>✓ Signed in with EU Digital Identity Wallet · high assurance</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 26}}>
              {['Payments', 'Child Benefit', 'Documents', 'Messages'].map(t => (
                <div key={t} style={{background: C.bg, borderRadius: 14, padding: '26px 20px', fontSize: 22, fontWeight: 600}}>{t}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Phone p={ph} at={20} w={300} h={600} screens={[
        {at: 0, node: <><ScrTitle sub="Government Digital Wallet">Scan to sign in</ScrTitle><div style={{height: 260, borderRadius: 18, border: `3px dashed ${C.sky}`}} /></>},
        {at: 130, node: <>
          <ScrTitle sub="Dept. of Social Protection ✓">Sign in to MyWelfare?</ScrTitle>
          <ScrRow text="Identity (PID): name, date of birth" on />
          <ScrRow text="PPS number" on />
          <ScrNote>Nothing else is shared. You can see this in your wallet history.</ScrNote>
          <ScrBtn text="Sign in with Face ID" />
        </>},
        {at: 260, node: <><ScrTitle sub="MyWelfare">Signed in ✓</ScrTitle></>},
      ]} />
      <Connector from={[1180, 330]} to={[820, 300]} start={90} dur={25} color={C.sky} until={130} />
      <Badge p={[1010, 250]} at={100} text="scan" icon="qr" until={130} />
      <Actor p={be} icon="server" label="DSP verifier" sub="OpenID4VP endpoint" at={150} compact w={300} />
      <Packet from={[1420, 360]} to={be} start={205} label="PID + PPSN (signed)" color={C.green} curve={-40} />
      <Packet from={be} to={[900, 200]} start={255} label="session established" color={C.sky} curve={-60} />
      <Captions items={[
        {at: 0, text: 'Signing in to a government service: choose the wallet option'},
        {at: 60, text: 'Cross-device: scan a QR  ·  same device: browser calls the wallet (W3C Digital Credentials API)'},
        {at: 130, text: 'The wallet shows the verified service and what it needs; you approve'},
        {at: 205, text: 'Signed PID + PPSN go to the department\'s verifier  ·  OpenID4VP'},
        {at: 300, text: 'Signed in at high assurance, no password. MyGovID stays for people without a smartphone'},
      ]} />
    </Stage>
  );
};

/* 7. Adult delegation */
export const Adult: React.FC = () => {
  const mary: P = [270, 210], dss: P = [270, 560], reg: P = [880, 390], sean: P = [1400, 200], rp: P = [1610, 570];
  return (
    <Stage tag="DRAFT PROPOSAL">
      <Actor p={mary} icon="user" label="Mary, 82" sub="the person represented" at={0} compact w={330} />
      <Actor p={dss} icon="scale" label="Decision Support Service" sub="EPAs · co-decision · ADMCA 2015" at={8} compact w={390} />
      <Actor p={reg} icon="scroll" label="Representation service" sub="attestation provider (proposed)" at={16} w={330} />
      <Actor p={sean} icon="user" label="Seán (son)" sub="the representative" at={24} compact w={320} />
      <Actor p={rp} icon="building" label="Revenue / HSE / bank" sub="relying party" at={32} compact w={380} />
      <Packet from={mary} to={reg} start={55} label="Mandate → Seán · pensions & health" color={C.teal} curve={-40} dur={45} />
      <Packet from={dss} to={reg} start={115} label="Registered EPA" color={C.sky} curve={40} />
      <Packet from={reg} to={sean} start={165} label="Representation attestation" icon="file" curve={-40} />
      <Badge p={[1400, 320]} at={210} text="bound to Seán's PID · refreshes ≤30 days" icon="refresh" color={C.teal} size={17} />
      <Packet from={sean} to={rp} start={240} label="Seán's PID + attestation" color={C.green} curve={50} />
      <Badge p={[1610, 450]} at={285} text="Seán acting for Mary · scope: pensions" icon="eye" color={C.copper} />
      <Connector from={[1450, 600]} to={[1050, 430]} start={300} color={C.green} until={340} />
      <Tick p={[1800, 520]} at={322} until={400} />
      <Packet from={mary} to={reg} start={350} label="Withdraw mandate" color={C.red} curve={-40} dur={35} />
      <Badge p={[880, 560]} at={390} text="status: revoked" color={C.red} icon="ban" />
      <Packet from={sean} to={rp} start={405} label="attestation (revoked)" color={C.muted} curve={50} dur={35} />
      <Tick p={[1800, 520]} at={445} ok={false} />
      <Captions items={[
        {at: 0, text: 'Adults: someone you trust acts for you, within limits you set'},
        {at: 55, text: 'Mary grants a mandate in her wallet — or a legal instrument (EPA) is registered by the DSS'},
        {at: 165, text: 'Seán receives a representation attestation, bound to his own identity (PID)'},
        {at: 240, text: 'The service always sees he is a representative, and for what  ·  ARF Topic I'},
        {at: 350, text: 'Mary can withdraw (or Seán can step down) at any time — status lists stop it everywhere'},
      ]} />
    </Stage>
  );
};

/* 8. Children – Option D */
const Timeline: React.FC<{stops: {at: number; age: number}[]}> = ({stops}) => {
  const f = useCurrentFrame();
  const x0 = 160, x1 = 1560, ages = [0, 2, 9, 16, 18];
  const ax = (a: number) => x0 + (x1 - x0) * (a / 18);
  let age = 0;
  stops.forEach((s, i) => {
    const prev = i ? stops[i - 1].age : 0;
    if (f >= s.at) age = prev + (s.age - prev) * ease(f, s.at, s.at + 25);
  });
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 110}}>
      <div style={{position: 'absolute', left: x0, top: 56, width: x1 - x0, height: 6, background: C.border, borderRadius: 6}} />
      <div style={{position: 'absolute', left: x0, top: 56, width: ax(age) - x0, height: 6, background: C.sky, borderRadius: 6}} />
      {ages.map(a => (
        <div key={a} style={{position: 'absolute', left: ax(a), top: 20, transform: 'translateX(-50%)', fontSize: 19, color: C.muted, fontWeight: 600}}>
          {a === 0 ? 'birth' : `age ${a}`}
        </div>
      ))}
      <div style={{position: 'absolute', left: ax(age), top: 59, transform: 'translate(-50%,-50%)', width: 30, height: 30, borderRadius: 30,
        background: C.copper, border: '4px solid #fff', boxShadow: '0 3px 10px rgba(0,0,0,.25)'}} />
    </div>
  );
};
export const Child: React.FC = () => {
  const gro: P = [250, 230], crt: P = [250, 430], tus: P = [250, 630];
  const pa: P = [900, 230], pb: P = [900, 430], fc: P = [900, 630];
  const rp: P = [1560, 300], ch: P = [1560, 560];
  return (
    <Stage tag="DRAFT PROPOSAL">
      <Timeline stops={[{at: 40, age: 0}, {at: 135, age: 2}, {at: 220, age: 9}, {at: 420, age: 16}, {at: 470, age: 18}]} />
      <Actor p={gro} icon="stamp" label="GRO" sub="birth & adoption registration" at={0} compact w={340} />
      <Actor p={crt} icon="gavel" label="Courts" sub="guardianship orders · declarations" at={6} compact w={340} />
      <Actor p={tus} icon="hand" label="Tusla" sub="care orders" at={12} compact w={340} />
      <Actor p={pa} icon="user" label="Parent A" sub="guardian" at={18} compact w={310} />
      <Actor p={pb} icon="user" label="Parent B" sub="parent" at={22} compact w={310} />
      <Actor p={fc} icon="home" label="Foster carer" sub="from care order" at={26} compact w={310} />
      <Actor p={rp} icon="school" label="School / GP" sub="relying party" at={30} compact w={320} />
      <Actor p={ch} icon="baby" label="The child" sub="0 → 18" at={34} compact w={300} />
      <Packet from={gro} to={pa} start={50} label="Guardian · until 18th birthday" icon="file" />
      <Badge p={[900, 520]} at={100} until={185} text="parent ≠ guardian (yet)" color={C.copper} />
      <Packet from={crt} to={pb} start={145} label="Guardianship: declaration / court" icon="file" />
      <Badge p={[900, 520]} at={190} text="guardian ✓" color={C.green} />
      <Packet from={tus} to={[900, 330]} start={235} label="Care order: restrict" color={C.copper} curve={-80} dur={45} />
      <Badge p={[1120, 230]} at={280} text="restricted" color={C.copper} icon="alert" />
      <Badge p={[1120, 430]} at={284} text="restricted" color={C.copper} icon="alert" />
      <Packet from={tus} to={fc} start={290} label="Day-to-day care · school & GP" icon="file" />
      <Packet from={fc} to={rp} start={345} label="Foster carer credential" color={C.green} curve={-60} />
      <Badge p={[1560, 410]} at={390} text="authorised ✓ · placement not revealed" color={C.green} />
      <Badge p={[1560, 660]} at={430} text="from 16: sees who acts for them" icon="eye" until={475} />
      <Badge p={[1120, 230]} at={480} text="expired at 18" color={C.muted} />
      <Badge p={[1120, 430]} at={484} text="expired at 18" color={C.muted} />
      <Badge p={[1120, 630]} at={488} text="expired at 18" color={C.muted} />
      <Badge p={[1560, 660]} at={492} text="own wallet & PID ✓" color={C.green} icon="wallet" />
      <Captions items={[
        {at: 0, text: 'Option D: one baseline from the register of life events, plus overlays from courts and Tusla'},
        {at: 50, text: 'GRO issues a guardian credential on registering the birth or adoption'},
        {at: 100, text: 'Parentage isn\'t guardianship: an unmarried father may need a declaration or court order'},
        {at: 235, text: 'Care order: parents\' authority is restricted, not erased; the foster carer gets a scoped credential'},
        {at: 345, text: 'The school sees an authorised carer — never the placement address or the care order'},
        {at: 430, text: 'From 16 the young person can see (and be heard on) who acts for them'},
        {at: 480, text: 'At 18 every guardian credential expires automatically — the adult holds their own'},
      ]} />
    </Stage>
  );
};

/* 9. Self-granted health mandate: Bob → Alice */
export const SelfGrant: React.FC = () => {
  const bob: P = [300, 400], svc: P = [880, 185], alice: P = [1480, 170], hse: P = [1010, 560], pharm: P = [1650, 560];
  return (
    <Stage tag="DRAFT PROPOSAL · ILLUSTRATIVE">
      <Phone p={bob} at={0} screens={[
        {at: 0, node: <>
          <ScrTitle sub="Bob Murphy · Government Digital Wallet">Let someone help you</ScrTitle>
          <ScrRow text="Alice Murphy (daughter)" hl />
          <ScrNote>Alice accepted your invite with her own wallet. Her identity is verified (PID).</ScrNote>
        </>},
        {at: 40, node: <>
          <ScrTitle sub="Health · granted by you">What can Alice do?</ScrTitle>
          <ScrRow text="View prescriptions & medicines" on />
          <ScrRow text="Order repeat prescriptions" on />
          <ScrRow text="Collect from a pharmacy" on />
          <ScrRow text="GP notes & test results" off />
          <ScrRow text="Pensions · banking · tax" off />
          <ScrNote>For 12 months. You can withdraw at any time.</ScrNote>
          <ScrBtn text="Grant with Face ID" />
        </>},
        {at: 110, node: <>
          <ScrTitle sub="People who can act for you">Shared with Alice ✓</ScrTitle>
          <CredCard title="Alice · prescriptions" sub="BY CONSENT" status="Active" small />
          <ScrNote>Nothing has been done in your name yet.</ScrNote>
        </>},
        {at: 480, node: <>
          <ScrTitle sub="Done in your name">Activity</ScrTitle>
          <ScrRow text="Alice viewed medicines · 10:02" />
          <ScrRow text="Alice ordered a repeat · 10:05" />
          <ScrRow text="Collected at pharmacy · 16:40" />
          <ScrBtn text="Withdraw Alice's access" color={C.red} />
        </>},
        {at: 535, node: <>
          <ScrTitle sub="People who can act for you">Access withdrawn</ScrTitle>
          <CredCard title="Alice · prescriptions" sub="BY CONSENT" status="Revoked" color={C.muted} small />
        </>},
      ]} />
      <Actor p={svc} icon="scroll" label="Representation service" sub="attestation provider (proposed)" at={10} compact w={400} />
      <Actor p={alice} icon="user" label="Alice (daughter)" sub="the representative" at={18} compact w={330} />
      <Actor p={hse} icon="heart" label="HSE prescriptions" sub="medicines record · ePrescribing" at={26} compact w={410} />
      <Actor p={pharm} icon="pill" label="Pharmacy" sub="relying party" at={34} compact w={300} />

      <Packet from={[470, 330]} to={svc} start={110} label="Mandate → Alice · prescriptions" color={C.teal} curve={-30} dur={40} />
      <Badge p={[880, 290]} at={150} text="Legal basis: Bob's own consent · no court, no DSS" icon="hand" color={C.copper} size={18} until={330} />
      <Packet from={svc} to={alice} start={175} label="Representation attestation" icon="file" curve={-30} />
      <Badge p={[1480, 275]} at={220} text="bound to Alice's PID · 12 months · refreshes ≤30 days" icon="refresh" color={C.teal} size={16} until={330} />

      <Packet from={alice} to={hse} start={250} label="Alice's PID + attestation" color={C.green} curve={40} />
      <Tick p={[1240, 520]} at={290} until={345} />
      <Packet from={hse} to={alice} start={300} label="Bob's medicines (read-only)" color={C.sky} curve={40} dur={35} />

      <Packet from={alice} to={hse} start={345} label="Order repeat: atorvastatin" color={C.teal} curve={40} dur={35} />
      <Packet from={[1215, 560]} to={[1500, 560]} start={385} label="ePrescription" color={C.sky} dur={30} />
      <Packet from={alice} to={pharm} start={425} label="Collect for Bob" color={C.green} curve={-30} dur={30} />
      <Badge p={[1650, 445]} at={460} text="Alice acting for Bob · scope ✓" icon="eye" color={C.copper} until={530} />
      <Tick p={[1800, 520]} at={468} until={530} />

      <Packet from={[470, 330]} to={svc} start={535} label="Withdraw" color={C.red} curve={-30} dur={30} />
      <Badge p={[880, 290]} at={570} text="status: revoked" icon="ban" color={C.red} />
      <Packet from={alice} to={hse} start={580} label="attestation (revoked)" color={C.muted} curve={40} dur={30} />
      <Tick p={[1240, 520]} at={615} ok={false} />
      <Captions items={[
        {at: 0, text: 'Bob, 74, wants his daughter Alice to help with his prescriptions — no solicitor, no court'},
        {at: 40, text: 'In his own wallet Bob picks Alice and ticks exactly what she may do'},
        {at: 110, text: "Bob's consent is the legal basis: Alice gets a scoped mandate bound to her own PID"},
        {at: 250, text: 'Alice signs in as herself, shown as acting for Bob, and sees a read-only medicines list'},
        {at: 345, text: 'She orders a repeat; the pharmacy checks her mandate when she collects it'},
        {at: 480, text: 'Bob sees everything done in his name in his activity log'},
        {at: 535, text: 'Bob can withdraw at any time — the status list stops it everywhere'},
      ]} />
    </Stage>
  );
};

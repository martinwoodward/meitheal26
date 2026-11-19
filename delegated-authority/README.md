# Digital wallets & delegated authority

Talk for Digital Meitheal 2026, Day 2 (20 November 2026). Prepared by Martin Woodward ([martin@woodwardweb.com](mailto:martin@woodwardweb.com)).

- **[Slides — PowerPoint](Digital-Wallets-Delegated-Authority-Meitheal-2026.pptx)** (36 slides, embedded autoplaying animations, speaker notes)
- **[Slides — PDF](Digital-Wallets-Delegated-Authority-Meitheal-2026.pdf)**

## Contents

| Path | What it is |
|---|---|
| [`prototype-plan/`](prototype-plan/) | Detailed plan for prototyping person-to-person representation in the EUDI Wallet using [Paradym Wallet](https://github.com/animo/paradym-wallet) (Apache-2.0): architecture, credential design, flows, child authorisation options A–E, phases, test scenarios, risks. Also as a [3-page PDF](prototype-plan/EUDI-Representation-Prototype-Plan.pdf) (HTML source alongside). |
| [`REFERENCES.md`](REFERENCES.md) | All legislation, standards, architecture documents, working systems and code referenced in the deck and plan. |
| [`openid-da-framework-proposals.md`](openid-da-framework-proposals.md) | Changes we might propose to the draft OpenID Delegated Authority framework, based on gaps found in this analysis. |
| [`videos/`](videos/) | The Remotion animations embedded in the deck, as standalone MP4s. |
| [`source/`](source/) | Source that generates the deck: Remotion scenes (`src/`) and the pptxgenjs builder (`build.mjs`). |

## Animations

| Video | Shows |
|---|---|
| [Trust](videos/Trust.mp4) | The issuer–holder–verifier triangle and trust lists |
| [Disclosure](videos/Disclosure.mp4) | Selective disclosure |
| [Issue](videos/Issue.mp4) | Issuing a credential to the wallet |
| [CatB](videos/CatB.mp4) | Car hire: "may I drive a Category B car?" |
| [FullDetails](videos/FullDetails.mp4) | Full mobile driving licence request |
| [SignIn](videos/SignIn.mp4) | Signing in to a government website with the wallet |
| [Adult](videos/Adult.mp4) | Enduring power of attorney → mandate credential |
| [SelfGrant](videos/SelfGrant.mp4) | Bob grants his daughter Alice access to his prescriptions, no court involved |
| [Child](videos/Child.mp4) | Option D: guardianship from birth to 18 |

## Rebuilding the deck

```sh
cd source
npm install
node assets.mjs                       # icon PNGs (already committed)
npx remotion studio src/index.ts      # preview the scenes
for s in Trust Disclosure Issue CatB FullDetails SignIn Adult SelfGrant Child; do
  npx remotion render src/index.ts $s out/$s.mp4
done
# posters: npx remotion still src/index.ts <Scene> out/<Scene>-poster.png --frame=<last frame>
node build.mjs out/deck.pptx
```

> **Draft for discussion.** Not Government policy. Schemas and flows are illustrative.

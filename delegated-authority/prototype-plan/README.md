# Prototype plan: person-to-person representation in the EUDI Wallet (Paradym Wallet)

*Prepared by Martin Woodward ([martin@woodwardweb.com](mailto:martin@woodwardweb.com)) · Draft for discussion*

## 1. Goal

Prototype ARF **[Topic I — "Natural person representing another natural person"](https://eudi.dev/latest/discussion-topics/i-natural-person-representing-another-natural-person/)** end to end:

- An **agent** (e.g. adult child, parent, carer) holds a *Representation Attestation* in their own wallet.
- A **relying party (RP)** requests it, is *always* told the user is acting as a representative, and sees the nature and scope of the authority.
- Authority comes from either **(a) the principal's explicit consent** (voluntary mandate / power of attorney — elderly relative) or **(b) an authentic register** (parent of a minor, court-appointed guardian).
- Attestations are **short-lived and/or revocable** by everyone legally entitled to revoke.

Non-goals (v1): legal-person mandates (company PoA — see WeBUILD `rb-poa-pox`), cross-border legal validity, production-grade security certification.

## 2. ARF requirements we must demonstrate

| Source | Requirement | How the prototype shows it |
|---|---|---|
| Topic I §3.1 | Distinct attestation type for representation | New `vct` `urn:eudi:representation:proto:1` |
| Topic I §3.1 | Must state nature of representation and authorised operations; **cannot be concealed** | `representation_type`, `scope`, principal identity are **always-disclosed** (not SD) claims |
| Topic I §3.1 / Req 2 | Short-lived or revocable by all entitled parties | IETF Token Status List + ≤ 30-day validity with silent re-issuance |
| Topic I §3.2 | RP always aware it's dealing with a representative | RP must request the representation attestation; wallet UI shows "Acting on behalf of …" |
| Topic I §3.1 | Parent/child derived from authentic sources; PoA needs explicit principal authorisation | Two issuance paths (register-derived vs consent-derived) |
| Topic K | Combined presentation of several attestations | DCQL `credential_sets`: agent PID + representation attestation in one response |

## 3. Architecture

```
 ┌────────────────────┐      OpenID4VP (PID)      ┌─────────────────────────────┐
 │ Principal's wallet │ ───────────────────────▶ │ Representation Attestation   │
 │ (Paradym fork)     │   grant / revoke mandate  │ Provider (RAP)  – Credo      │
 └────────────────────┘                           │  • Mandate registry (≈Pääsuke)│
                                                  │  • Mock population register  │
 ┌────────────────────┐  OpenID4VCI (+ VP of PID) │  • Token Status List         │
 │ Agent's wallet     │ ◀───────────────────────▶ │  • OpenID4VCI issuer         │
 │ (Paradym fork)     │                           └─────────────────────────────┘
 └─────────┬──────────┘
           │ OpenID4VP / DC API: DCQL { PID(agent) + RepresentationAttestation }
           ▼
 ┌────────────────────┐
 │ Demo RP (Credo     │  e.g. "Health portal" / "Social-care application"
 │ verifier)          │  checks binding, scope, status, trust list
 └────────────────────┘
```

**Stack**

- **Wallet:** fork of `animo/paradym-wallet` (Apache-2.0, Expo/React Native, Credo `0.8.0-alpha`, `@openid4vc/*` 0.8). Two installs/devices: principal + agent.
- **RAP + RP:** Node services using `@credo-ts/core` + `@credo-ts/openid4vc` (same library as the wallet, minimising interop friction). Postgres or SQLite for the mandate registry.
- **PID source:** a test PID issuer (EUDI reference PID issuer, or a Credo-based mock) — both wallets need a PID.
- **Trust:** local ETSI TS 119 602 trusted list hosted by the RAP project, listing the RAP (issuer) and demo RP (WRPAC/WRPRC); Paradym already consumes these (`packages/sdk/src/trust/trustedLists.ts`).

## 4. Credential design (draft "rulebook")

Format: **SD-JWT VC** (`dc+sd-jwt`) first; ISO mdoc variant in a later phase for proximity.

```jsonc
{
  "vct": "urn:eudi:representation:proto:1",
  "iss": "https://rap.example.eu",
  "iat": 1795000000, "nbf": 1795000000, "exp": 1797592000,   // ≤ 30 days
  "status": { "status_list": { "idx": 412, "uri": "https://rap.example.eu/status/1" } },
  "cnf": { "jwk": { /* agent wallet key */ } },

  // ---- ALWAYS DISCLOSED (non-concealable per Topic I) ----
  "representation_type": "voluntary_mandate",   // | legal_guardian_minor | legal_guardian_adult | power_of_attorney
  "legal_basis": "consent",                      // | population_register | court_order
  "principal": {
    "given_name": "Anna", "family_name": "Ozola",
    "birth_date": "1941-03-02",
    "identifier": "EE-pseudo-7f3a…"              // pairwise/pseudonymous where possible
  },
  "scope": [                                     // operations the agent may perform
    { "domain": "health", "actions": ["read_records", "book_appointment"] },
    { "domain": "social_care", "actions": ["submit_application"] }
  ],
  "mandate_validity": { "from": "2026-11-19", "through": null }, // null = open-ended (as Pääsuke allows)
  "constraints": { "jurisdictions": ["EE", "LV"] },

  // ---- Representative binding ----
  "representative": {                            // must match agent PID presented alongside
    "given_name": "Mārtiņš", "family_name": "Ozols", "birth_date": "1975-06-11",
    "pid_binding": "sha256(<agent PID identifier>)"
  }
}
```

**Two separate validity periods.** `mandate_validity` is the *legal* duration of the authority. It can be open-ended, like Estonia's Pääsuke `validityPeriod` (`through` = null means indefinite; see the [X-Road services spec v1.0.3](https://github.com/e-gov/PH/blob/main/spec/P%C3%A4%C3%A4suke-xroad-services-spec-v1.0.3.pdf)). `exp` is the *technical* lifetime of this credential copy. It is kept short (≤ 30 days) and refreshed silently while the mandate is active and not revoked. That covers the ARF's "short-lived *or* revocable" requirement and comes close to Pääsuke's live check over X-Road, while still working offline. The 30-day figure is a prototype choice to test, not something Estonia uses.

Design decisions to validate in the prototype:

1. **Agent↔attestation binding:** `cnf` key in the agent's wallet **plus** matching agent PID claims presented in the same response (Topic K). Alternative to test: bind to the agent's Wallet Unit Attestation key.
2. **Principal data minimisation:** pseudonymous `principal.identifier` per RP sector vs. real personal ID — measure what RPs actually need.
3. **Scope vocabulary:** small controlled list of `domain` and `actions` values; publish as type metadata so the wallet can render human labels.
4. **Minors:** `representation_type=legal_guardian_minor`, `exp` capped at the child's 18th birthday.

Publish **SD-JWT VC Type Metadata** (with SVG rendering + claim labels) so Paradym renders it without hard-coding (`packages/sdk/src/config/typeMetadata.ts`, `display/sdJwt.ts`).

## 5. Key flows

### F1 — Principal grants a mandate (elderly relative)
1. Principal opens RAP "Authorisations" web page (Pääsuke-style) → **Log in with wallet** (OpenID4VP, PID).
2. Selects agent (by name + birth date + email/phone or invite), picks scope and validity, confirms.
3. RAP asks for a **signed consent** — prototype: second OpenID4VP with `transaction_data` describing the mandate (Paradym already parses transaction data in `packages/sdk/src/paso/transactionData.ts`); later: QES via wallet.
4. RAP creates a mandate record (status `pending_acceptance`) and sends the agent an invite link/QR.

### F2 — Agent accepts and receives the attestation
1. Agent opens invite → OpenID4VCI **authorization-code** flow.
2. The authorisation server requests the agent's **PID via OpenID4VP during issuance** — already supported by Paradym (`apps/wallet/src/features/receive/issuanceAuthorizationPresentationRequest.ts`).
3. RAP checks PID matches the invited agent → issues the attestation bound to agent's key; mandate goes `active`.

### F3 — Parent or guardian of a minor (from authoritative sources)
1. A legal event (birth registration, adoption, guardianship order, care order) creates or changes a guardianship record. See **§5a** for options on who issues.
2. The guardian receives a credential offer in their wallet, or collects it later by presenting their PID. Each child gets a separate credential (`legal_guardian_minor`), with `legal_basis` naming the event.
3. The mandate runs until the child's 18th birthday unless a later event ends or restricts it. Credential copies are refreshed regularly, and revocation goes through the status list.

## 5a. Child authorisations: options (Ireland as the worked example)

**The key constraint: parentage is not guardianship.** In Ireland, the General Register Office (GRO) registers births, marriages and adoptions. But a father who is not married to the mother is **not** a guardian just because he is on the birth certificate. He becomes one by:
- 12 months living with the mother, including 3 months with the child ([Children and Family Relationships Act 2015, s.49](https://www.irishstatutebook.ie/eli/2015/act/9/section/49));
- a statutory declaration signed by both parents; or
- a court order.

None of these are registered centrally today. Under a **care order** ([Child Care Act 1991, s.18](https://www.irishstatutebook.ie/eli/1991/act/17/section/18/enacted/en/html)), Tusla (the Child and Family Agency) can make most decisions, including consenting to medical treatment and passports. Parents usually remain guardians, but in practice their powers are restricted. Any design must handle these layers.

### Legal events to model

| Event | Authoritative source (IE) | Effect on attestations |
|---|---|---|
| Birth registration — married parents / mother | GRO (birth + marriage registers) | Issue `legal_guardian_minor` to each guardian, until 18 |
| Birth registration — unmarried father | GRO (parentage only) | **No guardianship** unless one of the events below applies |
| Statutory declaration (unmarried father) | Not registered today | Issue to father (needs a new registration step, see options) |
| Cohabitation-based guardianship (12 months + 3 months) | Not registered; court declaration if disputed | Issue on declaration or court order |
| Parents marry after birth | GRO marriage register | Issue to father |
| Donor-assisted reproduction (2nd parent) | GRO (CFRA 2015 parentage) | Issue to the second parent if they are a guardian |
| Adoption order | Adoption Authority of Ireland → GRO Adopted Children Register | Revoke birth parents' credentials; issue to adoptive parents |
| Court guardianship / custody / access order | Courts Service | Issue, restrict or revoke according to the order |
| Emergency / interim care order (s.13 / s.17) | District Court → Tusla | Short-lived Tusla authority; restrict parents' scope |
| Care order (s.18) | District Court → Tusla | Tusla authority until 18 or the order's end date; parents' scope restricted |
| Voluntary care (s.4) | Tusla, with parental agreement | Parents keep authority; foster carer gets day-to-day scope only |
| Enhanced foster-carer rights (s.43A) | District Court | Issue to the foster carer with the scope set by the order |
| Order discharged / child returns home | Courts / Tusla | Revoke Tusla/foster credentials; restore parents' scope |
| 18th birthday / death | GRO | All credentials expire or are revoked |

### Option A — GRO as the attestation provider, issuing at the life event
- GRO issues credentials automatically at birth registration, marriage and adoption entry. They run until the child turns 18.
- **Pros:** simplest; covers most children from day one; a single trusted issuer.
- **Cons:** misses unmarried fathers, court orders and care situations; GRO becomes involved in family-law matters it doesn't hold data on.
- **Option A+:** add a legal step so statutory declarations are lodged with GRO, which closes the biggest gap.

### Option B — A new central guardianship register (Estonia/Latvia-style)
- A register that combines GRO events, Courts Service orders, statutory declarations and Tusla care status feeds one representation issuer.
- **Pros:** one authoritative answer to "who may act for this child right now"; clean revocation; services only check one issuer.
- **Cons:** needs new law and a new data-sharing basis; this is the largest build and governance effort.

### Option C — Each authority issues its own credential
- GRO issues parentage/guardianship credentials, Courts Service issues credentials for orders, and Tusla issues care-authority credentials.
- The wallet presents whichever credentials are relevant, and the service works out who has authority.
- **Pros:** no new register; each body issues only what it is legally responsible for.
- **Cons:** services must reconcile possibly conflicting credentials; revocation is spread across issuers; hard for a parent to see where they stand.

### Option D — Hybrid: GRO baseline plus overlays from Courts and Tusla (recommended for the prototype)
- GRO issues the **baseline** guardianship credential at the life event (as in Option A+).
- The Courts Service and Tusla issue **overlay** credentials to new representatives: Tusla, an assigned social worker, foster carers, or a court-appointed guardian. They can also *restrict* the baseline through a shared restrictions/status service. A parent's credential can be narrowed (for example, it no longer covers medical consent) rather than revoked, which mirrors the legal reality.
- Services always check the status of both the baseline and the overlay.
- **Pros:** builds incrementally on existing registers; covers the care system; legally accurate.
- **Cons:** needs an agreed restrictions model and data sharing between Tusla, the Courts and GRO.

### Option E — Migrants and foreign-born children, using the OpenID Delegated Authority framework as the reference model

**The gap.** Ireland has no population register. Lawful migrants show up only in separate systems, and none of them records guardianship:
- **Immigration Service Delivery** (Department of Justice, Irish Residence Permit card): non-EEA residents only, and **[under-16s are not required to register](https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-register-your-immigration-permission-for-the-first-time/registration-requirements-for-minors/)**.
- **EU/EEA, Swiss and UK citizens:** no registration at all. Non-EU family members may hold an EU family residence card.
- **Department of Social Protection:** PPS number and Child Benefit. This gives a parent–child link, but it records who gets the payment, not who is legally a guardian.
- **GRO:** covers only births in Ireland and intercountry adoptions (recorded by the Adoption Authority). Children born abroad are missing.

**Proposal.** Add an "evidence-based" issuance route to Option D. The issuer's data model follows the OpenID Foundation eKYC & IDA working group's **[Delegated Authority (DA) Framework](https://github.com/openid/eKYC-IDA-Authority/tree/main/DA%20Framework)**, so authority from foreign or non-register sources is expressed the same way as domestic authority:

| Evidence source | How it becomes an attestation | DA framework concept |
|---|---|---|
| Guardianship attestation from another member state's EUDI Wallet (when available) | Accepted directly through the EU trusted lists; RAP re-issues or the RP accepts it as is | Source Authority `granted_by.granting_body` = foreign authority; cross-border recognition ([§11.8](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/reference_architecture.md)) |
| Foreign birth certificate, adoption or guardianship order (apostilled) | Verified by a caseworker (e.g. Intreo / DSP during PPS allocation) → issued at a lower assurance level until confirmed | `granted_by.method` = `appointed` / `inherent`; profile-based assurance |
| PPS / Child Benefit parent–child link | Supporting evidence only, never proof of guardianship on its own | Eligibility criteria (Relationship §4.6) |
| 1996 Hague Child Protection Convention measures | Foreign protective measures and parental responsibility recognised in Ireland | [HCCH 1996 Convention](https://www.hcch.net/en/instruments/conventions/full-text/?cid=70), cited in DA §11.8 |

**What to adopt from the DA framework, which applies to all options and not just migrants:**
- **Relationship type** `urn:ietf:params:delegation:guardian-dependent` (and `legal-representative` for adults) to align our `representation_type` ([Reference Architecture §4.3](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/reference_architecture.md)).
- **Trigger-based expiry** (`expires_on_event`, §7.7): age of majority, end of a court order or statutory review, rather than only calendar dates. Maps to our `mandate_validity`.
- **Transfer with continuity** (`successor_rel_jti`, §8.5): on a change of placement or guardian, the outgoing credential stays valid until its successor is active, so there is no gap in protection. Changes are also cascaded so that revocation reaches every credential that depends on the changed one.
- **Precedence among concurrent authority holders** (§11.7): parent, Tusla and foster carer can all hold authority at once with different scopes. This is still an open question in the framework, which matches our Option D "restriction service".
- **Graduated authority** by age band ([stress test §3.4](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/stress_test_child_guardianship.md)): the child gains authority from 13 and 16; full revocation at 18.
- **[Privacy-Preserving Profile](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/privacy_preserving_profile.md)** R1–R6: the service learns that the person is authorised, but not the child's care status, how many children they act for, their role or the legal basis. A *verification intermediary* holds the full credential and gives the service a minimal "presentation token". This aligns with our safeguarding mode.

**Caveat:** the DA framework is an early working draft (Reference Architecture v4.2). The README says it was drafted with AI assistance, and it uses JWTs rather than SD-JWT VC. Treat it as a design reference, not a normative spec. Our prototype could feed results back to the working group.

**Prototype impact:** add a "foreign evidence" mock issuer and a caseworker verification screen to the RAP. Test case: a family arrives from Brazil, a parent presents an apostilled birth certificate, receives a provisional attestation, and it is upgraded after verification.

### Specific design points for care and fostering
- **Scope tiers:** `guardian_full`, `day_to_day_care` (school trips, routine GP visits, school), `medical_consent`, `passport_consent`, `education`. Foster carers usually get `day_to_day_care`. Tusla holds `medical_consent`/`passport_consent` under s.18. Section 43A orders can extend a foster carer's scope.
- **Safeguarding:** where there is a child-protection concern, a parent's credential must not reveal the child's placement, school or address. Principal claims need a "minimal disclosure" mode, and services must not hand out location data.
- **Short-lived by default:** emergency (8 days) and interim (up to 29 days) care orders match short credential lifetimes, with automatic expiry when the order ends.
- **Delegation by Tusla:** Tusla is a legal person, so it issues credentials to named social workers and foster carers. This links to the legal-person mandate work (WeBUILD PoA rulebook).
- **The child's own voice:** from 16 (age of consent for medical treatment in Ireland) the child could be notified of, or able to see, who holds authority over them. This is a policy question to raise.
- **Issuing at birth before a wallet exists:** issue on demand. The guardian collects it by presenting their PID. GRO sends a notification (via MyGovID) rather than pushing to a wallet.

### Prototype impact
- Mock services for **GRO** (births, marriages, adoptions, statutory declarations), **Courts Service** (orders) and **Tusla** (care status, carers).
- RAP becomes a multi-source issuer following Option D. New `legal_basis` values: `birth_registration`, `marriage`, `adoption_order`, `statutory_declaration`, `court_guardianship_order`, `emergency_care_order`, `interim_care_order`, `care_order`, `voluntary_care`, `s43a_order`.
- Phase 6 grows from 1 to 2 weeks.
- New tests: an unmarried father on the birth certificate is refused until a declaration is lodged; adoption revokes the birth parents' credentials and issues new ones; a care order narrows the parent's scope and issues foster-carer day-to-day scope; the order is discharged and everything is restored; a parent under a safeguarding flag cannot see the placement.

### F4 — Agent acts at a relying party
1. Demo RP issues OpenID4VP request with **DCQL `credential_sets`**: `{ pid }` *or* `{ pid, representation }`. Paradym already resolves `credential_sets` (`packages/sdk/src/format/dcqlRequest.ts`).
2. Wallet shows a **distinct "Acting on behalf of Anna Ozola"** confirmation screen listing scope.
3. RP verifies: issuer in trusted list, signature, KB-JWT/nonce, status list, `representative` == presented PID, requested action ∈ `scope`.
4. RP UI shows "Mārtiņš Ozols acting for Anna Ozola (voluntary mandate)".

### F5 — Revocation
- **Principal** (in RAP portal, or from their wallet "Authorisations I've given" list) → revoke.
- **Agent** → renounce (from attestation detail screen).
- **Register/authority** → automated (F3) or admin console (court order).
- All set the Token Status List bit; RAP also stops re-issuance.

## 6. Paradym Wallet changes

| Area | Change | Likely location |
|---|---|---|
| Fork & build | Fork, set up EAS dev build, configure own PID issuer + trusted list URL | `apps/wallet/src/config/*`, `packages/sdk/src/trust/trustedLists.ts` |
| Display | Distinct "Representation" card style & detail screen (principal, type, scope, expiry, status) | `packages/sdk/src/display/sdJwt.ts`, `packages/ui`, `apps/wallet/src/features/wallet` |
| Presentation UX | When a representation attestation is in the submission, show "Acting on behalf of …" banner + scope; block if requested action outside scope (optional local check) | `apps/wallet/src/features/share/*` |
| Selection | If agent holds several representation attestations matching a query, add a "who are you acting for?" picker before attribute review | `packages/sdk/src/format/dcqlRequest.ts`, share screens |
| Status | Show revoked/expired state; refresh status list on open | `packages/sdk` (Credo status list support) |
| Lifecycle | Background re-issuance of short-lived attestation (refresh token / re-offer) | `packages/sdk/src/openid4vc/*` |
| Principal view | "Authorisations I've given" list — v1 = deep link to RAP portal; v2 = native list via RAP API authenticated by wallet | new `apps/wallet/src/features/representation` |
| Activity log | Record "Acted for X at RP Y" entries | `packages/sdk/src/hooks/useActivities.tsx` |
| i18n | New strings (en + lv/et for demo) | `packages/translations` |

Keep changes behind a feature flag (`apps/wallet/src/config/features.ts`: add `REPRESENTATION`).

## 7. Phased plan (≈ 11–13 weeks, 2–3 engineers)

| Phase | Weeks | Deliverables |
|---|---|---|
| **0. Setup** | 1 | Fork builds on iOS/Android; test PID issued to two wallets; local trusted list; CI |
| **1. Rulebook draft** | 1 | Credential schema, scope vocabulary, type metadata + SVG, binding decision record |
| **2. RAP issuer** | 2 | Credo OpenID4VCI issuer with PID-during-issuance, mandate registry, F1 portal, Token Status List |
| **3. Wallet: receive & display** | 2 | F2 working; representation card + detail screen; status display |
| **4. Demo RP + present** | 2 | Credo verifier with DCQL credential_sets; wallet "acting on behalf" UX; F4 end-to-end |
| **5. Lifecycle & revocation** | 1 | F5 (principal/agent/authority), short-lived re-issuance, activity log |
| **6. Minors & care system** | 2 | Mock GRO / Courts / Tusla services, Option D (baseline + overlays), scope restriction, safeguarding mode, auto-expiry at 18 |
| **7. Evaluate & publish** | 1–2 | Usability test (incl. older users), threat model, demo video, feedback to [ARF discussion #495](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/495) and draft rulebook PR to [`eudi-doc-attestation-rulebooks-catalog`](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog) |

Stretch: ISO mdoc variant + proximity (Paradym `packages/sdk/src/proximity`), Pääsuke adapter (Estonia) as an alternative authority source, Digital Credentials API flow (`dc-api`).

## 8. Test scenarios (acceptance)

1. Elderly principal grants health-read mandate → agent views records at demo health portal; RP shows "acting for".
2. Agent tries `social_care.submit_application` without that scope → RP rejects.
3. Principal revokes → next presentation fails status check within status-list TTL.
4. Parent receives attestations for two children; selects correct child at RP.
5. Child's 18th birthday (time-travel in test) → attestation revoked, not re-issued.
6. Agent presents representation attestation with someone else's PID → RP rejects (binding check).
7. RP requests only PID → representation attestation is never disclosed.

## 9. Risks & open questions

- **Binding model** is not yet specified by the ARF — prototype should compare `cnf`+PID-match vs WUA binding and report back.
- **Consent evidence** for PoA: is a wallet-signed transaction enough, or is a QES required under national law?
- **Principal's privacy:** what principal data can RPs see; pairwise identifiers per sector?
- **Minors with own wallets** (15+ in some states): does the child see/approve the parent's attestation?
- **Cross-border recognition** depends on the new EU [*Protection of Adults Regulation*](https://www.consilium.europa.eu/en/press/press-releases/2026/11/19/council-greenlights-new-eu-rules-to-protect-vulnerable-adults/) (certificate of representation) — model `legal_basis=eu_certificate` as a future value.
- Paradym is on **alpha Credo** builds — pin versions; expect upstream churn.
- **Licensing:** Paradym Apache-2.0 — keep NOTICE, mark modified files; check bundled assets/brand (rename app, replace Animo/Paradym branding).

## 10. References

**EU regulation and architecture**
- [Regulation (EU) 2024/1183 (eIDAS 2)](https://eur-lex.europa.eu/eli/reg/2024/1183/oj): Art. 5a (wallets); Annex VI point 9, "powers and mandates to represent"
- [Implementing Regulation (EU) 2024/2977: PID and electronic attestations of attributes](https://eur-lex.europa.eu/eli/reg_impl/2024/2977/oj)
- [ARF Discussion Topic I: natural person representing another natural person](https://eudi.dev/latest/discussion-topics/i-natural-person-representing-another-natural-person/) · [ARF discussion #495](https://github.com/eu-digital-identity-wallet/eudi-doc-architecture-and-reference-framework/discussions/495)
- [EUDI attestation rulebooks catalogue](https://github.com/eu-digital-identity-wallet/eudi-doc-attestation-rulebooks-catalog) · [WeBUILD power-of-attorney rulebook (legal persons)](https://github.com/webuild-consortium/webuild-attestation-rulebooks-catalog/tree/main/rulebooks/rb-poa-pox)
- [Council of the EU press release, 19 Nov 2026: new rules to protect vulnerable adults (European certificate of representation)](https://www.consilium.europa.eu/en/press/press-releases/2026/11/19/council-greenlights-new-eu-rules-to-protect-vulnerable-adults/)

**Estonia (Pääsuke)**
- [RIA: Authorisations management (Pääsuke)](https://www.ria.ee/en/state-information-system/personal-services/authorisations-management-paasuke) · [eesti.ee: Authorisations](https://www.eesti.ee/eraisik/en/volitused)
- [Pääsuke X-Road services specification v1.0.3](https://github.com/e-gov/PH/blob/main/spec/P%C3%A4%C3%A4suke-xroad-services-spec-v1.0.3.pdf): `ValidityPeriod`, `NAT_REPRIGHT`, DELETE_WITHDRAW / DELETE_WAIVE, role validity flags
- [Pääsuke developer docs (PH-Doku)](https://e-gov.github.io/PH-Doku/) · [Mandates (ET)](https://e-gov.github.io/PH-Doku/Volitused) · [Legal framework (ET)](https://e-gov.github.io/PH-Doku/oigusraamistik) · [Terms of use (ET, PDF)](https://www.ria.ee/sites/default/files/documents/2024-03/Paasuke_uldtingimused.pdf)
- [GovSSO: representee list](https://e-gov.github.io/GOVSSO/Representee) · [RIA: Estonian EUDI Wallet](https://www.ria.ee/en/state-information-system/electronic-identity-eid-and-trust-services/eudi-wallet)
- [Public Information Act](https://www.riigiteataja.ee/en/akt/514112013001) (§ 43¹⁰, authorisations database) · [General Part of the Civil Code Act](https://www.riigiteataja.ee/en/akt/523012025003) (granting and withdrawing authorisation)

**Ireland**
- [Immigration Service Delivery: registration requirements for minors](https://www.irishimmigration.ie/registering-your-immigration-permission/how-to-register-your-immigration-permission-for-the-first-time/registration-requirements-for-minors/) · [HCCH 1996 Child Protection Convention](https://www.hcch.net/en/instruments/conventions/full-text/?cid=70)
- [Children and Family Relationships Act 2015, s.49](https://www.irishstatutebook.ie/eli/2015/act/9/section/49) · [Child Care Act 1991, s.18](https://www.irishstatutebook.ie/eli/1991/act/17/section/18/enacted/en/html)

**OpenID Foundation: Delegated Authority framework (draft)**
- [DA Framework folder (eKYC & IDA WG)](https://github.com/openid/eKYC-IDA-Authority/tree/main/DA%20Framework): [Reference Architecture](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/reference_architecture.md) · [Privacy-Preserving Profile](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/privacy_preserving_profile.md) · [Execution Layer](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/execution_layer.md) · [Child guardianship stress test](https://github.com/openid/eKYC-IDA-Authority/blob/main/DA%20Framework/stress_test_child_guardianship.md)

**Standards and code**
- [OpenID4VCI 1.0](https://openid.net/specs/openid-4-verifiable-credential-issuance-1_0.html) · [OpenID4VP 1.0](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html) · [SD-JWT VC](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/) · [Token Status List](https://datatracker.ietf.org/doc/draft-ietf-oauth-status-list/)
- [animo/paradym-wallet (Apache-2.0)](https://github.com/animo/paradym-wallet)

---
Contact: Martin Woodward · [martin@woodwardweb.com](mailto:martin@woodwardweb.com)

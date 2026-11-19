# Proposed changes to the OpenID Delegated Authority framework

The [OpenID DA Framework](https://github.com/openid/eKYC-IDA-Authority/tree/main/DA%20Framework) is an early draft from the eKYC & IDA Working Group. Working through EUDI Wallet representation, Estonia's Pääsuke and Irish guardianship law surfaced the gaps below. These are **suggestions for discussion**, not yet raised with the working group.

| # | Proposal | Issue it addresses |
|---|---|---|
| 1 | **EUDI Wallet / ARF binding profile** | The framework barely mentions eIDAS 2, the EUDI Wallet, ARF Topic I, OpenID4VCI/VP, mdoc or PID binding. A profile mapping DA relationships to EUDI attestations and PID-bound presentation would make it usable in Europe. |
| 2 | **Reconcile the Privacy-Preserving Profile with ARF Topic I** | Requirements R2/R3 allow the legal basis and role to be hidden from relying parties. ARF Topic I expects the relying party to see that a person is acting as a representative and in what capacity. The profile should state which wins, or offer both modes. |
| 3 | **A `statutory` value for `granted_by`** | Many relationships (a mother's guardianship, a married father's) arise by operation of law, not by a grant. Parentage is not the same as guardianship; the model should record the legal source separately from the evidence. |
| 4 | **A "restricted" status and subject-scoped constraints** | Care orders and court orders often limit, rather than remove, a guardian's authority. Add a restricted state alongside active/suspended/revoked, and let §11.7 precedence rules be scoped to particular subjects (health, education, travel). |
| 5 | **Provisional → confirmed assurance** | Foreign documents (migrants) need a provisional credential while a caseworker verifies them. Model the upgrade as a successor relationship (`successor_rel_jti`, §8.5) with continuity, rather than revoke-and-reissue. |
| 6 | **Every party who can end a delegation** | Include renunciation by the delegatee (Pääsuke `DELETE_WAIVE`), withdrawal by the principal, and revocation by a court or authority, each with its own reason code. |
| 7 | **Separate legal validity from technical `exp`** | An enduring power of attorney or Estonian mandate may be open-ended; the credential should still expire in ≤30 days and refresh. The framework should carry both. |
| 8 | **Constitutive vs informative flag** | Is the credential the authority itself (constitutive) or evidence of authority held elsewhere (informative)? This changes liability and what a relying party must check. |
| 9 | **Privacy between co-holders, and the child's voice** | Two guardians share authority but may not be entitled to see each other's actions or address. Add rules for co-holder visibility, and for notifying the child (e.g. from 16) of actions taken in their name. |
| 10 | **Update §11.8 for the EU adults regulation** | §11.8 refers to the March 2026 Council position. The Council adopted the protection-of-adults rules on 19 Nov 2026, including a European certificate of representation that the framework should map to. |

Contact: Martin Woodward · [martin@woodwardweb.com](mailto:martin@woodwardweb.com)

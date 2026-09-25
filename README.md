# TAHKIK AI — Scientific Freeze v1.0

Author: Ahmet Turan Demiralp

This release is a reproducibility handoff for the frozen deterministic TAHKIK benchmark and its evidence state.

## Confirmed in this freeze

- Frozen deterministic benchmark: 64/64 passed, 0 failed, 0 unsafe-handled.
- Signed operator-local external ledger rerun: VERIFIED.
- Ed25519 signature: valid and matched to an ACTIVE trusted public key with a prior possession proof.
- Evidence state is anchored to a SHA-256 chained Evidence Ledger.

## Not claimed by this release

- Independent third-party replication is not yet completed.
- This is not a blind or organizer-held secret external test.
- The signing key registry does not independently prove legal or real-world identity.
- Passing this frozen benchmark does not establish the truth of unrelated scientific claims.

## Reproduce

Install Node.js 18+ and run:

    node portable-runner.js YOUR_ACTOR_ID YOUR_ORGANIZATION

The runner requires no Floot, OpenAI, network access, or npm packages.
Return the generated external rerun JSON without modifying the frozen fixtures.

## Integrity

Scientific Freeze SHA-256: 5ede3f9c6bf4f0555c18185cd19d35f8ed94b11c72e1988d56c127b197eb92ce
Evidence Ledger anchor sequence: 47
Evidence Ledger anchor hash: e91ce3170a68e9a8411cc372c9884c88082ac516ab03f4b64ae5bebe333a524a
Frozen Rerun Pack SHA-256: 458d99c39c0f50185ff54ab24aaee80081ab77b6d35f7040e4755bca81444a4c
Portable Runner SHA-256: 9ff3286d1ee31138ca566b5c78e41c263b02ac45e5c26854c3d881f4e96a0e79

Developed collaboratively with ChatGPT / OpenAI as an AI-assisted development tool.

# Independent Replication Protocol

1. Use a machine, account, and runtime controlled by the external actor.
2. Verify the SHA-256 values in SHA256SUMS.txt before execution.
3. Do not edit the runner, fixture claims, materials, or expected labels.
4. Run portable-runner.js with Node.js 18+.
5. Preserve the generated external rerun JSON unchanged.
6. Record actor/organization, OS, architecture, Node version, start/end timestamps, and deviations.
7. Return the generated JSON for deterministic verification.

A successful run supports reproducibility of this frozen benchmark. It is not a blind test.

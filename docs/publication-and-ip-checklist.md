# GitHub Publication and IP Checklist

**Important:** the project team has been preparing patent materials. Before turning this repository public, get advice from a registered Indian patent agent about timing and disclosure. A repository can expose the technical specification, CAD, firmware and model details to the public.

Section 10 of the Indian Patents Act describes the required contents of specifications; Section 13 addresses searches for anticipation by previous publication/prior claim:
- https://ipindia.gov.in/acts/patent-act-1970/section-10
- https://ipindia.gov.in/acts/patent-act-1970/section-13

## Before making the repository public

- [ ] Confirm whether a patent application has been filed and record the filing/priority date.
- [ ] Ask a registered patent agent whether the README, images, CAD, schematic and code disclose anything that should remain confidential before filing.
- [ ] Confirm the inventors and applicant and document rights from all contributors, institutions and sponsors.
- [ ] Review hackathon slides, poster, demo videos, social media posts, papers, website history and prior demonstrations.
- [ ] Remove passwords, Wi-Fi credentials, API keys, tokens, SIM details and private keys.
- [ ] Remove personal worker data, health measurements, identifiers and consent-sensitive test data.
- [ ] Ensure photographs do not expose unrelated personal information or confidential site information.
- [ ] Verify every claim of predictive accuracy, warning lead time, radio range, latency and battery life against test reports.
- [ ] Choose a software license and a separate hardware/design license only after the team's IP strategy is settled.
- [ ] Mark generated concept renders clearly; don't represent them as measured CAD drawings.
- [ ] Verify all external research references and cite sources consistently.

## Do not include in public source control

- Device credentials or Wi-Fi passwords.
- Private `.env` files.
- API keys, access tokens, radio encryption keys or TLS private keys.
- Personal health data and unredacted worker logs.
- Confidential patent-agent correspondence.
- Third-party papers, images or product manuals unless redistribution is allowed.
- Unlicensed CAD, external source files or datasets.

A private GitHub repository is a safer temporary option while the filing strategy is being finalized, but access should still be limited to authorized collaborators.

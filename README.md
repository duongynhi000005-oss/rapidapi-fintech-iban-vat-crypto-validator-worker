# Universal IBAN, BIC/SWIFT, EU VAT, Luhn Card BIN & Crypto Address Validator API (Cloudflare Worker)

Sub-5ms global edge validation microservice built for **RapidAPI Hub** running at `$0/month` on Cloudflare Workers Free Tier (`100,000 requests/day` included, `0` external paid API dependencies).

## Endpoints
- `GET|POST /v1/iban` — ISO 13616 IBAN validation across 80+ countries with `MOD-97-10` checksum, SEPA status, and bank/branch extraction.
- `GET|POST /v1/vat` — EU-27, UK (`GB`), and Switzerland (`CHE`) VAT syntax and mathematical modulo checksum verification.
- `GET|POST /v1/crypto` — Cryptographic checksum validation for `BTC` (`Base58Check`, `Bech32`, `Bech32m`), `ETH/EVM` (`EIP-55 Keccak-256`), `SOL` (`Ed25519 Base58`), and `TRX` (`TRC-20 Base58Check`).
- `GET|POST /v1/card` — `Luhn MOD-10` checksum and `BIN` card network detection (`Visa`, `Mastercard`, `Amex`, `Discover`, `JCB`, `Diners Club`, `UnionPay`, `Maestro`).
- `GET|POST /v1/bic` — ISO 9362 `BIC / SWIFT` 8/11-character bank & branch code parser.
- `GET /v1/health` — Edge region & health status.

# P2 local account and session boundary

Single-user deployment, original design (all login geometry/copy UNVERIFIED).
`/login` switches between first-account registration and sign-in. Email is
normalized; passwords are 12–1024 characters, salted with 128 random bits and
hashed server-side using Node scrypt (64-byte result, default N=16384/r=8/p=1).
Constant-time hash comparison; no password logging or plaintext persistence.

`<DATA_FILE>.auth` stores the account's stable UUID, email, admin role and salted
hash plus SHA-256 hashes of 256-bit random session tokens. Sessions expire after
seven days; a maximum of ten recent sessions is retained. Logout revokes the
server record. JSON is atomically written with mode 0600 in a 0700 directory.
The session cookie is HttpOnly, SameSite=Strict and path-scoped to `/`.

Deployment remains **loopback HTTP only**, with Host and Origin enforcement and
a custom same-origin write header. Secure cookies/TLS reverse-proxy deployment
are not claimed; do not expose this server to a public interface. Sign-in and
registration are limited to ten attempts/minute/address. Only the first account
can register; later registration returns 409. Existing definitions are adopted
by the single owner when saved; new saves carry their user UUID.

Signed-out API calls return 401 and product pages redirect to `/login`.
Settings Account shows the signed-in email and a real Sign out action.
Static assets and login status do not expose private stored data.

Tests: persistence/restart, salt/hash/token secrecy, expiry, logout, duplicate
registration, invalid credentials, cookie flags, CSRF, signed-out gate and
throttling. All 61 tests and strict/evidence checks pass. No multi-user ACL,
password reset, email verification, session management UI, TLS deployment,
or reference visual parity is claimed.

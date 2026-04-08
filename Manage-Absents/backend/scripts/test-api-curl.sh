#!/usr/bin/env bash
# Teste toutes les routes HTTP de l'API avec curl (hors périmètre de test-db.mjs = SQLite seul).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export JWT_SECRET="${JWT_SECRET:-test-curl-jwt-secret}"
export PORT="${PORT:-3997}"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"; kill "$SRV_PID" 2>/dev/null || true' EXIT

rm -f "$ROOT/relay.db"

node server.js &
SRV_PID=$!
sleep 0.4

BASE="http://127.0.0.1:$PORT"
H_JSON=(-H "Content-Type: application/json")

json_field() {
  node -e "const j=JSON.parse(require('fs').readFileSync('$1','utf8')); console.log(j['$2'] ?? '')"
}

expect_code() {
  local got="$1"
  local want="$2"
  local label="$3"
  if [[ "$got" != "$want" ]]; then
    echo "ÉCHEC: $label — HTTP $got (attendu $want)"
    if [[ -f "$TMP/body" ]]; then echo "Corps: $(cat "$TMP/body")"; fi
    exit 1
  fi
  echo "OK    $label ($got)"
}

# --- Public ---
curl -sS -o "$TMP/body" -w "%{http_code}" "$BASE/health" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET /health"

curl -sS -o "$TMP/body" -w "%{http_code}" "${H_JSON[@]}" -d '{}' "$BASE/auth/login" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "400" "POST /auth/login sans email/password"

curl -sS -o "$TMP/body" -w "%{http_code}" "$BASE/users" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "401" "GET /users sans token"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${H_JSON[@]}" \
  -d '{"email":"curl-alice@test.local","password":"secret123","surname":"A","firstname":"Alice"}' \
  "$BASE/users" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "201" "POST /users (Alice)"
AID="$(json_field "$TMP/body" id)"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${H_JSON[@]}" \
  -d '{"email":"curl-bob@test.local","password":"secret456","surname":"B","firstname":"Bob"}' \
  "$BASE/users" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "201" "POST /users (Bob)"
BID="$(json_field "$TMP/body" id)"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${H_JSON[@]}" \
  -H "Authorization: Bearer invalid" \
  "$BASE/users" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "401" "GET /users token invalide"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${H_JSON[@]}" \
  -d "{\"email\":\"curl-alice@test.local\",\"password\":\"wrong\"}" \
  "$BASE/auth/login" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "401" "POST /auth/login mauvais mot de passe"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${H_JSON[@]}" \
  -d "{\"email\":\"curl-alice@test.local\",\"password\":\"secret123\"}" \
  "$BASE/auth/login" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "POST /auth/login"
TOKEN="$(json_field "$TMP/body" token)"
AUTH=(-H "Authorization: Bearer $TOKEN")

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/auth/me" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET /auth/me"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET /users"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users/$AID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET /users/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"surname":"Alisson","firstname":"Ali"}' \
  -X PUT "$BASE/users/$AID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "PUT /users/:id"

# --- Responsibilities ---
curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"description":"Tâche curl"}' \
  "$BASE/users/$AID/responsibilities" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "201" "POST .../responsibilities"
RID="$(json_field "$TMP/body" id)"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users/$AID/responsibilities" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../responsibilities"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users/$AID/responsibilities/$RID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../responsibilities/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"description":"Tâche curl MAJ"}' \
  -X PUT "$BASE/users/$AID/responsibilities/$RID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "PUT .../responsibilities/:id"

# --- Unavailabilities ---
curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"startDate":"2026-06-01","endDate":"2026-06-10"}' \
  "$BASE/users/$AID/unavailabilities" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "201" "POST .../unavailabilities"
UNAV_ID="$(json_field "$TMP/body" id)"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"startDate":"2026-12-10","endDate":"2026-12-01"}' \
  "$BASE/users/$AID/unavailabilities" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "400" "POST .../unavailabilities dates incohérentes"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users/$AID/unavailabilities" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../unavailabilities"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" "$BASE/users/$AID/unavailabilities/$UNAV_ID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../unavailabilities/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d '{"endDate":"2026-06-15"}' \
  -X PUT "$BASE/users/$AID/unavailabilities/$UNAV_ID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "PUT .../unavailabilities/:id"

# --- Coverages ---
curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d "{\"coveringUserId\":\"$BID\",\"responsibilityId\":\"$RID\"}" \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "201" "POST .../coverages"
CID="$(json_field "$TMP/body" id)"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d "{\"coveringUserId\":\"$BID\",\"responsibilityId\":\"$RID\"}" \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "409" "POST .../coverages doublon"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../coverages"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages/$CID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "GET .../coverages/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" "${H_JSON[@]}" \
  -d "{\"coveringUserId\":\"$BID\",\"responsibilityId\":\"$RID\"}" \
  -X PUT "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages/$CID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "200" "PUT .../coverages/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" -X DELETE \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID/coverages/$CID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "204" "DELETE .../coverages/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" -X DELETE \
  "$BASE/users/$AID/responsibilities/$RID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "204" "DELETE .../responsibilities/:id"

curl -sS -o "$TMP/body" -w "%{http_code}" \
  "${AUTH[@]}" -X DELETE \
  "$BASE/users/$AID/unavailabilities/$UNAV_ID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "204" "DELETE .../unavailabilities/:id"

BOB_TOKEN="$(curl -sS "${H_JSON[@]}" -d '{"email":"curl-bob@test.local","password":"secret456"}' "$BASE/auth/login" | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>console.log(JSON.parse(d).token))")"
curl -sS -o "$TMP/body" -w "%{http_code}" -H "Authorization: Bearer $BOB_TOKEN" -X DELETE "$BASE/users/$BID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "204" "DELETE /users/:id (Bob)"

curl -sS -o "$TMP/body" -w "%{http_code}" "${AUTH[@]}" -X DELETE "$BASE/users/$AID" >"$TMP/code" || true
expect_code "$(cat "$TMP/code")" "204" "DELETE /users/:id (Alice)"

echo ""
echo "Tous les tests curl API sont passés."

#!/bin/sh

echo "==[ 1) Network basics ]=="
ip -4 addr show 2>/dev/null | awk '/inet /{print "IP: " $2}' | sed 's#/.*##'
ip route 2>/dev/null | head -n1
echo

echo "==[ 2) DNS resolution ]=="
for h in [google.com](http://google.com/) [registry.npmjs.org](http://registry.npmjs.org/) [github.com](http://github.com/) [boutique.orange.ma](http://boutique.orange.ma/); do
if getent hosts "$h" >/dev/null 2>&1; then
echo "DNS OK: $h"
else
echo "DNS FAIL: $h"
fi
done
echo

echo "==[ 3) HTTP/HTTPS reachability (5s timeout) ]=="
for u in [https://google.com](https://google.com/) [https://registry.npmjs.org](https://registry.npmjs.org/) [https://github.com](https://github.com/); do
code=$(curl -sS -I --max-time 5 "$u" 2>/dev/null | head -n1 | awk '{print $2}')
if echo "$code" | grep -Eq '^[0-9]{3}$'; then
echo "HTTP OK: $u (code $code)"
else
echo "HTTP FAIL: $u"
fi
done
echo

echo "==[ 4) npm registry ping ]=="
if command -v npm >/dev/null 2>&1; then
echo "npm proxy: $(npm config get proxy)"
echo "npm https-proxy: $(npm config get https-proxy)"
npm ping --registry=https://registry.npmjs.org || echo "npm ping FAILED"
else
echo "npm not installed"
fi
echo

echo "==[ 5) Proxy env vars ]=="
env | grep -i -E 'http_proxy|https_proxy|no_proxy' || echo "No proxy vars set"
echo

echo "==[ RESULT ]=="
ONLINE=1
curl -sS -I --max-time 5 [https://registry.npmjs.org](https://registry.npmjs.org/) >/dev/null 2>&1 || ONLINE=0
getent hosts [registry.npmjs.org](http://registry.npmjs.org/) >/dev/null 2>&1 || ONLINE=0
if [ "$ONLINE" -eq 1 ]; then
echo "ONLINE: You can use 'npm install'."
else
echo "OFFLINE or BLOCKED: Use the offline method (copy node_modules + Cypress cache)."
fi

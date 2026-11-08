#!/bin/zsh
cd "${0:A:h}/../../.."
if [[ ! -f public/smartglasses/explorer/index.html ]]; then
 print '请先按 books/smartglasses/EXPLORER.md 构建本书。'
 read
 exit 1
fi
if /usr/bin/curl -fsS http://127.0.0.1:3473/smartglasses/explorer/index.html >/dev/null 2>&1; then
 open 'http://127.0.0.1:3473/smartglasses/explorer/index.html?chapter=ch2&section=2.4'
 exit 0
fi
open 'http://127.0.0.1:3473/smartglasses/explorer/index.html?chapter=ch2&section=2.4'
exec python3 -m http.server 3473 --bind 127.0.0.1 --directory public

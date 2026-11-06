#!/bin/sh
# Spanish Learning Lab — double-click to start the local app and open it in the browser.
# Uses only the Node runtime inside this folder. Changes no system settings, installs nothing globally,
# and does not add login items or launch agents. The app keeps running after this window closes;
# stop it with: runtime/node/bin/node app/bin/sll.mjs stop
HERE="$(cd "$(dirname "$0")" && pwd)"
exec "$HERE/runtime/node/bin/node" "$HERE/app/bin/sll.mjs" start --open

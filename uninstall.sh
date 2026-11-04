#!/bin/bash
# Undo install.sh: restore saved settings and remove LoveBites files. Brew packages and fonts stay installed.
set -uo pipefail
BK="$HOME/.lovebites-backup"

rm -rf "$HOME/Library/Application Support/Übersicht/widgets/lovebites.widget"

for d in Desktop Documents Downloads Music Pictures Movies; do fileicon -q rm "$HOME/$d" 2>/dev/null; done

G="$HOME/.config/ghostty/config"
[ -f "$G" ] && sed -i '' '/# >>> lovebites >>>/,/# <<< lovebites <<</d' "$G"
rm -f "$HOME/.config/ghostty/themes/LoveBites" "$HOME/.config/ghostty/themes/LoveBites Dark"
rm -f "$HOME/.config/nvim/colors/lovebites.lua"

[ -f "$BK/restore.sh" ] && bash "$BK/restore.sh"
rm -rf "$BK"
echo "LoveBites removed. Log out and back in to fully reset the accent color."

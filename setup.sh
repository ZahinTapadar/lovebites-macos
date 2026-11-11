#!/bin/bash
# Fresh-Mac setup for both rices, LoveBites and Event Horizon. Re-runnable.
#   ./setup.sh                  install everything, then apply LoveBites
#   ./setup.sh event-horizon    ... then apply Event Horizon
# Afterwards switch any time with `rice toggle`, Switch Rice.app, or the swap button on the desktop widget.
# Configs it changes are copied once to ~/.config/rice/backup first.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
RICE="${1:-lovebites}"
BK="$HOME/.config/rice/backup"; mkdir -p "$BK"
backup() { if [ -e "$1" ] && [ ! -e "$BK/$2" ]; then cp -R "$1" "$BK/$2"; fi; }

command -v brew >/dev/null || { echo "Install Homebrew first: https://brew.sh" >&2; exit 1; }

echo "==> Apps and tools"
brew install macmon fileicon fastfetch neovim
for c in ubersicht ghostty font-maple-mono-nf; do   # an app installed outside Homebrew is fine too
  brew install --cask "$c" || echo "   kept the existing $c"
done

echo "==> Fonts: Iosevka (Event Horizon, widgets)"
unzip -oq "$HERE/assets/fonts/Iosevka-33.3.1.zip" -d "$HOME/Library/Fonts"

echo "==> rice command and Switch Rice.app"
mkdir -p "$HOME/.local/bin" "$HOME/Applications"
ln -sf "$HERE/bin/rice" "$HOME/.local/bin/rice"
osacompile -o "$HOME/Applications/Switch Rice.app" "$HERE/bin/switch-rice.applescript"
fileicon -q set "$HOME/Applications/Switch Rice.app" "$HERE/event-horizon/assets/terminal/fastfetch-logo.png" || true
case ":$PATH:" in *":$HOME/.local/bin:"*) ;; *) echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$HOME/.zshrc" ;; esac

echo "==> Ghostty: theme, font and backdrop come from the active rice"
G="$HOME/.config/ghostty"; mkdir -p "$G"; touch "$G/config"; backup "$G/config" ghostty-config
sed -i '' '/# >>> lovebites >>>/,/# <<< lovebites <<</d' "$G/config"   # older LoveBites install block
grep -q 'config-file = ?rice.conf' "$G/config" ||
  printf '# >>> rice >>>\n# theme, font and backdrop come from the active rice (switch with: rice toggle)\nconfig-file = ?rice.conf\n# <<< rice <<<\n' >> "$G/config"

echo "==> fastfetch: logo follows the rice"
F="$HOME/.config/fastfetch"; mkdir -p "$F"
if [ -f "$F/config.jsonc" ]; then
  backup "$F/config.jsonc" fastfetch-config.jsonc
  sed -i '' 's|~/.config/fastfetch/lovebites-logo.png|~/.config/fastfetch/logo.png|' "$F/config.jsonc"
  grep -q '"logo"' "$F/config.jsonc" || echo "   your fastfetch config has no logo block; add one with source ~/.config/fastfetch/logo.png"
else
  cp "$HERE/fastfetch/config.jsonc" "$F/config.jsonc"
fi

echo "==> Neovim: colorscheme follows the rice"
N="$HOME/.config/nvim"
if [ ! -e "$N" ]; then
  cp -R "$HERE/nvim" "$N"                                  # no config yet: take the whole one from this repo
else
  backup "$N/lua/config/theme.lua" nvim-theme.lua
  mkdir -p "$N/colors" "$N/lua/config"
  cp "$HERE/nvim/colors/"*.lua "$N/colors/"
  if [ -f "$N/lua/config/theme.lua" ]; then cp "$HERE/nvim/lua/config/theme.lua" "$N/lua/config/theme.lua"
  else echo "   add the contents of nvim/lua/config/theme.lua to your init.lua to follow the rice"; fi
fi

echo "==> Applying $RICE"
"$HERE/bin/rice" "$RICE"

cat <<MSG

Done. Two steps macOS and Chrome keep for you:
  • First switch: allow Übersicht and Switch Rice when macOS asks (Accessibility / System Events).
  • Chrome: chrome://extensions → Developer mode → Load unpacked:
      LoveBites:      $HERE/chrome/theme  and  $HERE/chrome/newtab
      Event Horizon:  $HERE/event-horizon/chrome/theme  and  $HERE/event-horizon/chrome/newtab
Obsidian: install LoveBites from Community plugins; with a vault open, \`rice toggle\` adds the
Event Horizon theme and its New Tab plugin to it.
MSG

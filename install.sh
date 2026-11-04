#!/bin/bash
# LoveBites for macOS. Re-runnable. Original settings are saved once to ~/.lovebites-backup; uninstall.sh puts them back.
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
BK="$HOME/.lovebites-backup"
RESTORE="$BK/restore.sh"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
mkdir -p "$BK"; [ -f "$RESTORE" ] || echo '#!/bin/bash' > "$RESTORE"
# each original is recorded once (first run that reaches it), so a re-run never saves LoveBites values as "originals"
saved() { grep -qF -- "$1" "$RESTORE"; }

save_default() { # domain key: record the current value (or its absence) so uninstall can restore it
  saved " $1 $2 " && return 0
  local t v
  if t=$(defaults read-type "$1" "$2" 2>/dev/null); then
    t=${t#Type is }; v=$(defaults read "$1" "$2")
    case $t in boolean) t=bool;; integer) t=int;; esac
    printf 'defaults write %q %q -%s %q\n' "$1" "$2" "$t" "$v" >> "$RESTORE"
  else
    printf 'defaults delete %q %q 2>/dev/null || true\n' "$1" "$2" >> "$RESTORE"
  fi
}
backup() { if [ -e "$1" ] && [ ! -e "$BK/$2" ]; then cp -R "$1" "$BK/$2"; fi; }

echo "==> Homebrew packages"
brew install macmon fileicon
brew install --cask ubersicht

echo "==> Iosevka font"
unzip -oq "$HERE/assets/fonts/Iosevka-33.3.1.zip" -d "$HOME/Library/Fonts"

echo "==> Wallpaper"
if ! saved "set picture"; then
  old=$(osascript -e 'tell application "System Events" to get picture of current desktop' 2>/dev/null || true)
  if [ -n "$old" ]; then
    printf 'osascript -e %q\n' "tell application \"System Events\" to tell every desktop to set picture to \"$old\"" >> "$RESTORE"
  fi
fi
mkdir -p "$HOME/Pictures/LoveBites"
cp "$HERE/assets/wallpaper.png" "$HOME/Pictures/LoveBites/wallpaper.png"
osascript -e "tell application \"System Events\" to tell every desktop to set picture to \"$HOME/Pictures/LoveBites/wallpaper.png\""

echo "==> Light mode, red accent, pink highlight"
save_default -g AppleAccentColor
save_default -g AppleHighlightColor
if ! saved "dark mode" && [ "$(defaults read -g AppleInterfaceStyle 2>/dev/null)" = Dark ]; then
  echo "osascript -e 'tell application \"System Events\" to tell appearance preferences to set dark mode to true'" >> "$RESTORE"
fi
osascript -e 'tell application "System Events" to tell appearance preferences to set dark mode to false'
defaults write -g AppleAccentColor -int 0
defaults write -g AppleHighlightColor -string "1.000000 0.352941 0.435294 Other"

echo "==> Übersicht stats widget"
mkdir -p "$WIDGETS"
cp -R "$HERE/ubersicht/lovebites.widget" "$WIDGETS/"
open -a "Übersicht"

echo "==> Red Papirus folders"
for pair in Desktop:folder-desktop Documents:folder-documents Downloads:folder-download \
            Music:folder-music Pictures:folder-pictures Movies:folder-videos; do
  d="$HOME/${pair%%:*}"
  if [ -d "$d" ]; then fileicon -q set "$d" "$HERE/assets/folders/${pair#*:}.png" || echo "   skipped $d"; fi
done

echo "==> Ghostty theme"
G="$HOME/.config/ghostty"
if [ -d "$G" ]; then
  mkdir -p "$G/themes"; cp "$HERE/ghostty/themes/"* "$G/themes/"
  backup "$G/config" ghostty-config
  sed -i '' '/# >>> lovebites >>>/,/# <<< lovebites <<</d' "$G/config"
  cat >> "$G/config" <<'GH'
# >>> lovebites >>>
theme = light:LoveBites,dark:LoveBites Dark
font-family = "Iosevka"
background-opacity = 1
background-image = ~/Pictures/LoveBites/wallpaper.png
background-image-fit = cover
background-image-opacity = 0.12
# <<< lovebites <<<
GH
fi

echo "==> Neovim colorscheme"
mkdir -p "$HOME/.config/nvim/colors"
cp "$HERE/nvim/colors/lovebites.lua" "$HOME/.config/nvim/colors/"
echo "   use it with :colorscheme lovebites"

echo "==> fastfetch anime logo"
F="$HOME/.config/fastfetch"
mkdir -p "$F"
cp "$HERE/assets/terminal/fastfetch-girl.png" "$F/lovebites-girl.png"
backup "$F/config.jsonc" fastfetch-config.jsonc
if [ -f "$F/config.jsonc" ] && ! grep -q '"logo"' "$F/config.jsonc"; then
  # insert a logo block before "modules" so the rest of the user's config stays as is
  python3 - "$F/config.jsonc" <<'PY'
import sys; p=sys.argv[1]; s=open(p).read()
logo='"logo": {"type": "kitty-direct", "source": "~/.config/fastfetch/lovebites-girl.png", "height": 19, "padding": {"top": 1, "left": 1, "right": 3}},\n    "modules"'
open(p,'w').write(s.replace('"modules"', logo, 1))
PY
elif [ ! -f "$F/config.jsonc" ]; then
  cp "$HERE/fastfetch/config.jsonc" "$F/config.jsonc"
fi

echo
echo "Done. Log out and back in once so every app picks up the red accent."
echo "First run: allow Übersicht if macOS asks."

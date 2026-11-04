# LoveBites for macOS 💋

A macOS port of [flyingcakes85/LoveBites](https://github.com/flyingcakes85/LoveBites), plus my dotfiles.

| LoveBites (Linux) | macOS |
|---|---|
| Wallpaper | Same art, refit to 16:10 |
| conky | Übersicht widget (`ubersicht/lovebites.widget`), live CPU/RAM/temps (macmon)/net/uptime, light + dark |
| PapirusRed icons | Red Papirus icons on home folders (fileicon) |
| Xfwm/GTK theme | Light mode, red accent, pink highlight |
| Iosevka | Installed to `~/Library/Fonts` |
| — | Ghostty themes `LoveBites` / `LoveBites Dark` (auto light/dark) |
| — | fastfetch logo: red manga-eye art (`assets/terminal/fastfetch-logo.png`, kitty graphics in Ghostty) |
| — | Ghostty backdrop: the wallpaper, dimmed into the theme color |
| — | Neovim colorscheme `nvim/colors/lovebites.lua` (light + dark, follows Ghostty) |

## Install

```bash
./install.sh     # saves your current settings to ~/.lovebites-backup first
./uninstall.sh   # puts them back
```

`nvim/`, `ghostty/config` and `fastfetch/config.jsonc` are my full configs; the installer only copies the colorscheme and themes.

## Credits

Original rice, conky art, panel hearts: [flyingcakes85](https://github.com/flyingcakes85/LoveBites) (GPL-3.0-or-later, see `COPYING`).
Wallpaper: [Rikka Takarada Minimalist](https://www.deviantart.com/kiddblaster/art/Rikka-Takarada-Minimalist-785029419) by Kiddblaster. Not covered by the GPL.
Icons: Papirus (GPL-3.0).

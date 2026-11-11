# Event Horizon for macOS

A space rice: ink-black sky, an accretion disk of ice-white light with an ember rim. It is the dark twin of
[LoveBites](https://github.com/ZahinTapadar/lovebites-macos), and one command switches the whole Mac between the two.

| Piece | Event Horizon | Where it lives |
|---|---|---|
| Wallpaper | the ringed black hole (4K original), cropped to the screen | `assets/wallpaper.jpg` |
| macOS | dark mode, blue accent, ice-blue text selection | `rice.sh` |
| Übersicht | CPU as an accretion ring around a black core, memory, heat, network, uptime, swap button | `ubersicht/event-horizon.widget` |
| Ghostty | `Event Horizon` theme, Iosevka, dimmed disk backdrop | `ghostty/themes`, `rice.sh` |
| Neovim | `event-horizon` colorscheme (same highlight map as `lovebites`) | `nvim/colors/event-horizon.lua` |
| fastfetch | a crop of the disk as the logo | `assets/terminal/fastfetch-logo.png` |
| Finder | macOS's own blue folders (LoveBites puts its red ones back) | `rice.sh` |
| Obsidian | `Event Horizon` theme (starfield behind every pane, LoveBites Reading mode re-set as glass and starlit pages) and the `event-horizon-newtab` plugin: empty tabs become the living black hole, with vault search and recent notes | `obsidian/` |
| Chrome | ink-black theme, and a New Tab where the wallpaper comes alive: light streams along the rings, ground lights breathe, your top sites sit under the search | `chrome/theme`, `chrome/newtab` |

## Switching

```bash
rice toggle          # flip to the other rice
rice event-horizon   # or name one: lovebites | event-horizon
rice                 # print the active one
```

Or without a terminal:

- **Switch Rice.app** in `~/Applications`: click it, or press ⌘Space and type "Switch Rice". The first run asks to control System Events: allow it.
- the **swap** button on either desktop widget.

A switch changes dark mode, accent, wallpaper, the desktop widget, Finder folder icons, Ghostty (open windows reload),
the Neovim colorscheme (open editors switch when they regain focus) and the fastfetch logo.

Each rice folder has a `rice.sh` profile with its settings; `bin/rice` (at the repo root) reads it. LoveBites lives at
the repo root and Event Horizon in `event-horizon/`, so the repo can be cloned anywhere.

### Chrome

Chrome won't let a script change its theme, so this one step is manual. In `chrome://extensions` turn on Developer mode,
then **Load unpacked** both `chrome/theme` and `chrome/newtab` from the rice you want (loading a theme replaces the current
one). To go back, load the other rice's folders, or switch the New Tab extensions on and off.

## Setup

Run `./setup.sh event-horizon` from the repo root on a fresh Mac. It installs what both rices need, makes Ghostty,
fastfetch and Neovim follow the active rice, adds `rice` and Switch Rice.app, and applies Event Horizon.
Your previous configs are copied to `~/.config/rice/backup/` first.

### Obsidian

- **Theme** `obsidian/Event Horizon`: starfield behind the panes, faint motes rising, headings that widen and catch the
  disk's light on hover, a sliding lit underline on links, LoveBites Reading mode re-set as a glass (Night) or starlit
  (Paper) page.
- **Plugin** `obsidian/event-horizon-newtab`: empty tabs become the living black hole (as in Chrome), with vault search
  and recent notes. It only draws while the Event Horizon theme is on.

`rice toggle` copies both into every open vault and switches the theme; LoveBites' own look comes back when you switch back.

## Credits

The wallpaper and backdrop are cropped from two ringed black hole images supplied by the user.

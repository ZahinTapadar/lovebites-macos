-- ============================================================================
-- Active colorscheme follows the desktop rice (`rice toggle` in a shell).
-- ~/.config/rice/nvim names it: lovebites or event-horizon. Open editors pick
-- up a switch when they regain focus. Fallback when the file is missing:
-- lovebites. Other configured themes: nord, rose-pine, gruvbox, kanagawa,
-- solarized-osaka, tokyonight, catppuccin.
-- ============================================================================

local function rice_scheme()
  local f = io.open(vim.fn.expand("~/.config/rice/nvim"))
  local name = f and vim.trim(f:read("*a")) or ""
  if f then f:close() end
  return name ~= "" and name or "lovebites"
end

local function apply()
  local name = rice_scheme()
  if vim.g.colors_name ~= name then pcall(vim.cmd.colorscheme, name) end
end

apply()
vim.api.nvim_create_autocmd("FocusGained", { callback = apply })

-- ============================================================================
-- Neovim configuration
-- Ghostty-transparent • Helix-flavoured • VS Code-inspired
-- Requires Neovim >= 0.11, git, ripgrep, fd, a C compiler, and node
--
-- Layout:
--   lua/config/       core editor settings (options, keymaps, autocmds, ...)
--   lua/plugins/<x>/  one file per plugin, grouped by category
--                     (themes/ holds every colorscheme; pick one in config/theme.lua)
--   after/lsp/        per-server LSP settings (merged over nvim-lspconfig)
-- ============================================================================

-- Leader keys must be set before lazy.nvim loads any plugin.
vim.g.mapleader = " "
vim.g.maplocalleader = " "

require("config.options")
require("config.lazy")
require("config.theme")
require("config.highlights")
require("config.keymaps")
require("config.autocmds")

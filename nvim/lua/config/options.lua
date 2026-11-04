-- Turn off built-in features we don't use (silences :checkhealth warnings,
-- and netrw must be off so `nvim .` can open the Telescope picker instead)
vim.g.loaded_netrw = 1
vim.g.loaded_netrwPlugin = 1
vim.g.loaded_node_provider = 0
vim.g.loaded_perl_provider = 0
vim.g.loaded_python3_provider = 0
vim.g.loaded_ruby_provider = 0

local o = vim.opt

-- ============================================================================
-- Editor
-- ============================================================================

o.termguicolors = true
o.number = true
o.relativenumber = true
o.cursorline = true
o.scrolloff = 8
o.colorcolumn = { "80", "100" }
o.signcolumn = "yes"
o.mouse = "a"
o.clipboard = "unnamedplus"

o.splitbelow = true
o.splitright = true

o.undofile = true
o.ignorecase = true
o.smartcase = true

o.updatetime = 2000
o.timeoutlen = 400

o.completeopt = { "menuone", "noselect", "popup" }

o.confirm = true
o.title = true
o.showmode = false
o.laststatus = 3

-- ============================================================================
-- Folding
-- VS Code-style code collapsing (click the arrows in the gutter)
-- ============================================================================

o.foldmethod = "expr"
o.foldexpr = "v:lua.vim.treesitter.foldexpr()"
o.foldlevel = 99
o.foldenable = true
o.foldtext = ""
o.foldcolumn = "1"
o.fillchars = {
    foldopen = "▾",
    foldclose = "▸",
    fold = " ",
    foldsep = " ",
    eob = " ", -- hides the ~ on empty lines
}

-- ============================================================================
-- Wrapping
-- ============================================================================

o.wrap = true
o.linebreak = true
o.breakindent = true

-- ============================================================================
-- Indentation
-- ============================================================================

o.expandtab = true
o.shiftwidth = 4
o.tabstop = 4
o.smartindent = true

-- ============================================================================
-- Whitespace
-- ============================================================================

o.list = true
o.listchars = {
    space = "·",
    tab = "→ ",
    eol = "⏎",
    trail = "·",
    nbsp = "␣",
}

-- ============================================================================
-- Cursor
-- ============================================================================

o.guicursor = "n-c:block,i-ci-ve:ver25,v:hor20,r-cr-o:hor20"

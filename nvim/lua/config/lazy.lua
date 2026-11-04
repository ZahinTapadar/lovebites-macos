-- ============================================================================
-- lazy.nvim
-- Every file under lua/plugins/<category>/ returns one plugin spec.
-- Add a new category by creating the folder and listing it below.
-- ============================================================================

local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"

if not vim.uv.fs_stat(lazypath) then
    vim.fn.system({
        "git",
        "clone",
        "--filter=blob:none",
        "--branch=stable",
        "https://github.com/folke/lazy.nvim.git",
        lazypath,
    })
end

vim.opt.rtp:prepend(lazypath)

require("lazy").setup({
    spec = {
        { import = "plugins.themes" },
        { import = "plugins.ui" },
        { import = "plugins.editor" },
        { import = "plugins.treesitter" },
        { import = "plugins.lsp" },
        { import = "plugins.extras" },
    },

    -- None of these plugins need luarocks; disabling it removes the
    -- :checkhealth lazy error.
    rocks = {
        enabled = false,
    },

    ui = {
        border = "rounded",
    },

    change_detection = {
        notify = false,
    },
})

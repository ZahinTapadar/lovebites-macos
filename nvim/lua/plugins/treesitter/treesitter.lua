-- Tree-sitter
-- New main-branch API for Neovim 0.11+

return {
    "nvim-treesitter/nvim-treesitter",
    branch = "main",
    lazy = false,
    build = ":TSUpdate",

    config = function()
        local ts = require("nvim-treesitter")

        ts.setup({})

        ts.install({
            "lua",
            "vim",
            "vimdoc",
            "c",
            "cpp",
            "python",
            "bash",
            "json",
            "yaml",
            "toml",
            "markdown",
            "markdown_inline",
        })

        vim.api.nvim_create_autocmd("FileType", {
            callback = function(ev)
                if pcall(vim.treesitter.start, ev.buf) then
                    vim.bo[ev.buf].indentexpr =
                        "v:lua.require'nvim-treesitter'.indentexpr()"
                end
            end,
        })
    end,
}

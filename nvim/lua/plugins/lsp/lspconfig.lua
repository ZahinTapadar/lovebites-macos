-- LSP
-- Python = Pyright (types, navigation) + Ruff (lint + format)
-- C/C++  = clangd
-- Lua    = lua_ls
--
-- Per-server settings: after/lsp/<server>.lua
-- Keymaps / diagnostics: lua/config/lsp.lua

return {
    "neovim/nvim-lspconfig",

    dependencies = {
        {
            "mason-org/mason.nvim",
            opts = {},
        },

        {
            "mason-org/mason-lspconfig.nvim",

            opts = {
                ensure_installed = {
                    "lua_ls",
                    "clangd",
                    "pyright",
                    "ruff",
                },

                automatic_enable = true,
            },
        },
    },

    config = function()
        vim.lsp.enable({
            "pyright",
            "ruff",
            "clangd",
            "lua_ls",
        })

        require("config.lsp")
    end,
}

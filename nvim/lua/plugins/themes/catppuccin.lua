-- NOTE: Catppuccin

return {
    "catppuccin/nvim",
    name = "catppuccin",
    lazy = true,
    priority = 1000,

    opts = {
        flavour = "mocha",
        background = {
            light = "latte",
            dark = "mocha",
        },
        transparent_background = true,
        dim_inactive = {
            enabled = false,
            shade = "dark",
            percentage = 0.15,
        },

        styles = {
            comments = { "italic" },
            conditionals = { "italic" },
            loops = {},
            functions = {},
            keywords = { "bold" },
            strings = {},
            variables = {},
            numbers = {},
            booleans = {},
            properties = {},
            types = {},
            operators = {},
        },

        custom_highlights = function(colors)
            return {
                ColorColumn = { bg = "#1C1C21" },

                Pmenu = { bg = colors.transparent_background, fg = colors.text },
                PmenuSel = { bg = colors.surface2, fg = "NONE" },
                PmenuSbar = { bg = colors.surface0 },
                PmenuThumb = { bg = colors.overlay2 },

                NormalFloat = { bg = "none" },
            }
        end,

        -- Only plugins this config actually installs
        integrations = {
            treesitter = true,
            native_lsp = {
                enabled = true,
                virtual_text = { errors = { "italic" }, hints = { "italic" } },
            },
            blink_cmp = true,
            telescope = true,
            which_key = true,
            gitsigns = true,
            nvimtree = true,
            indent_blankline = { enabled = true },
            mason = true,
            markdown = true,
        },
    },
}

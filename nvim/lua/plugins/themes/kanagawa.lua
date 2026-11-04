-- NOTE: Kanagawa

return {
    "rebelot/kanagawa.nvim",
    lazy = true,
    priority = 1000,

    opts = {
        compile = false,
        undercurl = true,
        commentStyle = { italic = true },
        functionStyle = {},
        keywordStyle = { italic = false },
        statementStyle = { bold = true },
        typeStyle = {},
        transparent = true,
        dimInactive = false,
        terminalColors = true,

        colors = {
            palette = {},
            theme = {
                wave = {},
                dragon = {},
                all = {
                    ui = {
                        bg_gutter = "none",
                        border = "rounded",
                    },
                },
            },
        },

        overrides = function(colors) -- modify highlights
            local theme = colors.theme
            return {
                FloatTitle = { bg = "none" },
                Pmenu = { fg = theme.ui.shade0, bg = "NONE", blend = vim.o.pumblend },
                PmenuSel = { fg = "NONE", bg = theme.ui.bg_p2 },
                PmenuSbar = { bg = theme.ui.bg_m1 },
                PmenuThumb = { bg = theme.ui.bg_p2 },

                NormalDark = { fg = theme.ui.fg_dim, bg = theme.ui.bg_m3 },

                LazyNormal = { bg = theme.ui.bg_m3, fg = theme.ui.fg_dim },
                MasonNormal = { bg = theme.ui.bg_m3, fg = theme.ui.fg_dim },
                TelescopeTitle = { fg = theme.ui.special, bold = true },
                TelescopePromptBorder = { fg = theme.ui.special },
                TelescopeResultsNormal = { fg = theme.ui.fg_dim },
                TelescopeResultsBorder = { fg = theme.ui.special },
                TelescopePreviewBorder = { fg = theme.ui.special },
            }
        end,

        theme = "wave", -- load "wave" theme when 'background' option is not set
        background = { -- map the value of background option to a theme
            dark = "wave",
        },
    },
}

-- NOTE: Solarized Osaka

return {
    "craftzdog/solarized-osaka.nvim",
    lazy = true,
    priority = 1000,

    opts = {
        transparent = true,
        terminal_colors = true,
        styles = {
            comments = { italic = true },
            keywords = { italic = false },
            functions = {},
            variables = {},
            -- Can be "dark", "transparent" or "normal"
            sidebars = "dark", -- style for sidebars
            floats = "dark", -- style for floating windows
        },
        sidebars = { "qf", "help" }, -- Set a darker background on sidebar-like windows
        day_brightness = 0.3,
        hide_inactive_statusline = false,
        dim_inactive = false, -- dims inactive windows
        lualine_bold = false, -- When `true`, section headers in the lualine theme will be bold

        on_highlights = function(hl, c)
            local prompt = "#2d3149"
            hl.TelescopeNormal = { bg = c.bg_dark, fg = c.fg_dark }
            hl.TelescopeBorder = { bg = c.bg_dark, fg = c.bg_dark }
            hl.TelescopePromptNormal = { bg = c.bg_dark }
            hl.TelescopePromptBorder = { bg = c.bg_dark, fg = c.bg_dark }
            hl.TelescopePromptTitle = { bg = prompt, fg = "#2C94DD" }
            hl.TelescopePreviewTitle = { bg = c.bg_dark, fg = c.bg_dark }
            hl.TelescopeResultsTitle = { bg = c.bg_dark, fg = c.bg_dark }
        end,
    },
}

-- NOTE: Rose pine

return {
    "rose-pine/neovim",
    name = "rose-pine",
    lazy = true,
    priority = 1000,

    opts = {
        variant = "main", -- auto, main, moon, or dawn
        dark_variant = "main", -- main, moon, or dawn
        dim_inactive_windows = false,
        disable_float_background = false,
        extend_background_behind_borders = true,

        styles = {
            bold = true,
            italic = false,
            transparency = false,
        },

        enable = {
            terminal = true,
            legacy_highlights = true,
            migrations = true,
        },

        highlight_groups = {
            ColorColumn = { bg = "#1C1C21" },
            PmenuSel = { bg = "#4a465d", fg = "NONE" }, -- Highlighted completion item
        },

        groups = {
            border = "muted",
            link = "iris",
            panel = "surface",
            error = "love",
            hint = "iris",
            info = "foam",
            note = "pine",
            todo = "rose",
            warn = "gold",
            git_add = "foam",
            git_change = "rose",
            git_delete = "love",
            git_dirty = "rose",
            git_ignore = "muted",
            git_merge = "iris",
            git_rename = "pine",
            git_stage = "iris",
            git_text = "rose",
            git_untracked = "subtle",
            h1 = "iris",
            h2 = "foam",
            h3 = "rose",
            h4 = "gold",
            h5 = "pine",
            h6 = "foam",
        },
    },
}

-- NOTE: Gruvbox

return {
    "ellisonleao/gruvbox.nvim",
    lazy = true,
    priority = 1000,

    opts = {
        terminal_colors = true,
        undercurl = true,
        underline = true,
        bold = true,
        italic = {
            strings = false,
            emphasis = false,
            comments = false,
            folds = false,
            operators = false,
        },
        strikethrough = true,
        invert_selection = false,
        invert_signs = false,
        invert_tabline = false,
        invert_intend_guides = false,
        inverse = true, -- invert background for search, diffs, statuslines and errors
        contrast = "", -- can be "hard", "soft" or empty string
        palette_overrides = {},
        overrides = {
            NormalFloat = { bg = "#282828" },
            PmenuSel = { bg = "#504945", fg = "NONE" }, -- highlighted completion item
            Pmenu = { bg = "#1d2021" }, -- completion menu background
        },
        dim_inactive = false,
        transparent_mode = true,
    },
}

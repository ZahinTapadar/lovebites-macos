-- ============================================================================
-- Transparent appearance
-- Strips backgrounds so the Ghostty background shows through. Re-applied
-- whenever the colorscheme changes.
-- ============================================================================

local function transparent()
    local groups = {
        "Normal",
        "NormalNC",
        "NormalFloat",
        "FloatBorder",
        "FloatTitle",
        "SignColumn",
        "EndOfBuffer",
        "LineNr",
        "CursorLineNr",
        "FoldColumn",
        "StatusLine",
        "StatusLineNC",
        "WinSeparator",
        "TabLine",
        "TabLineFill",
        "TabLineSel",
        "Pmenu",
        "MsgArea",
        "ColorColumn",
        "TelescopeNormal",
        "TelescopeBorder",
        "TelescopePromptNormal",
        "TelescopePromptBorder",
        "TelescopeResultsNormal",
        "TelescopePreviewNormal",
        "WhichKeyNormal",
        "BlinkCmpMenu",
        "BlinkCmpDoc",
        "NvimTreeNormal",
        "NvimTreeNormalNC",
        "NvimTreeEndOfBuffer",
        "NvimTreeWinSeparator",
        "OutlineNormal",
        "BufferLineFill",
        "BufferLineBackground",
        "BufferLineBufferVisible",
        "BufferLineSeparator",
        "BufferLineSeparatorVisible",
        "BufferLineCloseButton",
        "BufferLineCloseButtonVisible",
        "LazyNormal",
        "MasonNormal",
    }

    for _, group in ipairs(groups) do
        local hl = vim.api.nvim_get_hl(0, {
            name = group,
            link = false,
        })

        hl.bg = nil
        hl.ctermbg = nil

        vim.api.nvim_set_hl(0, group, hl)
    end

    -- lovebites has light and dark variants of these; the fixed dark greys below would break light mode
    if vim.g.colors_name == "lovebites" then
        return
    end

    vim.api.nvim_set_hl(0, "ColorColumn", {
        bg = "#1a1a1a",
    })

    vim.api.nvim_set_hl(0, "CursorLine", {
        bg = "#1f1f1f",
    })

    vim.api.nvim_set_hl(0, "Whitespace", {
        fg = "#333333",
    })

    vim.api.nvim_set_hl(0, "NonText", {
        fg = "#333333",
    })

    vim.api.nvim_set_hl(0, "SpecialKey", {
        fg = "#333333",
    })
end

vim.api.nvim_create_autocmd("ColorScheme", {
    callback = transparent,
})

transparent()

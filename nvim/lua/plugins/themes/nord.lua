-- NOTE: Nord

return {
    "shaunsingh/nord.nvim",
    lazy = true,
    priority = 1000,

    -- nord reads these globals when the colorscheme loads
    init = function()
        vim.g.nord_contrast = true
        vim.g.nord_borders = true
        vim.g.nord_disable_background = true
        vim.g.nord_cursorline_transparent = true
        vim.g.nord_enable_sidebar_background = false
    end,
}

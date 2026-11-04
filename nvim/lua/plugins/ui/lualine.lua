-- Statusline (transparent). Shows NORMAL / INSERT / VISUAL.

return {
    "nvim-lualine/lualine.nvim",
    dependencies = { "nvim-tree/nvim-web-devicons" },

    opts = function()
        local theme = {}

        -- take colours from the active colorscheme so light themes stay readable
        local function fg(name, fallback)
            local c = vim.api.nvim_get_hl(0, { name = name, link = false }).fg
            return c and string.format("#%06x", c) or fallback
        end

        for _, mode in ipairs({
            "normal",
            "insert",
            "visual",
            "replace",
            "command",
            "inactive",
        }) do
            theme[mode] = {
                a = { fg = fg("Function", "#88c0d0"), bg = "NONE", gui = "bold" },
                b = { fg = fg("Normal", "#d8dee9"), bg = "NONE" },
                c = { fg = fg("Normal", "#d8dee9"), bg = "NONE" },
            }
        end

        return {
            options = {
                theme = theme,
                section_separators = "",
                component_separators = "│",
                globalstatus = true,
            },

            sections = {
                lualine_a = { "mode" },
                lualine_b = { { "filename", path = 1 } },
                lualine_c = {},
                lualine_x = { "diagnostics", "branch", "diff" },
                lualine_y = { "location", "filetype" },
                lualine_z = {},
            },
        }
    end,

    config = function(plugin, opts)
        require("lualine").setup(opts)
        -- recolour when the colorscheme (or light/dark) changes
        vim.api.nvim_create_autocmd("ColorScheme", {
            callback = function()
                require("lualine").setup(plugin.opts())
            end,
        })
    end,
}

-- Minimap
-- VS Code-style code overview on the right, with search, diagnostic and
-- git change marks. Opens with the first file; click or scroll it to jump.
-- Space + M toggle · Space + Shift+M focus it (Esc / Space + Shift+M back)

return {
    "nvim-mini/mini.map",
    event = "BufReadPost",

    config = function()
        local minimap = require("mini.map")

        minimap.setup({
            integrations = {
                minimap.gen_integration.builtin_search(),
                minimap.gen_integration.diagnostic(),
                minimap.gen_integration.gitsigns(),
            },

            symbols = {
                encode = minimap.gen_encode_symbols.dot("4x2"),
                scroll_line = "▶",
                scroll_view = "┃",
            },

            window = {
                side = "right",
                width = 14,
                winblend = 0,
                show_integration_count = false,
            },
        })

        minimap.open()

        vim.keymap.set("n", "<leader>m", minimap.toggle, {
            desc = "Toggle minimap",
        })

        vim.keymap.set("n", "<leader>M", minimap.toggle_focus, {
            desc = "Focus minimap",
        })
    end,
}

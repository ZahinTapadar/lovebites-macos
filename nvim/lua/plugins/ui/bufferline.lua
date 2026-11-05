-- Bufferline
-- VS Code-style tabs for buffers

return {
    "akinsho/bufferline.nvim",
    version = "*",
    dependencies = {
        "nvim-tree/nvim-web-devicons",
    },

    config = function()
        require("bufferline").setup({
            options = {
                mode = "buffers",
                diagnostics = "nvim_lsp",
                always_show_bufferline = true,
                show_buffer_close_icons = true,
                show_close_icon = true,
                separator_style = "thin",

                offsets = {
                    {
                        filetype = "NvimTree",
                        text = "File Explorer",
                        text_align = "center",
                        separator = true,
                    },
                },
            },

            -- No fills anywhere: on the translucent window they show up as white boxes
            highlights = function(defaults)
                for _, group in pairs(defaults.highlights) do
                    group.bg = "NONE"
                end
                return defaults.highlights
            end,
        })
    end,
}

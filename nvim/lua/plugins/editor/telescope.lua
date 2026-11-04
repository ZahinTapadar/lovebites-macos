-- Telescope
-- Space + F = files (with preview)
-- Space + B = buffers
-- Space + / = grep
-- Space + S = symbols

return {
    "nvim-telescope/telescope.nvim",
    branch = "master",

    dependencies = {
        "nvim-lua/plenary.nvim",
    },

    cmd = "Telescope",

    keys = {
        {
            "<leader>f",
            function()
                require("telescope.builtin").find_files({
                    hidden = true,
                    previewer = true,
                })
            end,
            desc = "File picker",
        },

        {
            "<leader>b",
            "<cmd>Telescope buffers<CR>",
            desc = "Buffers",
        },

        {
            "<leader>/",
            "<cmd>Telescope live_grep<CR>",
            desc = "Global search",
        },

        {
            "<leader>s",
            "<cmd>Telescope lsp_document_symbols<CR>",
            desc = "Symbols",
        },

        {
            "<leader>d",
            "<cmd>Telescope diagnostics bufnr=0<CR>",
            desc = "Diagnostics",
        },

        {
            "<leader>'",
            "<cmd>Telescope resume<CR>",
            desc = "Last picker",
        },
    },

    opts = {
        defaults = {
            winblend = 0,

            file_ignore_patterns = {
                "^.git/",
                "node_modules/",
            },

            layout_strategy = "horizontal",

            -- preview_cutoff = 1 keeps the preview visible even in a
            -- narrow terminal (Telescope hides it below 120 columns).
            layout_config = {
                width = 0.9,
                height = 0.85,

                horizontal = {
                    preview_width = 0.55,
                    preview_cutoff = 1,
                },
            },
        },

        pickers = {
            find_files = {
                hidden = true,
                previewer = true,
            },

            buffers = {
                previewer = true,
            },
        },
    },
}

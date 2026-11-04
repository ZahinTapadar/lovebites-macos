-- File tree
-- Space + E

return {
    "nvim-tree/nvim-tree.lua",
    dependencies = {
        "nvim-tree/nvim-web-devicons",
    },

    config = function()
        require("nvim-tree").setup({
            -- Do not let NvimTree take over `nvim .`.
            -- Space + E still opens it normally.
            hijack_directories = {
                enable = false,
                auto_open = false,
            },

            view = {
                width = 32,
                side = "left",
            },

            renderer = {
                group_empty = true,
            },

            filters = {
                dotfiles = false,
            },

            actions = {
                open_file = {
                    quit_on_open = false,
                },
            },
        })

        vim.keymap.set("n", "<leader>e", "<cmd>NvimTreeToggle<CR>", {
            desc = "Toggle file tree",
        })
    end,
}

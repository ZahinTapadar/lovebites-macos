-- Code outline
-- Space + O

return {
    "hedyhli/outline.nvim",

    config = function()
        require("outline").setup({
            outline_window = {
                position = "right",
                width = 30,
                relative_width = false,
            },

            symbols = {
                icons = {
                    File = { icon = "󰈙", hl = "Identifier" },
                    Module = { icon = "󰏗", hl = "Include" },
                    Namespace = { icon = "󰅪", hl = "Include" },
                    Package = { icon = "󰏖", hl = "Include" },
                    Class = { icon = "󰠱", hl = "Type" },
                    Method = { icon = "󰆧", hl = "Function" },
                    Property = { icon = "󰜢", hl = "Identifier" },
                    Field = { icon = "󰜢", hl = "Identifier" },
                    Constructor = { icon = "", hl = "Special" },
                    Enum = { icon = "", hl = "Type" },
                    Interface = { icon = "", hl = "Type" },
                    Function = { icon = "󰊕", hl = "Function" },
                    Variable = { icon = "󰀫", hl = "Constant" },
                    Constant = { icon = "󰏿", hl = "Constant" },
                    String = { icon = "󰀬", hl = "String" },
                    Number = { icon = "󰎠", hl = "Number" },
                    Boolean = { icon = "󰨙", hl = "Boolean" },
                    Array = { icon = "󰅪", hl = "Constant" },
                    Object = { icon = "󰅩", hl = "Type" },
                    Key = { icon = "󰌋", hl = "Constant" },
                    Null = { icon = "󰟢", hl = "Constant" },
                    EnumMember = { icon = "", hl = "Constant" },
                    Struct = { icon = "󰙅", hl = "Type" },
                    Event = { icon = "", hl = "Type" },
                    Operator = { icon = "󰆕", hl = "Operator" },
                    TypeParameter = { icon = "󰊄", hl = "Type" },
                },
            },
        })

        vim.keymap.set("n", "<leader>o", "<cmd>Outline<CR>", {
            desc = "Toggle code outline",
        })
    end,
}

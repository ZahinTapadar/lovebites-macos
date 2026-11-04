-- Tree-sitter text objects
-- vif / vaf = select function body / whole function
-- vic / vac = select class body / whole class
-- Wrapped in pcall so a plugin API change can never break startup.

return {
    "nvim-treesitter/nvim-treesitter-textobjects",
    branch = "main",
    dependencies = { "nvim-treesitter/nvim-treesitter" },

    config = function()
        local ok, textobjects = pcall(require, "nvim-treesitter-textobjects")
        if not ok then
            return
        end

        textobjects.setup({
            select = { lookahead = true },
        })

        local select = require("nvim-treesitter-textobjects.select")

        local objects = {
            af = "@function.outer",
            ["if"] = "@function.inner",
            ac = "@class.outer",
            ic = "@class.inner",
        }

        for lhs, query in pairs(objects) do
            vim.keymap.set({ "x", "o" }, lhs, function()
                select.select_textobject(query, "textobjects")
            end, { desc = "Select " .. query })
        end
    end,
}

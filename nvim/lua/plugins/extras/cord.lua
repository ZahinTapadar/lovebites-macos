-- Discord Rich Presence

local languages = {
    lua = "Lua",
    python = "Python",
    cpp = "C++",
    c = "C",
    javascript = "JavaScript",
    typescript = "TypeScript",
    html = "HTML",
    css = "CSS",
    json = "JSON",
    markdown = "Markdown",
    bash = "Bash",
    rust = "Rust",
    java = "Java",
}

return {
    "vyfor/cord.nvim",
    opts = {
        display = {
            theme = "catppuccin",
            flavor = "accent",
            view = "full",
        },

        text = {
            editing = function(opts)
                return "Writing " .. (languages[opts.filetype] or opts.filetype)
            end,

            viewing = function(opts)
                return "Reading " .. (languages[opts.filetype] or opts.filetype)
            end,

            workspace = "",
        },
    },
}

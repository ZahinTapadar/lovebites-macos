-- ============================================================================
-- Global keymaps
-- Plugin-specific keys live with their plugin in lua/plugins/;
-- LSP keys live in lua/config/lsp.lua.
-- ============================================================================

local map = vim.keymap.set

-- ---------------------------------------------------------------------------
-- Buffer switching
-- (Ctrl-Tab needs `keybind = ctrl+tab=unbind` in Ghostty; gn / gp always work)
-- ---------------------------------------------------------------------------

map("n", "<C-Tab>", "<cmd>bnext<CR>", {
    desc = "Next buffer",
})

map("n", "<C-S-Tab>", "<cmd>bprevious<CR>", {
    desc = "Previous buffer",
})

map("n", "gn", "<cmd>bnext<CR>", {
    desc = "Next buffer",
})

map("n", "gp", "<cmd>bprevious<CR>", {
    desc = "Previous buffer",
})

map("n", "<leader>x", "<cmd>bdelete<CR>", {
    desc = "Close buffer",
})

-- ---------------------------------------------------------------------------
-- Save / quit
-- ---------------------------------------------------------------------------

map("n", "<C-s>", "<cmd>w<CR>", {
    desc = "Save",
})

map("i", "<C-s>", "<Esc><cmd>w<CR>a", {
    desc = "Save",
})

map("n", "<leader>w", "<cmd>w<CR>", {
    desc = "Save",
})

map("n", "<leader>q", "<cmd>q<CR>", {
    desc = "Quit",
})

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

map({ "n", "v" }, "<C-_>", "gc", {
    remap = true,
    desc = "Toggle comment",
})

map({ "n", "v" }, "<C-/>", "gc", {
    remap = true,
    desc = "Toggle comment",
})

map("n", "<C-_>", "gcc", {
    remap = true,
    desc = "Toggle comment",
})

map("n", "<C-/>", "gcc", {
    remap = true,
    desc = "Toggle comment",
})

-- ---------------------------------------------------------------------------
-- Helix-style movement
-- ---------------------------------------------------------------------------

map({ "n", "v", "o" }, "gh", "0", {
    desc = "Line start",
})

map({ "n", "v", "o" }, "gl", "$", {
    desc = "Line end",
})

map({ "n", "v", "o" }, "gs", "^", {
    desc = "First non-blank",
})

map({ "n", "v", "o" }, "ge", "G", {
    desc = "End of file",
})

map("n", "U", "<C-r>", {
    desc = "Redo",
})

-- Space + % = select entire file.
-- % itself remains Vim's matching-bracket command.
map("n", "<leader>%", "ggVG", {
    desc = "Select whole file",
})

map("n", "<leader>y", '"+y', {
    desc = "Yank to system clipboard",
})

-- ---------------------------------------------------------------------------
-- Windows / splits
-- ---------------------------------------------------------------------------

map("n", "<C-h>", "<C-w>h", {
    desc = "Move left",
})

map("n", "<C-j>", "<C-w>j", {
    desc = "Move down",
})

map("n", "<C-k>", "<C-w>k", {
    desc = "Move up",
})

map("n", "<C-l>", "<C-w>l", {
    desc = "Move right",
})

-- These avoid the <leader>s prefix, which Space + S (symbols) already uses.
map("n", "<leader>\\", "<cmd>vsplit<CR>", {
    desc = "Split right",
})

map("n", "<leader>-", "<cmd>split<CR>", {
    desc = "Split below",
})

map("n", "<leader>c", "<cmd>close<CR>", {
    desc = "Close split",
})

map("n", "<leader>=", "<C-w>=", {
    desc = "Equalize splits",
})

-- ---------------------------------------------------------------------------
-- Search / diagnostics
-- ---------------------------------------------------------------------------

map("n", "<Esc>", "<cmd>nohlsearch<CR>")
map("n", "j", "gj")
map("n", "k", "gk")

map("n", "]d", function()
    vim.diagnostic.jump({
        count = 1,
    })
end, {
    desc = "Next diagnostic",
})

map("n", "[d", function()
    vim.diagnostic.jump({
        count = -1,
    })
end, {
    desc = "Previous diagnostic",
})

-- ---------------------------------------------------------------------------
-- Compile & run (C / C++)
-- F5 saves, compiles with g++/gcc and runs the program in a terminal split on
-- the right, in Insert mode so you can type input straight away. Pressing F5
-- again replaces the old run instead of stacking splits. The binary goes to
-- a temp dir, so the project folder stays clean.
-- In the run split: any key after the program exits closes it, or q in Normal.
-- ---------------------------------------------------------------------------

local run_buf

local compilers = {
    cpp = { "g++", "-std=c++20" },
    c = { "gcc", "-std=c17" },
}

local function compile_and_run()
    local compiler = compilers[vim.bo.filetype]
    if not compiler then
        vim.notify("F5: no compile-and-run for filetype '" .. vim.bo.filetype .. "'", vim.log.levels.WARN)
        return
    end

    vim.cmd("silent update")

    local src = vim.fn.expand("%:p")
    local dir = vim.fn.stdpath("cache") .. "/run"
    vim.fn.mkdir(dir, "p")
    local exe = dir .. "/" .. vim.fn.expand("%:t:r")

    local cmd = table.concat({
        compiler[1],
        compiler[2],
        "-Wall -Wextra -g",
        vim.fn.shellescape(src),
        "-o",
        vim.fn.shellescape(exe),
        "&& clear && cd " .. vim.fn.shellescape(vim.fn.expand("%:p:h")),
        "&& " .. vim.fn.shellescape(exe),
    }, " ")

    -- Close the previous run, if it is still open.
    if run_buf and vim.api.nvim_buf_is_valid(run_buf) then
        vim.api.nvim_buf_delete(run_buf, { force = true })
    end

    vim.cmd("botright vnew")
    run_buf = vim.api.nvim_get_current_buf()
    vim.fn.jobstart(cmd, { term = true })
    vim.bo[run_buf].bufhidden = "wipe"
    map("n", "q", "<cmd>close<CR>", { buffer = run_buf, desc = "Close run" })
    vim.cmd("startinsert")
end

map("n", "<F5>", compile_and_run, {
    desc = "Compile & run (C/C++)",
})

map("i", "<F5>", function()
    vim.cmd("stopinsert")
    compile_and_run()
end, {
    desc = "Compile & run (C/C++)",
})

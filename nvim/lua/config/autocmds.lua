-- ============================================================================
-- Auto-save
-- On focus loss and after 2 seconds idle in Normal mode (not on every Esc,
-- so half-typed code isn't saved and formatted mid-thought).
-- ============================================================================

vim.api.nvim_create_autocmd({ "FocusLost", "CursorHold" }, {
    callback = function(ev)
        local buf = ev.buf

        if
            vim.bo[buf].modified
            and vim.bo[buf].modifiable
            and vim.bo[buf].buftype == ""
            and vim.api.nvim_buf_get_name(buf) ~= ""
        then
            vim.api.nvim_buf_call(buf, function()
                vim.cmd("silent! update")
            end)
        end
    end,
})

-- ============================================================================
-- Highlight yanked text
-- ============================================================================

vim.api.nvim_create_autocmd("TextYankPost", {
    callback = function()
        vim.hl.on_yank()
    end,
})

-- ============================================================================
-- Reopen files at last cursor position
-- ============================================================================

vim.api.nvim_create_autocmd("BufReadPost", {
    callback = function(ev)
        local mark = vim.api.nvim_buf_get_mark(ev.buf, '"')

        if mark[1] > 0 and mark[1] <= vim.api.nvim_buf_line_count(ev.buf) then
            pcall(vim.api.nvim_win_set_cursor, 0, mark)
        end
    end,
})

-- ============================================================================
-- `nvim .` = Telescope file picker
-- Helix-style project opening
-- ============================================================================

vim.api.nvim_create_autocmd("VimEnter", {
    callback = function()
        local arg = vim.fn.argv(0)

        if arg == "" or vim.fn.isdirectory(arg) ~= 1 then
            return
        end

        vim.cmd.cd(arg)

        local dirbuf = vim.api.nvim_get_current_buf()
        vim.cmd("enew")
        pcall(vim.api.nvim_buf_delete, dirbuf, {
            force = true,
        })

        -- Telescope is lazy-loaded, so explicitly load it before opening
        -- the picker. Scheduling also prevents startup plugins from racing
        -- with this directory handler.
        vim.schedule(function()
            require("lazy").load({
                plugins = { "telescope.nvim" },
            })

            require("telescope.builtin").find_files({
                hidden = true,
                previewer = true,
            })
        end)
    end,
})

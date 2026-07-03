## Summary

<!-- What does this PR change and why? 1-3 bullet points. -->

-
-

## Test Plan

<!-- How was this verified? -->

- [ ] `npm run dev` starts both console and SCP server with one command
- [ ] Landing page routes to the Acme Outdoor Co. dashboard without login
- [ ] Context Browser fetches a shopper and displays the JSON response
- [ ] Toggling a scope off removes that data type from the next response
- [ ] Audit log shows the request + the policy change
- [ ] Export CSV downloads correctly
- [ ] `npm run lint && npm run typecheck && npm test` all pass

## Checklist

- [ ] No PII added to the Console's database or logs
- [ ] Conventional commit prefixes used (`feat:`, `fix:`, `chore:`, etc.)
- [ ] Any new env vars documented in `.env.example`

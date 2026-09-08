# Cursor SDK spike (2026-09-07)

Command: `pnpm spike:cursor`

Result on Linux with `@cursor/sdk@1.0.31`:

- `Agent.prompt` + `wait()` did **not** complete successfully.
- Failure: model resolution error (`Cannot use this model: undefined`) even with `{ id: "default" }`.
- Recorded adapter decision: keep `AgentPort` and use **HTTP Cloud Agents adapter** behind the same port for production if native local runtime is unavailable on Vercel.

Local development, CI, and the default process runtime use `FakeAgentPort`
(`USE_FAKE_AGENT=1`, missing `CURSOR_API_KEY`, or unset `CURSOR_AGENT_RUNTIME`).

Set `CURSOR_AGENT_RUNTIME=local` to force native `Agent.prompt`, or
`CURSOR_AGENT_RUNTIME=http` to use `HttpCloudAgentPort` (cloud prompt, no git clone
of this repository). The HTTP adapter sits behind the same `AgentPort`.

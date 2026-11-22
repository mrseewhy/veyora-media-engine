# AI Agents in 100 Seconds — editorial storyboard

Status: complete script and storyboard proposal. Only 0–30 seconds is implemented and rendered for review. Timing of later beats is a target and will be fitted to measured narration before rendering.

| Time | Beat | Narration | Visual plan |
|---|---|---|---|
| 0–10 | Hook | Ask a chatbot to book a trip, and it may give you a beautiful checklist. Ask an agent, and it can start doing the work. Same brain, very different job description. | Original comic chatbot trapped in a speech bubble; travel checklist explodes into a stamped stack. A small agent character steps out carrying a tool case. Original reaction gag: the chatbot watches, stunned. |
| 10–30 | Explanation | An AI agent is a model in a loop: it gets a goal, chooses an action, uses a tool, checks the result, and decides what to do next. Think of a chef. A chatbot tells you the recipe. An agent opens the fridge, notices there are no eggs, and changes the plan. That tiny detour is the point: the agent reacts to what it finds. | Cut from paper recipe to editorial kitchen illustration. A goal card becomes a moving task token; it travels through choose → tool → observe → repeat. The missing eggs trigger a red stamp and route change. |
| 30–55 | Technical | Under the hood, the model proposes a tool call with structured arguments. Your code decides whether to run it. The tool returns data, not magic. That result goes back into the conversation, where the model can choose another step. This loop stops on a final answer, a limit, or a human approval gate. | Actual self-recorded local code editor and run, with an original typed TypeScript tool schema; JSON tool call; animated request/response wiring; execution boundary and permission gate. Clearly label code as illustrative. Capture after 30-second approval. |
| 55–75 | Practical demo | Suppose the goal is to compare tomorrow's weather with your calendar and suggest a commute. The agent reads two approved sources, notices an afternoon meeting, and suggests leaving early with an umbrella. That's a useful workflow, but the displayed run is a simulation. | Clearly labeled simulated desktop: calendar and weather input, successive tool calls, evidence cards, final suggestion. No fake provider claims or invented measured performance. |
| 75–90 | Limitations | Agents can still hallucinate, call the wrong tool, or confidently act on stale data. Give them narrow permissions, timeouts, and a human checkpoint before anything costly or irreversible. | Original humorous wrong-tool reaction; stale-data date stamp; a self-produced photo of a hand at a confirmation key. Photograph after 30-second approval. |
| 90–100 | Conclusion | The trick is not making AI sound autonomous. It's giving it a goal, useful tools, and a way to know when to stop. ToolPilot: smarter tools, better work. | Return to goal token, now safely completed. One punchy visual equation and a brief ToolPilot sign-off. |

## 0–30-second shot list

| Time | Shot | Viewer learns | Motion and sound |
|---|---|---|---|
| 0–4 | Chat bubble versus task | Chatbots can explain without acting | Prompt types in; checklist prints; dry paper tick |
| 4–10 | Agent exits bubble | Agent takes action | Tool case lands; original comic reaction; soft impact |
| 10–17 | The loop | Goal → action → result → next action | Four steps reveal in sequence; crisp clicks |
| 17–22 | Recipe versus kitchen | Model plus tools changes capability | Match cut from recipe page to illustrated countertop |
| 22–30 | Missing eggs | Observation can change the plan | Fridge opens, missing eggs stamp, route turns toward grocery |

## Factual basis and review

The episode describes the general agent tool-use pattern, not a claim about a specific provider. The 55–75-second interface is planned as a disclosed simulation. The first 30 seconds use original code-native artwork and text only; the comic reaction is original, not an external meme. The planned real code recording and photograph are **not acquired yet**; their rights and provenance must be recorded before those scenes can render. Editorial and factual review remain pending.

References for the general pattern: [OpenAI function calling guide](https://platform.openai.com/docs/guides/function-calling), [Anthropic tool use overview](https://docs.anthropic.com/en/docs/agents-and-tools/tool-use/overview). These are research references, not footage or assets.

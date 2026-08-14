# Model Router Agent Prompt

Implement a provider-independent model routing layer.

Provider interface:

get_capabilities
chat
reason
vision
embed
tool_call
health
usage

Initial providers:

OllamaProvider
OpenAICompatibleProvider

Route on:

privacy
task type
vision requirement
tool use
latency
cost
context size
reasoning level
available hardware

Privacy policy:

PRIVATE_HIGH
local only unless explicit override

PRIVATE_MEDIUM
prefer local, remote only after disclosure evaluation

PUBLIC
quality/cost based

Every remote call returns:

provider
model
routing_reason
data_manifest
estimated_risk
usage

Never send entire Personal Memory by default.

Never expose provider API keys to model context.

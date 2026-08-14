# Network Agency Agent Prompt

Implement AgentReach Network Agency without creating a central brain.

Private Intent and Relationships remain local.

External discovery uses:

Private Intent
× Shared Claims
× Personal Reach Context

Network entities:

Person
Agent
Organization
Company
Community
Project
Repository
Service
WebResource
CloudResource

For every entity compute Affordances.

Outbound context must use ContextCapsule.

ContextCapsule must include:

purpose
recipient
scope
shared claims
data manifest
expiry
forwarding policy
approval

External agents can submit assertions and requests but cannot mutate trusted Personal Memory or Policy.

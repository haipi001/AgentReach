# 数据模型

## 1. Personal Canonical Store

建议 SQLite。

表：

```text
principals
personal_agents
agent_instances
devices
delegations

memory_items
memory_sources
memory_evidence
memory_candidates

intents
standing_intents

relationships
relationship_events

applications
aip_profiles
aip_procedures
procedure_versions
interaction_events
routine_candidates

skills
skill_versions
capabilities
capability_dependencies

credentials_metadata
policies
approvals

actions
action_attempts
rollback_records

evidence
audit_events

interface_preferences
backend_evolution_proposals
backend_releases
```

## 2. Shared Network Store

PostgreSQL / PolarDB：

```text
trust_domains
memberships
public_entities
claims
presence
mailbox_envelopes
introductions
shared_commitments
shared_evidence_index
```

不得存在：

```text
private_memory
private_relationship_notes
private_intent
raw_private_app_history
```

## 3. Derived Store

可以重建：

- vector index
- FTS
- graph index
- caches
- embeddings

不得把 derived store 当 canonical truth。

## 4. Event Store

建议 append-only：

```text
agency_events
interaction_events
action_events
verification_events
evolution_events
```

## 5. Model

基础对象：

- Principal
- PersonalAgent
- AgentInstance
- Memory
- Intent
- StandingIntent
- Relationship
- Application
- AIP
- Procedure
- Skill
- Capability
- Entity
- Affordance
- Delegation
- PolicyDecision
- Approval
- Action
- ActionResult
- Evidence
- AuditEvent
- EvolutionProposal

# Job Application Tracker — Schema

Draft data model. Storage format (Postgres, SQLite, etc.) can come later; this defines entities, fields, and relationships.

---

## Entity overview

```text
Company
  ├── Contact[] (employer)      # people who work at this company
  ├── Contact[] (hiring-for)    # people hiring/recruiting for this company (may work elsewhere)
  └── Job[]                     # positions you are tracking at this company (1+ per company)
        └── Thread              # one tracking thread per job
              ├── ThreadContact[]   # many contacts on the thread
              ├── Interaction[]     # every touch: inbound/outbound call, email, WhatsApp
              ├── FollowUp[]        # scheduled next actions (default +2 days)
              └── Remark[]          # conversation notes (esp. verbal)
```

**Core idea:** a **Job** is the position you are tracking at a company. Each job has one **Thread** that can involve **multiple contacts**. Contacts have one **employer** and one or more **hiring-for** companies (agency recruiters, etc.). The thread starts when either you reach out or they reach you, then accumulates interactions, follow-ups, and remarks until closed.

**Defaults**

| Setting | Value |
| --- | --- |
| Default follow-up interval | **2 days** (`fixed_interval`) |
| Attachments | **Not supported** |

---

## 1. Company

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `name` | string | Required |
| `website` | string? | |
| `careers_url` | string? | Portal / careers page |
| `location` | string? | HQ or primary location |
| `notes` | text? | Company-level notes |
| `created_at` | datetime | |
| `updated_at` | datetime | |

One company can have **many jobs** (multiple positions tracked in parallel).

---

## 2. Contact

People involved in hiring. Reusable across jobs/threads. A contact **works at** exactly one company (employer) and can be **hiring for** one or more companies (including their employer).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `employer_company_id` | fk → Company | Required — where they work |
| `hiring_company_ids` | uuid[] | Required, ≥1 — companies they recruit/hire for (join table `contact_hiring_companies`) |
| `name` | string | Required |
| `position` | string? | Their title (e.g. Recruiter, Hiring Manager) — not the job you are applying for |
| `emails` | string[] | One or more |
| `phones` | string[] | One or more (call / WhatsApp) |
| `linkedin_url` | string? | |
| `notes` | text? | Static notes about the person |
| `created_at` | datetime | |
| `updated_at` | datetime | |

**UI:** checkbox “Hiring for their employer” includes/excludes `employer_company_id` from `hiring_company_ids`.

**List filter** `GET /api/contacts?companyId=X`: contacts where they **work at X** or **hire for X**.

---

## 3. Job

A **required** position you are tracking at a company. This is what the UI shows as “the role” for that company. Multiple jobs per company are allowed.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `company_id` | fk → Company | Required |
| `title` | string | Required — the position you are tracking |
| `portal` | string? | LinkedIn, Naukri, company site, referral, etc. |
| `portal_application_id` | string? | External ref if any |
| `applied_at` | datetime? | When you submitted on the portal |
| `status` | enum | See job statuses below |
| `job_url` | string? | |
| `notes` | text? | |
| `created_at` | datetime | |
| `updated_at` | datetime | |

**Job status (suggested):** `wishlist` | `applied` | `in_process` | `offer` | `rejected` | `withdrawn` | `ghosted`

Creating a Job also creates its **Thread** (1:1).

---

## 4. Thread

One ongoing tracking conversation for a **Job**. Involves **one or more contacts** via `ThreadContact`.

This is what “starts” when:

1. You **receive** a call/email from a contact (cold, or after a portal application), or  
2. You **send** WhatsApp / call / email.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `job_id` | fk → Job | **Required**, unique — one thread per job. Company comes from `Job.company_id` |
| `origin` | enum | How tracking started — see below |
| `status` | enum | Lifecycle of this thread |
| `next_follow_up_at` | datetime? | Convenience: soonest open follow-up (or cached) |
| `closed_at` | datetime? | |
| `created_at` | datetime | |
| `updated_at` | datetime | |

**Origin (how tracking started):**

| Value | Meaning |
| --- | --- |
| `inbound` | They contacted you first (call / email / etc.) |
| `outbound` | You contacted them first |
| `portal_then_inbound` | You applied on a portal; they reached out afterward |
| `portal_then_outbound` | You applied on a portal; then you chased them |

**Thread status (suggested):** `active` | `waiting_on_them` | `waiting_on_me` | `paused` | `closed_won` | `closed_lost` | `closed_ghosted`

---

## 5. ThreadContact

Join table: many contacts on one thread (recruiter + hiring manager + HR, etc.).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `thread_id` | fk → Thread | Required |
| `contact_id` | fk → Contact | Required; contact should work at or hire for `Job.company_id` |
| `role_on_thread` | string? | Optional label, e.g. primary, hiring_manager, cc |
| `added_at` | datetime | |

**Constraints:** unique `(thread_id, contact_id)`. At least one contact should exist once outreach has started.

---

## 6. Interaction

A single touchpoint on a thread (call, email, WhatsApp, meeting, etc.).

Written channels may live elsewhere (email client, WhatsApp); still log a short record here so the timeline is complete. Verbal ones usually need a **Remark**.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `thread_id` | fk → Thread | Required |
| `direction` | enum | `inbound` \| `outbound` |
| `channel` | enum | `call` \| `email` \| `whatsapp` \| `sms` \| `meeting` \| `other` |
| `occurred_at` | datetime | When it happened |
| `subject` | string? | Useful for email |
| `summary` | text? | One-line what this touch was about |
| `external_ref` | string? | Optional link/id into mail/WhatsApp archive |
| `created_at` | datetime | |

### 6a. InteractionContact

Which people on the thread were involved in this touch (optional but useful when several contacts exist).

| Field | Type | Notes |
| --- | --- | --- |
| `interaction_id` | fk → Interaction | Required |
| `contact_id` | fk → Contact | Required; should already be on the thread |

**Constraints:** unique `(interaction_id, contact_id)`.

The **first** interaction on a thread should align with `Thread.origin` (inbound vs outbound).

---

## 7. FollowUp

Scheduled next action after a fixed interval or a time **they suggested**.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `thread_id` | fk → Thread | Required |
| `due_at` | datetime | When to follow up |
| `source` | enum | `fixed_interval` \| `suggested_by_them` \| `manual` |
| `interval_days` | int? | If `fixed_interval`; **default 2** when auto-created |
| `suggested_note` | string? | e.g. “They said call back next Monday” |
| `channel_hint` | enum? | Preferred channel for this follow-up |
| `status` | enum | `pending` \| `done` \| `skipped` \| `cancelled` |
| `completed_at` | datetime? | |
| `completed_interaction_id` | fk → Interaction? | The touch that fulfilled this follow-up |
| `created_at` | datetime | |
| `updated_at` | datetime | |

**Default behavior:** after an interaction (or when starting a thread), if no suggested date is given, create a FollowUp with `source: fixed_interval`, `interval_days: 2`, `due_at = occurred_at + 2 days`. If they suggest a time, use `source: suggested_by_them` and that `due_at` instead.

When you act on a follow-up, mark it `done`, log a new Interaction, and schedule the next FollowUp (again +2 days unless overridden).

---

## 8. Remark

Notes on what happened in a conversation — especially **verbal** (calls / meetings), since written media is already stored in email/WhatsApp.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid / pk | |
| `thread_id` | fk → Thread | Required |
| `interaction_id` | fk → Interaction? | Prefer linking to the call/meeting this refers to |
| `body` | text | What was said / decided / vibe |
| `recorded_at` | datetime | Usually = conversation time |
| `created_at` | datetime | |
| `updated_at` | datetime | |

Remarks can also be free-standing on the thread (`interaction_id` null) for quick notes not tied to a logged touch.

---

## Relationships (summary)

```text
Company 1 ── * Contact             as employer (Contact.employer_company_id)
Company * ── * Contact             as hiring-for (via contact_hiring_companies)
Company 1 ── * Job                 (multiple positions per company)
Job     1 ── 1 Thread              (required; one thread per job)
Thread  * ── * Contact             via ThreadContact
Thread  1 ── * Interaction
Interaction * ── * Contact         via InteractionContact (who was in this touch)
Thread  1 ── * FollowUp
Thread  1 ── * Remark
Interaction 1 ── * Remark          (optional link)
FollowUp    0..1 ── 1 Interaction  (when completed)
```

---

## Example flows

### A. Portal apply → they call you

1. Create **Company** and **Job** (`title` = position tracked, `status: applied`). Thread is created with the job.  
2. Create **Contact**(s); add them via **ThreadContact**.  
3. Set Thread `origin: portal_then_inbound`.  
4. Log **Interaction** (`direction: inbound`, `channel: call`) + **InteractionContact** for who called.  
5. Add **Remark** with what was discussed.  
6. Create **FollowUp**: their suggested date, or default **+2 days**.

### B. You WhatsApp / email / call first (possibly several people)

1. Create **Company**, **Job** (position title), and its **Thread**.  
2. Add one or more **Contacts** to the thread.  
3. Set `origin: outbound`; log **Interaction**(s) with involved contacts.  
4. Schedule **FollowUp** (+2 days, or date they gave you).

### C. Same company, second position

1. Create another **Job** under the same company (different `title`).  
2. New **Thread** for that job; attach contacts (can reuse existing Contact records).  
3. Track independently with its own interactions / follow-ups.

### D. Follow-up day arrives

1. Open pending **FollowUp**.  
2. Perform the action → log new **Interaction** (+ **Remark** if verbal).  
3. Mark FollowUp `done`, link `completed_interaction_id`.  
4. If thread still open, create next **FollowUp** (default +2 days unless they suggested otherwise).

---

## Suggested indexes / queries

- Contacts by `employer_company_id` and by hiring-for company (`contact_hiring_companies`)
- Jobs by `company_id` and `status` (company’s tracked positions)
- Thread by `job_id` (1:1)
- ThreadContacts by `thread_id`
- Threads by `status`, `next_follow_up_at` (today’s follow-ups list)
- FollowUps where `status = pending` ordered by `due_at`
- Interactions by `thread_id` ordered by `occurred_at`

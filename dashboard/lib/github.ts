import { Octokit } from "octokit";

function repoInfo() {
  const [owner, repo] = process.env.GITHUB_REPO!.split("/");
  return { owner, repo };
}

function client() {
  return new Octokit({ auth: process.env.GITHUB_TOKEN });
}

export async function dispatchIngest(sourcePath: string) {
  await client().rest.repos.createDispatchEvent({
    ...repoInfo(),
    event_type: "ingest-text",
    client_payload: { source_path: sourcePath },
  });
}

export async function triggerWorkflow(workflowFile: string) {
  await client().rest.actions.createWorkflowDispatch({
    ...repoInfo(),
    workflow_id: workflowFile,
    ref: "main",
  });
}

export async function latestRun(workflowFile: string) {
  const res = await client().rest.actions.listWorkflowRuns({
    ...repoInfo(),
    workflow_id: workflowFile,
    per_page: 1,
  });
  const run = res.data.workflow_runs[0];
  if (!run) return null;
  return { status: run.status, conclusion: run.conclusion, ran_at: run.run_started_at };
}

const metadataPaths = [
  "./deployment.json",
  "./arcium-deployment.json",
  "./config.json",
  "/app/deployment.json",
  "/app/arcium-deployment.json",
  "/app/config.json",
  "/deployment.json",
];

const form = document.querySelector("#contact-form");
const contactInput = document.querySelector("#contact-input");
const registryInput = document.querySelector("#registry-input");
const clearButton = document.querySelector("#clear-button");
const copyButton = document.querySelector("#copy-button");
const formStatus = document.querySelector("#form-status");
const emptyState = document.querySelector("#empty-state");
const tableWrap = document.querySelector("#table-wrap");
const resultsBody = document.querySelector("#results-body");
const metricTotal = document.querySelector("#metric-total");
const metricUnique = document.querySelector("#metric-unique");
const metricMatches = document.querySelector("#metric-matches");
const deploymentState = document.querySelector("#deployment-state");
const metadataList = document.querySelector("#metadata-list");

let latestRows = [];

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  await processContacts();
});

clearButton.addEventListener("click", () => {
  contactInput.value = "";
  registryInput.value = "";
  latestRows = [];
  renderRows([]);
  renderMetrics(0, 0, 0);
  setStatus("");
});

copyButton.addEventListener("click", async () => {
  const hashes = latestRows.map((row) => row.hash).join("\n");
  if (!hashes) return;

  await navigator.clipboard.writeText(hashes);
  setStatus("Hashes copied.");
});

loadDeploymentMetadata();

async function processContacts() {
  const entries = contactInput.value
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean)
    .map((raw) => ({ raw, ...normalizeIdentifier(raw) }))
    .filter((entry) => entry.normalized);

  const registry = new Set(
    registryInput.value
      .split(/\r?\n|,|\s/)
      .map((value) => value.trim().toLowerCase())
      .filter((value) => /^[a-f0-9]{64}$/.test(value))
  );

  latestRows = await Promise.all(
    entries.map(async (entry) => {
      const hash = await sha256(entry.normalized);
      return {
        ...entry,
        hash,
        matched: registry.has(hash),
      };
    })
  );

  const uniqueCount = new Set(latestRows.map((row) => row.hash)).size;
  const matchCount = latestRows.filter((row) => row.matched).length;

  renderRows(latestRows);
  renderMetrics(latestRows.length, uniqueCount, matchCount);
  setStatus(
    latestRows.length
      ? `${latestRows.length} contact${
          latestRows.length === 1 ? "" : "s"
        } processed.`
      : "No valid contacts found."
  );
}

function normalizeIdentifier(raw) {
  const compact = raw.trim().toLowerCase();

  if (!compact) {
    return { type: "Unknown", normalized: "" };
  }

  if (compact.includes("@") && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(compact)) {
    return { type: "Email", normalized: compact };
  }

  const phoneCandidate = compact.replace(/[^\d+]/g, "");
  const digits = phoneCandidate.replace(/\D/g, "");
  if (digits.length >= 7 && digits.length <= 15) {
    const normalizedPhone = phoneCandidate.startsWith("+")
      ? `+${digits}`
      : digits;
    return { type: "Phone", normalized: normalizedPhone };
  }

  const handle = compact.replace(/^@+/, "").replace(/\s+/g, "");
  if (handle) {
    return { type: "Alias", normalized: `@${handle}` };
  }

  return { type: "Unknown", normalized: "" };
}

async function sha256(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function renderRows(rows) {
  resultsBody.replaceChildren();
  emptyState.hidden = rows.length > 0;
  tableWrap.hidden = rows.length === 0;
  copyButton.disabled = rows.length === 0;

  const fragment = document.createDocumentFragment();
  for (const row of rows) {
    const tr = document.createElement("tr");
    tr.append(
      tableCell(row.type),
      tableCell(row.normalized),
      tableCell(row.hash, "hash-cell"),
      registryCell(row.matched)
    );
    fragment.append(tr);
  }
  resultsBody.append(fragment);
}

function tableCell(value, className) {
  const td = document.createElement("td");
  td.textContent = value;
  if (className) td.className = className;
  return td;
}

function registryCell(matched) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = matched ? "match-pill hit" : "match-pill";
  span.textContent = matched ? "Matched" : "Not present";
  td.append(span);
  return td;
}

function renderMetrics(total, unique, matches) {
  metricTotal.textContent = total;
  metricUnique.textContent = unique;
  metricMatches.textContent = matches;
}

function setStatus(message) {
  formStatus.textContent = message;
}

async function loadDeploymentMetadata() {
  for (const path of metadataPaths) {
    const metadata = await fetchJson(path);
    if (metadata) {
      renderDeploymentMetadata(metadata, path);
      return;
    }
  }

  deploymentState.textContent = "Not deployed yet";
  deploymentState.className = "state-pill missing";
  renderMetadataList([
    ["Status", "not deployed yet"],
    ["Metadata", "No local deployment JSON found."],
  ]);
}

async function fetchJson(path) {
  try {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) return null;

    return await response.json();
  } catch {
    return null;
  }
}

function renderDeploymentMetadata(metadata, sourcePath) {
  const programId = readFirst(metadata, [
    "programId",
    "program_id",
    "address",
    "deployedProgramId",
  ]);
  const network = readFirst(metadata, ["network", "cluster", "solanaCluster"]);
  const transaction = readFirst(metadata, [
    "signature",
    "transaction",
    "tx",
    "deploymentTx",
  ]);
  const deployedAt = readFirst(metadata, [
    "deployedAt",
    "deployed_at",
    "timestamp",
    "createdAt",
  ]);

  if (!programId) {
    deploymentState.textContent = "Metadata incomplete";
    deploymentState.className = "state-pill error";
    renderMetadataList([
      ["Status", "metadata found but program id is missing"],
      ["Source", sourcePath],
    ]);
    return;
  }

  deploymentState.textContent = "Verified locally";
  deploymentState.className = "state-pill ready";
  renderMetadataList([
    ["Status", "verified from local deployment metadata"],
    ["Program ID", programId],
    ["Network", network || "not specified"],
    ["Transaction", transaction || "not specified"],
    ["Deployed At", deployedAt || "not specified"],
    ["Source", sourcePath],
  ]);
}

function readFirst(source, keys) {
  for (const key of keys) {
    if (source && source[key]) return String(source[key]);
  }
  return "";
}

function renderMetadataList(rows) {
  metadataList.replaceChildren();
  const fragment = document.createDocumentFragment();

  for (const [label, value] of rows) {
    const row = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    fragment.append(row);
  }

  metadataList.append(fragment);
}

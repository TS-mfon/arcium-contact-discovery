const METADATA_PATHS = [
  "/app/deployment.json",
  "/app/arcium-deployment.json",
  "/app/config.json",
  "/deployment.json",
];

const DEVNET_EXPLORER = "https://explorer.solana.com";
const DEVNET_RPC = "https://api.devnet.solana.com";

const walletButton = document.querySelector("[data-wallet-button]");
const walletAddress = document.querySelectorAll("[data-wallet-address]");
const deploymentStatus = document.querySelectorAll("[data-deployment-status]");
const programIdNodes = document.querySelectorAll("[data-program-id]");
const deployTxNodes = document.querySelectorAll("[data-deploy-tx]");
const verificationCopy = document.querySelectorAll("[data-verification-copy]");

let deployment = null;

walletButton?.addEventListener("click", connectWallet);
loadDeployment();

async function connectWallet() {
  const provider = window.solana;
  if (!provider?.isPhantom) {
    setWalletText("Phantom not found");
    return;
  }

  try {
    const response = await provider.connect();
    const publicKey = response.publicKey.toString();
    setWalletText(shortKey(publicKey));
    walletButton.textContent = "Wallet connected";
    walletButton.disabled = true;
  } catch (error) {
    setWalletText("Connection rejected");
  }
}

async function loadDeployment() {
  deployment = await findDeployment();
  if (!deployment) {
    setDeploymentMissing();
    return;
  }

  const programId = readFirst(deployment, [
    "programId",
    "program_id",
    "address",
    "deployedProgramId",
  ]);
  const cluster =
    readFirst(deployment, ["cluster", "network", "solanaCluster"]) || "devnet";
  const tx = readFirst(deployment, [
    "deploymentTx",
    "deployTx",
    "signature",
    "transaction",
    "tx",
  ]);

  setText(deploymentStatus, "Deployment metadata loaded");
  setHtml(
    programIdNodes,
    programId
      ? explorerLink("address", programId, cluster)
      : "Missing program ID"
  );
  setHtml(
    deployTxNodes,
    tx ? explorerLink("tx", tx, cluster) : "Missing deploy transaction"
  );

  if (programId) {
    const exists = await verifyProgram(programId);
    setText(
      verificationCopy,
      exists
        ? "Program account was found on Solana devnet RPC. Use the explorer links to verify the same address."
        : "Deployment metadata exists, but the program account could not be verified through public devnet RPC."
    );
    setText(
      deploymentStatus,
      exists ? "Verified on devnet" : "Metadata loaded"
    );
  }
}

async function findDeployment() {
  for (const path of METADATA_PATHS) {
    try {
      const response = await fetch(path, { cache: "no-store" });
      if (!response.ok) continue;
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("json")) continue;
      return await response.json();
    } catch {
      continue;
    }
  }
  return null;
}

async function verifyProgram(programId) {
  try {
    const response = await fetch(DEVNET_RPC, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "verify-program",
        method: "getAccountInfo",
        params: [programId, { encoding: "base64" }],
      }),
    });
    const payload = await response.json();
    return Boolean(payload.result?.value);
  } catch {
    return false;
  }
}

function setDeploymentMissing() {
  setText(deploymentStatus, "Not deployed yet");
  setText(programIdNodes, "No local deployment JSON found");
  setText(deployTxNodes, "Unavailable");
  setText(
    verificationCopy,
    "No verified Arcium deployment metadata is bundled with this app yet. The UI will not show fake on-chain state."
  );
}

function readFirst(source, keys) {
  for (const key of keys) {
    if (source?.[key]) return source[key];
  }
  return "";
}

function explorerLink(kind, value, cluster) {
  const base = kind === "tx" ? "tx" : "address";
  const clusterQuery =
    cluster === "mainnet-beta" ? "" : `?cluster=${cluster || "devnet"}`;
  return `<a href="${DEVNET_EXPLORER}/${base}/${value}${clusterQuery}" target="_blank" rel="noreferrer">${value}</a>`;
}

function shortKey(value) {
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function setWalletText(value) {
  for (const node of walletAddress) node.textContent = value;
}

function setText(nodes, value) {
  for (const node of nodes) node.textContent = value;
}

function setHtml(nodes, value) {
  for (const node of nodes) node.innerHTML = value;
}

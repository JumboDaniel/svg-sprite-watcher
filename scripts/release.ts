import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readdirSync } from "node:fs";
import semver from "semver";
import prompts from "prompts";

const TAG_MAP = [[/^rc[0-9]+$/, "next"] as const];
const DEFAULT_TAG = "latest";

function $(cmd: string, options?: { quiet?: boolean }): void {
  try {
    execSync(cmd, { stdio: options?.quiet ? "ignore" : "inherit" });
  } catch (error) {
    if (!options?.quiet) {
      console.error(`Command failed: ${cmd}`);
      process.exit(1);
    }
    throw error;
  }
}

function getGitStatusPorcelain() {
  return execSync("git status --porcelain", { encoding: "utf-8" }).trim();
}

function assertCleanWorkingTree() {
  const gitStatus = getGitStatusPorcelain();
  if (gitStatus.length > 0) {
    console.error(
      "Working tree is not clean. Commit or stash local changes before releasing.",
    );
    process.exit(1);
  }
}

function commitVersionBump(
  pkgJsonPath: string,
  packageName: string,
  version: string,
) {
  const normalizedPath = pkgJsonPath.replace(/\\/g, "/");
  $(`git add -- "${normalizedPath}"`);
  $(`git commit -m "chore(${packageName}): version bump to ${version}"`);
}

function isLoggedIntoNpm() {
  try {
    $("pnpm whoami", { quiet: true });
    return true;
  } catch {
    return false;
  }
}

function ensureNpmLogin() {
  if (isLoggedIntoNpm()) {
    console.info("npm auth check passed (pnpm whoami)");
    return;
  }

  console.info("Not logged in to npm. Starting pnpm login...");
  $("pnpm login");

  if (!isLoggedIntoNpm()) {
    console.error("npm authentication failed after login attempt.");
    process.exit(1);
  }
}

async function doesTagAlreadyExist(tag: string) {
  try {
    $(`gh api -X GET /repos/{owner}/{repo}/git/ref/tags/${tag}`, {
      quiet: true,
    });
    return true;
  } catch {
    return false;
  }
}

function lint(packageName: string) {
  console.info("Linting...");
  $(`pnpm --filter ${packageName} run lint`);
}

function runTests(packageName: string) {
  console.info("Running tests...");
  $(`pnpm --filter ${packageName} run test`);
}

function build(packageName: string) {
  console.info("Building...");
  $(`pnpm --filter ${packageName} run build`);
}

function publishToNpm(packageName: string, tag: string) {
  $(
    `pnpm --filter ${packageName} publish --tag ${tag} --access public --no-git-checks`,
  );
}

/** Tags are scoped per-package to avoid collisions: e.g. astro-typed-routes-v1.2.0 */
function makeGitTag(packageName: string, version: string) {
  return `${packageName}-v${version}`;
}

function tagAndPush(packageName: string, version: string) {
  const gitTag = makeGitTag(packageName, version);
  $(`git tag -a ${gitTag} -m "Release ${packageName} version ${version}"`);
  $(`git push origin ${gitTag}`);
}

function createRelease(
  packageName: string,
  version: string,
  isPreRelease: boolean,
) {
  const gitTag = makeGitTag(packageName, version);
  $(
    `gh release create ${gitTag} --generate-notes --title "${packageName} v${version}" ${isPreRelease ? "--prerelease" : ""}`,
  );
}

function getVersionAndTag(version: string) {
  const parsedVersion = semver.valid(version);
  if (!parsedVersion) {
    throw new Error(`Invalid version: ${version}`);
  }
  const tag = version.split("-").at(1);
  if (tag === undefined) {
    return { version: parsedVersion, tag: DEFAULT_TAG };
  }
  const matching = TAG_MAP.find(([regex]) => regex.test(tag));
  if (matching === undefined) {
    throw new Error(`Invalid tag: ${tag}`);
  }
  return { version: parsedVersion, tag: matching[1] };
}

/** Discover all packages under packages/ that have a package.json */
function discoverPackages(root: string) {
  const packagesDir = join(root, "packages");
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const pkgJsonPath = join(packagesDir, entry.name, "package.json");
      try {
        const pkg = JSON.parse(readFileSync(pkgJsonPath, "utf-8"));
        return { dir: join(packagesDir, entry.name), pkg, pkgJsonPath };
      } catch {
        return null;
      }
    })
    .filter(Boolean) as {
    dir: string;
    pkg: Record<string, string>;
    pkgJsonPath: string;
  }[];
}

async function run() {
  const root = process.cwd();
  assertCleanWorkingTree();

  // 0. Discover packages and prompt for selection
  const packages = discoverPackages(root);
  if (packages.length === 0) {
    console.error("No packages found under packages/");
    process.exit(1);
  }

  const { selectedIndex } = await prompts({
    type: "select",
    name: "selectedIndex",
    message: "Which package would you like to release?",
    choices: packages.map((p, i) => ({
      title: `${p.pkg.name}  (current: ${p.pkg.version})`,
      value: i,
    })),
  });

  if (selectedIndex === undefined) process.exit(1); // User cancelled

  const { pkg, pkgJsonPath } = packages[selectedIndex];
  const packageName: string = pkg.name;

  // 1. Prompt for Version Bump
  const { releaseType } = await prompts({
    type: "select",
    name: "releaseType",
    message: `Current version is ${pkg.version}. How would you like to bump it?`,
    choices: [
      { title: `Patch (${semver.inc(pkg.version, "patch")})`, value: "patch" },
      { title: `Minor (${semver.inc(pkg.version, "minor")})`, value: "minor" },
      { title: `Major (${semver.inc(pkg.version, "major")})`, value: "major" },
      { title: "Skip bump (Keep current)", value: "skip" },
    ],
  });

  if (!releaseType) process.exit(1); // User cancelled

  if (releaseType !== "skip") {
    const nextVersion = semver.inc(
      pkg.version,
      releaseType as semver.ReleaseType,
    );
    if (!nextVersion) throw new Error("Semver failed to increment");

    pkg.version = nextVersion;
    writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n", "utf-8");
    commitVersionBump(pkgJsonPath, packageName, nextVersion);
  }

  const { version, tag } = getVersionAndTag(pkg.version);
  const gitTag = makeGitTag(packageName, version);

  const versionIsBusy = await doesTagAlreadyExist(gitTag);
  if (versionIsBusy) {
    console.error(`Tag "${gitTag}" already exists on GitHub.`);
    process.exit(1);
  }

  const res = await prompts({
    type: "confirm",
    name: "value",
    message: `Publish ${packageName} version "v${version}" under npm tag "${tag}"?`,
    initial: false,
  });

  if (!res.value) {
    console.log("Release cancelled.");
    process.exit(1);
  }

  const isPreRelease = tag !== DEFAULT_TAG;

  lint(packageName);
  runTests(packageName);
  build(packageName);
  ensureNpmLogin();
  tagAndPush(packageName, version);
  publishToNpm(packageName, tag);
  createRelease(packageName, version, isPreRelease);

  console.log(`\n? Release ${gitTag} successfully completed!`);
}

run().catch((err) => {
  console.error("Release script failed:", err);
  process.exit(1);
});

#!/usr/bin/env python3
"""
Script to build and link a local development version of deltachat-core to the desktop app.

Usage: python build_and_link_local_core.py <core_path>

Run this script from the desktop repository directory.
"""

import subprocess
import sys
import os
import json
import re

# Check Python version
if sys.version_info < (3, 6):
    print("Error: This script requires Python 3.6 or higher")
    sys.exit(1)


def run_command(cmd, cwd=None):
    """Run a command and exit on failure."""
    print(f"\n>>> Running: {cmd}")
    if cwd:
        print(f"    in: {cwd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"Error: Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)


def get_core_version(core_path):
    """Get the core version from Cargo.toml."""
    cargo_toml = os.path.join(core_path, "Cargo.toml")
    try:
        with open(cargo_toml, "r") as f:
            for line in f:
                if line.strip().startswith("version"):
                    # Parse: version = "1.2.3"
                    return line.split("=")[1].strip().strip('"').strip("'")
    except Exception:
        pass
    return "unknown"


def get_git_branch(core_path):
    """Get the current git branch name."""
    try:
        result = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=core_path,
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return None


def parse_version(version_str):
    """Parse version string into tuple of integers for comparison."""
    # Extract version numbers (e.g., "9.1.0" from "pnpm 9.1.0" or "cargo 1.75.0 (...)")
    match = re.search(r'(\d+)\.(\d+)\.(\d+)', version_str)
    if match:
        return tuple(int(x) for x in match.groups())
    # Try major.minor format (e.g., "1.88")
    match = re.search(r'(\d+)\.(\d+)', version_str)
    if match:
        return (int(match.group(1)), int(match.group(2)), 0)
    return (0, 0, 0)


def get_required_pnpm_version(desktop_path):
    """Get required pnpm version from package.json."""
    try:
        package_json = os.path.join(desktop_path, "package.json")
        with open(package_json, "r") as f:
            data = json.load(f)
            pnpm_req = data.get("engines", {}).get("pnpm", "")
            # Parse ">=9.6.0" or "^9.6.0" -> (9, 6, 0)
            return parse_version(pnpm_req)
    except Exception:
        return None


def get_required_rust_version(core_path):
    """Get required rust version from core."""
    try:
        cargo_toml = os.path.join(core_path, "Cargo.toml")
        with open(cargo_toml, "r") as f:
            for line in f:
                if line.strip().startswith("rust-version"):
                    # Parse: rust-version = "1.88"
                    version = line.split("=")[1].strip().strip('"').strip("'")
                    return parse_version(version)
    except Exception:
        pass
    return None


def check_tool(name, min_version=None):
    """Check if a tool is installed and optionally meets minimum version."""
    try:
        result = subprocess.run(
            [name, "--version"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            version_output = result.stdout.strip().split('\n')[0]
            version = parse_version(version_output)

            if min_version and version < min_version:
                min_str = '.'.join(str(x) for x in min_version)
                print(f"  {name}: {version_output} (requires >= {min_str})")
                return False

            print(f"  {name}: {version_output}")
            return True
    except FileNotFoundError:
        pass
    print(f"  {name}: NOT FOUND")
    return False


def check_required_tools(desktop_path):
    """Check that all required tools are installed."""
    print("Checking required tools...")
    all_ok = True

    # Get required versions from project files
    pnpm_min = get_required_pnpm_version(desktop_path)
    rust_min = get_required_rust_version(desktop_path)

    if not check_tool("npm"):
        all_ok = False
    if not check_tool("pnpm", min_version=pnpm_min):
        all_ok = False
    if not check_tool("rustc", min_version=rust_min):
        all_ok = False
    if not check_tool("cargo"):
        all_ok = False

    if not all_ok:
        print("\nError: Missing or outdated required tools")
        sys.exit(1)
    print()


def main():
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <core_path>")
        print("Run this script from the desktop repository directory.")
        sys.exit(1)

    core_path = os.path.abspath(sys.argv[1])
    desktop_path = os.getcwd()

    if not os.path.isdir(core_path):
        print(f"Error: core_path does not exist: {core_path}")
        sys.exit(1)

    check_required_tools(desktop_path)

    print(f"Core directory: {core_path}")
    print(f"Desktop directory: {desktop_path}")

    # Step 1: Run make_local_dev_version.py in core_path
    run_command(
        f"{sys.executable} deltachat-rpc-server/npm-package/scripts/make_local_dev_version.py",
        cwd=core_path
    )

    # Step 2: npm install in deltachat-jsonrpc/typescript/
    jsonrpc_ts_dir = os.path.join(core_path, "deltachat-jsonrpc", "typescript")
    run_command("npm install", cwd=jsonrpc_ts_dir)

    # Step 3: npm run build in deltachat-jsonrpc/typescript/
    run_command("npm run build", cwd=jsonrpc_ts_dir)

    # Step 4: Link core packages to desktop packages
    jsonrpc_link = f"@deltachat/jsonrpc-client@link:{core_path}/deltachat-jsonrpc/typescript"
    stdio_rpc_link = f"@deltachat/stdio-rpc-server@link:{core_path}/deltachat-rpc-server/npm-package"

    run_command(
        f"pnpm add {jsonrpc_link} {stdio_rpc_link}",
        cwd=os.path.join(desktop_path, "packages", "target-electron")
    )

    run_command(
        f"pnpm add {jsonrpc_link} {stdio_rpc_link}",
        cwd=os.path.join(desktop_path, "packages", "target-browser")
    )

    run_command(
        f"pnpm add {jsonrpc_link}",
        cwd=os.path.join(desktop_path, "packages", "frontend")
    )

    run_command(
        f"pnpm add {jsonrpc_link}",
        cwd=os.path.join(desktop_path, "packages", "runtime")
    )

    run_command(
        f"pnpm add {jsonrpc_link}",
        cwd=os.path.join(desktop_path, "packages", "target-tauri")
    )

    tauri_src_dir = os.path.join(desktop_path, "packages", "target-tauri", "src-tauri")
    result = subprocess.run(
        f"cargo add deltachat --path {core_path} && cargo add deltachat-jsonrpc --path {core_path}/deltachat-jsonrpc",
        shell=True,
        cwd=tauri_src_dir
    )
    if result.returncode != 0:
        print("\n\nFailed to link local core to tauri: please update Cargo.toml in packages/target-tauri/src-tauri manually")

    version = get_core_version(core_path)
    branch = get_git_branch(core_path)

    version_str = version
    if branch:
        version_str = f"{version} ({branch})"

    print(f"\n✓ Done! Desktop is now linked to core {version_str}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Script to build and link a local development version of deltachat-core to the desktop app.

Usage: python build_and_link_local_core.py <core_path>

Run this script from the desktop repository directory.
"""

import subprocess
import sys
import os

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

    print(f"Core directory: {core_path}")
    print(f"Desktop directory: {desktop_path}")

    # Step 1: Run make_local_dev_version.py in core_path
    run_command(
        "python deltachat-rpc-server/npm-package/scripts/make_local_dev_version.py",
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

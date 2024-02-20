{
  description = "Deltachat";
  inputs = {
    rust-overlay.url = "github:oxalica/rust-overlay";
    flake-utils.follows = "rust-overlay/flake-utils";
    nixpkgs.follows = "rust-overlay/nixpkgs";
    naersk.url = "github:nix-community/naersk";
  };
  outputs = inputs:
    with inputs;
      flake-utils.lib.eachDefaultSystem (
        system: let
          pkgs = import nixpkgs {
            overlays = [(import rust-overlay)];
            inherit system;
          };
          naerskLib = pkgs.callPackage naersk {
            cargo = rust-toolchain;
            rustc = rust-toolchain;
          };

          buildInputs = with pkgs; [
            electron
          ];

          nativeBuildInputs = with pkgs; [
            pkg-config
            openssl
          ];
          rust-toolchain = pkgs.rust-bin.stable.latest.default.override {
            extensions = ["rust-src" "rustfmt" "rust-docs" "clippy"];
          };
        in {
          packages = rec {
            deltachatlib = naerskLib.buildPackage {
              inherit nativeBuildInputs;
              name = "deltachatlib";
              src = ./.;
            };

            nodejs = {

            };

            default = deltachatlib;
          };
          devShells.default = pkgs.mkShell {
            inherit buildInputs;
            nativeBuildInputs = nativeBuildInputs ++ [rust-toolchain pkgs.rust-analyzer];
            RUST_BACKTRACE = 1;
          };
        }
      );
}

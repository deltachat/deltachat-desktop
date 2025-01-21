{
  description = "A Nix-flake-based Node.js and Rust development environment";

  inputs.nixpkgs.url = "https://flakehub.com/f/NixOS/nixpkgs/0.1.*.tar.gz";
  inputs.rust-overlay = {
    url = "github:oxalica/rust-overlay";
    inputs.nixpkgs.follows = "nixpkgs";
  };
  outputs = {
    self,
    nixpkgs,
    rust-overlay,
  }: let
    supportedSystems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forEachSupportedSystem = f:
      nixpkgs.lib.genAttrs supportedSystems (system:
        f {
          pkgs = import nixpkgs {
            inherit system;
            overlays = [rust-overlay.overlays.default self.overlays.default];
          };
        });
  in {
    formatter = forEachSupportedSystem ({pkgs}: pkgs.alejandra);
    overlays.default = final: prev: {
      rustToolchain = let
        rust = prev.rust-bin;
      in
        rust.stable.latest.default.override {
          extensions = ["rust-src" "rustfmt"];
        };
    };
    devShells = forEachSupportedSystem ({pkgs}: let
      nativeBuildInputs = with pkgs; [
        pkg-config
        gobject-introspection
        cargo
        cargo-tauri
        nodejs
      ];

      buildInputs = with pkgs; [
        at-spi2-atk
        atkmm
        cairo
        gdk-pixbuf
        glib
        gtk3
        harfbuzz
        librsvg
        libsoup_3
        pango
        webkitgtk_4_1
        openssl
        makeWrapper
        libsoup
      ];
    in {
      default = pkgs.mkShell {
        packages = with pkgs; [node2nix nodejs nodePackages.pnpm rustToolchain pkg-config rust-analyzer] ++ buildInputs ++ nativeBuildInputs;
      };
      env = {
        # Required by rust-analyzer
        RUST_SRC_PATH = "${pkgs.rustToolchain}/lib/rustlib/src/rust/library";
      };
    });
  };
}

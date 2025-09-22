{
  description = "A Nix-flake-based Rust development environment";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs.nixpkgs.follows = "nixpkgs";
    };
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
    overlays.default = final: prev: {
      rustToolchain = let
        rust = prev.rust-bin;
      in
        if builtins.pathExists ./rust-toolchain.toml
        then rust.fromRustupToolchainFile ./rust-toolchain.toml
        else if builtins.pathExists ./rust-toolchain
        then rust.fromRustupToolchainFile ./rust-toolchain
        else
          rust.stable.latest.default.override {
            extensions = ["rust-src" "rustfmt"];
          };
    };

    devShells = forEachSupportedSystem ({pkgs}: {
      default = pkgs.mkShell rec {
        nativeBuildInputs = with pkgs; [
          pkg-config
          gobject-introspection
          cargo
          cargo-tauri
          nodejs_22 # what electron uses
          electron_37 # electron version should be same as defined in packages/target-electron/package.json
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
          libayatana-appindicator
          # Video/Audio data playback
          gst_all_1.gstreamer
          gst_all_1.gst-plugins-base
          gst_all_1.gst-plugins-good
          gst_all_1.gst-plugins-bad
          gst_all_1.gst-libav
          gst_all_1.gst-vaapi

          # coding
          pnpm
          rustToolchain
          rust-analyzer
          typescript-language-server
          vscode-extensions.esbenp.prettier-vscode
        ];
        env = {
          # Required by rust-analyzer
          RUST_SRC_PATH = "${pkgs.rustToolchain}/lib/rustlib/src/rust/library";
          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath buildInputs}:$LD_LIBRARY_PATH";
          XDG_DATA_DIRS = "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS";

          # needed with nvidia driver to make it show the ui at all,
          # but it slows down the UI performance by a lot.
          # though even on AMD gpu I get some glitches without it.
          WEBKIT_DISABLE_COMPOSITING_MODE = 1;
        };
        shellHook = ''
          pnpm install
          # On nixos, you can not run npm electron, so we remove it here and have it in packages.
          rm ./packages/target-electron/node_modules/.bin/electron || true
        '';
      };
    });
  };
}

{
  description = "A Nix-flake-based development environment for Delta Chat Desktop";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    inherit (nixpkgs) lib;
    electronVersionSpec = (lib.importJSON ./packages/target-electron/package.json).devDependencies.electron;
    electronVersion = lib.removePrefix "^" electronVersionSpec;

    supportedSystems = ["x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin"];
    forEachSupportedSystem = f:
      nixpkgs.lib.genAttrs supportedSystems (system:
        f {
          pkgs = import nixpkgs {
            inherit system;
            overlays = [];
          };
        });
  in {
    devShells = forEachSupportedSystem ({pkgs}: {
      default = pkgs.mkShell rec {
        nativeBuildInputs = with pkgs; [
          pkg-config
          gobject-introspection
          nodejs_22 # what project defines
          pkgs."electron_${lib.versions.major electronVersion}"
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
          pango
          openssl
          libayatana-appindicator
          # Video/Audio data playback
          gst_all_1.gst-plugins-base
          gst_all_1.gst-plugins-good
          gst_all_1.gst-plugins-bad
          gst_all_1.gst-libav
          gst_all_1.gst-vaapi

          # coding
          pnpm
          python3 # for bin/link_core/build_and_link_local_core.py script
          typescript-language-server
          vscode-extensions.esbenp.prettier-vscode
        ];
        env = {
          LD_LIBRARY_PATH = "${pkgs.lib.makeLibraryPath buildInputs}:$LD_LIBRARY_PATH";
          XDG_DATA_DIRS = "${pkgs.gsettings-desktop-schemas}/share/gsettings-schemas/${pkgs.gsettings-desktop-schemas.name}:${pkgs.gtk3}/share/gsettings-schemas/${pkgs.gtk3.name}:$XDG_DATA_DIRS";
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

# To learn more about how to use Nix to configure your environment
# see: https://developers.google.com/idx/guides/customize-idx-env
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-23.11"; # or "unstable"

  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_20
    pkgs.nodePackages.yarn
    # pkgs.go
    # pkgs.python311
    # pkgs.python311Packages.pip
    # pkgs.nodePackages.nodemon
  ];

  # Sets environment variables in the workspace
  env = {};
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      # "vscodevim.vim"
      "aaron-bond.better-comments"
      "dbaeumer.vscode-eslint"
      "formulahendry.auto-rename-tag"
      "jeff-hykin.xd-theme"
      "rvest.vs-code-prettier-eslint"
      "syler.sass-indented"
      "vincaslt.highlight-matching-tag"
    ];

    # Enable previews
    previews = {
      enable = true;
      previews = {
        # web = {
        #   command = [
        #     "yarn"
        #     "dev"
        #     "--"
        #     "--host"
        #     "tunnel"
        #   ];
        #   manager = "web";
        # };
        # web = {
        #   # Example: run "npm run dev" with PORT set to IDX's defined port for previews,
        #   # and show it in IDX's web preview panel
        #   command = ["npm" "run" "dev"];
        #   manager = "web";
        #   env = {
        #     # Environment variables to set for your server
        #     PORT = "$PORT";
        #   };
        # };
      };
    };

    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        install-yarn = "npm install -g yarn";
        # Example: install JS dependencies from NPM
        # npm-install = "npm install";
      };
      # Runs when the workspace is (re)started
      onStart = {
        yarn-install = "yarn";
        expo-doctor = "yarn doctor";
        # Example: start a background task to watch and re-build backend code
        # watch-backend = "npm run watch-backend";
      };
    };
  };
}

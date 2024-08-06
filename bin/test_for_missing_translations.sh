#!/usr/bin/env zsh

dark_grey="\033[0;30m"
white="\033[1;37m"
red="\033[1;31m"
reset="\033[0m"

# Check if ripgrep is installed
if ! command -v rg &> /dev/null; then
    echo "${red}ripgrep is not installed${reset}. Please install it to continue."
    
    # Prompt the user to install ripgrep
    read -q "INSTALL_RIPGREP?Do you want to let this script try to install ripgrep now? [y/N] "
    echo
    
    if [[ $INSTALL_RIPGREP =~ ^[Yy]$ ]]; then
        # Install ripgrep based on the user's operating system
        case "$(uname -s)" in
            Darwin)
                echo "Installing ripgrep on macOS from homebrew..."
                brew install ripgrep
                ;;
            Linux)
                echo "Installing ripgrep on Linux..."
                if command -v apt-get &> /dev/null; then
                    sudo apt-get update
                    sudo apt-get install -y ripgrep
                elif command -v dnf &> /dev/null; then
                    sudo dnf install -y ripgrep
                elif command -v pacman &> /dev/null; then
                    sudo pacman -S ripgrep
                else
                    echo "Sorry, I don't know how to install ripgrep on your Linux distribution."
                    echo "Please visit https://github.com/BurntSushi/ripgrep#installation and follow the instructions for your distribution."
                    exit 1
                fi
                ;;
            *)
                echo "Sorry, I don't know how to install ripgrep on your operating system."
                echo "Please visit https://github.com/BurntSushi/ripgrep#installation and follow the instructions for your system."
                exit 1
                ;;
        esac
    else
        echo "Okay, please install ripgrep and run the script again."
        echo "Find installation instructions at https://github.com/BurntSushi/ripgrep#installation"
        exit 1
    fi
  echo "ripgrep is installed, continuing with the script..."

fi

ALL_PLACES=$(rg -o "tx\('(.*?)'\)" packages/frontend packages/target-electron packages/target-browser -r "\$1" --vimgrep)
main() {
  rg --no-filename --no-line-number -o "tx\('(.*?)'.*?\)" packages/frontend packages/target-electron packages/target-browser -r "\$1" | sort | uniq -u | while read line ; do
    if [[ ! $(rg -F "\"$line\"" _locales/en.json ./_locales/_untranslated_en.json) ]]; then
      echo "- [ ] ${white}tx('${red}$line${white}')${reset}"
      echo "       ${dark_grey}$(echo $ALL_PLACES | rg "(.*?):$line$" -r "\$1")${reset}"
    fi
  done
}

echo 
echo "Missing translations:"
echo

main 2>/dev/null | uniq -u

echo
echo "You need to check these by hand:"
echo

# grep -nr "tx(" packages | grep "tx([^']" 
rg --context 2 "tx\([^']*?\)" packages

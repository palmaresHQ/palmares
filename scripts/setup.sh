# install nvm. Reference: https://github.com/nvm-sh/nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
echo "add this to your ~/.bash_profile or ~/.nvmrc"
echo -e export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# install pnpm: https://pnpm.io/pt/installation
# https://stackoverflow.com/a/17072017 (i haven't done windows because of reasons)
if [ "$(uname)" == "Darwin" ]; then
  brew install pnpm
elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
  curl -fsSL https://get.pnpm.io/install.sh | sh -
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW32_NT" ]; then
  winget install pnpm
elif [ "$(expr substr $(uname -s) 1 10)" == "MINGW64_NT" ]; then
  winget install pnpm
fi

pnpm i
